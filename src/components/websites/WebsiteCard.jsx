import { useRef, useState } from 'react';
import { useCursor } from '../../contexts/CursorContext';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';

/**
 * WebsiteCard — Reusable 3D website portfolio card.
 * Displays a 16:9 autoplay video preview with project metadata.
 * The entire card is clickable and opens the project's website URL.
 *
 * Implements lazy video loading via IntersectionObserver for performance.
 */
export default function WebsiteCard({ project }) {
  const { setCursor, resetCursor } = useCursor();
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Lazy-load video when card enters viewport
  useIsomorphicLayoutEffect(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Auto-play when video loads
  const handleCanPlay = () => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => {
        console.log('Autoplay prevented:', err);
      });
    }
  };

  const handleError = (e) => {
    console.error('Video error:', e);
    setVideoError(true);
  };

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-white/70 p-3 shadow-[0_8px_40px_-12px_rgba(37,99,235,0.12),0_30px_90px_-50px_rgba(17,17,17,0.18)] backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-2 hover:scale-[1.01] hover:shadow-[0_16px_60px_-12px_rgba(37,99,235,0.22),0_50px_120px_-45px_rgba(17,17,17,0.22)] md:p-4"
      style={{ borderColor: 'rgba(147,197,253,0.4)' }}
      onMouseEnter={() => {
        setCursor('view', 'Visit');
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        resetCursor();
        setIsHovered(false);
      }}
      aria-label={`View ${project.title} website`}
    >
      {/* 16:9 Video Preview */}
      <div className="relative overflow-hidden rounded-[24px]" style={{ aspectRatio: '16 / 9' }}>
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={handleCanPlay}
          onError={handleError}
          style={{ display: shouldLoad && !videoError ? 'block' : 'none' }}
        >
          {shouldLoad && <source src={project.video} type="video/mp4" />}
        </video>

        {/* Placeholder gradient until video loads */}
        {(!shouldLoad || videoError) && (
          <div
            className="h-full w-full flex items-center justify-center"
            style={{
              background:
                'radial-gradient(120% 120% at 30% 20%, #fbfcff 0%, #f3f5fa 45%, #eceef5 100%)',
            }}
          >
            {videoError && (
              <p className="text-sm text-gray-400">Video unavailable</p>
            )}
          </div>
        )}

        {/* Subtle overlay on hover */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 40%)',
            opacity: isHovered ? 1 : 0,
          }}
        />
      </div>

      {/* Project Metadata */}
      <div className="px-3 pb-2 pt-6">
        {project.number && (
          <p className="eyebrow mb-3">
            {project.number} — {project.category}
          </p>
        )}
        <h3 className="text-2xl font-semibold leading-tight text-ink md:text-[1.7rem]">
          {project.title}
        </h3>
        <p className="mt-3 text-muted">{project.description}</p>

        {/* View Website Link */}
        <div
          className="mt-4 flex items-center gap-2 text-sm font-medium transition-all duration-500"
          style={{
            color: isHovered ? '#2563eb' : '#64748b',
            transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
          }}
        >
          <span>View Website</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="transition-transform duration-500"
            style={{
              transform: isHovered ? 'translate(2px, -2px)' : 'translate(0, 0)',
            }}
          >
            <path
              d="M3 13L13 3M13 3H6M13 3V10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}
