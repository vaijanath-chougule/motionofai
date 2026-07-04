import { Link } from 'react-router-dom';
import Logo from '../navigation/Logo';
import { BRAND } from '../../utils/constants';
import { useCursor } from '../../contexts/CursorContext';

/**
 * Minimal footer — brand, contact channels, and the promise one last
 * time. Restraint on purpose: the last thing you read is the message.
 */
export default function Footer() {
  const { setCursor, resetCursor } = useCursor();
  const year = 2026; // static: avoids hydration/date drift

  return (
    <footer className="border-t border-hairline">
      <div className="shell py-16 md:py-20">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-6 text-2xl font-medium tracking-tight text-ink">
              Get More Customers.
            </p>
            <p className="mt-3 text-sm text-muted">
              The growth studio for 3D websites, AI voice agents & AI video.
            </p>
          </div>

          <nav className="flex flex-col gap-4">
            <span className="eyebrow">Connect</span>
            {BRAND.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                onMouseEnter={() => setCursor('hover')}
                onMouseLeave={resetCursor}
                className="text-lg text-ink transition-colors duration-300 hover:text-accent"
              >
                {s.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-4">
            <span className="eyebrow">Studio</span>
            <a
              href={`mailto:${BRAND.email}`}
              onMouseEnter={() => setCursor('hover')}
              onMouseLeave={resetCursor}
              className="text-lg text-ink transition-colors duration-300 hover:text-accent"
            >
              {BRAND.email}
            </a>
            <Link
              to="/voice-agents"
              onMouseEnter={() => setCursor('hover')}
              onMouseLeave={resetCursor}
              className="text-lg text-ink transition-colors duration-300 hover:text-accent"
            >
              Voice Agent Demo
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-8 text-sm text-muted md:flex-row md:items-center">
          <p>© {year} {BRAND.name}. All rights reserved.</p>
          <p className="tracking-tight">Designed & engineered for growth.</p>
        </div>
      </div>
    </footer>
  );
}
