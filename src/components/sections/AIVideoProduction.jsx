import { useRef } from 'react';
import { gsap, ScrollTrigger, EASE } from '../../animations/gsap';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { useMediaQuery, MOBILE_QUERY } from '../../hooks/useMediaQuery';
import { prefersReducedMotion } from '../../utils/device';
import { FEATURED_REEL } from '../../data/videoPortfolio';
import CinematicReel from '../video/CinematicReel';
import MobileReel from '../video/MobileReel';

/**
 * AI Video Production — the cinematic showreel. A pure-white, Apple-inspired
 * stage that plays MotionOfAI's five best AI productions like a premium film
 * reel: one video commands the centre at a time.
 *
 *   • Desktop (fine pointer, motion allowed): a PINNED horizontal reel. Cards
 *     glide through the centre on scroll; the centred film plays while its
 *     neighbours shrink, soften and blur. (see CinematicReel)
 *   • Mobile / reduced-motion: the reel unfolds as a vertical stack, each
 *     video autoplaying only while on screen. (see MobileReel)
 *
 * `id="ai-video"` owns the nav anchor and must be preserved. The header is
 * kept for brand + SEO; the redesign lives entirely below it.
 */
export default function AIVideoProduction() {
  const scope = useRef(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const reduce = prefersReducedMotion();
  const pinned = !isMobile && !reduce;

  // Header reveal — film-cut fade up, matching the rest of the site.
  useIsomorphicLayoutEffect(() => {
    const el = scope.current;
    if (!el) return undefined;

    if (reduce) {
      gsap.set(el.querySelectorAll('[data-reveal], .reveal'), { opacity: 1, y: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray('[data-reveal]', el);
      if (targets.length) {
        gsap.from(targets, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: EASE.premium,
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        });
      }

      // Mobile cards fade up individually as they enter. `.reveal` starts
      // hidden in CSS (opacity:0, y:28px), so we animate TO the visible state
      // — matching the site's canonical useScrollReveal pattern. (Using
      // gsap.from here would tween back to the CSS 0 and never show.)
      gsap.utils.toArray('.reveal', el).forEach((card) => {
        gsap.to(card, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: EASE.premium,
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        });
      });
    }, el);

    return () => ctx.revert();
  }, [reduce, isMobile]);

  return (
    <section id="ai-video" ref={scope} className="relative overflow-hidden bg-canvas">
      {/* Header — minimal, generous whitespace. */}
      <div className="mx-auto w-full px-6 pt-20 md:px-10 md:pt-28" style={{ maxWidth: '1600px' }}>
        <header className="max-w-3xl">
          <p data-reveal className="eyebrow mb-4 sm:mb-5">AI Visual Production</p>
          <h2 data-reveal className="text-display-md font-semibold leading-[1.05] text-ink">
            Visual Content That{' '}
            <span className="lg:whitespace-nowrap">
              <span className="text-accent">Gets Attention.</span> 100% AI generated
            </span>
          </h2>
        </header>
      </div>

      {/* The reel. Desktop pins + scrubs; mobile stacks. */}
      <div className={pinned ? 'mt-10 md:mt-16' : 'mt-10 pb-8'}>
        {pinned ? (
          <CinematicReel projects={FEATURED_REEL} />
        ) : (
          <MobileReel projects={FEATURED_REEL} />
        )}
      </div>
    </section>
  );
}
