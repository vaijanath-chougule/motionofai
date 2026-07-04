import { useEffect, useState } from 'react';
import { isBrowser } from '../utils/device';

/**
 * Reactive matchMedia. Returns whether `query` currently matches and
 * updates on breakpoint / orientation changes. SSR-safe (false on server).
 *
 * Used to pick the device-appropriate media asset (mobile vs desktop) so
 * we ever only download ONE source — and to resolve future R3F cameras.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    isBrowser ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    if (!isBrowser) return undefined;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange(); // sync in case it changed between render and effect
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// The single breakpoint that separates the mobile asset set (portrait
// 9:16) from the desktop/tablet set. Kept here so every responsive media
// component agrees on where "mobile" begins.
export const MOBILE_QUERY = '(max-width: 767px)';
