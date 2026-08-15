import { useScrollReveal } from '../../hooks/useScrollReveal';
import ServiceCard3D from './ServiceCard3D';
import ServiceCardVoice from './ServiceCardVoice';
import ServiceCardVideo from './ServiceCardVideo';

/**
 * ServiceShowcase — replaces the three stacked service sections with one
 * full-height stage of three premium cards. Composes the existing pieces
 * (SpherePlaceholder + Flip handoff, cinematic media) rather than
 * duplicating them.
 *
 * Grid: three equal columns on desktop (each card carries the same
 * visual weight / attention), tablet 2-up, mobile single column. Equal
 * heights via `items-stretch`. 32px gutters, capped at 1500px. Section
 * ids for 3D / Voice / Video live on the cards so the existing nav
 * anchors keep working.
 */
export default function ServiceShowcase() {
  const scope = useScrollReveal({ stagger: 0.16, start: 'top 78%' });

  return (
    <section
      id="services"
      ref={scope}
      className="relative flex min-h-screen items-center overflow-hidden py-24 md:py-28"
    >
      {/* Atmospheric glows — soft, barely visible, blue left + violet right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10), transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 h-[400px] w-[400px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.09), transparent 70%)' }}
      />

      <div className="relative mx-auto w-full px-6 md:px-10" style={{ maxWidth: '1500px' }}>
        <header className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          {/* WHAT WE BUILD — transparent glass pill matching the hero eyebrow */}
          <div className="reveal mb-4 flex justify-center">
            <span
              className="inline-flex items-center whitespace-nowrap rounded-full border px-4 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderColor: 'rgba(147,197,253,0.50)',
                boxShadow: '0 2px 16px -4px rgba(79,70,229,0.18)',
              }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                What We Build
              </span>
            </span>
          </div>

          {/* Heading — "Three ways to" dark; "get" blue→violet; "more customers." full gradient */}
          <h2 className="reveal text-display-md font-bold leading-[1.05] text-ink">
            Three ways to{' '}
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              get
            </span>
            <br />
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 55%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              more customers.
            </span>
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:items-stretch lg:gap-8">
          <ServiceCard3D />
          <ServiceCardVoice />
          <ServiceCardVideo />
        </div>
      </div>
    </section>
  );
}
