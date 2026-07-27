import ResponsiveVideo from '../media/ResponsiveVideo';
import ReelCard from './ReelCard';

/**
 * MobileReel — the reduced-motion fallback. Nothing pins and nothing scrubs,
 * so visitors who ask for less motion still get every film: the projects
 * stack vertically as tall, near-full-width cards. Portrait-leaning (4:5) so
 * the phone's own vertical source fills the frame instead of being cropped to
 * a letterbox.
 *
 * Phones with motion enabled do NOT come here — they run the same pinned
 * horizontal reel as desktop (see CinematicReel).
 *
 * Each card carries the film's identity only (category + title, via ReelCard's
 * `minimal` chrome) and nothing sits below it. Each ResponsiveVideo autoplays
 * via IntersectionObserver only while on screen and pauses when it leaves, so
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
              minimal
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
        </article>
      ))}
    </div>
  );
}
