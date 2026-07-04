import { useEffect, useLayoutEffect } from 'react';

// useLayoutEffect warns during SSR; swap to useEffect on the server.
// GSAP setup wants layout timing, so prefer layout effect in the browser.
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
