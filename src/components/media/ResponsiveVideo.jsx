import { useEffect, useRef, useState } from 'react';
import { useMediaQuery, MOBILE_QUERY } from '../../hooks/useMediaQuery';
import { prefersReducedMotion } from '../../utils/device';

/**
 * Device-aware cinematic video.
 *
 * • Resolves EXACTLY ONE source (mobile OR desktop) via matchMedia, so
 *   the browser never double-downloads. `preload="metadata"` keeps the
 *   initial cost tiny until it plays.
 * • Mounts the <video> only after it nears the viewport, then plays /
 *   pauses with an IntersectionObserver (off-screen video = 0 decode).
 * • Until real frames are painting — no src yet, still loading, a failed
 *   fetch, or reduced-motion — it shows an elegant studio placeholder (or
 *   the poster), so there is never a broken player and ZERO layout shift.
 * • object-fit: cover; the box (aspect ratio, radius) is owned by the
 *   parent via `className`.
 */
export default function ResponsiveVideo({
  desktopSrc,
  mobileSrc,
  poster,
  className = '',
  label = 'Cinematic Video',
  /** Controllable mute — defaults true (autoplay policy). Pass false to unmute
   *  after a user gesture (e.g. the audio button in MobileReel for Cards 2–5). */
  muted = true,
  /** Solid black loading state instead of the light placeholder gradient.
   *  Used for Cards 2–5 in the reduced-motion MobileReel path. */
  darkFallback = false,
}) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const src = isMobile ? mobileSrc ?? desktopSrc : desktopSrc ?? mobileSrc;
  const reduce = prefersReducedMotion();

  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const [mounted, setMounted] = useState(false); // has entered viewport once
  const [playing, setPlaying] = useState(false); // painting real frames
  const [failed, setFailed] = useState(false); // src missing / undecodable

  // A newly-resolved source (breakpoint crossed) starts fresh.
  useEffect(() => {
    setPlaying(false);
    setFailed(false);
  }, [src]);

  // Mount latch + play/pause on viewport enter/leave.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || reduce || !src) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          videoRef.current?.play?.().catch(() => {});
        } else {
          videoRef.current?.pause?.();
        }
      },
      { rootMargin: '200px', threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, src]);

  // Apply muted imperatively so toggling audio never restarts playback.
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted, playing]);

  const showVideo = src && mounted && !reduce && !failed;

  return (
    <div ref={wrapRef} className={`placeholder-surface gpu ${className}`}>
      {showVideo && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
          src={src}
          poster={poster}
          autoPlay
          loop
          muted={muted}
          playsInline
          preload="metadata"
          onPlaying={() => setPlaying(true)}
          onError={() => setFailed(true)}
        />
      )}

      {/* Base layer: poster (if any) or studio placeholder. Sits beneath
          the video and stays visible until real frames fade in — also the
          reduced-motion and no-asset resting state. */}
      {!playing && <MediaFallback poster={poster} label={label} dark={darkFallback} />}

      {/* Inner vignette seats the media into the page. */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_120px_rgba(17,17,17,0.06)]" />
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
  if (dark) {
    return <div className="absolute inset-0 bg-black" />;
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-white/70 backdrop-blur-glass">
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
          <path
            d="M17 8.27a2 2 0 0 1 0 3.46L3 19.66A2 2 0 0 1 0 17.93V2.07A2 2 0 0 1 3 .34l14 7.93Z"
            fill="#2563EB"
          />
        </svg>
      </div>
      <span className="mt-5 text-xs font-medium uppercase tracking-eyebrow text-muted">
        {label}
      </span>
    </div>
  );
}
