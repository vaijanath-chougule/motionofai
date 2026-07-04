import { createContext, useContext, useRef, useMemo } from 'react';

/**
 * Carries a captured GSAP Flip state across a React Router navigation.
 *
 * The home "voice sphere" and the Voice Agents hero object are two
 * different DOM nodes on two different routes, but they share a
 * data-flip-id. On click we snapshot the source node's Flip state and
 * park it here; when the destination mounts it reads the snapshot and
 * runs Flip.from(...) so the circle appears to fluidly expand into the
 * next page instead of a hard route cut.
 *
 * A plain ref (not state) is deliberate: stashing the snapshot must not
 * trigger a re-render mid-transition.
 */
const TransitionContext = createContext(null);

export function TransitionProvider({ children }) {
  const flipStateRef = useRef(null);

  const api = useMemo(
    () => ({
      setFlipState: (state) => {
        flipStateRef.current = state;
      },
      consumeFlipState: () => {
        const s = flipStateRef.current;
        flipStateRef.current = null;
        return s;
      },
      hasFlipState: () => flipStateRef.current !== null,
    }),
    [],
  );

  return (
    <TransitionContext.Provider value={api}>{children}</TransitionContext.Provider>
  );
}

export const useTransition = () => useContext(TransitionContext);
