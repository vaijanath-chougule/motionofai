import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { FocusItem, useFocusGallery } from '../motion/FocusGallery';
import ReelAudioButton from './ReelAudioButton';
import ReelCard from './ReelCard';
import ReelVideo from './ReelVideo';

/**
 * ReelShowcase — the five-up vertical reel collection that occupies ONE slot
 * of the pinned CinematicReel (the entry flagged `variant: 'reels'`). Every
 * other slot in the reel is untouched and still renders a single landscape
 * ReelCard.
 *
 * It deliberately owns NO scroll behaviour of its own on the vertical axis:
 * the parent still pins, scrubs and transforms this slot exactly as before.
 * All this component does is fill that slot with true 9:16 cards.
 *
 * LAYOUT — one flex row for every breakpoint, only `perView` changes:
 *   • desktop (≥1024px) — 5 reels, no overflow, centred
 *   • tablet  (768–1023px) — 3 reels in view; the remaining two stay reachable
 *     through the native horizontal snap-scroller (nothing is dropped)
 *   • phone   (≤767px) — one full-width reel, swipe between them
 * Card size is `min(share-of-the-row, slot-height × 9/16)` so the 9:16 ratio
 * is exact at every width AND the row can never grow taller than the slot the
 * parent already reserved. The section's height is therefore unchanged.
 *
 * AUDIO — at most one reel may sound, anywhere on the page. `soloId` is the
 * single source of truth; ReelVideo applies it as a live `muted` property
 * write, so switching sound between reels is instant and never restarts
 * playback. Sound is dropped automatically when the slot leaves centre or the
 * sounding reel is swiped off screen — no invisible audio, ever.
 *
 * PERFORMANCE — mount is gated on `near` (the parent's own latch, so far cards
 * never download), playback on `active && on-screen`. On phones that means a
 * single decoding video even though five are mounted, tracked by one
 * IntersectionObserver rooted on the scroller rather than a scroll listener.
 *
 * BANDWIDTH SCHEDULER — five simultaneous streams starve each other, so this
 * component decides WHICH reels may hold a source at any moment. A browser
 * gives no direct throttle: `preload` is advisory and pausing does not cancel a
 * fetch in flight. Detaching the <video> does, so `allowLoad` is the whole
 * mechanism (see ReelVideo).
 *
 *   • Reels fetch only once they are APPROACHING the viewport — a second
 *     observer with a one-viewport rootMargin, ahead of the 0.6-threshold one
 *     that governs playback.
 *   • At most MAX_WARMING reels may be filling their buffer at once. A reel
 *     stops counting against that budget once it holds WARM_ENOUGH seconds, so
 *     the queue drains steadily instead of stampeding on first paint.
 *   • Unmuting a reel makes it the priority stream: it is admitted instantly,
 *     no new background reel is admitted, and every admitted reel that is off
 *     screen has its source withdrawn — cancelling those range requests and
 *     leaving the connection to the reel actually being watched.
 *   • Background admission resumes only once the priority reel holds
 *     PRIORITY_BUFFER_HI seconds ahead of its playhead, and is withdrawn again
 *     if that cushion falls below PRIORITY_BUFFER_LO. The gap between the two
 *     is deliberate: a single threshold would oscillate on every progress tick.
 *
 * Reels already on screen are never yanked — cancelling a visible stream would
 * drop a painted card back to its placeholder, which is a visual change, and
 * the brief is explicit that only loading behaviour may change.
 */

const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)';
const PHONE_QUERY = '(max-width: 767px)';

// How many reels may be filling their buffer concurrently. Two keeps the pipe
// busy without splitting it so thin that nothing reaches playable depth.
const MAX_WARMING = 2;

// Seconds of cushion that frees a reel's slot for the next one in the queue.
const WARM_ENOUGH = 2;

// Priority cushion, with hysteresis. Background admission resumes once the
// watched reel holds HI seconds and is suspended again below LO.
const PRIORITY_BUFFER_HI = 8;
const PRIORITY_BUFFER_LO = 5;

// Sets compare by identity, so state updates need a value check to avoid
// re-rendering (and re-running the scheduler) on every progress event.
const sameSet = (a, b) => a.size === b.size && [...a].every((v) => b.has(v));

// Gutter between reels, per layout. Kept generous enough that the cards read
// as separate objects and tight enough that five fit the existing slot.
const GAP = { 1: 0, 3: 18, 5: 20 };

// Tallest a reel may be. Sits just inside the slot the parent reserves
// (78svh / max 900px on desktop) so the row always clears the card chrome.
const MAX_CARD_HEIGHT = 'min(74svh, 820px)';

export default function ReelShowcase({
  project,
  near = true,
  active = true,
  mobile = false,
}) {
  // Memoised so the scheduler effect below never sees a fresh [] each render.
  const reels = useMemo(() => project.reels ?? [], [project.reels]);
  const total = reels.length;

  const isPhone = useMediaQuery(PHONE_QUERY);
  const isTablet = useMediaQuery(TABLET_QUERY);
  const perView = isPhone || mobile ? 1 : isTablet ? 3 : 5;
  const gap = GAP[perView];

  const scrollerRef = useRef(null);
  const itemRefs = useRef([]);

  // Cinematic focus on hover — desktop only. `perView === 5` is the five-up
  // layout, so phones (1) and tablets (3) never arm it; the hook additionally
  // requires a fine pointer and no reduced-motion preference. When inactive it
  // renders plain divs and nothing here behaves differently.
  const gallery = useFocusGallery({ enabled: perView === 5 });

  // Which reels are actually on screen inside the scroller. Everything else
  // is mounted but paused, so exactly one video decodes on a phone.
  const [visible, setVisible] = useState(() => new Set(reels.map((r) => r.id)));
  // Which reels are within a viewport of entering — the fetch trigger, always
  // a superset of `visible`.
  const [approaching, setApproaching] = useState(() => new Set(reels.map((r) => r.id)));
  // The one reel allowed to make sound. null = the whole showcase is silent.
  const [soloId, setSoloId] = useState(null);
  // Which reels currently hold a source. The scheduler's output.
  const [allowed, setAllowed] = useState(() => new Set());
  // Reels holding WARM_ENOUGH seconds — they no longer occupy a warming slot.
  const [warm, setWarm] = useState(() => new Set());
  // Does the priority reel have its cushion? True whenever nothing is soloed,
  // so background loading runs unimpeded in the normal case.
  const [priorityReady, setPriorityReady] = useState(true);

  // Two observers on the same root: one for playback (mostly-visible), one a
  // viewport ahead of it for fetching.
  useEffect(() => {
    const root = scrollerRef.current;
    const items = itemRefs.current.filter(Boolean);
    if (!root || !items.length || typeof IntersectionObserver === 'undefined') return undefined;

    const track = (setter) => (entries) =>
      setter((prev) => {
        const next = new Set(prev);
        entries.forEach((entry) => {
          const { id } = entry.target.dataset;
          if (!id) return;
          if (entry.isIntersecting) next.add(id);
          else next.delete(id);
        });
        return sameSet(prev, next) ? prev : next;
      });

    const playback = new IntersectionObserver(track(setVisible), { root, threshold: 0.6 });
    // One root-width of lead time on each side: a reel starts fetching just
    // before the swipe that brings it in, never five at once.
    const fetching = new IntersectionObserver(track(setApproaching), {
      root,
      rootMargin: '0px 100%',
      threshold: 0,
    });

    items.forEach((el) => {
      playback.observe(el);
      fetching.observe(el);
    });
    return () => {
      playback.disconnect();
      fetching.disconnect();
    };
  }, [perView, total]);

  // Leaving centre silences the collection, so audio can never outlive the
  // slot that owns it.
  useEffect(() => {
    if (!active) setSoloId(null);
  }, [active]);

  // Swiping the sounding reel off screen silences it too (phones/tablets).
  useEffect(() => {
    if (soloId && !visible.has(soloId)) setSoloId(null);
  }, [soloId, visible]);

  // Click the active speaker → mute. Click any other → that reel takes the
  // audio and the previous one is muted in the same commit.
  const toggleSolo = useCallback((id) => {
    setSoloId((current) => (current === id ? null : id));
  }, []);

  // ---- bandwidth scheduler -------------------------------------------------

  // Last reported cushion per reel, and the current priority id. Refs, because
  // buffer events fire several times a second and must not re-render.
  const bufferRef = useRef({});
  const priorityRef = useRef(null);

  // A new priority reel inherits whatever cushion it already had, so switching
  // to an fully-buffered reel does not needlessly stall the others.
  useEffect(() => {
    priorityRef.current = soloId;
    if (!soloId) setPriorityReady(true);
    else setPriorityReady((bufferRef.current[soloId] ?? 0) >= PRIORITY_BUFFER_HI);
  }, [soloId]);

  const reportBuffer = useCallback((id, ahead) => {
    bufferRef.current[id] = ahead;

    setWarm((prev) => {
      const cushioned = ahead >= WARM_ENOUGH;
      if (cushioned === prev.has(id)) return prev;
      const next = new Set(prev);
      if (cushioned) next.add(id);
      else next.delete(id);
      return next;
    });

    if (id !== priorityRef.current) return;
    // Hysteresis: cross HI to release the background, fall under LO to hold it
    // again. Between the two, whatever was decided last stands.
    setPriorityReady((prev) => {
      if (ahead >= PRIORITY_BUFFER_HI) return true;
      if (ahead < PRIORITY_BUFFER_LO) return false;
      return prev;
    });
  }, []);

  // A dead source must not sit on a warming slot forever.
  const reportUnavailable = useCallback((id) => {
    bufferRef.current[id] = Infinity;
    setWarm((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  // The admission decision itself. Recomputed only when an input genuinely
  // changes — never per buffer event.
  useEffect(() => {
    setAllowed((prev) => {
      const next = new Set();
      const holdBackground = Boolean(soloId) && !priorityReady;

      // 1. The reel being watched always loads, ahead of everything else.
      if (soloId) next.add(soloId);

      // 2. Keep what is already streaming AND still on screen. Off-screen
      //    grants are dropped while the priority reel is short of cushion —
      //    that is the bandwidth actually being reclaimed.
      reels.forEach((r) => {
        if (r.id === soloId || !prev.has(r.id)) return;
        if (!holdBackground || visible.has(r.id)) next.add(r.id);
      });

      // 3. Admit newcomers up to the warming budget, nearest-first, unless we
      //    are clearing the way for the priority reel. While a reel is being
      //    watched the budget narrows to one, so background reels keep filling
      //    in — just gently, one at a time, never as a pack.
      if (!holdBackground) {
        const budget = soloId ? 1 : MAX_WARMING;
        let slots = budget - [...next].filter((id) => !warm.has(id)).length;
        for (const r of reels) {
          if (slots <= 0) break;
          if (next.has(r.id) || !approaching.has(r.id)) continue;
          next.add(r.id);
          slots -= 1;
        }
      }

      return sameSet(prev, next) ? prev : next;
    });
  }, [reels, soloId, priorityReady, approaching, visible, warm]);

  // One 9:16 card: never wider than its share of the row, never taller than
  // the slot. Height follows from the aspect ratio, so the ratio is exact.
  const itemStyle = useMemo(() => {
    if (perView === 1) return { width: '100%', scrollSnapAlign: 'center' };
    const share = `calc((100% - ${(perView - 1) * gap}px) / ${perView})`;
    return {
      width: `min(${share}, calc(${MAX_CARD_HEIGHT} * 9 / 16))`,
      scrollSnapAlign: 'center',
    };
  }, [perView, gap]);

  if (!total) return null;

  return (
    <div
      ref={(el) => {
        scrollerRef.current = el;
        gallery.rowRef.current = el;
      }}
      {...gallery.rowHandlers}
      className={`flex h-full w-full items-center overscroll-x-contain [&::-webkit-scrollbar]:hidden ${
        perView === 5 ? 'justify-center' : 'justify-start'
      } ${
        // A focused card lifts and grows past the row's box, so the row stops
        // clipping while the effect is armed. Only ever true in the five-up
        // layout, which has no horizontal overflow to scroll in the first
        // place — the swiping layouts keep their scroller untouched.
        gallery.active ? 'overflow-visible' : 'overflow-x-auto overflow-y-hidden'
      }`}
      style={{
        gap: `${gap}px`,
        scrollbarWidth: 'none',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {reels.map((reel, i) => {
        const id = reel.id;
        const label = reel.title ?? project.title;
        const onScreen = visible.has(id);

        return (
          <FocusItem
            key={id}
            index={i}
            controller={gallery}
            data-id={id}
            elementRef={(el) => (itemRefs.current[i] = el)}
            className="relative aspect-[9/16] shrink-0 will-change-transform"
            style={itemStyle}
          >
            <ReelCard
              project={{
                category: reel.category ?? project.category,
                title: label,
              }}
              index={i}
              total={total}
              isActive={active && onScreen}
              // The collection carries neither runtimes nor an NN/TT counter —
              // the card is just its label and the couple's name.
              showDuration={false}
              showCounter={false}
              actions={
                <ReelAudioButton
                  on={soloId === id}
                  onToggle={() => toggleSolo(id)}
                  label={`${label} — reel ${i + 1}`}
                />
              }
              media={
                <ReelVideo
                  desktopSrc={reel.desktopVideo}
                  mobileSrc={reel.mobileVideo}
                  poster={reel.poster}
                  label={reel.category ?? project.category}
                  near={near}
                  active={active && onScreen}
                  muted={soloId !== id}
                  allowLoad={allowed.has(id)}
                  onBufferAhead={(ahead) => reportBuffer(id, ahead)}
                  onUnavailable={() => reportUnavailable(id)}
                />
              }
            />
          </FocusItem>
        );
      })}
    </div>
  );
}
