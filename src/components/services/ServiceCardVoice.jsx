import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flip, gsap } from '../../animations/gsap';
import SpherePlaceholder from '../voice/SpherePlaceholder';
import { useCursor } from '../../contexts/CursorContext';
import { useTransition } from '../../contexts/TransitionContext';
import { useSmoothScroll } from '../../contexts/SmoothScrollContext';
import { prefersReducedMotion } from '../../utils/device';
import { CARD_SHELL } from './cardStyles';

/**
 * Card 2 — the centerpiece. The breathing sphere, centered. On click it
 * snapshots its GSAP Flip state, hands it to TransitionContext and routes
 * to /voice-agents, where the SAME `data-flip-id` lets the circle appear
 * to fluidly expand into that page's hero object. Breathing, glow, hover
 * and the Flip handoff are preserved exactly from the old section.
 *
 * `id="voice-agents"` preserves the existing nav anchor.
 */
export default function ServiceCardVoice() {
  const sphereRef = useRef(null);
  const [activating, setActivating] = useState(false);
  const navigate = useNavigate();
  const { setCursor, resetCursor } = useCursor();
  const { setFlipState } = useTransition();
  const { stop } = useSmoothScroll();

  const activate = useCallback(() => {
    if (activating) return;
    const el = sphereRef.current;
    if (!el) {
      navigate('/voice-agents');
      return;
    }
    setActivating(true);
    resetCursor();
    stop(); // freeze scroll during the morph

    if (prefersReducedMotion()) {
      navigate('/voice-agents');
      return;
    }

    // Snapshot state for the destination to resume from.
    const state = Flip.getState(el, { props: 'borderRadius' });
    setFlipState(state);

    // A brief scale-up sells intent before the route flips.
    gsap.to(el, {
      scale: 1.08,
      duration: 0.45,
      ease: 'power3.inOut',
      onComplete: () => navigate('/voice-agents'),
    });
  }, [activating, navigate, resetCursor, setFlipState, stop]);

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  };

  return (
    <article
      id="voice-agents"
      role="button"
      tabIndex={0}
      aria-label="Open AI Voice Agents experience"
      onClick={activate}
      onKeyDown={onKey}
      onMouseEnter={() => setCursor('view', 'Open')}
      onMouseLeave={resetCursor}
      className={`${CARD_SHELL} !p-6 cursor-pointer`}
      style={{ borderColor: 'rgba(147,197,253,0.4)' }}
    >
      <div className="reveal flex flex-1 flex-col">
        {/* Centered sphere fills the card's vertical space */}
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="group/sphere relative" style={{ width: 'min(58vw, 300px)' }}>
            <SpherePlaceholder
              ref={sphereRef}
              interactive
              className="w-full transition-transform duration-700 ease-premium group-hover/sphere:scale-[1.03]"
            />
            {/* Hover glow intensifier */}
            <div className="pointer-events-none absolute -inset-6 rounded-full bg-accent/0 blur-2xl transition-all duration-700 group-hover/sphere:bg-accent/10" />
          </div>
        </div>

        <div className="px-2 pb-2 text-center">
          <p className="eyebrow mb-3">02 — AI Voice Agents</p>
          <h3 className="text-2xl font-semibold leading-tight text-ink md:text-[1.7rem]">
            A voice that answers, qualifies &amp; books —{' '}
              <span
                style={{
                  backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                24/7
              </span>.
          </h3>
          <p className="mt-3 text-muted">Tap the sphere to step inside.</p>
        </div>
      </div>
    </article>
  );
}
