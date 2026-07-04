import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

// Single registration point for GSAP plugins used across the app.
gsap.registerPlugin(ScrollTrigger, Flip);

// Mobile browsers fire a resize every time the address bar shows/hides
// during scroll. Left unhandled that re-measures pinned scenes mid-scroll
// and makes the hero "jump". Ignoring it keeps the scrubbed sequence
// gliding smoothly on phones.
ScrollTrigger.config({ ignoreMobileResize: true });

// Premium easing vocabulary — deliberately no bounce / no elastic.
export const EASE = {
  premium: 'power3.out',
  premiumInOut: 'power3.inOut',
  soft: 'power2.out',
  expo: 'expo.out',
};

// Shared reveal durations so every section feels part of one film.
export const DUR = {
  fast: 0.6,
  base: 0.9,
  slow: 1.2,
  cinematic: 1.6,
};

export { gsap, ScrollTrigger, Flip };
