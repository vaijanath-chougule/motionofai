import ResponsiveVideo from '../media/ResponsiveVideo';
import ReelCard from './ReelCard';

/**
 * MobileReel — the phone (and reduced-motion) experience. No pinning, no
 * horizontal scroll: the five projects stack vertically as tall, near-
 * full-width cards. The card is portrait-leaning (4:5) so the phone's own
 * vertical video source fills it instead of being cropped to a letterbox.
 *
 * The card's overlay carries all the meta (category · title · duration ·
 * NN/05) so nothing is duplicated in copy above it — just a single-line
 * description sits beneath each card. Each ResponsiveVideo autoplays via
 * IntersectionObserver only while on screen and pauses when it leaves, so
 * exactly one video decodes at a time.
 */
export default function MobileReel({ projects }) {
  const n = projects.length;

  return (
    <div className="flex flex-col gap-12 px-5">
      {projects.map((project, i) => (
        <article key={project.id} className="reveal">
          <div className="relative aspect-[4/5] w-full">
            <ReelCard
              project={project}
              index={i}
              total={n}
              isActive
              media={
                <ResponsiveVideo
                  desktopSrc={project.desktopVideo}
                  mobileSrc={project.mobileVideo}
                  poster={project.poster}
                  label={project.category}
                  className="h-full w-full"
                />
              }
            />
          </div>

          {/* Single-line description beneath the card (no repeated category). */}
          <p className="mt-4 px-0.5 text-[15px] leading-relaxed text-muted">
            {project.description}
          </p>
        </article>
      ))}
    </div>
  );
}
