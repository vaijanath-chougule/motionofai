import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCalendly } from '../contexts/CalendlyContext';
import MagneticButton from '../components/common/MagneticButton';
import WebsiteCard from '../components/websites/WebsiteCard';
import { WEBSITES_PORTFOLIO } from '../data/websitesPortfolio';
import { CTA } from '../utils/constants';

/**
 * WebsitesPage — Dedicated 3D Websites portfolio page.
 *
 * Features:
 * - Premium hero introduction
 * - Desktop optimization notice
 * - Data-driven 2-column project grid (desktop)
 * - Responsive layout (tablet 2-col, mobile 1-col)
 * - Bottom CTA with Calendly booking
 *
 * Accessible from:
 * - Navbar "3D Websites"
 * - Home ServiceCard3D (first card)
 */
export default function WebsitesPage() {
  const heroScope = useScrollReveal({ stagger: 0.14, start: 'top 80%' });
  const gridScope = useScrollReveal({ stagger: 0.12, start: 'top 82%' });
  const ctaScope = useScrollReveal({ stagger: 0.14, start: 'top 82%' });
  const { openCalendly } = useCalendly();

  return (
    <main className="relative">
      {/* Hero Section */}
      <section
        ref={heroScope}
        className="relative overflow-hidden bg-canvas pb-16 pt-32 md:pb-20 md:pt-40 lg:pt-44"
      >
        {/* Subtle atmospheric gradients */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/2 h-[500px] w-[500px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)' }}
        />

        <div className="shell relative">
          {/* Main Heading */}
          <h1 className="reveal mx-auto mb-6 max-w-5xl text-center text-display-lg font-bold leading-[1.05] text-ink">
            Websites that feel
            <br />
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 55%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              like experiences.
            </span>
          </h1>

          {/* Supporting Text */}
          <div className="reveal mb-6 flex justify-center md:mb-8">
            <div
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border px-6 py-2"
              style={{
                background: 'linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(245,243,255,0.9) 100%)',
                borderColor: 'rgba(147,197,253,0.6)',
                color: '#4338ca',
                boxShadow: '0 2px 14px -4px rgba(79,70,229,0.15)',
                letterSpacing: '0.01em',
              }}
            >
              <p
                className="text-center text-sm font-medium md:text-[15px]"
                style={{ color: '#4338ca' }}
              >
                Immersive, interactive 3D websites engineered to make brands impossible to ignore.
              </p>
            </div>
          </div>

          {/* Desktop Optimization Notice */}
          <div className="reveal mx-auto mb-0 flex max-w-2xl items-center justify-center gap-2.5">
            <svg
              width="20"
              height="16"
              viewBox="0 0 20 16"
              fill="none"
              className="flex-shrink-0"
              aria-hidden="true"
            >
              <rect
                x="1"
                y="1"
                width="18"
                height="12"
                rx="1.5"
                stroke="#d97706"
                strokeWidth="1.5"
                fill="none"
              />
              <path d="M6 15h8" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="10" cy="15" r="0.75" fill="#d97706" />
            </svg>
            <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
              Best viewed on desktop, many of these builds are desktop optimized.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section ref={gridScope} className="relative bg-canvas pb-24 pt-0 md:pb-32 lg:pb-40">
        <div className="shell">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
            {WEBSITES_PORTFOLIO.map((project) => (
              <div key={project.id} className="reveal">
                <WebsiteCard project={project} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section ref={ctaScope} className="relative overflow-hidden bg-canvas pb-24 pt-12 md:pb-32 md:pt-16">
        {/* Subtle bottom gradient wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[50vh]"
          style={{
            background:
              'linear-gradient(to top, rgba(37,99,235,0.06) 0%, transparent 60%)',
          }}
        />

        <div className="shell relative">
          <div className="reveal mx-auto text-center">
            <h2 className="mb-6 inline-block text-display-md font-bold leading-[1.15] text-ink md:text-display-lg">
              <span className="block text-center">Want a website</span>
              <span
                className="block text-center"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 55%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                which gets you more customers?
              </span>
            </h2>

            <div
              className="mx-auto mb-10 inline-flex items-center justify-center rounded-full border px-6 py-2"
              style={{
                background: 'linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(245,243,255,0.9) 100%)',
                borderColor: 'rgba(147,197,253,0.6)',
                color: '#4338ca',
                boxShadow: '0 2px 14px -4px rgba(79,70,229,0.15)',
                letterSpacing: '0.01em',
              }}
            >
              <p className="text-sm font-medium md:text-[15px]" style={{ color: '#4338ca' }}>
                Build your next digital experience with Wenilo.
              </p>
            </div>

            <div className="flex justify-center">
              <div
                className="relative inline-block"
                style={{ filter: 'drop-shadow(0 8px 20px rgba(124,58,237,0.28))' }}
              >
                <MagneticButton onClick={openCalendly} variant="primary" strength={0.5}>
                  {CTA.primary}
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
