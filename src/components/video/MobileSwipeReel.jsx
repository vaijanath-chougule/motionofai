import { useCallback, useEffect, useRef, useState } from 'react';
import ReelAudioButton from './ReelAudioButton';
import ReelCard from './ReelCard';
import ReelVideo from './ReelVideo';
import ReelShowcase from './ReelShowcase';
import ReelProgress from './ReelProgress';

/**
 * MobileSwipeReel — horizontal swipe carousel for mobile AI Video Production.
 *
 * Uses the EXACT same card dimensions, aspect ratio, positioning, and styling
 * as CinematicReel's mobile mode. The ONLY difference is navigation:
 *   - CinematicReel: pinned section, vertical scroll controls horizontal motion
 *   - MobileSwipeReel: native horizontal touch swipe with CSS scroll-snap
 *
 * User swipes horizontally to navigate:
 *   Video 1 → swipe left → Video 2 → swipe left → Video 3 → etc.
 *
 * Preserves from CinematicReel mobile mode:
 *   - Card dimensions: aspect-[9/16], h-[60svh], max-h-[560px], max-w-[76vw]
 *   - Vertical positioning: top-[calc(50%-18px)]
 *   - ReelCard with minimal={true}
 *   - ReelVideo with same props
 *   - ReelShowcase for variant: 'reels'
 *   - Mute controls
 *   - Auto-play on active
 *   - Stage height: h-[100svh]
 *
 * Changes ONLY navigation from scroll-scrub to swipe-snap.
 */
export default function MobileSwipeReel({ projects }) {
  const n = projects.length;
  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);
  const progressRef = useRef(null);
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(() => new Set([0, 1]));

  const [mutedCards, setMutedCards] = useState(
    () => new Set(projects.filter((p) => p.variant !== 'reels').map((p) => p.id))
  );

  // Track which card is centered using IntersectionObserver
  useEffect(() => {
    const scroller = scrollerRef.current;
    const cards = cardRefs.current.filter(Boolean);
    if (!scroller || !cards.length || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            const index = parseInt(entry.target.dataset.index, 10);
            if (!isNaN(index) && index !== active) {
              setActive(index);
              setNear((prev) => {
                const s = new Set(prev);
                [index - 1, index, index + 1].forEach((k) => {
                  if (k >= 0 && k < n) s.add(k);
                });
                return s;
              });
            }
          }
        });
      },
      {
        root: scroller,
        threshold: [0.75],
      }
    );

    cards.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [projects.length, active, n]);

  // Update progress indicator based on active card
  useEffect(() => {
    if (progressRef.current && n > 1) {
      const progress = active / (n - 1);
      progressRef.current.set(progress);
    }
  }, [active, n]);

  const toggleCardMute = useCallback((id) => {
    setMutedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <section className="relative">
      {/* Stage — same height as CinematicReel mobile */}
      <div className="relative h-[100svh] w-full overflow-hidden">
        {/* Subtle blue ambient glow — same as CinematicReel */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[85vh] w-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10), rgba(37,99,235,0) 70%)' }}
        />

        {/* Horizontal scroll container with snap points */}
        <div
          ref={scrollerRef}
          className="absolute inset-0 flex overflow-x-auto overflow-y-hidden overscroll-x-contain [&::-webkit-scrollbar]:hidden"
          style={{
            perspective: '1200px',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pinch-zoom',
          }}
        >
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => (cardRefs.current[i] = el)}
              data-index={i}
              className="relative w-full shrink-0"
              style={{
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always',
              }}
            >
              {/* Card positioned EXACTLY as CinematicReel mobile mode */}
              <div
                className="absolute left-1/2 top-[calc(50%-18px)] aspect-[9/16] h-[60svh] max-h-[560px] max-w-[76vw] -translate-x-1/2"
              >
                {project.variant === 'reels' ? (
                  <ReelShowcase
                    project={project}
                    near={near.has(i)}
                    active={i === active}
                    mobile={true}
                  />
                ) : (
                  <ReelCard
                    project={project}
                    index={i}
                    total={n}
                    isActive={i === active}
                    minimal={true}
                    showDuration={false}
                    bottomActions={
                      <ReelAudioButton
                        on={!mutedCards.has(project.id)}
                        onToggle={() => toggleCardMute(project.id)}
                        label={project.title}
                      />
                    }
                    media={
                      <ReelVideo
                        desktopSrc={project.desktopVideo}
                        mobileSrc={project.mobileVideo}
                        poster={project.poster}
                        label={project.category}
                        near={near.has(i)}
                        active={i === active}
                        muted={mutedCards.has(project.id)}
                        resetOnActivate
                        darkFallback
                      />
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator — same as CinematicReel mobile */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[max(28px,env(safe-area-inset-bottom))] flex justify-center px-6">
          <ReelProgress
            ref={progressRef}
            total={n}
            active={active}
            label="Swipe"
            className="w-full max-w-[280px]"
          />
        </div>
      </div>
    </section>
  );
}
