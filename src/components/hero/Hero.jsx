import { useRef } from 'react';
import { gsap, ScrollTrigger, EASE, DUR } from '../../animations/gsap';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { useParallax } from '../../hooks/useParallax';
import HeroSequence from './HeroSequence';
import ScrollIndicator from './ScrollIndicator';
import MagneticButton from '../common/MagneticButton';
import { CTA } from '../../utils/constants';
import { useCalendly } from '../../contexts/CalendlyContext';
import { prefersReducedMotion, isTouch } from '../../utils/device';

const OFFERINGS = ['Premium 3D Websites', 'AI Voice Agents', 'AI Video Production'];

/**
 * The hero is a PINNED scroll-scene. A full-bleed canvas plays a 152-
 * frame sequence as you scroll, creating a 3D "moving through space"
 * illusion. The headline states the promise on entry, then lifts away in
 * the first stretch of scroll so the sequence becomes the show — before
 * the story hands off to the next section.
 *
 * Two elements are decoupled on purpose: the tall <section> provides
 * scroll distance, the sticky inner stage stays pinned, so ScrollTrigger
 * scrubs cleanly with Lenis and never fights layout.
 */
export default function Hero() {
  const scene = useRef(null);
  const seqRef = useRef(null);
  const parallaxRef = useParallax({ max: 16 });
  const { openCalendly } = useCalendly();
  const reduce = prefersReducedMotion();
  const touch = isTouch();

  useIsomorphicLayoutEffect(() => {
    const el = scene.current;
    if (!el) return undefined;

    const ctx = gsap.context(() => {
      // Intro film — states the promise on load.
      if (!reduce) {
        const tl = gsap.timeline({ defaults: { ease: EASE.premium } });
        tl.from('[data-hero-eyebrow]', { y: 20, opacity: 0, duration: DUR.base }, 0.1)
          .from('[data-hero-word]', { yPercent: 120, opacity: 0, duration: DUR.slow, stagger: 0.09 }, 0.2)
          .from('[data-hero-sub]', { y: 20, opacity: 0, duration: DUR.base, ease: EASE.premium, stagger: 0.15 }, 0.2)
          .from('[data-hero-cta]', { y: 24, opacity: 0, duration: DUR.base, stagger: 0.1 }, 0.7)
          .from('[data-hero-scroll]', { opacity: 0, duration: DUR.base }, 0.9);
      }

      const seq = seqRef.current;

      if (reduce) {
        // Static: show a representative frame, no scrub, no pin distance.
        seq?.setProgress(0.35);
        return;
      }

      // Scrub the frame sequence across the pinned scene. The scene is kept
      // short (see section height below) so even a small scroll advances
      // many frames — high sensitivity, tightly connected to the input. A
      // light scrub (low catch-up time) keeps that near 1:1 with the scroll
      // rather than lagging behind it, while still smoothing the stepping.
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        onUpdate: (self) => seq?.setProgress(self.progress),
      });

      // Headline lifts + dissolves over the first ~24% of the scene.
      gsap.to('[data-hero-content]', {
        yPercent: -14,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: '24% top', scrub: true },
      });
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section
      ref={scene}
      className={`relative w-full ${
        reduce ? 'h-[100svh]' : touch ? 'h-[180svh]' : 'h-[200svh]'
      }`}
    >
      {/* Pinned stage */}
      <div className="sticky top-0 flex h-[100svh] min-h-[600px] items-center justify-center overflow-hidden">
        <HeroSequence ref={seqRef} />

        <div ref={parallaxRef} className="relative z-10 flex w-full justify-center">
          <div data-hero-content className="shell flex flex-col items-center text-center">

            {/* Hero eyebrow — transparent glass pill for longer tagline, no dot */}
            <div data-hero-eyebrow data-parallax="0.25" className="mb-7">
              <span
                className="inline-flex items-center whitespace-nowrap rounded-full border px-5 py-2"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderColor: 'rgba(147,197,253,0.50)',
                  boxShadow: '0 2px 20px -4px rgba(79,70,229,0.22), 0 1px 0 rgba(255,255,255,0.3) inset',
                }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  We Will Help You To Integrate AI In Your Business
                </span>
              </span>
            </div>

            {/* Headline — 90% of original display-xl; "Customers" in Playfair italic */}
            <h1
              data-parallax="0.4"
              className="font-semibold text-ink"
              style={{ fontSize: 'clamp(3.15rem, 10.8vw, 10.8rem)', lineHeight: '0.92', letterSpacing: '-0.04em' }}
              aria-label="Get More Customers"
            >
              <span className="block overflow-hidden">
                <span data-hero-word className="inline-block">Get</span>{' '}
                <span data-hero-word className="inline-block">More</span>
              </span>
              <span className="block overflow-hidden" style={{ lineHeight: '1.0' }}>
                <span
                  data-hero-word
                  className="inline-block"
                  style={{
                    fontWeight: 600,
                    backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 30%, #7c3aed 70%, #22d3ee 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                  }}
                >
                  Customers
                </span>
              </span>
            </h1>

            {/* Service statement — cohesive dark charcoal, accent-tinted separators only */}
            <div
              data-parallax="0.3"
              className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 text-display-sm font-semibold leading-[1.2] text-[#1E293B]"
              style={{ textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}
            >
              {OFFERINGS.map((o, i) => (
                <span key={o} data-hero-sub className="inline-flex items-center gap-3">
                  {i > 0 && <span className="text-accent/50">·</span>}
                  {o}
                </span>
              ))}
            </div>

            {/* CTAs — Schedule a Call gets a lavender glow wrap */}
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row" data-parallax="0.2">
              <span data-hero-cta style={{ filter: 'drop-shadow(0 8px 20px rgba(124,58,237,0.28))' }}>
                <MagneticButton onClick={openCalendly} variant="primary" strength={0.5}>
                  {CTA.primary}
                </MagneticButton>
              </span>
              <span data-hero-cta>
                <MagneticButton to="/#work" variant="secondary" strength={0.5}>
                  {CTA.secondary}
                  <Arrow />
                </MagneticButton>
              </span>
            </div>
          </div>
        </div>

        <div data-hero-scroll className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <ScrollIndicator />
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 ease-premium group-hover:translate-x-1">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
