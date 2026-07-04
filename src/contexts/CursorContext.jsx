import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Broadcasts the current cursor "intent" so the single CustomCursor
 * element can react to whatever the pointer is hovering — a link, a
 * media tile ("view"), or the voice sphere ("open") — without each
 * component owning its own cursor DOM.
 */
const CursorContext = createContext({
  variant: 'default',
  label: '',
  setCursor: () => {},
  resetCursor: () => {},
});

export function CursorProvider({ children }) {
  const [state, setState] = useState({ variant: 'default', label: '' });

  const setCursor = useCallback(
    (variant = 'default', label = '') => setState({ variant, label }),
    [],
  );
  const resetCursor = useCallback(() => setState({ variant: 'default', label: '' }), []);

  const value = useMemo(
    () => ({ ...state, setCursor, resetCursor }),
    [state, setCursor, resetCursor],
  );

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}

export const useCursor = () => useContext(CursorContext);
