import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, EASE } from '../../animations/gsap';
import { NAV_LINKS, CTA } from '../../utils/constants';
import MagneticButton from '../common/MagneticButton';
import { useCalendly } from '../../contexts/CalendlyContext';

/**
 * Full-screen glass menu for tablet/mobile. Links stagger in with the
 * same premium easing as the rest of the site so small screens still
 * feel cinematic.
 */
export default function MobileMenu({ open, onNavigate, onClose, activeSection }) {
  const root = useRef(null);
  const itemsRef = useRef([]);
  const { openCalendly } = useCalendly();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (open) {
      gsap.set(el, { pointerEvents: 'auto' });
      gsap.to(el, { autoAlpha: 1, duration: 0.5, ease: EASE.premium });
      gsap.fromTo(
        itemsRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: EASE.premium, delay: 0.12 },
      );
    } else {
      gsap.to(el, { autoAlpha: 0, duration: 0.4, ease: EASE.premium, pointerEvents: 'none' });
    }
  }, [open]);

  return (
    <div
      ref={root}
      className="glass fixed inset-0 z-[850] flex flex-col justify-center px-8 opacity-0 lg:hidden"
      style={{ backdropFilter: 'blur(28px) saturate(180%)' }}
    >
      <ul className="flex flex-col gap-2">
        {NAV_LINKS.map((link, i) => (
          <li key={link.label} ref={(n) => (itemsRef.current[i] = n)}>
            <Link
              to={link.to}
              onClick={(e) => {
                onNavigate(e, link);
                onClose();
              }}
              className={`block py-2 text-4xl font-medium tracking-tight transition-colors duration-300 ${
                link.section === activeSection ? 'text-accent' : 'text-ink'
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div
        className="mt-12"
        ref={(n) => (itemsRef.current[NAV_LINKS.length] = n)}
      >
        <MagneticButton
          onClick={() => {
            onClose();
            openCalendly();
          }}
          variant="primary"
        >
          {CTA.primary}
        </MagneticButton>
      </div>
    </div>
  );
}
