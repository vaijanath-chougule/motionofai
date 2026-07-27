import { forwardRef, useImperativeHandle, useRef } from 'react';
import { gsap } from '../../animations/gsap';

/**
 * ReelProgress — wenilo's own scroll indicator for the pinned film reel.
 *
 * A small frosted-glass pill holding a 2px electric-blue line with rounded
 * ends — nothing else. No thumb, no marker: just the line filling smoothly,
 * 0% on the first card, 100% on the last, continuously interpolated from the
 * reel's own scrub progress (never snapped to a card index). A soft blue aura
 * sits behind the pill and deepens as the reel advances; when the last card
 * lands that glow lifts once, gently, just before the section unpins.
 *
 * PERFORMANCE — this is called on every scroll frame, so it is imperative by
 * design: the parent grabs a ref and calls `set(p)`. React never re-renders
 * during a scroll. Every per-frame write is a composited property only:
 *   • the fill + its glow scale on X (transform, origin left)
 *   • the aura/glow "intensify" via OPACITY
 * No width/left animation, so no layout and no repaint of the track.
 *
 * API (via ref): set(progress 0→1). Nothing to re-measure on resize — the bar
 * is pure scaleX, so it is resolution-independent by construction.
 */
const ReelProgress = forwardRef(function ReelProgress(
  { total, active = 0, label = 'Scroll', className = '' },
  ref,
) {
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const glowRef = useRef(null);
  const auraRef = useRef(null);

  const armedRef = useRef(true); // the end-pulse fires once per arrival
  const pulsingRef = useRef(false); // while true, per-frame opacity writes stand down

  useImperativeHandle(
    ref,
    () => ({
      set(progress) {
        const p = gsap.utils.clamp(0, 1, progress || 0);

        // Line + its blur twin grow from the left edge.
        gsap.set([fillRef.current, glowRef.current], { scaleX: p, force3D: true });

        // Glow deepens with progress — opacity only, so it stays composited.
        // Restrained ceiling: the bar should read as light, never neon.
        if (!pulsingRef.current) {
          gsap.set(glowRef.current, { opacity: 0.16 + p * 0.44 });
          gsap.set(auraRef.current, { opacity: 0.12 + p * 0.36 });
        }

        // Final card reached → one gentle pulse. Re-arms if the visitor
        // scrubs back up, so returning to the end pulses again.
        if (p > 0.995) endPulse();
        else if (p < 0.94) armedRef.current = true;
      },
    }),
    [],
  );

  const endPulse = () => {
    if (!armedRef.current) return;
    armedRef.current = false;
    pulsingRef.current = true;

    // Glow only — a single soft breath as the last card lands, then settle.
    gsap
      .timeline({ onComplete: () => (pulsingRef.current = false) })
      .to(auraRef.current, { opacity: 0.72, duration: 0.5, ease: 'power2.out' })
      .to(auraRef.current, { opacity: 0.48, duration: 1.1, ease: 'power3.out' })
      .to(glowRef.current, { opacity: 0.78, duration: 0.5, ease: 'power2.out' }, 0)
      .to(glowRef.current, { opacity: 0.6, duration: 1.1, ease: 'power3.out' }, 0.5);
  };

  const num = String(Math.min(active + 1, total)).padStart(2, '0');
  const tot = String(total).padStart(2, '0');

  return (
    <div
      className={`reel-progress ${className}`}
      role="progressbar"
      aria-label="Reel progress"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={Math.min(active + 1, total)}
      aria-valuetext={`Film ${num} of ${tot}`}
    >
      {/* Blue aura behind the glass — brightens with progress. */}
      <span ref={auraRef} className="reel-progress__aura" aria-hidden="true" />

      <div className="reel-progress__inner">
        <span className="reel-progress__label">{label}</span>

        <div ref={trackRef} className="reel-progress__track">
          <span ref={glowRef} className="reel-progress__glow" aria-hidden="true" />
          <span ref={fillRef} className="reel-progress__fill" aria-hidden="true" />
        </div>

        <span className="reel-progress__count">
          {num}
          <span className="reel-progress__count-total"> / {tot}</span>
        </span>
      </div>
    </div>
  );
});

export default ReelProgress;
