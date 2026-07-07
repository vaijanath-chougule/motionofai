import { useRef, useState, useEffect } from 'react';
import { gsap, EASE } from '../../animations/gsap';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { prefersReducedMotion } from '../../utils/device';
import { CALENDLY_URL } from '../../utils/constants';

/**
 * AI Video Production — final CTA. The closing scene: a light, editorial
 * split panel matching the MotionOfAI theme. Left = huge headline + italic
 * serif accent + a single premium button. Right = a real Calendly booking
 * widget inside a floating glass card, so the visitor books a strategy call
 * without ever leaving MotionOfAI.
 *
 * Light theme (canvas white, ink type, MotionOfAI blue accent) — nothing
 * touches the shared design system; section-specific colour lives inline /
 * in scoped classes.
 *
 * Performance: Calendly must not cost anything until this section is near.
 * We load Calendly's official widget.js + mount the inline embed only after
 * an IntersectionObserver fires (once), so its script + iframe load lazily —
 * no upfront weight, no layout shift (the card reserves its height from first
 * paint), Lighthouse stays high.
 */

// Elegant serif stack for the italic accent line. Kept local so the global
// design system (SF Pro / Inter) is not modified.
const SERIF = "'Playfair Display', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

// Official Calendly inline embed. Branding (white bg, ink text, MotionOfAI
// blue) is passed as query params — the same mechanism the reference site
// uses — so no react-calendly wrapper is involved.
const CALENDLY_WIDGET_SRC = 'https://assets.calendly.com/assets/external/widget.js';
const CALENDLY_EMBED_URL = `${CALENDLY_URL}?hide_gdpr_banner=1&background_color=ffffff&text_color=111111&primary_color=2563eb`;

export default function AIVideoCTA() {
  const scope = useRef(null);
  const calendlyMount = useRef(null);
  const widgetRef = useRef(null);
  const [showCalendly, setShowCalendly] = useState(false);

  // Calendly needs an explicit pixel height (its iframe can't auto-size).
  // Mobile is taller (720px) so the booking form's header + calendar fit
  // without Calendly scrolling internally at the top; desktop stays 600px.
  // Tracked in state and kept in sync on resize so the reserved placeholder
  // and the live widget always match — no layout shift when it swaps in.
  const [widgetHeight, setWidgetHeight] = useState(600);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setWidgetHeight(mq.matches ? 720 : 600);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // ── Load the official Calendly widget.js once the widget is shown, then
  // initialise the inline embed into our container. widget.js reads the
  // .calendly-inline-widget div's data-url and injects a responsive iframe
  // that fills the parent — this is exactly the reference site's approach.
  useEffect(() => {
    if (!showCalendly) return undefined;

    const init = () => {
      if (window.Calendly && widgetRef.current) {
        // Guard against double-init (StrictMode / re-runs): only initialise
        // an empty container.
        if (widgetRef.current.childElementCount === 0) {
          window.Calendly.initInlineWidget({
            url: CALENDLY_EMBED_URL,
            parentElement: widgetRef.current,
          });
        }
      }
    };

    // Reuse the script if it's already on the page; otherwise inject it.
    let script = document.querySelector(`script[src="${CALENDLY_WIDGET_SRC}"]`);
    if (window.Calendly) {
      init();
    } else if (script) {
      script.addEventListener('load', init, { once: true });
    } else {
      script = document.createElement('script');
      script.src = CALENDLY_WIDGET_SRC;
      script.async = true;
      script.addEventListener('load', init, { once: true });
      document.body.appendChild(script);
    }

    return () => {
      script?.removeEventListener('load', init);
    };
  }, [showCalendly]);

  // ── Lazy-load Calendly: only mount the widget once its card scrolls near
  // the viewport. Fires once, then disconnects. Falls back to eager mount if
  // IntersectionObserver is unavailable (very old browsers / SSR safety).
  useEffect(() => {
    const node = calendlyMount.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setShowCalendly(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShowCalendly(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px 0px' }, // warm it up just before it's needed
    );

    io.observe(node);
    return () => io.disconnect();
  }, []);

  // ── CTA click: make sure the widget is mounted (in case it hasn't lazy-
  // loaded yet), then glide the card into view so booking is immediate.
  const scrollToCalendly = () => {
    setShowCalendly(true);
    calendlyMount.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ── Entrance choreography — matches the site's film-cut reveal grammar:
  // fade up 40px → 0, power3.out, staggered. The glass card additionally
  // scales 0.96 → 1. Background glow breathes on a slow, endless loop.
  useIsomorphicLayoutEffect(() => {
    const el = scope.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll('[data-reveal]'), { opacity: 1, y: 0 });
      gsap.set(el.querySelectorAll('[data-card]'), { opacity: 1, y: 0, scale: 1 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray('[data-reveal]', el);
      if (targets.length) {
        gsap.from(targets, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: EASE.premium,
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 72%', once: true },
        });
      }

      // Card: soft scale-up from 0.96, a beat behind the headline.
      const card = el.querySelector('[data-card]');
      if (card) {
        gsap.from(card, {
          y: 48,
          opacity: 0,
          scale: 0.96,
          duration: 1.2,
          ease: EASE.premium,
          delay: 0.15,
          scrollTrigger: { trigger: el, start: 'top 72%', once: true },
        });
      }

      // Glow: slow, endless breathe — very low amplitude, never distracting.
      const glow = el.querySelector('[data-glow]');
      if (glow) {
        gsap.to(glow, {
          opacity: 0.9,
          scale: 1.08,
          duration: 7,
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
      id="book"
      ref={scope}
      className="relative flex min-h-screen flex-col overflow-hidden bg-canvas pt-24 md:pt-28"
    >
      {/* Light-blue wash — darker at the bottom, fading up toward the
          headline / button. Full-bleed vertical gradient. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0.12) 22%, rgba(37,99,235,0.045) 44%, rgba(37,99,235,0) 64%)',
        }}
      />
      {/* Scattered soft-blue light pools, breathing slowly. */}
      <div
        aria-hidden
        data-glow
        className="pointer-events-none absolute -bottom-1/4 left-1/2 h-[75vh] w-[120vw] -translate-x-1/2 rounded-[50%] blur-[130px]"
        style={{
          opacity: 0.6,
          background:
            'radial-gradient(closest-side, rgba(37,99,235,0.16) 0%, rgba(37,99,235,0.06) 45%, rgba(37,99,235,0) 78%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-[8%] h-[40vh] w-[40vh] rounded-full blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12), rgba(37,99,235,0) 70%)' }}
      />

      {/* ── Split layout: 55% / 45% on desktop, stacked on mobile ─────── */}
      <div className="relative flex flex-1 items-center py-16 md:py-20">
      <div className="mx-auto w-full px-6 md:px-10" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[55fr_45fr] lg:gap-16 xl:gap-24">
          {/* ── LEFT — editorial content ─────────────────────────────── */}
          <div className="max-w-2xl">
            <p data-reveal className="eyebrow mb-6">
              The Next Scene Is Yours
            </p>

            <h2
              data-reveal
              className="text-display-md font-semibold leading-[1.02] text-ink"
            >
              Have a Story
              <br />
              Worth Watching?
            </h2>

            {/* Luxury italic serif accent — MotionOfAI blue, soft glow. */}
            <p
              data-reveal
              className="mt-5 italic text-accent"
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: 'clamp(1.75rem, 3.4vw, 3rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                textShadow: '0 0 30px rgba(37,99,235,0.22)',
              }}
            >
              We&apos;ll Bring It To Life.
            </p>

            {/* Premium CTA button — scrolls to the live Calendly widget so
                the visitor books without ever leaving the page. */}
            <div data-reveal className="mt-10">
              <button
                type="button"
                onClick={scrollToCalendly}
                className="cta-light-primary group relative inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 text-[15px] font-semibold tracking-tight gpu"
              >
                <span className="relative z-10">Schedule a Call</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT — floating animated-glass frame holding the live
              Calendly. Nudged a little left of the column edge. ───────── */}
          <div data-card className="relative mx-auto w-full min-w-0 max-w-[460px] lg:mr-0 lg:-translate-x-6 xl:-translate-x-12">
            {/* Soft accent halo pooling behind the card. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[44px] blur-2xl"
              style={{
                background:
                  'radial-gradient(60% 60% at 50% 30%, rgba(37,99,235,0.16), rgba(37,99,235,0) 70%)',
              }}
            />

            {/* The glass texture — animated gradient border + slow sheen sweep.
                Padding leaves the frosted frame visible around the widget. */}
            <div className="calendly-glass relative p-3.5 sm:p-4">
              <div className="calendly-sheen" aria-hidden />

              {/* Heading sits ON the glass texture, above the widget. */}
              <div className="relative flex items-center justify-between px-1.5 pb-3.5 pt-1">
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                  Book a meet
                </h3>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-accent"
                  style={{ background: 'rgba(37,99,235,0.10)' }}
                >
                  <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-accent" />
                  30 min
                </span>
              </div>

              <div
                ref={calendlyMount}
                className="relative overflow-hidden rounded-[20px] bg-white"
                style={{ height: `${widgetHeight}px`, boxShadow: '0 20px 60px -30px rgba(17,17,17,0.35)' }}
              >
                {showCalendly ? (
                  // Official Calendly inline embed (same approach as the
                  // reference site): widget.js renders the iframe itself and
                  // `min-width: 100%` lets it fill the card and shrink freely
                  // on any viewport — no react-calendly 320px floor, no
                  // iframe scaling, no transform, no fixed-width wrapper.
                  <div
                    ref={widgetRef}
                    className="calendly-inline-widget h-full w-full"
                    data-url={CALENDLY_EMBED_URL}
                    style={{ minWidth: '100%', height: '100%' }}
                  />
                ) : (
                  // Reserved-height placeholder so there's zero layout shift
                  // before the widget mounts. Quiet, on-brand loading state.
                  <div
                    className="flex w-full items-center justify-center"
                    style={{ height: `${widgetHeight}px` }}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <span
                        className="h-8 w-8 animate-spin rounded-full"
                        style={{
                          border: '2px solid rgba(17,17,17,0.10)',
                          borderTopColor: '#2563eb',
                        }}
                      />
                      <span className="eyebrow">Loading Calendar</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* ── Giant full-bleed MotionOfAI wordmark, flush to the bottom.
          Letters lighter at the top, darker MotionOfAI blue at the base —
          echoing the wash rising up the page. ─────────────────────────── */}
      <div data-reveal className="relative w-full select-none px-2 text-center">
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
