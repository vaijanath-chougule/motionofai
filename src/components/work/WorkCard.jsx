import { useCursor } from '../../contexts/CursorContext';

// Per-span aspect ratios drive the masonry rhythm without images.
const RATIO = {
  tall: '3 / 4',
  wide: '4 / 3',
  normal: '1 / 1',
};

/**
 * A single luxury work card: rounded media placeholder with a soft
 * hover zoom, a meta row, and a reveal-on-hover corner action. Drop a
 * poster image / video into `.card-media` later — the frame is fixed.
 */
export default function WorkCard({ item }) {
  const { setCursor, resetCursor } = useCursor();

  return (
    <article
      onMouseEnter={() => setCursor('view', 'View')}
      onMouseLeave={resetCursor}
      className="group relative cursor-none overflow-hidden rounded-[28px] border border-hairline bg-white"
    >
      <div className="overflow-hidden rounded-[28px]" style={{ aspectRatio: RATIO[item.span] || '1 / 1' }}>
        <div className="placeholder-surface card-media h-full w-full transition-transform duration-[900ms] ease-premium group-hover:scale-[1.06]">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium uppercase tracking-eyebrow text-muted/70">
              {item.tag}
            </span>
          </div>
        </div>
      </div>

      {/* Meta bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
          <p className="text-sm text-muted">{item.tag}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline transition-all duration-500 ease-premium group-hover:border-accent group-hover:bg-accent">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="transition-transform duration-500 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]">
            <path d="M5 11L11 5M11 5H6M11 5V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-ink group-hover:text-white" />
          </svg>
        </span>
      </div>
    </article>
  );
}
