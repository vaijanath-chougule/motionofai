import { SmoothScrollProvider } from './contexts/SmoothScrollContext';
import { CursorProvider } from './contexts/CursorContext';
import { TransitionProvider } from './contexts/TransitionContext';
import { CalendlyProvider } from './contexts/CalendlyContext';
import Navbar from './components/navigation/Navbar';
import ScrollToTop from './components/common/ScrollToTop';
import AppRoutes from './routes/AppRoutes';

/**
 * App shell. Provider order matters: SmoothScroll owns the Lenis clock
 * that everything (ScrollTrigger, nav, page transitions) reads from, so
 * it wraps the rest. Cursor + Transition are ambient UI state.
 */
export default function App() {
  return (
    <SmoothScrollProvider>
      <CursorProvider>
        <TransitionProvider>
          <CalendlyProvider>
            <ScrollToTop />
            <Navbar />
            <AppRoutes />
          </CalendlyProvider>
        </TransitionProvider>
      </CursorProvider>
    </SmoothScrollProvider>
  );
}
