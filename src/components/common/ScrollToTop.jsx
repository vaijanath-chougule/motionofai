import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSmoothScroll } from '../../contexts/SmoothScrollContext';

/**
 * Resets scroll to the top on every route change. Uses Lenis when
 * available so it's consistent with the smooth-scroll engine. The Voice
 * Agent page also does this on mount before its Flip entrance — this is
 * the general safety net for all other navigations.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, lenis]);

  return null;
}
