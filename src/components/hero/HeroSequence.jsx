import { forwardRef, useImperativeHandle } from 'react';
import { useImageSequence } from '../../hooks/useImageSequence';
import { useMediaQuery, MOBILE_QUERY } from '../../hooks/useMediaQuery';
import { HERO_SEQUENCE } from '../../utils/constants';

/**
 * The scroll-driven 3D hero. A full-bleed canvas plays the frame
 * sequence as the user scrolls, creating the "rotating through space"
 * illusion. Parent drives it via the imperative `setProgress(0..1)`
 * handle from a GSAP ScrollTrigger scrub.
 *
 * A soft placeholder field sits behind the canvas so there's never a
 * blank flash before the first frame decodes.
 */
const HeroSequence = forwardRef(function HeroSequence(_props, ref) {
  // Phones load the dedicated portrait set; everything else the landscape
  // set. Resolved once at load — a phone never fetches the desktop frames.
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const set = isMobile ? HERO_SEQUENCE.mobile : HERO_SEQUENCE.desktop;

  const { canvasRef, setProgress, loadedCount, frameCount } = useImageSequence({
    frameCount: HERO_SEQUENCE.count,
    getUrl: set.getUrl,
    getFallbackUrl: set.getFallbackUrl,
  });

  useImperativeHandle(ref, () => ({ setProgress, loadedCount, frameCount }), [
    setProgress,
    loadedCount,
    frameCount,
  ]);

  const booted = loadedCount > 0;

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      {/* Fallback ambient field — fades out once frames start painting */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          booted ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_35%,#f4f7ff_0%,#eef1f8_45%,#ffffff_100%)]" />
        <div className="absolute left-1/2 top-1/3 h-[46vw] w-[46vw] -translate-x-1/2 -translate-y-1/2 animate-breathe rounded-full opacity-70 blur-3xl"
          style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.16),rgba(37,99,235,0) 65%)' }}
        />
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full gpu"
        aria-hidden="true"
      />

      {/* Legibility scrim: a soft white wash so the dark headline reads
          over any frame content, brand-consistent (white canvas). */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-white/70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_75%_at_50%_42%,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_60%)]" />
    </div>
  );
});

export default HeroSequence;
