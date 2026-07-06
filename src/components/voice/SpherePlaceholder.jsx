import { forwardRef } from 'react';
import { VOICE_FLIP_ID } from '../../utils/constants';

/**
 * The Voice Agent "breathing sphere" placeholder — a perfect circle
 * built to be MORPHED, not merely displayed.
 *
 * Architecture notes for the future Three.js swap:
 *  • The outer element carries `data-flip-id` so GSAP Flip can morph
 *    this exact circle from the home section into the /voice-agents hero
 *    across the route change.
 *  • Everything inside is layered radial light + concentric rings that a
 *    <Canvas> / <mesh> can replace 1:1 — same box, same center, same
 *    breathing rhythm. Drop a sphere in `children` and the frame stays.
 *
 * It never looks cheap: soft studio light, an inner "voice core",
 * orbiting rings and a slow CSS breathe convey a living object.
 */
const SpherePlaceholder = forwardRef(function SpherePlaceholder(
  { className = '', interactive = false, breathe = true, children },
  ref,
) {
  return (
    <div
      ref={ref}
      data-flip-id={VOICE_FLIP_ID}
      className={`relative aspect-square select-none rounded-full gpu ${
        breathe ? 'animate-breathe' : ''
      } ${className}`}
      style={{ willChange: 'transform' }}
    >
      {/* Soft ambient blue glow bed */}
      <div
        className="absolute -inset-[18%] rounded-full opacity-70 blur-3xl transition-opacity duration-700"
        data-sphere-glow
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(37,99,235,0.28), rgba(37,99,235,0) 68%)',
        }}
      />

      {/* The sphere body — this is the node a Three.js canvas replaces */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {children ?? <SphereSkin />}
      </div>

      {/* Concentric orbit rings — depth + "listening" feel */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute inset-0 rounded-full border border-accent/15" />
        <span className="absolute inset-[8%] rounded-full border border-accent/10" />
        <span className="absolute inset-[-6%] rounded-full border border-accent/[0.07]" />
        {interactive && (
          <span className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/30" />
        )}
      </div>
    </div>
  );
});

/** Default visual skin — swap for <Canvas> later. */
function SphereSkin() {
  return (
    <>
      {/* Base sphere shading */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 38% 32%, #ffffff 0%, #eef4ff 34%, #d6e4ff 62%, #b8ceff 100%)',
          boxShadow:
            'inset -22px -26px 60px rgba(37,99,235,0.18), inset 18px 20px 50px rgba(255,255,255,0.9)',
        }}
      />
      {/* Specular highlight */}
      <div className="absolute left-[26%] top-[20%] h-[24%] w-[24%] rounded-full bg-white/80 blur-xl" />
      {/* Voice core — the "listening" pulse */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-[26%] w-[26%] items-center justify-center rounded-full bg-accent/90 shadow-[0_0_50px_rgba(37,99,235,0.55)]">
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/30" style={{ animationDuration: '3s' }} />
          {/* Equalizer bars — signals "voice" */}
          <div className="flex items-end gap-[3px]">
            {[0.5, 0.9, 0.65, 1, 0.55].map((h, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-white animate-breathe"
                style={{ height: `${h * 22}px`, animationDelay: `${i * 0.18}s`, animationDuration: '2.4s' }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default SpherePlaceholder;
