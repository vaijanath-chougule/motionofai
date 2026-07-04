import { useInView } from '../../hooks/useInView';

/**
 * Full-bleed cinematic hero backdrop. Ships as an elegant motion
 * placeholder (drifting light-fields, faint grid) and becomes a real
 * fullscreen video the moment you pass a `src` — autoplay / loop / muted
 * / object-cover, exactly as briefed. No layout shift on swap.
 */
export default function HeroMedia({ src, poster }) {
  const [ref, inView] = useInView({ rootMargin: '0px', once: true });

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-white">
      {src && inView ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      ) : (
        <PlaceholderField />
      )}

      {/* Very subtle dark overlay for legibility — kept light on a white brand */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/30 to-white/70" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,transparent_40%,rgba(255,255,255,0.4)_100%)]" />
    </div>
  );
}

/** Pure-CSS ambient field — premium, never a flat grey box. */
function PlaceholderField() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_30%,#f4f7ff_0%,#eef1f8_45%,#ffffff_100%)]" />
      {/* Two slow-drifting accent light-fields */}
      <div
        className="absolute left-1/2 top-1/3 h-[52vw] w-[52vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl animate-breathe"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.16), rgba(37,99,235,0) 65%)',
        }}
      />
      <div
        className="absolute right-[12%] top-[18%] h-[26vw] w-[26vw] rounded-full opacity-60 blur-3xl animate-breathe"
        style={{
          animationDelay: '-2.5s',
          background:
            'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.10), rgba(37,99,235,0) 70%)',
        }}
      />
      {/* Faint engineered grid to read as "product", not "poster" */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(17,17,17,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.035) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(70% 70% at 50% 40%, #000 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(70% 70% at 50% 40%, #000 30%, transparent 100%)',
        }}
      />
    </div>
  );
}
