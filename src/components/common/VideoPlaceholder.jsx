import { useCursor } from '../../contexts/CursorContext';
import { useInView } from '../../hooks/useInView';

/**
 * The universal cinematic media container.
 *
 * • With no `src`: renders an elegant studio-lit placeholder (hairline
 *   frame, soft sheen, corner meta) — never a cheap grey box.
 * • With a `src`: lazily mounts a muted, looping, autoplay <video> only
 *   once it nears the viewport (saves bandwidth + main thread).
 *
 * Aspect ratio is reserved up front via `ratio`, so swapping in real
 * media causes ZERO layout shift. This is the drop-in point for every
 * future custom video.
 */
export default function VideoPlaceholder({
  src,
  poster,
  label = 'Cinematic Video',
  ratio = '16 / 9',
  rounded = 'rounded-[28px]',
  interactive = false,
  className = '',
  cursorLabel = 'View',
}) {
  const [ref, inView] = useInView({ rootMargin: '300px' });
  const { setCursor, resetCursor } = useCursor();

  const hover = interactive
    ? {
        onMouseEnter: () => setCursor('view', cursorLabel),
        onMouseLeave: () => resetCursor(),
      }
    : {};

  return (
    <div
      ref={ref}
      {...hover}
      className={`placeholder-surface gpu ${rounded} ${className} ${
        interactive ? 'group cursor-none' : ''
      }`}
      style={{ aspectRatio: ratio }}
    >
      {src && inView ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
        />
      ) : (
        <PlaceholderContent label={label} interactive={interactive} />
      )}

      {/* Subtle inner vignette to seat future media into the page */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_120px_rgba(17,17,17,0.06)]" />
    </div>
  );
}

function PlaceholderContent({ label, interactive }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Play glyph — signals "video lives here" */}
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-white/70 backdrop-blur-glass transition-transform duration-700 ease-premium ${
          interactive ? 'group-hover:scale-110' : ''
        }`}
      >
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
          <path d="M17 8.27a2 2 0 0 1 0 3.46L3 19.66A2 2 0 0 1 0 17.93V2.07A2 2 0 0 1 3 .34l14 7.93Z" fill="#2563EB" />
        </svg>
      </div>
      <span className="mt-5 text-xs font-medium uppercase tracking-eyebrow text-muted">
        {label}
      </span>

      {/* Corner meta — makes the frame feel like a real player */}
      <span className="absolute left-6 top-6 text-[11px] font-medium tracking-eyebrow text-muted/70">
        MOAI · STUDIO
      </span>
      <span className="absolute bottom-6 right-6 flex items-center gap-2 text-[11px] font-medium tracking-eyebrow text-muted/70">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        4K · HDR
      </span>
    </div>
  );
}
