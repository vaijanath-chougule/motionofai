import { useCursor } from '../../contexts/CursorContext';
import ResponsiveVideo from '../media/ResponsiveVideo';
import { MEDIA } from '../../utils/constants';
import { CARD_SHELL, CARD_MEDIA, CARD_MEDIA_ASPECT } from './cardStyles';

/**
 * Card 1 — 3D Websites. Large cinematic media (9:16 mobile · 4:3 tablet ·
 * 16:9 desktop) over a tight, confident line of copy. The media is a
 * device-aware autoplay/loop/muted ResponsiveVideo that degrades to an
 * elegant placeholder until real assets are dropped into /public/media.
 *
 * `id="3d-websites"` preserves the existing nav anchor.
 */
export default function ServiceCard3D() {
  const { setCursor, resetCursor } = useCursor();

  return (
    <article
      id="3d-websites"
      className={CARD_SHELL}
      style={{ borderColor: 'rgba(147,197,253,0.4)' }}
      onMouseEnter={() => setCursor('view', 'Watch')}
      onMouseLeave={resetCursor}
    >
      <div className="reveal flex flex-1 flex-col">
        <div className={`${CARD_MEDIA} ${CARD_MEDIA_ASPECT}`}>
          <ResponsiveVideo
            desktopSrc={MEDIA.website.desktop}
            mobileSrc={MEDIA.website.mobile}
            label="3D Website Reel"
            className="h-full w-full rounded-[24px]"
          />
        </div>

        <div className="px-3 pb-2 pt-6">
          <p className="eyebrow mb-3">01 — 3D Websites</p>
          <h3 className="text-2xl font-semibold leading-tight text-ink md:text-[1.7rem]">
            Cinematic websites customers{' '}
              <span
                style={{
                  backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                never forget.
              </span>
          </h3>
          <p className="mt-3 text-muted">
            Immersive, interactive experiences engineered to turn attention into revenue.
          </p>
        </div>
      </div>
    </article>
  );
}
