import { useRef } from 'react';
import { gsap, ScrollTrigger, EASE } from '../../animations/gsap';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { PROCESS_STEPS } from '../../utils/constants';
import { prefersReducedMotion } from '../../utils/device';

/**
 * Process — a horizontal timeline (stacks vertically on mobile). A
 * hairline progress track fills as the section scrolls through, and
 * each node lights up in sequence: Discover → Design → Build → Launch →
 * Get More Customers.
 */
export default function Process() {
  const scope = useScrollReveal({ stagger: 0.08 });
  const trackRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const track = trackRef.current;
    if (!track) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-progress-fill]',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          transformOrigin: 'left center',
          scrollTrigger: {
            trigger: track,
            start: 'top 70%',
            end: 'bottom 60%',
            scrub: 0.6,
          },
        },
      );

      gsap.utils.toArray('[data-node]').forEach((node) => {
        gsap.to(node, {
          scale: 1,
          backgroundColor: '#2563EB',
          color: '#ffffff',
          borderColor: '#2563EB',
          ease: EASE.premium,
          scrollTrigger: { trigger: node, start: 'top 75%', toggleActions: 'play none none reverse' },
        });
      });
    }, track);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={scope} className="relative py-28 md:py-40">
      <div className="shell">
        <div className="mb-16 max-w-2xl">
          <p className="reveal eyebrow mb-6">The Process</p>
          <h2 className="reveal text-display-md font-semibold text-ink">
            Five steps to <span className="text-accent">more customers</span>.
          </h2>
        </div>

        <div ref={trackRef} className="relative">
          {/* Progress track (desktop) */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-hairline lg:block">
            <div data-progress-fill className="h-full w-full origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
          </div>

          <ol className="grid gap-10 lg:grid-cols-5 lg:gap-6">
            {PROCESS_STEPS.map((step) => (
              <li key={step.n} className="reveal relative flex gap-5 lg:flex-col lg:gap-6">
                <span
                  data-node
                  className="relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-hairline bg-white text-sm font-semibold text-ink"
                  style={{ transform: 'scale(0.9)' }}
                >
                  {step.n}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-muted">
                    {step.copy}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
