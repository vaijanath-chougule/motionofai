import { useCallback, useEffect, useRef, useState } from 'react';
import ReelAudioButton from './ReelAudioButton';
import ReelCard from './ReelCard';
import ReelVideo from './ReelVideo';

/**
 * MobileSwipeReel — native horizontal swipe carousel for mobile AI Video Production.
 *
 * Unlike CinematicReel (which pins and scrubs on scroll), this uses native
 * CSS scroll-snap for a touch-friendly left/right swipe interaction.
 *
 * User swipes horizontally to navigate between videos:
 *   Video 1 → swipe left → Video 2 → swipe left → Video 3 → etc.
 *
 * Features:
 *   - Native touch scrolling with snap points
 *   - IntersectionObserver tracks which video is centered
 *   - Active video auto-plays, others pause
 *   - Smooth snap animations
 *   - No vertical scroll interference within the carousel
 *   - Hidden scrollbar for clean UI
 *
 * Desktop uses CinematicReel; this is mobile-only.
 */
export default function MobileSwipeReel({ projects }) {
  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mutedCards, setMutedCards] = useState(
    () => new Set(projects.map((p) => p.id))
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
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = parseInt(entry.target.dataset.index, 10);
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: scroller,
        threshold: [0.6],
      }
    );

    cards.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [projects.length]);

  const toggleCardMute = useCallback((id) => {
    setMutedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="relative w-full">
      {/* Horizontal scroll container with snap points */}
      <div
        ref={scrollerRef}
        className="flex w-full overflow-x-auto overflow-y-hidden overscroll-x-contain [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          // Prevent vertical scroll interference
          touchAction: 'pan-x pinch-zoom',
        }}
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            ref={(el) => (cardRefs.current[index] = el)}
            data-index={index}
            className="w-full shrink-0 px-4"
            style={{
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always',
            }}
          >
            <div className="mx-auto w-full max-w-[min(420px,92vw)]">
              <ReelCard
                project={project}
                index={index}
                total={projects.length}
                isActive={index === activeIndex}
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
                    near={true}
                    active={index === activeIndex}
                    muted={mutedCards.has(project.id)}
                    resetOnActivate
                    darkFallback
                  />
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination dots indicator */}
      <div className="mt-6 flex justify-center gap-2">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const card = cardRefs.current[index];
              if (card && scrollerRef.current) {
                card.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'center',
                });
              }
            }}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: index === activeIndex ? '24px' : '8px',
              backgroundColor:
                index === activeIndex
                  ? '#2563eb'
                  : 'rgba(37, 99, 235, 0.3)',
            }}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
