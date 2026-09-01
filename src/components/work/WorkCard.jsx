import { Link } from 'react-router-dom';
import { useCursor } from '../../contexts/CursorContext';
import { useInView } from '../../hooks/useInView';
import ReelVideo from '../video/ReelVideo';

// Per-span aspect ratios drive the masonry rhythm without images.
const RATIO = {
  tall: '3 / 4',
  wide: '4 / 3',
  normal: '1 / 1',
  video: '16 / 9',
};

/**
 * A single luxury work card: rounded media placeholder with a soft
 * hover zoom, a meta row, and a reveal-on-hover corner action. Drop a
 * poster image / video into `.card-media` later — the frame is fixed.
 *
 * An item carrying `reel` fills that same frame with a real film instead of
 * the placeholder (see WorkCardReel). Every item carries `to`, so the card
 * renders as a router Link and the WHOLE card navigates — not just the corner
 * arrow. The frame, ratios, hover zoom and meta row are identical either way.
 */
export default function WorkCard({ item }) {
  const { setCursor, resetCursor } = useCursor();

  // Every WORK_ITEMS entry now carries `to`, so every card is a real router
  // Link and the WHOLE card surface is clickable. The `article` branch stays as
  // a guard for a future entry without a destination — it must not advertise a
  // pointer it cannot honour, so only the Link branch gets `cursor-pointer`.
  // Nothing inside the card overrides the cursor: the media well, the reel and
  // the meta row all inherit it, and the arrow is a <span>, not a nested link.
  const Root = item.to ? Link : 'article';
  const linkProps = item.to ? { to: item.to, onClick: resetCursor } : {};

  return (
    <Root
      {...linkProps}
      onMouseEnter={() => setCursor('view', 'View')}
      onMouseLeave={resetCursor}
      className={`group relative block overflow-hidden rounded-[28px] border bg-white shadow-sm transition-shadow duration-500 ease-premium hover:shadow-md ${
        item.to ? 'cursor-pointer' : ''
      }`}
      style={{ borderColor: 'rgba(147,197,253,0.45)' }}
    >
      <div className="overflow-hidden rounded-[28px]" style={{ aspectRatio: RATIO[item.span] || '1 / 1' }}>
        <div className="placeholder-surface card-media h-full w-full transition-transform duration-[900ms] ease-premium group-hover:scale-[1.06]">
          {item.reel ? (
            <WorkCardReel reel={item.reel} label={item.tag} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium uppercase tracking-eyebrow text-muted/70">
                {item.tag}
              </span>
            </div>
          )}
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
    </Root>
  );
}

/**
 * The reel that fills a card's media well. No player, source resolution or
 * loading logic lives here — it hands the site's ReelVideo the same two gates
 * the AI Video Production showcase does, just driven by this card's own
 * position instead of a pinned timeline:
 *
 *   • `near`   — latched a viewport early, so the <video> mounts and starts
 *                fetching just before the card arrives, never on page load.
 *   • `active` — true only while the card is genuinely on screen, so a card
 *                scrolled past decodes nothing.
 *
 * Muted, looping, playsInline, preload="metadata" and object-fit: cover all
 * come from ReelVideo itself, so behaviour matches the portfolio page exactly.
 * Split into its own component so the four placeholder cards mount no
 * observers at all.
 */
function WorkCardReel({ reel, label }) {
  const [nearRef, near] = useInView({ rootMargin: '300px' });
  const [playRef, onScreen] = useInView({ threshold: 0.25, rootMargin: '0px', once: false });

  return (
    <div
      ref={(el) => {
        nearRef.current = el;
        playRef.current = el;
      }}
      className="absolute inset-0"
    >
      <ReelVideo
        desktopSrc={reel.desktopVideo}
        mobileSrc={reel.mobileVideo}
        poster={reel.poster}
        label={label}
        near={near}
        active={onScreen}
      />
    </div>
  );
}
