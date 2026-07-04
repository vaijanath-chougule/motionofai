import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../animations/gsap';
import { prefersReducedMotion } from '../utils/device';

const SmoothScrollContext = createContext({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

/**
 * Owns the single Lenis instance for the whole app and drives it from
 * GSAP's ticker so ScrollTrigger and Lenis share one clock (no jank,
 * no double RAF loops). Lives at the router root so smooth scrolling
 * survives page transitions.
 */
export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    // Respect reduced-motion: fall back to native scroll entirely.
    if (prefersReducedMotion()) return undefined;

    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      lerp: 0.1,
    });

    lenisRef.current = instance;
    setLenis(instance);

    // Bridge Lenis -> ScrollTrigger.
    instance.on('scroll', ScrollTrigger.update);

    const raf = (time) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Keep ScrollTrigger's cached measurements honest.
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const api = useMemo(
    () => ({
      lenis,
      scrollTo: (target, options = {}) => {
        const l = lenisRef.current;
        if (l) l.scrollTo(target, { offset: 0, duration: 1.2, ...options });
        else if (typeof target !== 'number' && target?.scrollIntoView) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      },
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    [lenis],
  );

  return (
    <SmoothScrollContext.Provider value={api}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export const useSmoothScroll = () => useContext(SmoothScrollContext);
