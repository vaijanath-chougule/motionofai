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
      className="relative flex min-h-screen items-center py-24 md:py-28"
    >
      <div className="mx-auto w-full px-6 md:px-10" style={{ maxWidth: '1500px' }}>
        <header className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <p className="reveal eyebrow mb-4">What we build</p>
          <h2 className="reveal text-display-md font-semibold text-ink">
            Three ways to <span className="text-accent">get more customers</span>.
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
