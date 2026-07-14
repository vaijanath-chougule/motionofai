import { useRef } from 'react';
import { Phone } from 'lucide-react';
import { FaInstagram, FaWhatsapp, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import { gsap, EASE, DUR } from '../../animations/gsap';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { prefersReducedMotion } from '../../utils/device';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import MagneticButton from '../common/MagneticButton';
import { CTA } from '../../utils/constants';
import { useCalendly } from '../../contexts/CalendlyContext';

/**
 * Final CTA — the last impression. Huge centered type restates the one
 * promise, then a premium contact row that reads like navigation (never a
 * footer), and finally the single premium button. Anchors #contact.
 *
 * Contacts are placeholders (not links yet). Phone uses a Lucide outline
 * glyph; the social platforms use their official react-icons SVG marks.
 * Icons are monochrome and warm to MotionOfAI blue on hover — with the
 * item lifting, scaling and casting a soft blue glow. The row fades + rises
 * in on view, staggered 80ms per item.
 */
const CONTACTS = [
  { Icon: Phone, label: '8600186550', brand: false, primary: true },
  { Icon: FaInstagram, label: 'Instagram', brand: true },
  { Icon: FaWhatsapp, label: 'WhatsApp', brand: true },
  { Icon: FaLinkedin, label: 'LinkedIn', brand: true },
  { Icon: FaYoutube, label: 'YouTube', brand: true },
  { Icon: MdEmail, label: 'Email', brand: true },
  { Icon: FaXTwitter, label: 'X', brand: true },
];

export default function FinalCTA() {
  const scope = useScrollReveal();
  const contactRef = useRef(null);
  const { openCalendly } = useCalendly();

  // Contact row entrance — own trigger so it fades + rises with an 80ms
  // stagger, independent of the section's reveal cadence.
  useIsomorphicLayoutEffect(() => {
    const el = contactRef.current;
    if (!el) return undefined;
    const items = el.querySelectorAll('.contact-item');

    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.from(items, {
        opacity: 0,
        y: 20,
        duration: DUR.base,
        ease: EASE.premium,
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, []);

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
        <p className="reveal mx-auto mt-8 max-w-[650px] text-lg leading-relaxed text-muted">
          Whether you need an immersive 3D website, an AI voice agent that works 24/7, or a
          cinematic AI commercial — we'd love to hear your vision.
        </p>

        {/* Premium contact row — reads as navigation, not a footer. No boxes,
            borders or backgrounds; just SVG iconography + type. One centred row
            on desktop, wraps on tablet, two-column grid on mobile. */}
        <ul
          ref={contactRef}
          className="mx-auto mt-14 grid w-full max-w-[900px] grid-cols-2 place-items-center gap-x-10 gap-y-12 sm:mt-16 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-14 sm:gap-y-10 lg:gap-x-[4.5rem]"
        >
          {CONTACTS.map(({ Icon, label, brand, primary }) => (
            <li
              key={label}
              className="contact-item group flex cursor-pointer flex-col items-center gap-3 transition-transform duration-[350ms] ease-out will-change-transform hover:-translate-y-[3px] hover:scale-[1.08]"
            >
              <span className="flex h-7 items-center justify-center">
                <Icon
                  className={`text-ink/80 transition-all duration-[350ms] ease-out group-hover:text-accent group-hover:drop-shadow-[0_0_14px_rgba(37,99,235,0.5)] ${
                    brand ? 'h-[22px] w-[22px]' : 'h-6 w-6'
                  }`}
                  strokeWidth={brand ? undefined : 1.5}
                  aria-hidden="true"
                />
              </span>
              <span
                className={`font-medium text-ink/75 transition-colors duration-[350ms] ease-out group-hover:text-accent ${
                  primary ? 'text-base' : 'text-sm tracking-[0.02em]'
                }`}
              >
                {label}
              </span>
            </li>
          ))}
        </ul>

        <div className="reveal mt-16">
          <MagneticButton onClick={openCalendly} variant="primary" strength={0.55} className="px-10 py-5 text-base">
            {CTA.primary}
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
