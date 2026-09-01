import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCursor } from '../../contexts/CursorContext';
import ResponsiveVideo from '../media/ResponsiveVideo';
import { MEDIA } from '../../utils/constants';
import { CARD_MEDIA, CARD_MEDIA_ASPECT } from './cardStyles';

/**
 * Card 1 — 3D Websites. Large cinematic media (9:16 mobile · 4:3 tablet ·
 * 16:9 desktop) over a tight, confident line of copy. The media is a
 * device-aware autoplay/loop/muted ResponsiveVideo that degrades to an
 * elegant placeholder until real assets are dropped into /public/media.
 *
 * `id="3d-websites"` preserves the existing nav anchor.
 * The entire card is clickable and navigates to /3d-websites page.
 */
export default function ServiceCard3D() {
  const { setCursor, resetCursor } = useCursor();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate('/3d-websites');
  }, [navigate]);

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      id="3d-websites"
      role="button"
      tabIndex={0}
      aria-label="Explore 3D Websites portfolio"
      onClick={handleClick}
      onKeyDown={onKey}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[32px] border bg-white/70 p-3 shadow-[0_8px_40px_-12px_rgba(37,99,235,0.12),0_30px_90px_-50px_rgba(17,17,17,0.18)] backdrop-blur-glass transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_16px_60px_-12px_rgba(37,99,235,0.22),0_50px_120px_-45px_rgba(17,17,17,0.22)] md:p-4"
      style={{ borderColor: 'rgba(147,197,253,0.4)' }}
      onMouseEnter={() => setCursor('view', 'Explore')}
      onMouseLeave={resetCursor}
    >
      <div className="reveal flex flex-1 flex-col">
        <div className={`${CARD_MEDIA} ${CARD_MEDIA_ASPECT}`}>
          <video
            className="h-full w-full rounded-[24px] object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="https://assets.wenilo.com/3d-websites/alta/0831.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="px-3 pb-2 pt-6">
          <p className="eyebrow mb-3">01 — 3D Websites</p>
          <h3 className="mb-4 text-2xl font-semibold leading-tight text-ink md:text-[1.7rem]">
            Websites built to{' '}
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              convert attention into sales.
            </span>
          </h3>
          <p className="text-base leading-relaxed md:text-[1.05rem]">
            <span className="text-muted">Immersive, interactive experiences engineered to turn </span>
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '500',
              }}
            >
              attention into revenue.
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}
