import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../animations/gsap';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import ReelAudioButton from './ReelAudioButton';
import ReelCard from './ReelCard';
import ReelProgress from './ReelProgress';
import ReelShowcase from './ReelShowcase';
import ReelVideo from './ReelVideo';

/**
 * CinematicReel — the "film reel". The section is pinned and, as the visitor
 * scrolls, five video cards glide horizontally through the centre: the active
 * card is centred, full-size and opaque; neighbours sit smaller, softer
 * (≈70% opacity) and gently blurred. When a card reaches the centre it begins
 * playing and the previous one pauses.
 *
 * PHONES RUN THE SAME INTERACTION. There is no stacked mobile variant here:
 * the stage pins, vertical scroll is converted to the same horizontal travel,
 * and the section only releases once the last card has been reached. `mobile`
 * changes geometry ONLY — a portrait card, a wider step so neighbours peek
 * instead of overlapping, a lighter blur/tilt budget for phone GPUs — never
 * the behaviour. (prefers-reduced-motion is handled upstream, which swaps in
 * the vertical MobileReel instead.)
 *
 * How it works (60fps, zero React churn per frame):
 *   • One ScrollTrigger pins the stage and scrubs a proxy timeline 0→1.
 *   • render(p) maps p to a continuous position f = p·(n-1); every card's
 *     transform (x / scale / opacity / blur / rotateY / z) is a function of
 *     its distance from f, applied imperatively with gsap.set — no re-render.
 *     The same p drives ReelProgress imperatively through its ref.
 *   • Only when the ROUNDED active index changes do we touch React state, to
 *     swap the play/pause target and the progress counter. So the hot path
 *     never trips the reconciler.
 */
export default function CinematicReel({ projects, mobile = false }) {
  const n = projects.length;
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const progressRef = useRef(null);
  const stepRef = useRef(0);
  const activeRef = useRef(0);
  const prevActiveRef = useRef(0);

  const [active, setActive] = useState(0);
  // Which cards are mounted/loaded — everything within one slot of centre.
  const [near, setNear] = useState(() => new Set([0, 1]));

  // Muted state for Cards 2–5 (all non-`reels` entries). Starts fully muted
  // so every card satisfies browser autoplay policy on first play.
  // Card 1 (`variant: 'reels'`) manages its own audio inside ReelShowcase.
  const [mutedCards, setMutedCards] = useState(
    () => new Set(projects.filter((p) => p.variant !== 'reels').map((p) => p.id)),
  );

  // When the active card changes, re-mute whichever regular card just left so
  // returning to it always starts silent (per spec: "reset to muted on return").
  useEffect(() => {
    const prev = projects[prevActiveRef.current];
    if (prev && prev.variant !== 'reels') {
      setMutedCards((s) => (s.has(prev.id) ? s : new Set([...s, prev.id])));
    }
    prevActiveRef.current = active;
  }, [active, projects]);

  const toggleCardMute = useCallback((id) => {
    setMutedCards((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return undefined;

    const cards = cardRefs.current.filter(Boolean);

    // Distance (px) between adjacent card centres. Desktop: slightly less
    // than the card width so neighbours peek in at the edges. Mobile: a
    // little MORE than the (portrait, much narrower) card, so the shrunken
    // neighbours sit just outside the active card instead of under it.
    const measure = () => {
      const w = cards[0]?.offsetWidth || stage.offsetWidth * 0.52;
      stepRef.current = w * (mobile ? 1.08 : 0.86);
    };

    // Phones pay for full-screen filters, so the off-centre blur and the
    // 3D tilt are dialled back. Same curve, smaller budget.
    const blurPer = mobile ? 1.7 : 2.4;
    const blurMax = mobile ? 4.5 : 7;
    const tiltPer = mobile ? 3.6 : 5;
    const tiltMax = mobile ? 7 : 9;

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
          rotationY: gsap.utils.clamp(-tiltMax, tiltMax, -d * tiltPer),
          zIndex: Math.round(100 - ad * 10),
          force3D: true,
        });
        // Soft blur while moving off-centre (cheap, GPU-composited).
        el.style.filter = `blur(${Math.min(ad * blurPer, blurMax).toFixed(2)}px)`;
      });

      // Continuous 0→1 — the indicator never snaps to a card.
      progressRef.current?.set(p);

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
        // The pin holds until the final card has landed, then releases.
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
  }, [n, mobile]);

  return (
    <section ref={sectionRef} className="relative">
      {/* Pinned stage — one viewport tall. */}
      <div
        ref={stageRef}
        className={`relative w-full overflow-hidden ${
          mobile ? 'h-[100svh]' : 'h-[100svh] min-h-[620px]'
        }`}
      >
        {/* Subtle blue ambient glow, low + centred. Nothing distracting. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[85vh] w-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10), rgba(37,99,235,0) 70%)' }}
        />

        {/* The reel track — cards absolutely centred, transformed per frame. */}
        <div
          ref={trackRef}
          className="absolute inset-0"
          style={{ perspective: mobile ? '1200px' : '2000px' }}
        >
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => (cardRefs.current[i] = el)}
              className={
                mobile
                  ? // Height-driven 9:16 frame: the card always fits the
                    // viewport (60svh, capped), and its width follows from the
                    // aspect ratio so the portrait source fills it without
                    // cropping on any phone. max-w is the safety clamp for
                    // very narrow devices.
                    'absolute left-1/2 top-[calc(50%-18px)] aspect-[9/16] h-[60svh] max-h-[560px] max-w-[76vw] will-change-transform'
                  : 'absolute left-1/2 top-[calc(50%+40px)] h-[78svh] max-h-[900px] w-[min(92vw,1720px)] will-change-transform'
              }
            >
              {/* A slot flagged `variant: 'reels'` holds a collection of
                  vertical 9:16 films instead of one landscape card. The slot
                  geometry above is identical either way, so the reel's step
                  measurement, scrub and pin are completely unaffected. */}
              {project.variant === 'reels' ? (
                <ReelShowcase
                  project={project}
                  near={near.has(i)}
                  active={i === active}
                  mobile={mobile}
                />
              ) : (
                <ReelCard
                  project={project}
                  index={i}
                  total={n}
                  isActive={i === active}
                  minimal={mobile}
                  showDuration={false}
                  // Audio toggle placed above the category label in the bottom
                  // meta block — not in the top-right corner (that slot stays
                  // for Card 1's ReelShowcase which manages its own audio).
                  bottomActions={
                    <ReelAudioButton
                      on={!mutedCards.has(project.id)}
                      onToggle={() => toggleCardMute(project.id)}
                      label={project.title}
                    />
                  }
                  media={
                    <ReelVideo
                      desktopSrc={project.desktopVideo}
                      mobileSrc={project.mobileVideo}
                      poster={project.poster}
                      label={project.category}
                      near={near.has(i)}
                      active={i === active}
                      // Each card starts muted; user unmutes via the button above.
                      muted={mutedCards.has(project.id)}
                      // Restart from the top whenever this card enters centre.
                      resetOnActivate
                      // Solid black before the first frame — no white flash.
                      darkFallback
                    />
                  }
                />
              )}
            </div>
          ))}
        </div>

        {/* wenilo's own scroll indicator — phones only. Driven imperatively
            from render(), so it costs nothing per frame. */}
        {mobile && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[max(28px,env(safe-area-inset-bottom))] flex justify-center px-6">
            <ReelProgress
              ref={progressRef}
              total={n}
              active={active}
              label="Scroll"
              className="w-full max-w-[280px]"
            />
          </div>
        )}
      </div>
    </section>
  );
}
