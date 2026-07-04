import { useRef } from 'react';
import { gsap, ScrollTrigger, EASE, DUR } from '../animations/gsap';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { prefersReducedMotion } from '../utils/device';

/**
 * Returns a ref to attach to a section. Every descendant carrying the
 * `.reveal` class fades + rises into place as the section scrolls into
 * view, staggered like a film cut. Uses ScrollTrigger.batch so many
 * elements share a single observer (cheap, 60fps-friendly).
 *
 * @param {object} opts
 * @param {number} opts.stagger  gap between siblings (s)
 * @param {number} opts.y        initial offset (px)
 * @param {string} opts.start    ScrollTrigger start position
 */
export function useScrollReveal({ stagger = 0.12, y = 28, start = 'top 82%' } = {}) {
  const scope = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const el = scope.current;
    if (!el) return undefined;

    // Reduced motion: reveal instantly, no transform.
    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll('.reveal'), { opacity: 1, y: 0, clearProps: 'all' });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray('.reveal', el);
      if (!targets.length) return;

      ScrollTrigger.batch(targets, {
        start,
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: DUR.base,
            ease: EASE.premium,
            stagger,
            overwrite: true,
          }),
      });
    }, el);

    return () => ctx.revert();
  }, [stagger, y, start]);

  return scope;
}
