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
 * Everything else is untouched: the typography, the gradient and the reveal
 * animation are the same as before — only the scale is computed instead of
 * hardcoded. `ref` and extra props (data-reveal) pass through to the wrapper
 * so each section keeps driving its own GSAP entrance.
 */

const PROBE = 200; // px — arbitrary size used to learn the font's metrics
const FILL = 0.995; // leave a sliver so subpixel rounding can never clip
const LEADING = 0.8; // matches leading-[0.8] below
// Round letters (e, o) dip a hair below the baseline. Cheap, font-agnostic
// allowance so the overshoot is never the thing that gets clipped.
const OVERSHOOT = 0.022;
// Ceiling for how much of the viewport height the wordmark's own line box may
// take. Only bites on short/landscape windows, where a width-driven fit would
// otherwise fill the screen.
const MAX_VH = 0.5;
const MIN_PX = 44;

const BrandWordmark = forwardRef(function BrandWordmark(
  { className = '', ...rest },
  ref,
) {
  const wrapRef = useRef(null); // the padded outer box (also the forwarded ref)
  const boxRef = useRef(null); // padding-free measuring box
  const textRef = useRef(null);
  const strutRef = useRef(null); // zero-height inline-block: sits on the baseline
  const ratioRef = useRef(0); // glyph width per 1px of font-size
  const lastRef = useRef({ w: 0, h: 0 });

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    const box = boxRef.current;
    const text = textRef.current;
    if (!wrap || !box || !text) return;

    // Learn the font's advance width once — it is a constant of the typeface.
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

    const byWidth = (box.clientWidth * FILL) / ratioRef.current;
    const byHeight = (window.innerHeight * MAX_VH) / LEADING;
    const size = Math.max(MIN_PX, Math.min(byWidth, byHeight));
    text.style.fontSize = `${size}px`;

    // Now pad the wrapper by however far the ink spills past the line box, so
    // the giant type sits flush to the page edge without being sheared.
    const line = text.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(text);
    const content = range.getBoundingClientRect(); // ascent + descent band
    const baseline = strutRef.current?.getBoundingClientRect().top ?? line.bottom;

    const below = baseline + size * OVERSHOOT - line.bottom;
    const above = line.top - content.top;
    wrap.style.paddingTop = `${Math.max(0, Math.ceil(above))}px`;
    wrap.style.paddingBottom = `${Math.max(0, Math.ceil(below))}px`;
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
    // platforms) — that changes the metrics, so drop the cached ratio and
    // solve again.
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
          wenilo
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
