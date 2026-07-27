/**
 * ReelCard — the premium video card chrome shared by the desktop cinematic
 * reel and the mobile vertical stack. It owns ONLY presentation:
 *
 *   • 16:9 surface, 24–32px radius, deep premium shadow, soft border
 *   • a glass reflection sheen across the top
 *   • an overlay play glyph that fades out once the card is the active
 *     ("now playing") one
 *   • bottom-left meta: category · title · duration
 *   • bottom-right project number  NN / TT
 *
 * `minimal` strips the chrome back to the film's identity alone — category +
 * title, nothing else. That is what phones use: the duration and the NN/TT
 * counter would only compete with the reel's own progress indicator.
 *
 * The actual player is injected via `media` so each context can supply the
 * right one — a scroll-controlled <ReelVideo> in the pinned reel, an
 * IntersectionObserver <ResponsiveVideo> in the reduced-motion stack.
 */
export default function ReelCard({ project, index, total, isActive = false, minimal = false, media }) {
  const num = String(index + 1).padStart(2, '0');
  const tot = String(total).padStart(2, '0');

  return (
    <div
      className="reel-card group relative h-full w-full overflow-hidden rounded-[24px] border border-white/60 bg-white md:rounded-[30px]"
      style={{
        boxShadow:
          '0 42px 120px -46px rgba(17,17,17,0.55), 0 8px 28px -18px rgba(17,17,17,0.35)',
      }}
    >
      {/* The player (desktop = controlled, mobile = IO-autoplay). */}
      <div className="absolute inset-0">{media}</div>

      {/* Cinematic legibility scrim — heavier at the bottom for the meta. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(10,12,20,0.62) 0%, rgba(10,12,20,0.20) 26%, rgba(10,12,20,0) 52%)',
        }}
      />

      {/* Glass reflection — a soft diagonal sheen seated on the surface. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{
          background:
            'linear-gradient(160deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0) 60%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Overlay play glyph — a frosted disc. Fades + scales away while the
          card is the active, playing one, so attention stays on the film. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-700 ease-premium ${
          isActive ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-white/15 backdrop-blur-md md:h-20 md:w-20">
          <svg width="20" height="24" viewBox="0 0 18 20" fill="none" aria-hidden="true">
            <path d="M17 8.27a2 2 0 0 1 0 3.46L3 19.66A2 2 0 0 1 0 17.93V2.07A2 2 0 0 1 3 .34l14 7.93Z" fill="#fff" />
          </svg>
        </span>
      </div>

      {/* Bottom-left meta. */}
      <div className="absolute bottom-0 left-0 max-w-[80%] p-5 md:p-7">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70 md:text-[11px]">
          {project.category}
        </p>
        <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-white md:text-2xl">
          {project.title}
        </h3>
        {!minimal && (
          <p className="mt-1 flex items-center gap-2 text-xs font-medium text-white/70">
            <span className="inline-block h-1 w-1 rounded-full bg-accent" />
            {project.duration}
          </p>
        )}
      </div>

      {/* Bottom-right project number. */}
      {!minimal && (
        <div className="absolute bottom-0 right-0 p-5 md:p-7">
          <span className="font-display text-sm font-semibold tracking-tight text-white/90">
            {num}
            <span className="text-white/45"> / {tot}</span>
          </span>
        </div>
      )}
    </div>
  );
}
