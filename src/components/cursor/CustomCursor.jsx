import { useEffect, useRef } from 'react';
import { gsap } from '../../animations/gsap';
import { useCursor } from '../../contexts/CursorContext';
import { hasFinePointer } from '../../utils/device';

/**
 * A single, GPU-accelerated custom cursor for the whole app: a precise
 * dot that tracks the pointer 1:1 and a larger ring that eases behind it
 * with smooth latency. Reacts to CursorContext — growing into a labelled
 * pill on media ("View") or the voice sphere ("Open").
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const { variant, label } = useCursor();

  useEffect(() => {
    if (!hasFinePointer()) return undefined;

    document.body.classList.add('has-custom-cursor');

    const dot = dotRef.current;
    const ring = ringRef.current;

    // Dot: near-instant. Ring: trailing ease for premium latency.
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3.out' });

    let visible = false;
    const onMove = (e) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
      }
    };
    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.3 });
    };
    const onDown = () => gsap.to(ring, { scale: 0.82, duration: 0.25, ease: 'power3.out' });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.35, ease: 'power3.out' });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.body.classList.remove('has-custom-cursor');
    };
  }, []);

  // React to hover intent broadcast through CursorContext.
  useEffect(() => {
    if (!hasFinePointer()) return;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const hasLabel = Boolean(label);

    gsap.to(ring, {
      width: hasLabel ? 96 : variant === 'hover' ? 64 : 40,
      height: hasLabel ? 96 : variant === 'hover' ? 64 : 40,
      backgroundColor:
        variant === 'hover' || hasLabel ? 'rgba(37,99,235,0.10)' : 'rgba(37,99,235,0)',
      borderColor: hasLabel ? 'rgba(37,99,235,0)' : 'rgba(37,99,235,0.9)',
      duration: 0.4,
      ease: 'power3.out',
    });
    gsap.to(dot, { opacity: hasLabel ? 0 : 1, duration: 0.3 });
    gsap.to(labelRef.current, { autoAlpha: hasLabel ? 1 : 0, duration: 0.3 });
  }, [variant, label]);

  if (!hasFinePointer()) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/90 opacity-0 gpu"
        style={{ willChange: 'transform, width, height' }}
      >
        <span
          ref={labelRef}
          className="select-none whitespace-nowrap text-[11px] font-medium tracking-wide text-accent opacity-0"
        >
          {label}
        </span>
      </div>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-0 gpu"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}
