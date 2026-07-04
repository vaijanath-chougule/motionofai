import { useCursor } from '../../contexts/CursorContext';
import ResponsiveVideo from '../media/ResponsiveVideo';
import { MEDIA } from '../../utils/constants';
import { CARD_SHELL, CARD_MEDIA, CARD_MEDIA_ASPECT } from './cardStyles';

/**
 * Card 3 — AI Video Production. Same responsive media architecture as the
 * 3D card (9:16 mobile · 4:3 tablet · 16:9 desktop), autoplay/loop/muted,
 * with its own placeholder until assets land in /public/media.
 *
 * `id="ai-video"` preserves the existing nav anchor.
 */
export default function ServiceCardVideo() {
  const { setCursor, resetCursor } = useCursor();

  return (
    <article
      id="ai-video"
      className={CARD_SHELL}
      onMouseEnter={() => setCursor('view', 'Play')}
      onMouseLeave={resetCursor}
    >
      <div className="reveal flex flex-1 flex-col">
        <div className={`${CARD_MEDIA} ${CARD_MEDIA_ASPECT}`}>
          <ResponsiveVideo
            desktopSrc={MEDIA.videoProduction.desktop}
            mobileSrc={MEDIA.videoProduction.mobile}
            label="AI Showreel"
            className="h-full w-full rounded-[24px]"
          />
        </div>

        <div className="px-3 pb-2 pt-6">
          <p className="eyebrow mb-3">03 — AI Video Production</p>
          <h3 className="text-2xl font-semibold leading-tight text-ink md:text-[1.7rem]">
            AI commercials that <span className="text-accent">increase conversions</span>.
          </h3>
          <p className="mt-3 text-muted">
            Cinema-grade video at the speed of AI — crafted to move audiences and move metrics.
          </p>
        </div>
      </div>
    </article>
  );
}
