import { useRef } from 'react';
import { gsap } from '../animations/gsap';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { hasFinePointer } from '../utils/device';

/**
 * Magnetic hover: the element (and optionally an inner label) eases
 * toward the pointer while hovered, then springs back to rest on leave.
 * GSAP quickTo gives a buttery, allocation-free pointer follow.
 *
 * @param {number} strength   how far the element is pulled (0–1)
 * @param {number} innerScale extra pull applied to a [data-magnetic-inner] child
 */
export function useMagnetic(strength = 0.35, innerScale = 0.6) {
  const ref = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer()) return undefined;

    const inner = el.querySelector('[data-magnetic-inner]');

    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' });
    const ixTo = inner && gsap.quickTo(inner, 'x', { duration: 0.9, ease: 'power3.out' });
    const iyTo = inner && gsap.quickTo(inner, 'y', { duration: 0.9, ease: 'power3.out' });

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - (r.left + r.width / 2);
      const relY = e.clientY - (r.top + r.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
      if (ixTo) {
        ixTo(relX * strength * innerScale);
        iyTo(relY * strength * innerScale);
      }
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
      if (ixTo) {
        ixTo(0);
        iyTo(0);
      }
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf([el, inner].filter(Boolean));
    };
  }, [strength, innerScale]);

  return ref;
}
