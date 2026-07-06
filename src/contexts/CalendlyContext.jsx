import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { PopupModal } from 'react-calendly';
import { CALENDLY_URL } from '../utils/constants';

/**
 * One global Calendly booking popup for the whole site. Every "Schedule a
 * Call" CTA (navbar, hero, final CTAs, voice-agent page) calls openCalendly()
 * and the SAME form opens as an in-page modal — the visitor never leaves
 * MotionOfAI. Single source of truth for the event URL (see CALENDLY_URL).
 *
 * The Calendly script + iframe only load the first time the modal opens, so
 * this costs nothing on initial page load.
 */
const CalendlyContext = createContext({ openCalendly: () => {}, closeCalendly: () => {} });

export function CalendlyProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openCalendly = useCallback(() => setOpen(true), []);
  const closeCalendly = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openCalendly, closeCalendly }), [openCalendly, closeCalendly]);

  const rootElement = typeof document !== 'undefined' ? document.getElementById('root') : null;

  return (
    <CalendlyContext.Provider value={value}>
      {children}
      {rootElement && (
        <PopupModal
          url={CALENDLY_URL}
          open={open}
          onModalClose={closeCalendly}
          rootElement={rootElement}
          pageSettings={{
            backgroundColor: 'ffffff',
            primaryColor: '2563eb',
            textColor: '111111',
            hideEventTypeDetails: false,
            hideLandingPageDetails: false,
            hideGdprBanner: true,
          }}
        />
      )}
    </CalendlyContext.Provider>
  );
}

export const useCalendly = () => useContext(CalendlyContext);
