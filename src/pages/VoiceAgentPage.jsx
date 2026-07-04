import { useRef } from 'react';
import { gsap, ScrollTrigger, Flip, EASE } from '../animations/gsap';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { useTransition } from '../contexts/TransitionContext';
import { useSmoothScroll } from '../contexts/SmoothScrollContext';
import SpherePlaceholder from '../components/voice/SpherePlaceholder';
import MagneticButton from '../components/common/MagneticButton';
import { prefersReducedMotion } from '../utils/device';

/**
 * /voice-agents — scroll-driven storytelling.
 *
 * Entrance: if the user arrived by clicking the home sphere, a Flip
 * snapshot is waiting in TransitionContext. We run Flip.from so the SAME
 * circle appears to expand into this page's hero object (no route cut).
 *
 * Then the object is fully scroll-driven: it starts large + centered and
 * eases RIGHT → CENTER → LEFT while shrinking gradually — never
 * disappearing suddenly — exactly like premium Three.js narratives.
 *
 * Structure for the future Canvas: the pinned <div ref=mover> is what
 * ScrollTrigger transforms; the <SpherePlaceholder> inside carries the
 * flip-id and is the node a <Canvas> replaces. Two elements = zero
 * transform conflict between Flip, scroll and the eventual WebGL layer.
 */
export default function VoiceAgentPage() {
  const scene = useRef(null);
  const mover = useRef(null);
  const sphere = useRef(null);
  const { consumeFlipState } = useTransition();
  const { lenis, start } = useSmoothScroll();

  useIsomorphicLayoutEffect(() => {
    // Always begin at the top of the new page.
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const reduce = prefersReducedMotion();

      // ---- Entrance ----
      const flipState = consumeFlipState();
      if (flipState && !reduce) {
        Flip.from(flipState, {
          targets: sphere.current,
          duration: 1.15,
          ease: EASE.premiumInOut,
          absolute: true,
          onComplete: () => start(),
        });
      } else {
        start();
        gsap.from(sphere.current, {
          scale: 0.6,
          autoAlpha: 0,
          duration: reduce ? 0 : 1.1,
          ease: EASE.premium,
        });
      }

      // Copy blocks rise as they enter.
      gsap.utils.toArray('[data-va-panel]').forEach((panel) => {
        gsap.from(panel.querySelectorAll('.reveal'), {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: EASE.premium,
          stagger: 0.1,
          scrollTrigger: { trigger: panel, start: 'top 72%' },
        });
      });

      if (reduce) return;

      // ---- Scroll-driven object journey ----
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scene.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
        defaults: { ease: 'none' },
      });
      tl.to(mover.current, { x: '26vw', scale: 0.82 }) // → right
        .to(mover.current, { x: '0vw', scale: 0.62 })  // → center
        .to(mover.current, { x: '-27vw', scale: 0.46 }) // → left
        .to(mover.current, { x: '0vw', scale: 0.34 });  // → settle, small, still present

      // Gentle continuous hue/glow shift so it feels alive, not static.
      gsap.to(sphere.current, {
        filter: 'saturate(1.15)',
        repeat: -1,
        yoyo: true,
        duration: 4,
        ease: 'sine.inOut',
      });
    }, scene);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <main className="relative">
      <section ref={scene} className="relative">
        {/* Pinned sphere stage */}
        <div className="pointer-events-none sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
          <div
            ref={mover}
            className="gpu"
            style={{ width: 'min(70vw, 520px)', willChange: 'transform' }}
          >
            <SpherePlaceholder ref={sphere} breathe className="w-full" />
          </div>
        </div>

        {/* Narrative panels scroll over the pinned sphere */}
        <div className="relative z-10 -mt-[100svh]">
          <Panel align="center">
            <p className="reveal eyebrow mb-6">AI Voice Agents</p>
            <h1 className="reveal max-w-3xl text-display-lg font-semibold text-ink">
              The agent that never <span className="text-accent">sleeps</span>.
            </h1>
            <p className="reveal mt-6 max-w-md text-lg leading-relaxed text-muted">
              Scroll to see it work.
            </p>
          </Panel>

          <Panel align="left">
            <StoryCard
              eyebrow="Always On"
              title="Answers in one ring."
              copy="Every call picked up instantly — day, night, weekends. No missed lead ever again."
            />
          </Panel>

          <Panel align="right">
            <StoryCard
              eyebrow="Qualifies"
              title="Knows who's ready to buy."
              copy="Natural conversation that qualifies intent and routes hot leads straight to you."
            />
          </Panel>

          <Panel align="left">
            <StoryCard
              eyebrow="Books"
              title="Fills your calendar."
              copy="It schedules the meeting, sends the confirmation, and follows up — autonomously."
            />
          </Panel>

          <Panel align="center">
            <h2 className="reveal max-w-3xl text-display-md font-semibold text-ink">
              More conversations. <span className="text-accent">More customers.</span>
            </h2>
            <div className="reveal mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <MagneticButton href="mailto:hello@motionofai.com" variant="primary" strength={0.5}>
                Book Strategy Call
              </MagneticButton>
              <MagneticButton to="/" variant="secondary" strength={0.5}>
                Back to Home
              </MagneticButton>
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Panel({ children, align = 'center' }) {
  const items =
    align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';
  return (
    <div data-va-panel className="flex min-h-[100svh] flex-col justify-center">
      <div className="shell w-full">
        <div className={`flex flex-col ${items}`}>{children}</div>
      </div>
    </div>
  );
}

function StoryCard({ eyebrow, title, copy }) {
  return (
    <div className="max-w-sm">
      <p className="reveal eyebrow mb-5">{eyebrow}</p>
      <h2 className="reveal text-display-sm font-semibold text-ink">{title}</h2>
      <p className="reveal mt-5 text-lg leading-relaxed text-muted">{copy}</p>
    </div>
  );
}
