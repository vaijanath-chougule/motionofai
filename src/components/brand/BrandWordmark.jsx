import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { mergeRefs } from '../../utils/mergeRefs';

/**
 * BrandWordmark — the giant "wenilo" signature that closes a page.
 *
 * One component, two call sites (the AI Video Production CTA and the Home
 * page's final CTA), so the two can never drift apart: same font, same
 * weight, same tracking, same blue gradient, same spacing.
 *
 * SIZING — the wordmark is fitted to the viewport rather than guessed with a
 * vw font-size. A `vw` value only lands edge-to-edge for the exact font it was
 * tuned against; the display stack resolves differently per platform (SF Pro
 * Display on Apple, Inter elsewhere), so the same 17vw is a different width on
 * every device — too small here, clipped there. Instead we measure the glyph
 * advance ONCE at a probe size to learn this font's width-per-px, then solve
 * for the font-size that lands the word a hair inside the container. That is
 * exact on every platform, at every width, and cannot clip.
 *
 * CLIPPING — leading-[0.8] makes the line box SHORTER than the glyphs, so the
 * ink spills past the box at both ends. At the old size that spill was a few
 * pixels; at this size it is tens of them, and the section's overflow-hidden
 * would shear the bottoms off the letters. So after fitting we measure where
 * the baseline actually sits (via a zero-height inline-block strut, which
 * always rests on it) and pad the wrapper by exactly the overflow — the box
 * ends up hugging the ink, flush to the page edge with nothing cut.
 *
 * BOTTOM EDGE — that spill goes both ways, and the wrapper has to answer both.
 * "wenilo" has no descenders, so under the baseline there is only the tiny
 * overshoot of the round letters, while the line box keeps its full descent
 * room — leaving a blank band under the word and, since this is the last
 * element on the page, under the page. How wide that band is depends on the
 * face that resolved (SF Pro Display on Apple, Inter elsewhere), so it cannot
 * be a constant: we ask the font itself, via canvas actualBoundingBoxDescent,
 * how far the ink really goes, then pull the wrapper's bottom edge up to it
 * with a negative margin. Nothing above the bottom edge moves.
 *
 * Everything else is untouched: the typography, the gradient and the reveal
 * animation are the same as before — only the scale is computed instead of
 * hardcoded. `ref` and extra props (data-reveal) pass through to the wrapper
 * so each section keeps driving its own GSAP entrance.
 */

const WORD = 'wenilo';
const PROBE = 200; // px — arbitrary size used to learn the font's metrics
// Descent is probed much larger: "wenilo" has no descenders, so the only ink
// under the baseline is the overshoot of the round e/o — a fraction of a pixel
// at PROBE, which rounds to noise. At 1000px it resolves cleanly.
const DESCENT_PROBE = 1000;
const FILL = 0.995; // leave a sliver so subpixel rounding can never clip
const LEADING = 0.8; // matches leading-[0.8] below
// Round letters (e, o) dip a hair below the baseline. Fallback for engines
// that don't report usable ink metrics, and the sanity band we accept a
// measured value within — a no-descender word can't be outside it.
const OVERSHOOT = 0.022;
const OVERSHOOT_MIN = 0.004;
const OVERSHOOT_MAX = 0.06;
// Ceiling for how much of the viewport height the wordmark's own line box may
// take. Only bites on short/landscape windows, where a width-driven fit would
// otherwise fill the screen.
const MAX_VH = 0.5;
const MIN_PX = 44;

/**
 * How far the ink of WORD reaches below the baseline, as a fraction of the
 * font size, for whatever face actually resolved.
 *
 * Rasterises the word with its baseline on the strip's top edge, so the strip
 * contains exactly the sub-baseline ink, and scans up for the lowest row with
 * any coverage at all (alpha > 0, so antialiased edges count). That is the
 * literal answer to "where does the logo stop", which is what the bottom edge
 * has to sit on.
 *
 * TextMetrics is kept only as a fallback. It is the tidier API but the wrong
 * number: actualBoundingBoxDescent reads ~40% deeper than the ink really goes
 * (0.0156 vs 0.011 for this stack), which at display sizes leaves a visible
 * band of blank under the word — the exact thing this is here to remove.
 *
 * Both a zero reading (engines reporting no ink for a word with no descenders)
 * and a wild one (a canvas that silently kept its default font) fall outside
 * the sanity band and are rejected, because trusting either would pull the
 * wrapper's bottom edge up through the letters and the section's
 * overflow-hidden would shear them.
 */
function measureDescentRatio(cs) {
  try {
    const canvas = document.createElement('canvas');
    const g = canvas.getContext('2d', { willReadFrequently: true });
    if (!g) return OVERSHOOT;

    const font = `${cs.fontStyle} ${cs.fontWeight} ${DESCENT_PROBE}px ${cs.fontFamily}`;
    g.font = font;
    // If the assignment didn't take, the context is still on its default font
    // and every measurement below would describe the wrong typeface.
    if (!g.font.includes(`${DESCENT_PROBE}px`)) return OVERSHOOT;
    g.textBaseline = 'alphabetic';

    const metrics = g.measureText(WORD);
    const reported = metrics.actualBoundingBoxDescent / DESCENT_PROBE;

    // Only the band just under the baseline can hold ink, so only that is
    // rasterised — a short strip, not a full-size canvas.
    const band = Math.ceil(DESCENT_PROBE * OVERSHOOT_MAX) + 4;
    const width = Math.ceil(metrics.width) + 8;
    canvas.width = width;
    canvas.height = band;
    // Resizing a canvas resets its context, so restate what matters.
    g.font = font;
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#000';
    g.fillText(WORD, 4, 0); // baseline at y=0 — the strip IS the sub-baseline band

    const { data } = g.getImageData(0, 0, width, band);
    let lowest = -1;
    for (let y = band - 1; y >= 0 && lowest < 0; y--) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 0) {
          lowest = y;
          break;
        }
      }
    }

    // +1 because `lowest` is a row index and the ink's edge is that row's far
    // side; the strip's own top row is the baseline itself.
    const scanned = (lowest + 1) / DESCENT_PROBE;
    if (scanned >= OVERSHOOT_MIN && scanned <= OVERSHOOT_MAX) return scanned;
    if (reported >= OVERSHOOT_MIN && reported <= OVERSHOOT_MAX) return reported;
    return OVERSHOOT;
  } catch {
    return OVERSHOOT;
  }
}

const BrandWordmark = forwardRef(function BrandWordmark(
  { className = '', ...rest },
  ref,
) {
  const wrapRef = useRef(null); // the padded outer box (also the forwarded ref)
  const boxRef = useRef(null); // padding-free measuring box
  const textRef = useRef(null);
  const strutRef = useRef(null); // zero-height inline-block: sits on the baseline
  const ratioRef = useRef(0); // glyph width per 1px of font-size
  const fontRef = useRef(''); // which face the width ratio above was learnt from
  const lastRef = useRef({ w: 0, h: 0 });

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    const box = boxRef.current;
    const text = textRef.current;
    if (!wrap || !box || !text) return;

    // Start every pass from a neutral bottom edge. The pull-up below changes
    // the section's height, and in a flex column that can reposition this very
    // element — measuring while a previous pass's margin is still applied lets
    // that feed back into the next result, so the two never settle.
    wrap.style.marginBottom = '0px';

    // The advance width is a constant of the typeface, so it is learnt once —
    // but "once per typeface". The display stack resolves differently per
    // platform, so if the resolved face changed underneath us the cached value
    // describes the wrong font and has to go.
    const cs = getComputedStyle(text);
    const fontKey = `${cs.fontStyle}|${cs.fontWeight}|${cs.fontFamily}`;
    if (fontRef.current !== fontKey) {
      fontRef.current = fontKey;
      ratioRef.current = 0;
    }

    // Learn the font's advance width.
    if (!ratioRef.current) {
      wrap.style.paddingTop = '0px';
      wrap.style.paddingBottom = '0px';
      text.style.fontSize = `${PROBE}px`;
      const range = document.createRange();
      range.selectNodeContents(text);
      const w = range.getBoundingClientRect().width;
      if (!w) return; // font not ready yet; document.fonts.ready retries
      ratioRef.current = w / PROBE;
    }

    // The ink's reach below the baseline decides where the box may end, so it
    // is re-measured every pass rather than cached. Caching it was a real bug:
    // the webfont swap keeps the family string identical and only changes the
    // file underneath, so a stale value survived the swap and the box was
    // pulled up by the wrong font's overshoot — flush on one page, a sheared
    // letter on the other. One canvas measurement per fit is nothing, and fits
    // are rare.
    const descent = measureDescentRatio(cs);

    const byWidth = (box.clientWidth * FILL) / ratioRef.current;
    const byHeight = (window.innerHeight * MAX_VH) / LEADING;
    const size = Math.max(MIN_PX, Math.min(byWidth, byHeight));
    text.style.fontSize = `${size}px`;

    // Now settle the wrapper's edges onto the ink. The top pads out however
    // far the ascenders spill past the line box; the bottom works in both
    // directions — pad when the ink spills below the box, pull the box up when
    // the box ends below the ink (which is the usual case here: no
    // descenders). floor() on the pull-up trims a hair less than the blank, so
    // rounding can never eat into a glyph.
    const line = text.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(text);
    const content = range.getBoundingClientRect(); // ascent + descent band
    const baseline = strutRef.current?.getBoundingClientRect().top ?? line.bottom;

    const below = baseline + size * descent - line.bottom;
    const above = line.top - content.top;
    wrap.style.paddingTop = `${Math.max(0, Math.ceil(above))}px`;
    wrap.style.paddingBottom = `${Math.max(0, Math.ceil(below))}px`;
    wrap.style.marginBottom = below < 0 ? `${-Math.floor(-below)}px` : '0px';
  }, []);

  // Fit before paint, so the wordmark never renders at the wrong size.
  useIsomorphicLayoutEffect(() => {
    fit();
    lastRef.current = { w: boxRef.current?.clientWidth ?? 0, h: window.innerHeight };
  }, [fit]);

  useEffect(() => {
    // Re-fit on width changes only. Ignoring height here matters: mobile
    // browsers fire a resize every time the address bar slides, and re-fitting
    // on that would make the type breathe while you scroll.
    let ro;
    if (typeof ResizeObserver !== 'undefined' && boxRef.current) {
      ro = new ResizeObserver(([entry]) => {
        const w = entry.contentRect.width;
        if (Math.abs(w - lastRef.current.w) < 0.5) return;
        lastRef.current.w = w;
        fit();
      });
      ro.observe(boxRef.current);
    }

    // A big height change (orientation flip, desktop window resize) can bring
    // the height ceiling into play, so that one is worth honouring.
    const onResize = () => {
      if (Math.abs(window.innerHeight - lastRef.current.h) < 140) return;
      lastRef.current.h = window.innerHeight;
      fit();
    };
    window.addEventListener('resize', onResize);

    // The webfont can swap in after first paint (Inter on non-Apple
    // platforms) without changing the family string, so fit() cannot detect
    // that one on its own — drop the cached width ratio and solve again.
    document.fonts?.ready?.then(() => {
      ratioRef.current = 0;
      fit();
    });

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [fit]);

  return (
    <div
      ref={mergeRefs(wrapRef, ref)}
      className={`relative w-full select-none px-4 text-center md:px-6 ${className}`}
      {...rest}
    >
      <div ref={boxRef}>
        <span
          ref={textRef}
          // nowrap matters: the baseline probe below is an inline-block, which
          // would otherwise be a legal break point — the word would drop it to
          // a second line and double the block's height.
          className="block whitespace-nowrap font-display font-semibold leading-[0.8]"
          style={{
            // Pre-JS resting value; the effect above replaces it before paint.
            fontSize: 'clamp(3rem, 17vw, 19rem)',
            letterSpacing: '-0.045em',
            backgroundImage: 'linear-gradient(180deg, #7aa2ff 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {WORD}
          {/* Baseline probe: a zero-sized inline-block rests exactly on the
              baseline, which is what the padding maths needs. Invisible and
              zero-width, so it changes neither the layout nor the metrics. */}
          <i
            ref={strutRef}
            aria-hidden="true"
            style={{ display: 'inline-block', width: 0, height: 0 }}
          />
        </span>
      </div>
    </div>
  );
});

export default BrandWordmark;
