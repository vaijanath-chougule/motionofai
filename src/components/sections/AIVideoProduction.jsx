import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger, EASE } from '../../animations/gsap';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { useCursor } from '../../contexts/CursorContext';
import ResponsiveVideo from '../media/ResponsiveVideo';
import { VIDEO_CATEGORIES, getFeaturedVideo } from '../../data/videoPortfolio';
import { prefersReducedMotion } from '../../utils/device';

/**
 * AI Video Production — a cinematic, two-column portfolio section.
 * Left = AI Advertisements, right = AI Cinematic Videos, identical
 * visual weight. The videos ARE the hero: each column autoplays a
 * muted, looping, controls-less clip so the visitor experiences the
 * work without clicking. Data-driven (see data/videoPortfolio.js) —
 * adding a project needs no change here.
 *
 * Performance: video mount + play/pause + single-source resolution +
 * poster crossfade all live in ResponsiveVideo (IntersectionObserver,
 * preload="metadata"). Text fades up on section enter while the videos
 * are already playing. `id="ai-video"` owns the nav anchor.
 */
export default function AIVideoProduction() {
  const scope = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const el = scope.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll('[data-reveal]'), { opacity: 1, y: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray('[data-reveal]', el);
      if (!targets.length) return;

      // Fade up 40px → 0, 1s, power3.out, staggered like a film cut.
      // Videos are outside this set, so they keep playing throughout.
      gsap.from(targets, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: EASE.premium,
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: 'top 78%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="ai-video"
      ref={scope}
      className="relative flex min-h-screen flex-col justify-center py-24 md:py-28"
    >
      <div className="mx-auto w-full px-6 md:px-10" style={{ maxWidth: '1600px' }}>
        {/* Section header — minimal, generous whitespace, Apple spacing. */}
        <header className="mb-14 max-w-3xl md:mb-20">
          <p data-reveal className="eyebrow mb-5">AI Visual Production</p>
          <h2 data-reveal className="text-display-md font-semibold leading-[1.05] text-ink">
            Visual Content That{' '}
            <span className="whitespace-nowrap">
              <span className="text-accent">Gets Attention.</span> 100% AI generated
            </span>
          </h2>
        </header>

        {/* Two equal columns — 40px gap desktop, reduced on tablet,
            stacked on mobile (Advertisements first, Cinematic second). */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-6 lg:gap-10">
          {VIDEO_CATEGORIES.map((cat) => (
            <VideoColumn key={cat.key} category={cat} video={getFeaturedVideo(cat.key)} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * One portfolio column: category label, a large autoplaying video that
 * clicks through to its dedicated portfolio page (never YouTube), then
 * heading, description and a primary CTA.
 */
function VideoColumn({ category, video }) {
  const { setCursor, resetCursor } = useCursor();

  return (
    <div data-reveal className="flex flex-col">
      <p className="eyebrow mb-4">{category.label}</p>

      {/* The video IS the hero. Whole surface is the click target →
          dedicated portfolio page. Hover: subtle lift + scale 1.02 +
          deeper shadow, GPU transform, Apple easing. */}
      <Link
        to={category.portfolioUrl}
        aria-label={category.cta}
        onMouseEnter={() => setCursor('view', 'View')}
        onMouseLeave={resetCursor}
        className="group block gpu will-change-transform transition-[transform,box-shadow] duration-500 ease-premium hover:-translate-y-1 hover:scale-[1.02]"
      >
        <div className="relative aspect-video overflow-hidden rounded-[28px] shadow-[0_30px_90px_-45px_rgba(17,17,17,0.35)] transition-shadow duration-500 ease-premium group-hover:shadow-[0_60px_140px_-40px_rgba(17,17,17,0.45)]">
          <ResponsiveVideo
            desktopSrc={video?.desktopVideo}
            mobileSrc={video?.mobileVideo}
            poster={video?.poster}
            label={category.label}
            className="h-full w-full rounded-[28px]"
          />
        </div>
      </Link>
    </div>
  );
}
