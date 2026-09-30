import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReelAudioButton from './ReelAudioButton';
import ReelCard from './ReelCard';
import ReelVideo from './ReelVideo';

/**
 * MobileRailReel — mobile-only horizontal carousel for the AI Video Production
 * section. Replaces the old pinned/ScrollTrigger-driven layout.
 *
 * One continuous horizontal rail. Every card sits immediately after the previous
 * one with a small intentional gap. Vertical page scrolling continues to work
 * (touch-action: pan-y); horizontal swipes drive the carousel. CSS scroll-snap
 * settles each card to centre.
 *
 * Each card is a SINGLE ReelCard + ReelVideo (or, for the children of a
 * `variant: 'reels'` collection, a single ReelCard that always happens to be
 * 9:16). The rail flattens every top-level project AND every reel inside a
 * collection into one ordered list, so the visitor walks the entire library
 * left-to-right without ever leaving the rail.
 *
 * Cards keep their source aspect ratio:
 *   - 9:16  →  `aspect-[9/16] h-[min(60svh,560px)]`  (jewellery, nimantran)
 *   - 16:9  →  `aspect-[16/9] w-[min(88vw,560px)]`   (Minar, Rova, Suvi)
 *
 * Heights are NOT forced equal across the rail — each card renders at its own
 * natural height so 16:9 videos are not cropped/pillarboxed into a 9:16 frame
 * and 9:16 videos are not letterboxed into a 16:9 frame.
 *
 * Active-card detection:
 *   - One IntersectionObserver rooted on the scroller, threshold 0.6.
 *   - Whichever card has the largest visible share becomes the active index.
 *   - Only the active card passes `active={true}` to its ReelVideo → only it
 *     autoplays. Everything else is paused by the existing ReelVideo props
 *     (no separate playback manager — the global `videoPlaybackManager` from
 *     `src/utils/videoPlaybackManager.js` still owns exclusive-audio priority
 *     when the visitor unmutes the active card).
 *
 * Preserved from the desktop / CinematicReel path:
 *   - ReelCard chrome (border radius, scrim, sheen, overlay play glyph, bottom
 *     meta block).
 *   - ReelVideo props (muted, loop, playsInline, resetOnActivate, darkFallback,
 *     collectionId="mobile-rail").
 *   - ReelAudioButton toggle on every non-`reels` card.
 *   - Global playback manager (no second manager is introduced).
 *
 * Replaced:
 *   - Pinned section + ScrollTrigger scrub → native horizontal scroll.
 *   - Forced uniform 9:16 frame → mixed-aspect carousel.
 *   - Stacked-by-collection arrangement → one continuous rail.
 */
export default function MobileRailReel({ projects }) {
  // Flatten FEATURED_REEL into a single ordered list. Each item is one card.
  // Children of a `variant: 'reels'` project keep the parent id so the global
  // playback manager still treats them as one collection (same audio priority
  // semantics as ReelShowcase on desktop).
  const cards = useMemo(
    () =>
      projects.flatMap((p) => {
        if (p.variant === 'reels') {
          return (p.reels ?? []).map((r) => ({
            id: r.id,
            title: r.title,
            category: r.category || p.category || '',
            description: '',
            desktopVideo: r.desktopVideo,
            mobileVideo: r.mobileVideo ?? r.desktopVideo,
            poster: r.poster,
            collectionId: p.id,
            sourceAspect: '9/16',
          }));
        }
        return [
          {
            id: p.id,
            title: p.title,
            category: p.category || '',
            description: p.description || '',
            desktopVideo: p.desktopVideo,
            mobileVideo: p.mobileVideo ?? p.desktopVideo,
            poster: p.poster,
            collectionId: 'mobile-rail',
            sourceAspect: '16/9',
          },
        ];
      }),
    [projects],
  );
  const n = cards.length;

  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);
  const [active, setActive] = useState(0);
  // Mount/mounted latch — same pattern CinematicReel uses. Cards within one
  // slot of centre are mounted (and therefore allowed to load); far cards stay
  // unmounted so the browser does not preload the whole library.
  const [near, setNear] = useState(() => new Set([0, 1]));

  // Every card starts muted. Toggling unmutes the active card and lets the
  // existing playback manager enforce exclusive audio.
  const [mutedCards, setMutedCards] = useState(
    () => new Set(cards.map((c) => c.id)),
  );

  // Active card detection — IntersectionObserver rooted on the scroller. We
  // accept the card with the largest intersection ratio at or above 0.6, so
  // two cards are never treated as active at once during a swipe.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const items = cardRefs.current.filter(Boolean);
    if (!scroller || !items.length || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Take the intersecting entry with the highest visible share.
        let bestIndex = null;
        let bestRatio = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.intersectionRatio > bestRatio) {
            const idx = Number.parseInt(entry.target.dataset.index, 10);
            if (!Number.isNaN(idx)) {
              bestRatio = entry.intersectionRatio;
              bestIndex = idx;
            }
          }
        });
        if (bestIndex === null || bestRatio < 0.6 || bestIndex === activeRef.current) {
          return;
        }
        activeRef.current = bestIndex;
        setActive(bestIndex);
        setNear((prev) => {
          const s = new Set(prev);
          for (let k = bestIndex - 1; k <= bestIndex + 1; k += 1) {
            if (k >= 0 && k < n) s.add(k);
          }
          return s;
        });
      },
      { root: scroller, threshold: [0.6, 0.8, 1] },
    );

    const ref = activeRef;
    items.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [n]);

  // Ref mirror of `active` so the observer closure can compare without
  // re-binding every render.
  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // When the active card changes, re-mute whichever card just left so a
  // returning to it always starts silent (same rule CinematicReel enforces).
  const prevActiveRef = useRef(0);
  useEffect(() => {
    const prev = cards[prevActiveRef.current];
    if (prev) setMutedCards((s) => (s.has(prev.id) ? s : new Set([...s, prev.id])));
    prevActiveRef.current = active;
  }, [active, cards]);

  const toggleCardMute = useCallback((id) => {
    setMutedCards((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (n === 0) return null;

  return (
    <div className="relative w-full">
      {/* Ambient glow — same recipe as CinematicReel's stage so the rail reads
          as part of the same section, not a different component. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[85vh] w-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
        style={{
          background:
            'radial-gradient(circle, rgba(37,99,235,0.10), rgba(37,99,235,0) 70%)',
        }}
      />

      {/* The rail itself.
          - overflow-x: auto + touch-action: pan-y → horizontal swipe drives the
            carousel; vertical gestures pass through to the page scroll.
          - scroll-snap-type: x mandatory → settle cleanly on each card.
          - gap keeps cards "immediately adjacent with a small intentional gap"
            per the brief; no large vertical sections, no stacked collections.
          - data-lenis-prevent → Lenis (the global smooth scroll) skips this
            element entirely so its touch listener does NOT preventDefault the
            horizontal pan. Without this attribute, Lenis intercepts the touch
            event and the rail refuses to scroll. The attribute is the
            documented Lenis escape hatch; the CSS rule in index.css that
            matches it only adds overscroll-behavior: contain, but Lenis itself
            reads the attribute at runtime. */}
      <div
        ref={scrollerRef}
        data-lenis-prevent
        className="relative flex overflow-x-auto overflow-y-hidden overscroll-x-contain py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          gap: '14px',
          paddingLeft: 'max(16px, calc((100vw - min(88vw,560px)) / 2))',
          paddingRight: 'max(16px, calc((100vw - min(88vw,560px)) / 2))',
        }}
      >
        {cards.map((c, i) => {
          // 9:16 cards (jewellery + nimantran) keep the existing CinematicReel
          // mobile sizing verbatim. 16:9 cards (Minar, Rova, Suvi) get a
          // width-driven frame so the source aspect is preserved.
          const isPortrait = c.sourceAspect === '9/16';
          const sizeClass = isPortrait
            ? 'aspect-[9/16] h-[min(60svh,560px)]'
            : 'aspect-[16/9] w-[min(88vw,560px)]';

          const isActive = i === active;
          const isMuted = mutedCards.has(c.id);

          return (
            <div
              key={c.id}
              ref={(el) => (cardRefs.current[i] = el)}
              data-index={i}
              className={`relative shrink-0 ${sizeClass}`}
              style={{
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always',
              }}
            >
              <ReelCard
                project={c}
                index={i}
                total={n}
                isActive={isActive}
                minimal
                showDuration={false}
                showCounter={false}
                bottomActions={
                  <ReelAudioButton
                    on={!isMuted}
                    onToggle={() => toggleCardMute(c.id)}
                    label={c.title}
                  />
                }
                media={
                  <ReelVideo
                    desktopSrc={c.desktopVideo}
                    mobileSrc={c.mobileVideo}
                    poster={c.poster}
                    label={c.category}
                    near={near.has(i)}
                    active={isActive}
                    muted={isMuted}
                    videoId={c.id}
                    collectionId={c.collectionId}
                    resetOnActivate
                    darkFallback
                  />
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}