import { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../animations/gsap';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import ReelCard from './ReelCard';
import ReelVideo from './ReelVideo';

/**
 * CinematicReel — the desktop "film reel". The section is pinned and, as the
 * visitor scrolls, five video cards glide horizontally through the centre:
 * the active card is centred, full-size and opaque; neighbours sit smaller,
 * softer (≈70% opacity) and gently blurred. When a card reaches the centre it
 * begins playing and the previous one pauses.
 *
 * How it works (60fps, zero React churn per frame):
 *   • One ScrollTrigger pins the stage and scrubs a proxy timeline 0→1.
 *   • render(p) maps p to a continuous position f = p·(n-1); every card's
 *     transform (x / scale / opacity / blur / rotateY / z) is a function of
 *     its distance from f, applied imperatively with gsap.set — no re-render.
 *   • Only when the ROUNDED active index changes do we touch React state, to
 *     swap the play/pause target, the editorial text panel and the progress
 *     indicator. So the hot path never trips the reconciler.
 */
export default function CinematicReel({ projects }) {
  const n = projects.length;
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const stepRef = useRef(0);
  const activeRef = useRef(0);

  const [active, setActive] = useState(0);
  // Which cards are mounted/loaded — everything within one slot of centre.
  const [near, setNear] = useState(() => new Set([0, 1]));

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return undefined;

    const cards = cardRefs.current.filter(Boolean);

    // Distance (px) between adjacent card centres. Slightly less than the
    // card width so neighbours peek in at the edges. Recomputed on refresh.
    const measure = () => {
      const w = cards[0]?.offsetWidth || stage.offsetWidth * 0.52;
      stepRef.current = w * 0.86;
    };

    // Apply every card's transform for a continuous position f∈[0, n-1].
    const render = (p) => {
      const f = p * (n - 1);
      const step = stepRef.current;

      cards.forEach((el, i) => {
        const d = i - f; // signed distance from centre, in slots
        const ad = Math.min(Math.abs(d), 2);
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          x: d * step,
          scale: 1 - ad * 0.13, // centre 1 → neighbour ~0.87
          opacity: Math.max(1 - ad * 0.34, 0.3), // neighbour ≈0.66–0.70
          rotationY: gsap.utils.clamp(-9, 9, -d * 5),
          zIndex: Math.round(100 - ad * 10),
          force3D: true,
        });
        // Soft blur while moving off-centre (cheap, GPU-composited).
        el.style.filter = `blur(${Math.min(ad * 2.4, 7).toFixed(2)}px)`;
      });

      const nextActive = Math.round(f);
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
        setNear((prev) => {
          const s = new Set(prev);
          [nextActive - 1, nextActive, nextActive + 1].forEach((k) => {
            if (k >= 0 && k < n) s.add(k);
          });
          return s;
        });
      }
    };

    const ctx = gsap.context(() => {
      measure();

      // Proxy tween gives the scrub a smoothed playhead to interpolate.
      const proxy = { p: 0 };
      const tl = gsap.timeline();
      tl.to(proxy, { p: 1, ease: 'none', duration: 1, onUpdate: () => render(proxy.p) });

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        // One viewport-height of scroll per transition — unhurried, cinematic.
        end: () => '+=' + (n - 1) * window.innerHeight,
        pin: stage,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        animation: tl,
        onRefresh: measure,
      });

      render(0);
    }, section);

    return () => ctx.revert();
  }, [n]);

  return (
    <section ref={sectionRef} className="relative">
      {/* Pinned stage — one viewport tall. */}
      <div ref={stageRef} className="relative h-[100svh] min-h-[620px] w-full overflow-hidden">
        {/* Subtle blue ambient glow, low + centred. Nothing distracting. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[85vh] w-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10), rgba(37,99,235,0) 70%)' }}
        />

        {/* The reel track — cards absolutely centred, transformed per frame. */}
        <div ref={trackRef} className="absolute inset-0" style={{ perspective: '2000px' }}>
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => (cardRefs.current[i] = el)}
              className="absolute left-1/2 top-[calc(50%+40px)] h-[78svh] max-h-[900px] w-[min(92vw,1720px)] will-change-transform"
            >
              <ReelCard
                project={project}
                index={i}
                total={n}
                isActive={i === active}
                media={
                  <ReelVideo
                    desktopSrc={project.desktopVideo}
                    mobileSrc={project.mobileVideo}
                    poster={project.poster}
                    label={project.category}
                    near={near.has(i)}
                    active={i === active}
                  />
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
