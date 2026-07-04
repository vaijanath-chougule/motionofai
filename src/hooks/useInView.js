import { useEffect, useRef, useState } from 'react';

/**
 * IntersectionObserver wrapper for lazy work: returns [ref, inView].
 * `once` latches true so heavy content (video, GLB, Canvas) mounts a
 * single time and is never torn down on scroll-out.
 */
export function useInView({ rootMargin = '200px', threshold = 0, once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || (once && inView)) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once, inView]);

  return [ref, inView];
}
