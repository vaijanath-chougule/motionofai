import { useNavigate } from 'react-router-dom';
import { useCursor } from '../../contexts/CursorContext';
import ResponsiveVideo from '../media/ResponsiveVideo';
import { MEDIA } from '../../utils/constants';
import { CARD_SHELL, CARD_MEDIA_ASPECT } from './cardStyles';

/**
 * Card 3 — AI Video Production. A full-bleed film card: the reel IS the card,
 * edge to edge, with the copy reading over its bottom third. Same responsive
 * media architecture as the 3D card (9:16 mobile · 4:3 tablet · 16:9 desktop),
 * same ResponsiveVideo (autoplay/loop/muted, IntersectionObserver mount +
 * play/pause, one source per device) — only the composition changed.
 *
 * Geometry notes, since this is the one card that opts out of CARD_SHELL's
 * inset:
 *   • `!p-0` drops the shell's p-3/md:p-4 so the video reaches the border.
 *     The shell's own overflow-hidden + rounded-[32px] then clip it, so the
 *     card radius is unchanged and the media simply inherits it.
 *   • `grow` (flex: 1 1 auto) — NOT flex-1 — lets the media take the full
 *     row height where the grid stretches it (desktop, where it matches the
 *     taller Voice card exactly as before) while still falling back to the
 *     aspect ladder for its intrinsic height when the card stands alone.
 *
 * A teaser card: clicking it OPENS the dedicated /ai-video-production
 * page (the cinematic two-column portfolio) — it does not scroll to a
 * section below the cards.
 */
export default function ServiceCardVideo() {
  const navigate = useNavigate();
  const { setCursor, resetCursor } = useCursor();

  const open = () => {
    resetCursor();
    navigate('/ai-video-production');
  };

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label="Open AI Video Production portfolio"
      onClick={open}
      onKeyDown={onKey}
      onMouseEnter={() => setCursor('view', 'Open')}
      onMouseLeave={resetCursor}
      className={`${CARD_SHELL} !p-0 cursor-pointer`}
    >
      <div className="reveal flex flex-1 flex-col">
        <div className={`relative overflow-hidden rounded-[inherit] ${CARD_MEDIA_ASPECT} grow`}>
          <ResponsiveVideo
            desktopSrc={MEDIA.videoProduction.desktop}
            mobileSrc={MEDIA.videoProduction.mobile}
            label="AI Showreel"
            className="h-full w-full rounded-[inherit]"
          />

          {/* Readability scrim. Only the bottom of the card — the film itself
              is never dimmed, blurred or faded. The band runs a little past
              the copy so the ramp is already carrying ~25-35% black where the
              eyebrow starts and deepens under the body line; a band that
              stopped exactly at the text would leave its top row unreadable
              over a bright frame. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] rounded-b-[inherit] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* The same copy, same type scale, now reading over the film. Insets
              match what the old text block sat at (card padding + its own
              px-3 / pb-2), so nothing shifts horizontally. */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-5 md:px-7 md:pb-6">
            <p className="eyebrow mb-3 text-white/80">03 — AI Video Production</p>
            <h3 className="text-2xl font-semibold leading-tight text-white md:text-[1.7rem]">
              AI commercials that <span className="text-accent">increase conversions</span>.
            </h3>
            <p className="mt-3 text-white/75">
              Cinema-grade video at the speed of AI — crafted to move audiences and move metrics.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
