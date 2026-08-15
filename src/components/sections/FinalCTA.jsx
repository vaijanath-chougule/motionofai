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
import BrandWordmark from '../brand/BrandWordmark';
import { CTA } from '../../utils/constants';
import { useCalendly } from '../../contexts/CalendlyContext';

/**
 * Final CTA — the last impression. Huge centered type restates the one
 * promise, then a premium contact row (reads like navigation, never a
 * footer), the single premium button, and finally the giant full-bleed
 * wenilo wordmark flush to the bottom — the exact treatment used to
 * close the AI Video Production page. Anchors #contact.
 *
 * Each contact links out (LinkedIn is still a placeholder — no href yet).
 * Phone uses a Lucide outline
 * glyph; the social platforms use their official react-icons brand SVGs.
 * The row is a true CSS grid — 7 equal columns on desktop, 4 on tablet, 2
 * on mobile — so every icon shares one baseline and every column is equal
 * width regardless of label length (the phone number never widens its
 * column). Icons are monochrome and warm to wenilo blue on hover while
 * the item lifts + scales. The row fades + rises in on view, 80ms stagger.
 */
const CONTACTS = [
  { Icon: Phone, label: '8600186550', brand: false, href: 'tel:+918600186550' },
  {
    Icon: FaInstagram,
    label: 'Instagram',
    brand: true,
    href: 'https://www.instagram.com/wenilo.ai?utm_source=qr&igsh=aGV4NXYzeDh0MGIx',
    external: true,
  },
  {
    Icon: FaWhatsapp,
    label: 'WhatsApp',
    brand: true,
    href: "https://wa.me/918600186550?text=Hi%20Wenilo!%20I%27m%20interested%20in%20your%20services.%20I%27d%20love%20to%20discuss%20my%20project.%20Could%20we%20connect%3F",
    external: true,
  },
  { Icon: FaLinkedin, label: 'LinkedIn', brand: true },
  {
    Icon: FaYoutube,
    label: 'YouTube',
    brand: true,
    href: 'https://youtube.com/@wenilo?si=fUTwPM5mQ7byyOGg',
    external: true,
  },
  {
    Icon: MdEmail,
    label: 'weniloai@gmail.com',
    brand: true,
    href: 'mailto:weniloai@gmail.com?subject=Project%20Inquiry&body=Hi%20Wenilo,%0A%0AI%20would%20like%20to%20discuss%20my%20project.',
  },
  { Icon: FaXTwitter, label: 'X', brand: true, href: 'https://x.com/wenilo', external: true },
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
      {/* Atmospheric colour pools — blue centre + violet right + cyan left */}
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12), rgba(37,99,235,0) 68%)' }}
      />
      <div
        className="pointer-events-none absolute -right-20 top-[20%] h-[45vw] w-[45vw] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.09), rgba(124,58,237,0) 70%)' }}
      />
      <div
        className="pointer-events-none absolute -left-16 top-[55%] h-[40vw] w-[40vw] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.07), rgba(6,182,212,0) 70%)' }}
      />

      <div className="shell relative flex flex-col items-center text-center">
        {/* LET'S TALK — premium pill badge matching the site-wide label system */}
        <div className="reveal mb-8 flex justify-center">
          <span
            className="inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: 'linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(245,243,255,0.9) 100%)',
              borderColor: 'rgba(147,197,253,0.7)',
              color: '#4f46e5',
              boxShadow: '0 2px 12px -4px rgba(79,70,229,0.18)',
            }}
          >
            Let's Talk
          </span>
        </div>
        <h2 className="reveal max-w-5xl text-display-lg font-bold leading-[1.05] text-ink">
          Ready to get{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 48%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            more customers?
          </span>
        </h2>
        <p
          className="reveal mx-auto mt-8 max-w-[650px] text-lg leading-relaxed"
          style={{ color: '#475569', lineHeight: '1.75' }}
        >
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
          {CONTACTS.map(({ Icon, label, brand, href, external }) => {
            // Icon + label share one hit area: the <a> wraps both and inherits
            // the item's column layout, so nothing about the visual changes.
            const Inner = href ? 'a' : 'div';
            const linkProps = href
              ? { href, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }
              : {};

            return (
              <li
                key={label}
                className="contact-item group flex min-w-0 cursor-pointer flex-col items-center justify-center gap-2.5 transition-all duration-[350ms] ease-out will-change-transform hover:-translate-y-[3px] hover:scale-[1.08]"
              >
                <Inner
                  {...linkProps}
                  aria-label={label}
                  className="flex min-w-0 flex-col items-center justify-center gap-2.5"
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-[350ms] ease-out group-hover:shadow-[0_4px_16px_-4px_rgba(79,70,229,0.22)]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239,246,255,0.9) 0%, rgba(245,243,255,0.8) 100%)',
                      borderColor: 'rgba(147,197,253,0.45)',
                    }}
                  >
                    <Icon
                      className="h-5 w-5 text-indigo-500 transition-colors duration-[350ms] ease-out group-hover:text-accent"
                      strokeWidth={brand ? undefined : 1.5}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium tracking-[0.02em] text-ink/75 transition-colors duration-[350ms] ease-out group-hover:text-accent">
                    {label}
                  </span>
                </Inner>
              </li>
            );
          })}
        </ul>

        <div className="reveal mt-16">
          <div className="relative inline-block">
            {/* Subtle blue → violet glow beneath the button */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -bottom-2 mx-auto h-6 w-3/4 blur-[16px]"
              style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.40) 0%, rgba(139,92,246,0.28) 100%)' }}
            />
            <div className="relative" style={{ zIndex: 1 }}>
              <MagneticButton onClick={openCalendly} variant="primary" strength={0.55} className="px-10 py-5 text-base">
                {CTA.primary}
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* ── Light-blue vertical wash — darkest wenilo blue flush to the
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

      {/* ── Giant full-bleed wenilo wordmark, flush to the bottom — literally
          the same component that closes the AI Video Production page, so both
          signatures share one scale, gradient and typography. ─────────── */}
      <BrandWordmark ref={wordmarkRef} className="z-10 mt-6 md:mt-10" />
    </section>
  );
}
