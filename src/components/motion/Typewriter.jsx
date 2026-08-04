import { useEffect, useMemo, useRef } from 'react';
import { prefersReducedMotion } from '../../utils/device';

/**
 * Typewriter — reveals a phrase one character at a time, then erases it and
 * repeats. Restrained on purpose: characters simply appear, with no fade, no
 * slide and no per-word staging, which is what separates Apple's product
 * typography from a novelty terminal effect.
 *
 * ── ZERO LAYOUT SHIFT, BY CONSTRUCTION ─────────────────────────────────────
 * Every character is in the DOM from first paint. Revealing one flips
 * `visibility`, which does not affect layout at all — so the phrase occupies
 * its full final width from the very first frame and the heading can never
 * reflow, re-wrap or jump mid-animation.
 *
 * Splitting text across <span>s does NOT introduce new line-break
 * opportunities (per CSS Text, soft wrap opportunities come from the text
 * content, not element boundaries), so the heading still wraps exactly where
 * it did as a plain text node. Nothing about the typography changes.
 *
 * ── NO RE-RENDERS ──────────────────────────────────────────────────────────
 * The component renders ONCE. The animation is a single rAF loop mutating
 * `style.visibility` and one class name, so React is never involved after
 * mount — no state, no re-render per character.
 *
 * The caret is drawn as an absolutely-positioned ::after on the boundary
 * character, so it occupies no space and follows the last typed glyph without
 * ever nudging the text. Its blink is pure CSS.
 *
 * ── OFF-SCREEN ─────────────────────────────────────────────────────────────
 * An IntersectionObserver parks the loop while the heading is off screen, so
 * an unread section costs nothing.
 *
 * ── REDUCED MOTION ─────────────────────────────────────────────────────────
 * Renders the finished phrase, statically, with no caret and no rAF loop.
 *
 * @param {{
 *   text: string,
 *   typeMs?: number,
 *   eraseMs?: number,
 *   holdMs?: number,
 *   gapMs?: number,
 *   className?: string,
 * }} props
 */
export default function Typewriter({
  text,
  typeMs = 55,
  eraseMs = 40,
  holdMs = 2000,
  gapMs = 300,
  className = '',
}) {
  const reduce = prefersReducedMotion();
  const rootRef = useRef(null);
  const charRefs = useRef([]);

  // Stable per-character list. Spaces become non-breaking so a leading or
  // trailing space can never be collapsed away mid-reveal.
  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    if (reduce) return undefined;
    const root = rootRef.current;
    const cells = charRefs.current.filter(Boolean);
    if (!root || !cells.length) return undefined;

    const total = cells.length;
    let shown = -1; // force the first paint
    let caretAt = -1;
    let onScreen = true;
    let frame = 0;
    let phaseStart = performance.now();
    /** @type {'typing'|'holding'|'erasing'|'waiting'} */
    let phase = 'typing';

    const paint = (count) => {
      if (count === shown) return;
      // Only the characters that actually changed are touched, so a frame
      // costs one style write, not N.
      const from = Math.min(shown, count);
      const to = Math.max(shown, count);
      for (let i = Math.max(from, 0); i < to; i += 1) {
        cells[i].style.visibility = i < count ? 'visible' : 'hidden';
      }
      shown = count;

      // Caret sits after the last revealed character, or before the first one
      // when nothing is showing yet.
      const nextCaret = count === 0 ? 0 : count - 1;
      const nextClass = count === 0 ? 'is-caret-before' : 'is-caret-after';
      if (caretAt >= 0 && cells[caretAt]) {
        cells[caretAt].classList.remove('is-caret-before', 'is-caret-after');
      }
      cells[nextCaret].classList.add(nextClass);
      caretAt = nextCaret;
    };

    const tick = (now) => {
      frame = requestAnimationFrame(tick);
      if (!onScreen) {
        phaseStart = now; // resume where it left off rather than jumping ahead
        return;
      }
      const elapsed = now - phaseStart;

      if (phase === 'typing') {
        const count = Math.min(total, Math.floor(elapsed / typeMs));
        paint(count);
        if (count >= total) {
          phase = 'holding';
          phaseStart = now;
        }
      } else if (phase === 'holding') {
        if (elapsed >= holdMs) {
          phase = 'erasing';
          phaseStart = now;
        }
      } else if (phase === 'erasing') {
        const count = Math.max(0, total - Math.floor(elapsed / eraseMs));
        paint(count);
        if (count <= 0) {
          phase = 'waiting';
          phaseStart = now;
        }
      } else if (elapsed >= gapMs) {
        phase = 'typing';
        phaseStart = now;
      }
    };

    paint(0);

    let io;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      io.observe(root);
    }
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      io?.disconnect();
    };
  }, [reduce, chars, typeMs, eraseMs, holdMs, gapMs]);

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  return (
    <>
      {/* The animated glyphs. Hidden from assistive tech — a screen reader
          should hear the finished phrase, not a stream of characters. */}
      <span ref={rootRef} className={`typewriter ${className}`} aria-hidden="true">
        {chars.map((ch, i) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            ref={(el) => (charRefs.current[i] = el)}
            className="typewriter__char"
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
