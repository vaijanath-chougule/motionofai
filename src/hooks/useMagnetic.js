import { useRef } from 'react';

/**
 * Magnetic hover is intentionally disabled: buttons must stay fixed in
 * place on hover (no lift, translate or pointer-follow). Only paint-level
 * feedback — colour, shadow, background — is allowed, and that lives in
 * the button variant classes. This hook keeps its ref API so every
 * existing `useMagnetic()` call site works unchanged, but attaches no
 * movement.
 *
 * @param {number} strength   retained for API compatibility (unused)
 * @param {number} innerScale retained for API compatibility (unused)
 */
export function useMagnetic(strength = 0.35, innerScale = 0.6) {
  const ref = useRef(null);
  return ref;
}
