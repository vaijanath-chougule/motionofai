import { useRef } from 'react';
import { Phone } from 'lucide-react';
import { FaInstagram, FaWhatsapp, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import { gsap, ScrollTrigger, EASE, DUR } from '../../animations/gsap';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { prefersReducedMotion } from '../../utils/device';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import MagneticButton from '../common/MagneticButton';
import { CTA } from '../../utils/constants';
import { useCalendly } from '../../contexts/CalendlyContext';

/**
 * Final CTA — the last impression. Huge centered type restates the one
 * promise, then a premium contact row (reads like navigation, never a
 * footer), the single premium button, and finally the giant full-bleed
 * MotionOfAI wordmark flush to the bottom — the exact treatment used to
 * close the AI Video Production page. Anchors #contact.
 *
 * Contacts are placeholders (not links yet). Phone uses a Lucide outline
 * glyph; the social platforms use their official react-icons brand SVGs.
 * The row is a true CSS grid — 7 equal columns on desktop, 4 on tablet, 2
 * on mobile — so every icon shares one baseline and every column is equal
 * width regardless of label length (the phone number never widens its
 * column). Icons are monochrome and warm to MotionOfAI blue on hover while
 * the item lifts + scales. The row fades + rises in on view, 80ms stagger.
 */
const CONTACTS = [
  { Icon: Phone, label: '8600186550', brand: false },
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
  const wordmarkRef = useRef(null);
  const glowRef = useRef(null);
  const { openCalendly } = useCalendly();

  // Contact row entrance — start hidden, animate TO the resting state via a
  // batch onEnter (gsap.from + ScrollTrigger can freeze mid-stagger when the
  // row is already in view). Fades + rises with an 80ms stagger.
  useIsomorphicLayoutEffect(() => {
    const el = contactRef.current;
    if (!el) return undefined;
    const items = el.querySelectorAll('.contact-item');

    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0 });
      return undefined;
    }

    const wm = wordmarkRef.current;

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 20 });
      ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: DUR.base,
            ease: EASE.premium,
            stagger: 0.08,
            overwrite: true,
          }),
      });

      // Giant wordmark reveal — its own trigger fired the moment it enters the
      // viewport ('top bottom'). It can't ride the section's `.reveal` batch:
      // the wordmark is flush to the page bottom, so there is never enough
      // scroll room for its top to reach the 82% start line — it would stay
      // hidden. gsap.to from an explicit hidden state (not gsap.from) so it
      // always settles.
      if (wm) {
        gsap.set(wm, { opacity: 0, y: 40 });
        ScrollTrigger.create({
          trigger: wm,
          start: 'top bottom',
          once: true,
          onEnter: () =>
            gsap.to(wm, { opacity: 1, y: 0, duration: DUR.base, ease: EASE.premium }),
        });
      }

      // Ambient glow — an almost-imperceptible 24s drift (tiny scale + shift),
      // matching the slow breathe of the AI Video Production light pools.
      const glow = glowRef.current;
      if (glow) {
        gsap.to(glow, {
          scale: 1.06,
          xPercent: 2,
          yPercent: -2,
          duration: 24,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={scope}
      className="relative flex flex-col overflow-hidden bg-canvas pt-28 md:pt-40"
    >
      {/* Faint accent aura behind the type */}
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
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

        {/* Premium contact row — true CSS grid. Equal columns keep every icon
            on one baseline and every column centred; label length can't skew
            the layout. 7 cols desktop · 4 tablet · 2 mobile. */}
        <ul
          ref={contactRef}
          className="mx-auto mt-14 grid w-full max-w-[950px] grid-cols-2 gap-x-6 gap-y-12 sm:mt-16 sm:grid-cols-4 sm:gap-y-14 lg:grid-cols-7"
        >
          {CONTACTS.map(({ Icon, label, brand }) => (
            <li
              key={label}
              className="contact-item group flex min-w-0 cursor-pointer flex-col items-center justify-center gap-2.5 transition-all duration-[350ms] ease-out will-change-transform hover:-translate-y-[3px] hover:scale-[1.08]"
            >
              <span className="flex h-6 items-center justify-center">
                <Icon
                  className="h-6 w-6 text-ink/80 transition-colors duration-[350ms] ease-out group-hover:text-accent"
                  strokeWidth={brand ? undefined : 1.5}
                  aria-hidden="true"
                />
              </span>
              <span className="whitespace-nowrap text-sm font-medium tracking-[0.02em] text-ink/75 transition-colors duration-[350ms] ease-out group-hover:text-accent">
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

      {/* ── Light-blue vertical wash — darkest MotionOfAI blue flush to the
          bottom of the page, fading up into pure white (same treatment as the
          AI Video Production section). Full-bleed, no hard edges. ────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[72vh]"
        style={{
          background:
            'linear-gradient(to top, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0.12) 22%, rgba(37,99,235,0.045) 44%, rgba(37,99,235,0) 64%)',
        }}
      />

      {/* ── Soft blue ambient glow behind the wordmark — layered radial light
          pools that fade into pure white, echoing the AI Video Production
          section. Brightest point sits bottom-centre, behind the type; a
          faint white pool softens the transition. No box, no hard edges. ── */}
      <div
        aria-hidden
        ref={glowRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[58vh] blur-[80px] will-change-transform"
        style={{
          transformOrigin: '50% 100%',
          background: [
            // subtle white softener — lifts the transition, offset right
            'radial-gradient(50% 55% at 62% 78%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)',
            // softer blue pool, offset left
            'radial-gradient(48% 62% at 36% 90%, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0) 72%)',
            // large primary blue pool, centred low behind the typography
            'radial-gradient(62% 82% at 50% 100%, rgba(37,99,235,0.20) 0%, rgba(37,99,235,0.08) 42%, rgba(37,99,235,0) 74%)',
          ].join(', '),
        }}
      />

      {/* ── Giant full-bleed MotionOfAI wordmark, flush to the bottom — the
          exact treatment that closes the AI Video Production page. Letters
          lighter at the top, darker MotionOfAI blue at the base. ─────────── */}
      <div ref={wordmarkRef} className="relative z-10 mt-6 w-full select-none px-2 text-center md:mt-10">
        <span
          className="block font-display font-semibold leading-[0.8]"
          style={{
            fontSize: 'clamp(3rem, 17vw, 19rem)',
            letterSpacing: '-0.045em',
            backgroundImage: 'linear-gradient(180deg, #7aa2ff 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          MotionOfAI
        </span>
      </div>
    </section>
  );
}
