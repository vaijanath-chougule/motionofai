import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCursor } from '../../contexts/CursorContext';

/**
 * HealthCallCard — Wenilo Voice Agent card with Healthcare lead example.
 * Shows Rahul's dental appointment with:
 * - Healthcare category badge + Appointment Set status
 * - Lead details and description
 * - Play button (only interactive control)
 * - Countdown timer (1:47 → 0:00)
 * - Long horizontal progress bar spanning toward Lead Score
 * - Lead Score 90
 */
export default function HealthCallCard({ to }) {
  const { setCursor, resetCursor } = useCursor();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const CALL_DURATION = 107; // 1:47 in seconds

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Loop back to start
            return 0;
          }
          return prev + (100 / CALL_DURATION) * 0.1; // Update every 100ms
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlayPause = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  // Countdown: show remaining time from total duration down to 0
  const formatTimeCountdown = () => {
    const elapsed = Math.floor((progress / 100) * CALL_DURATION);
    const remaining = CALL_DURATION - elapsed;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Link
      to={to}
      onMouseEnter={() => setCursor('view', 'View')}
      onMouseLeave={resetCursor}
      className="group relative block h-full cursor-pointer overflow-hidden rounded-[28px] border bg-white shadow-sm transition-shadow duration-500 ease-premium hover:shadow-md"
      style={{
        borderColor: 'rgba(103,232,249,0.45)',
      }}
    >
      {/* Upper content area — badges, lead details, and entire call-player UI */}
      <div
        className="relative flex flex-col justify-between rounded-b-[20px] p-6 transition-transform duration-[900ms] ease-premium group-hover:scale-[1.06]"
        style={{
          aspectRatio: '16 / 9',
          background: 'linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%)',
        }}
      >
        {/* Top row: badges */}
        <div className="flex items-start justify-between">
          {/* Category badge */}
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.12) 100%)',
              color: '#0891b2',
            }}
          >
            Healthcare
          </span>

          {/* Status badge */}
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#6b7280' }}>
            Appointment Set
          </span>
        </div>

        {/* Middle: Lead details */}
        <div>
          <h3 className="mb-2 text-[19px] font-semibold leading-tight text-ink">
            Rahul — Dental Consult
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
            Confirmed symptoms, offered open slots and booked a Tuesday appointment.
          </p>
        </div>

        {/* Bottom: Call-player UI — play button, countdown, progress bar, lead score */}
        <div className="flex items-center gap-3.5">
          {/* Play button */}
          <button
            onClick={handlePlayPause}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-300"
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
                : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              boxShadow: '0 6px 20px -4px rgba(6, 182, 212, 0.4)',
            }}
            aria-label={isPlaying ? 'Pause call' : 'Play call'}
          >
            {isPlaying ? (
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <rect x="4" y="3" width="2.5" height="10" rx="1" fill="white" />
                <rect x="9.5" y="3" width="2.5" height="10" rx="1" fill="white" />
              </svg>
            ) : (
              <svg width="13" height="15" viewBox="0 0 16 18" fill="none">
                <path d="M2 1.5L14 9L2 16.5V1.5Z" fill="white" />
              </svg>
            )}
          </button>

          {/* Countdown + long progress bar */}
          <div className="flex flex-1 items-center gap-3">
            <span className="shrink-0 text-[15px] font-semibold text-ink">
              {isPlaying ? formatTimeCountdown() : '1:47'}
            </span>

            {/* Progress bar */}
            <div
              className="h-0.5 flex-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(6, 182, 212, 0.2)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-100 ease-linear"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)',
                }}
              />
            </div>
          </div>

          {/* Lead Score */}
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: '#06b6d4' }}
            />
            <span className="text-sm font-semibold" style={{ color: '#64748b' }}>
              Lead Score 90
            </span>
          </div>
        </div>
      </div>

      {/* Card footer — title and arrow only */}
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h4 className="text-base font-semibold text-ink">Orbit Health</h4>
          <p className="text-xs text-muted">AI Voice Agent</p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline transition-all duration-500 ease-premium group-hover:border-accent group-hover:bg-accent">
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            className="transition-transform duration-500 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
          >
            <path
              d="M5 11L11 5M11 5H6M11 5V10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink group-hover:text-white"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
