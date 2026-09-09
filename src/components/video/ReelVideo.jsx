import { useEffect, useRef, useState } from 'react';
import { useMediaQuery, MOBILE_QUERY } from '../../hooks/useMediaQuery';
import playbackManager from '../../utils/videoPlaybackManager';

/**
 * ReelVideo — a scroll-CONTROLLED cinematic video for the desktop reel.
 *
 * Unlike ResponsiveVideo (which plays/pauses itself via IntersectionObserver),
 * this one is driven entirely by props so the parent timeline decides which
 * single card is "active":
 *   • `near`   — the card is at/next-to centre → mount the <video> and begin
 *                loading it early. Far cards never mount, so we never preload
 *                all five or decode more than we need.
 *   • `active` — the card is centred → play. Everything else pauses, so only
 *                one video decodes at a time.
 *   • `muted`  — audio gate. Defaults to true (autoplay policy demands it);
 *                the vertical showcase flips exactly one player to false on a
 *                user gesture. Applied imperatively so toggling sound NEVER
 *                touches `src` and therefore never restarts playback.
 *   • `allowLoad` — bandwidth gate, owned by a parent scheduler. While false
 *                the <video> is not in the DOM at all, which is the only
 *                reliable way to ABORT an in-flight range request: `preload`
 *                is advisory and pausing does not cancel a fetch already under
 *                way. Detaching does. Defaults true, so every other caller
 *                (the landscape reel, the reduced-motion stack) is unaffected.
 *
 * Once a card has been near the centre it stays mounted (latched) to avoid a
 * reload/flicker when the visitor scrubs back and forth. Resolves exactly
 * one source per device and crossfades up from the poster.
 *
 * It reports two things upward so a scheduler can make decisions it cannot
 * make itself: `onBufferAhead` (seconds of contiguous data past the playhead)
 * and `onUnavailable` (this source will never load). Both are held in refs, so
 * a parent may pass fresh closures every render without re-binding listeners.
 *
 * PRIORITY PLAYBACK:
 * Integrates with the global playback manager. When a video is unmuted, it
 * claims exclusive priority and all other videos are paused. Only the priority
 * video may play until it is muted again or another video claims priority.
 */
export default function ReelVideo({
  desktopSrc,
  mobileSrc,
  poster,
  label = 'Cinematic Video',
  near,
  active,
  muted = true,
  allowLoad = true,
  onBufferAhead,
  onUnavailable,
  /** Unique ID for this video (required for priority system) */
  videoId,
  /** Collection ID for grouping (e.g., 'jewellery', 'wedding') */
  collectionId,
  /** When true, currentTime is reset to 0 each time the card becomes active.
   *  Defaults false so Card 1 (ReelShowcase sub-reels) is completely unchanged. */
  resetOnActivate = false,
  /** When true, the no-poster loading state is solid black instead of the
   *  light studio gradient. Defaults false to preserve Card 1 behaviour. */
  darkFallback = false,
}) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const src = isMobile ? mobileSrc ?? desktopSrc : desktopSrc ?? mobileSrc;

  const videoRef = useRef(null);
  const [mounted, setMounted] = useState(false); // latched once near
  const [playing, setPlaying] = useState(false); // real frames painting
  const [failed, setFailed] = useState(false);

  // Track the generation when we last requested play, to detect stale requests
  const playGenerationRef = useRef(null);

  // Callbacks live in refs so the listener effect below binds once per mount
  // rather than on every parent render.
  const bufferCb = useRef(onBufferAhead);
  const unavailableCb = useRef(onUnavailable);
  bufferCb.current = onBufferAhead;
  unavailableCb.current = onUnavailable;

  // Register with the global playback manager
  useEffect(() => {
    if (!videoId || !videoRef.current) return undefined;

    playbackManager.registerVideo(videoId, videoRef.current, collectionId);

    return () => {
      playbackManager.unregisterVideo(videoId);
    };
  }, [videoId, collectionId, mounted]);

  // Latch mount the first time this card nears the centre — and release it
  // again the moment the scheduler withdraws permission, which is what
  // actually cancels the download.
  useEffect(() => {
    if (near && allowLoad) setMounted(true);
    else if (!allowLoad) {
      setMounted(false);
      setPlaying(false); // fall back to the placeholder, never to white
    }
  }, [near, allowLoad]);

  // A newly-resolved source (breakpoint crossed) restarts the fade state.
  useEffect(() => {
    setPlaying(false);
    setFailed(false);
  }, [src]);

  // Play only when centred; pause otherwise. Only one video decodes at once.
  // `resetOnActivate` resets currentTime to 0 on enter so Cards 2–5 always
  // restart from the beginning — Card 1 leaves this false and is unaffected.
  // NOW GATED BY THE GLOBAL PLAYBACK MANAGER — only plays if allowed.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoId) return;

    if (active) {
      // Check with the playback manager before playing
      const generation = playbackManager.requestPlay(videoId);

      if (generation === null) {
        // Play request rejected — another video has priority
        v.pause?.();
        return;
      }

      // Play request approved — store generation and attempt play
      playGenerationRef.current = generation;

      if (resetOnActivate) v.currentTime = 0;

      // Use a microtask to ensure the generation is still valid
      Promise.resolve().then(() => {
        // Verify generation hasn't changed (no newer priority claim)
        if (playGenerationRef.current === generation && playbackManager.canPlay(videoId)) {
          v.play?.().catch(() => {
            // Ignore autoplay errors — likely policy restriction
          });
        }
      });
    } else {
      v.pause?.();
    }
  }, [active, mounted, resetOnActivate, videoId]);

  // Audio gate — a live property write on the element itself. No re-mount, no
  // seek, no reload: the frame on screen keeps playing and the sound simply
  // appears or disappears. Re-applied after (re)mount and after a source swap.
  // PRIORITY SYSTEM: When unmuted, claim exclusive priority and pause all others.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoId) return;

    // Apply muted state to the element
    v.muted = muted;

    // Priority management based on muted state
    if (!muted) {
      // This video is being unmuted — claim exclusive priority
      playbackManager.claimPriority(videoId);

      // Ensure this video is actually playing (it now has priority)
      if (active && mounted) {
        const generation = playbackManager.getGeneration();
        playGenerationRef.current = generation;

        Promise.resolve().then(() => {
          if (playGenerationRef.current === generation && playbackManager.canPlay(videoId)) {
            v.play?.().catch(() => {});
          }
        });
      }
    } else {
      // This video is being muted — release priority if it owns it
      if (playbackManager.isPriority(videoId)) {
        playbackManager.releasePriority();
        v.pause?.();
      }
    }
  }, [muted, mounted, src, videoId, active]);

  const showVideo = src && mounted && !failed;

  // Report how much contiguous data sits ahead of the playhead. This is what
  // lets the scheduler tell "comfortably buffered" from "about to stall"
  // without guessing at connection speed.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !showVideo) return undefined;

    const report = () => {
      const t = v.currentTime;
      let ahead = 0;
      for (let i = 0; i < v.buffered.length; i += 1) {
        // 0.25s of slack: the range holding the playhead may start a hair past it.
        if (v.buffered.start(i) <= t + 0.25 && v.buffered.end(i) > t) {
          ahead = v.buffered.end(i) - t;
          break;
        }
      }
      bufferCb.current?.(ahead);
    };

    // `waiting` is the stall itself — report immediately so the scheduler can
    // clear the way rather than waiting for the next progress tick.
    const events = ['progress', 'timeupdate', 'waiting', 'canplay'];
    events.forEach((e) => v.addEventListener(e, report));
    report();
    return () => events.forEach((e) => v.removeEventListener(e, report));
  }, [showVideo]);

  return (
    <div className="placeholder-surface gpu absolute inset-0 h-full w-full">
      {/* When a poster exists it crossfades OUT as the video fades IN — both
          share the same 700ms duration so neither layer ever goes transparent
          at the same time. Without a poster the original instant-remove path
          is used unchanged (dark/gradient fallback via MediaFallback). */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {showVideo && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
          src={src}
          poster={poster}
          loop
          muted={muted}
          playsInline
          preload="metadata"
          onPlaying={() => setPlaying(true)}
          onError={() => {
            setFailed(true);
            // Tell the scheduler to stop holding a slot for a source that is
            // never going to arrive.
            unavailableCb.current?.();
          }}
        />
      )}

      {/* Non-poster fallbacks (dark solid / light gradient) — original path. */}
      {!playing && !poster && <MediaFallback label={label} dark={darkFallback} />}
    </div>
  );
}

function MediaFallback({ poster, label, dark }) {
  if (poster) {
    return (
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  // `dark` → solid black loading state for Cards 2–5 (no spinner, no text).
  // Default light gradient preserved for Card 1 (ReelShowcase sub-reels).
  if (dark) {
    return <div className="absolute inset-0 bg-black" />;
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(120%_120%_at_50%_30%,#f4f7ff_0%,#eaeef7_55%,#e4e9f4_100%)]">
      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">{label}</span>
    </div>
  );
}
