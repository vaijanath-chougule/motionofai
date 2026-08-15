import { useRef } from 'react';
import { gsap, ScrollTrigger, EASE } from '../../animations/gsap';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { useMediaQuery, MOBILE_QUERY } from '../../hooks/useMediaQuery';
import { prefersReducedMotion } from '../../utils/device';
import { FEATURED_REEL } from '../../data/videoPortfolio';
import Typewriter from '../motion/Typewriter';
import CinematicReel from '../video/CinematicReel';
import MobileReel from '../video/MobileReel';

/**
 * AI Video Production — the cinematic showreel. A pure-white, Apple-inspired
 * stage that plays wenilo's five best AI productions like a premium film
 * reel: one video commands the centre at a time.
 *
 *   • Desktop AND mobile: the same PINNED horizontal reel. Cards glide
 *     through the centre on scroll; the centred film plays while its
 *     neighbours shrink, soften and blur. Phones get the identical
 *     interaction — only the geometry and a wenilo progress pill differ.
 *     (see CinematicReel)
 *   • Reduced-motion only: the reel unfolds as a vertical stack, each video
 *     autoplaying while on screen — nothing pins or scrubs. (see MobileReel)
 *
 * `id="ai-video"` owns the nav anchor and must be preserved. The header is
 * kept for brand + SEO; the redesign lives entirely below it.
 */
export default function AIVideoProduction() {
  const scope = useRef(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const reduce = prefersReducedMotion();
  // Phones pin too — only reduced-motion falls back to the vertical stack.
  const pinned = !reduce;

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
      {/* Atmospheric colour fields — extremely soft, composited only.
          Blue-violet pool behind the headline; faint cyan accent top-right;
          gentle gradient wash descending toward the reel. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 top-0 h-[560px] w-[560px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(37,99,235,0.10) 0%, rgba(124,58,237,0.07) 48%, transparent 70%)',
            filter: 'blur(110px)',
          }}
        />
        <div
          className="absolute -right-20 top-12 h-[400px] w-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-[360px] w-[900px] -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, rgba(124,58,237,0.04) 45%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
      </div>

      {/* Header — generous whitespace separating it from the navbar. */}
      <div className="mx-auto w-full px-6 pt-32 md:px-10 md:pt-44" style={{ maxWidth: '1600px' }}>
        <header className="max-w-3xl">
          {/* Label — premium rounded pill badge matching the Voice Agents
              "24/7 Active / Auto Follow-up" badge system. Blue-lavender
              tinted background, thin blue border, gradient text. */}
          <div data-reveal className="mb-5 sm:mb-6">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{
                background: 'linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(245,243,255,0.9) 100%)',
                borderColor: 'rgba(147,197,253,0.7)',
                color: '#4f46e5',
                boxShadow: '0 2px 12px -4px rgba(79,70,229,0.18)',
              }}
            >
              AI Video Production
            </span>
          </div>

          {/* Headline. "Gets Attention." uses a premium blue→violet→cyan
              gradient rather than a flat accent — cinematic but controlled. */}
          <h2 data-reveal className="text-display-md font-semibold leading-[1.05] text-ink">
            Visual Content That{' '}
            <span className="lg:whitespace-nowrap">
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #2563eb 0%, #8b5cf6 48%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Gets Attention.
              </span>{' '}
              <Typewriter text="100% AI generated" />
            </span>
          </h2>
        </header>
      </div>

      {/* The reel. A very soft ambient glow sits behind the cards so they
          feel curated rather than dropped onto a blank canvas. */}
      <div className={`relative ${pinned ? 'mt-10 md:mt-16' : 'mt-10 pb-8'}`}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% 28%, rgba(37,99,235,0.07) 0%, rgba(124,58,237,0.04) 48%, transparent 70%)',
          }}
        />
        {pinned ? (
          <CinematicReel projects={FEATURED_REEL} mobile={isMobile} />
        ) : (
          <MobileReel projects={FEATURED_REEL} />
        )}
      </div>
    </section>
  );
}
