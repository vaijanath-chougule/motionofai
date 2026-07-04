// Lightweight environment probes — no dependency, SSR-safe guards.

export const isBrowser = typeof window !== 'undefined';

export const prefersReducedMotion = () =>
  isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Precision pointer = show custom cursor + magnetic hovers.
export const hasFinePointer = () =>
  isBrowser && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isTouch = () =>
  isBrowser && window.matchMedia('(hover: none), (pointer: coarse)').matches;

// Rough low-power heuristic — used to trim decorative work on weak devices.
export const isLowPowerDevice = () => {
  if (!isBrowser) return false;
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;
  return cores <= 4 || mem <= 4;
};
