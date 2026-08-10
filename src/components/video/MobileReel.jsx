import { useCallback, useState } from 'react';
import ResponsiveVideo from '../media/ResponsiveVideo';
import ReelAudioButton from './ReelAudioButton';
import ReelCard from './ReelCard';
import ReelShowcase from './ReelShowcase';

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
 *
 * Cards 2–5 gain the same audio toggle and black loading state as the pinned
 * reel path so behaviour is consistent across motion settings.
 */
export default function MobileReel({ projects }) {
  const n = projects.length;

  // Muted state for Cards 2–5 (non-`reels` entries). Starts all-muted.
  const [mutedCards, setMutedCards] = useState(
    () => new Set(projects.filter((p) => p.variant !== 'reels').map((p) => p.id)),
  );

  const toggleCardMute = useCallback((id) => {
    setMutedCards((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-12 px-5">
      {projects.map((project, i) =>
        project.variant === 'reels' ? (
          <article key={project.id} className="reveal">
            <div className="relative mx-auto aspect-[9/16] w-full max-w-[76vw]">
              <ReelShowcase project={project} near active mobile />
            </div>
          </article>
        ) : (
          <article key={project.id} className="reveal">
            <div className="relative aspect-[4/5] w-full">
              <ReelCard
                project={project}
                index={i}
                total={n}
                isActive
                minimal
                showDuration={false}
                bottomActions={
                  <ReelAudioButton
                    on={!mutedCards.has(project.id)}
                    onToggle={() => toggleCardMute(project.id)}
                    label={project.title}
                  />
                }
                media={
                  <ResponsiveVideo
                    desktopSrc={project.desktopVideo}
                    mobileSrc={project.mobileVideo}
                    poster={project.poster}
                    label={project.category}
                    className="h-full w-full"
                    muted={mutedCards.has(project.id)}
                    darkFallback
                  />
                }
              />
            </div>
          </article>
        ),
      )}
    </div>
  );
}
