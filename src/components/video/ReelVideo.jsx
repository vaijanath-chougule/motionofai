import { useEffect, useRef, useState } from 'react';
import { useMediaQuery, MOBILE_QUERY } from '../../hooks/useMediaQuery';

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
 *
 * Once a card has been near the centre it stays mounted (latched) to avoid a
 * reload/flicker when the visitor scrubs back and forth. Resolves exactly
 * one source per device and crossfades up from the poster.
 */
export default function ReelVideo({ desktopSrc, mobileSrc, poster, label = 'Cinematic Video', near, active }) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const src = isMobile ? mobileSrc ?? desktopSrc : desktopSrc ?? mobileSrc;

  const videoRef = useRef(null);
  const [mounted, setMounted] = useState(false); // latched once near
  const [playing, setPlaying] = useState(false); // real frames painting
  const [failed, setFailed] = useState(false);

  // Latch mount the first time this card nears the centre.
  useEffect(() => {
    if (near) setMounted(true);
  }, [near]);

  // A newly-resolved source (breakpoint crossed) restarts the fade state.
  useEffect(() => {
    setPlaying(false);
    setFailed(false);
  }, [src]);

  // Play only when centred; pause otherwise. Only one video decodes at once.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) v.play?.().catch(() => {});
    else v.pause?.();
  }, [active, mounted]);

  const showVideo = src && mounted && !failed;

  return (
    <div className="placeholder-surface gpu absolute inset-0 h-full w-full">
      {showVideo && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
          src={src}
          poster={poster}
          loop
          muted
          playsInline
          preload="metadata"
          onPlaying={() => setPlaying(true)}
          onError={() => setFailed(true)}
        />
      )}

      {/* Poster / studio placeholder beneath the video until frames paint. */}
      {!playing && <MediaFallback poster={poster} label={label} />}
    </div>
  );
}

function MediaFallback({ poster, label }) {
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
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(120%_120%_at_50%_30%,#f4f7ff_0%,#eaeef7_55%,#e4e9f4_100%)]">
      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">{label}</span>
    </div>
  );
}
