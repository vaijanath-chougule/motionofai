import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MagneticButton from '../common/MagneticButton';
import Logo from './Logo';
import MobileMenu from './MobileMenu';
import { NAV_LINKS, CTA } from '../../utils/constants';
import { useSmoothScroll } from '../../contexts/SmoothScrollContext';
import { useCursor } from '../../contexts/CursorContext';
import { useCalendly } from '../../contexts/CalendlyContext';

/**
 * Floating glass navigation. Transparent + blurred, centered pill on
 * desktop, condenses slightly once the user scrolls past the hero.
 * Hash links (e.g. /#3d-websites) resolve to smooth Lenis scrolls,
 * navigating home first if the user is on another route.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lenis, scrollTo } = useSmoothScroll();
  const { setCursor, resetCursor } = useCursor();
  const { openCalendly } = useCalendly();
  const location = useLocation();
  const navigate = useNavigate();

  // Condense-on-scroll — bridged through Lenis, falls back to window.
  useEffect(() => {
    const handle = ({ scroll }) => setScrolled((scroll ?? window.scrollY) > 40);
    if (lenis) {
      lenis.on('scroll', handle);
      return () => lenis.off('scroll', handle);
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lenis]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (menuOpen) lenis?.stop();
    else lenis?.start();
  }, [menuOpen, lenis]);

  // Logo → hero (top of the home page). If already home, smooth-scroll
  // to the top; otherwise route home (ScrollToTop lands us at the hero).
  const handleLogoClick = useCallback(
    (e) => {
      setMenuOpen(false);
      if (location.pathname === '/') {
        e.preventDefault();
        scrollTo(0, { offset: 0 });
      }
    },
    [location.pathname, scrollTo],
  );

  const handleHashNav = useCallback(
    (e, link) => {
      if (!link.to.startsWith('/#')) return; // real route → let Router handle it
      e.preventDefault();
      setMenuOpen(false);
      const id = link.section;
      const doScroll = () => {
        const el = document.getElementById(id);
        if (el) scrollTo(el, { offset: -40 });
      };
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for the home route to paint before scrolling.
        setTimeout(doScroll, 260);
      } else {
        doScroll();
      }
    },
    [location.pathname, navigate, scrollTo],
  );

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[900] flex justify-center">
        <nav
          className={`glass pointer-events-auto mt-4 flex items-center gap-6 rounded-full transition-all duration-500 ease-premium ${
            scrolled ? 'scale-[0.97] px-4 py-2' : 'px-5 py-2.5'
          }`}
          style={{ width: 'min(1180px, calc(100vw - 2rem))' }}
        >
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 pr-2"
            onMouseEnter={() => setCursor('hover')}
            onMouseLeave={resetCursor}
            aria-label="wenilo home"
          >
            <Logo />
          </Link>

          <ul className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  onClick={(e) => handleHashNav(e, link)}
                  onMouseEnter={() => setCursor('hover')}
                  onMouseLeave={resetCursor}
                  className="relative rounded-full px-4 py-2 text-sm text-muted transition-colors duration-300 hover:bg-accent-soft hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto hidden lg:block">
            <MagneticButton
              onClick={openCalendly}
              variant="primary"
              className="px-6 py-3 text-sm"
              strength={0.5}
            >
              {CTA.primary}
            </MagneticButton>
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="ml-auto flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span
              className={`h-[1.5px] w-6 bg-ink transition-all duration-300 ${
                menuOpen ? 'translate-y-[6.5px] rotate-45' : ''
              }`}
            />
            <span
              className={`h-[1.5px] w-6 bg-ink transition-all duration-300 ${
                menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''
              }`}
            />
          </button>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onNavigate={handleHashNav} onClose={() => setMenuOpen(false)} />
    </>
  );
}
