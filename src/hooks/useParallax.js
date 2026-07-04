import { useRef } from 'react';
import { gsap } from '../animations/gsap';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { hasFinePointer, prefersReducedMotion } from '../utils/device';

/**
 * Subtle pointer-driven parallax for a whole scene. Attach the returned
 * ref to a container; any descendant with data-parallax="0.5" drifts by
 * that factor as the pointer moves across the container. Movement is
 * tiny and eased — cinematic, never gamey.
 */
export function useParallax({ max = 26 } = {}) {
  const scope = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const el = scope.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return undefined;

    const layers = gsap.utils.toArray('[data-parallax]', el);
    if (!layers.length) return undefined;

    const setters = layers.map((layer) => ({
      depth: parseFloat(layer.dataset.parallax) || 0.4,
      x: gsap.quickTo(layer, 'x', { duration: 1.1, ease: 'power3.out' }),
      y: gsap.quickTo(layer, 'y', { duration: 1.1, ease: 'power3.out' }),
    }));

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      setters.forEach((s) => {
        s.x(nx * max * s.depth);
        s.y(ny * max * s.depth);
      });
    };

    const onLeave = () => setters.forEach((s) => {
      s.x(0);
      s.y(0);
    });

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [max]);

  return scope;
}
