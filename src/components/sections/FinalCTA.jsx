import { useScrollReveal } from '../../hooks/useScrollReveal';
import MagneticButton from '../common/MagneticButton';
import { CTA } from '../../utils/constants';
import { useCalendly } from '../../contexts/CalendlyContext';

/**
 * Final CTA — the last impression. Huge centered type restates the one
 * promise, with a single premium button. This anchors #contact.
 */
export default function FinalCTA() {
  const scope = useScrollReveal();
  const { openCalendly } = useCalendly();

  return (
    <section id="contact" ref={scope} className="relative overflow-hidden py-32 md:py-48">
      {/* Faint accent aura behind the type */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12), rgba(37,99,235,0) 68%)' }}
      />

      <div className="shell relative flex flex-col items-center text-center">
        <p className="reveal eyebrow mb-8">Let's Talk</p>
        <h2 className="reveal max-w-5xl text-display-lg font-semibold text-ink">
          Ready to get <span className="text-accent">more customers?</span>
        </h2>
        <p className="reveal mt-8 max-w-lg text-lg leading-relaxed text-muted">
          Book a strategy call. We'll map the fastest path from where you are to a full pipeline.
        </p>
        <div className="reveal mt-12">
          <MagneticButton onClick={openCalendly} variant="primary" strength={0.55} className="px-10 py-5 text-base">
            {CTA.primary}
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
