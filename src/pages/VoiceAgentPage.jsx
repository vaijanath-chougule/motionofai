import { forwardRef, useRef, useState } from 'react';
import { gsap, ScrollTrigger, Flip, EASE } from '../animations/gsap';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { useTransition } from '../contexts/TransitionContext';
import { useSmoothScroll } from '../contexts/SmoothScrollContext';
import SpherePlaceholder from '../components/voice/SpherePlaceholder';
import MagneticButton from '../components/common/MagneticButton';
import { useCalendly } from '../contexts/CalendlyContext';
import { prefersReducedMotion } from '../utils/device';

/**
 * /voice-agents — a five-scene product film, not a scrolling document.
 *
 * The living sphere is ONE persistent object anchored to the viewport
 * (sticky stage). It never disappears or resets — as you move through the
 * page only its POSITION changes: right → left → right → left → into the
 * phone. Scroll is used purely to ACTIVATE a scene; each move eases with a
 * settle-and-hold at the edge (power3.inOut, then it rests until the next
 * scene triggers) so it "arrives" like an Apple product animation rather
 * than bouncing off a wall. Content does not slide up from below — it
 * fades into its final position when its scene becomes active.
 *
 * Untouched: the sphere itself, its breathing loop, the GSAP Flip entrance
 * from the home page, and the phone-finale mechanism. Only the journey's
 * timing/positions and the content layout are authored here.
 */

// Sphere resting positions per scene (x offset from centre + scale of the
// mover). Two sets: desktop flanks the copy left/right; mobile keeps the
// sphere centred behind the stacked, glass content so nothing overflows.
const DESKTOP_POS = [
  { x: '24vw', y: '0vh', scale: 0.92 }, // 0 hero      — right
  { x: '-28vw', y: '0vh', scale: 0.64 }, // 1 pricing  — left
  { x: '26vw', y: '0vh', scale: 0.66 }, // 2 live demo — right
  { x: '-28vw', y: '0vh', scale: 0.66 }, // 3 why      — left
  { x: '0vw', y: '0vh', scale: 0.3 }, // 4 book        — centre → phone
];
// Mobile: no room to flank the copy left/right, so the sphere lifts into
// the UPPER area (y offset) as a subtle backdrop while content stacks below
// it — legible, no overlap. It drops back to centre for the phone finale.
const MOBILE_POS = [
  { x: '0vw', y: '-24vh', scale: 0.52 }, // 0 hero
  { x: '0vw', y: '-32vh', scale: 0.34 }, // 1 pricing
  { x: '0vw', y: '-32vh', scale: 0.34 }, // 2 live demo
  { x: '0vw', y: '-32vh', scale: 0.34 }, // 3 why
  { x: '0vw', y: '0vh', scale: 0.26 }, // 4 book — centre → phone
];

export default function VoiceAgentPage() {
  const scene = useRef(null);
  const mover = useRef(null);
  const sphere = useRef(null);
  const finale = useRef(null);
  const phone = useRef(null);
  const screenGlow = useRef(null);
  const screenUI = useRef(null);
  const { consumeFlipState } = useTransition();
  const { lenis, start } = useSmoothScroll();
  const { openCalendly } = useCalendly();

  useIsomorphicLayoutEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const reduce = prefersReducedMotion();

      // ---- Entrance (unchanged) ----
      const flipState = consumeFlipState();
      if (flipState && !reduce) {
        Flip.from(flipState, {
          targets: sphere.current,
          duration: 1.15,
          ease: EASE.premiumInOut,
          absolute: true,
          onComplete: () => start(),
        });
      } else {
        start();
        gsap.from(sphere.current, {
          scale: 0.6,
          autoAlpha: 0,
          duration: reduce ? 0 : 1.1,
          ease: EASE.premium,
        });
      }

      // ---- Content materialises in place (fade only, no slide) ----
      // Each scene's [data-reveal] elements fade to opacity 1 when the
      // scene becomes active. No y-translate → nothing scrolls in from an
      // edge. Opacity-only also leaves transforms free for card hovers.
      const panels = gsap.utils.toArray('[data-va-panel]');
      panels.forEach((panel) => {
        const items = panel.querySelectorAll('[data-reveal]');
        if (!items.length) return;
        if (reduce) {
          gsap.set(items, { autoAlpha: 1 });
          return;
        }
        gsap.fromTo(
          items,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.8,
            ease: EASE.soft,
            stagger: 0.06,
            scrollTrigger: { trigger: panel, start: 'top 62%', once: true },
          },
        );
      });

      // Finale surface starts hidden below the fold (set before the reduced-
      // motion guard so it is never left parked in the centre).
      gsap.set(phone.current, { yPercent: 140 });
      gsap.set(screenGlow.current, { opacity: 0 });
      gsap.set(screenUI.current, { opacity: 0, y: 14 });

      if (reduce) {
        gsap.set(mover.current, { x: '0vw', y: '0vh', scale: 0.6 });
        return;
      }

      // Gentle continuous glow shift so it feels alive, not static.
      gsap.to(sphere.current, {
        filter: 'saturate(1.15)',
        repeat: -1,
        yoyo: true,
        duration: 4,
        ease: 'sine.inOut',
      });

      // ---- The sphere's scene-to-scene journey ----
      // Per-scene triggers (not a linear scrub): when a scene activates the
      // sphere eases to that scene's position and then RESTS there until the
      // next scene triggers — the deliberate "arrive and settle" hold.
      const setupJourney = (POS) => {
        gsap.set(mover.current, POS[0]);

        const moveTo = (i) =>
          gsap.to(mover.current, {
            x: POS[i].x,
            y: POS[i].y,
            scale: POS[i].scale,
            duration: 1.15,
            ease: 'power3.inOut', // ease-in-out = settle, no wall-bounce
            overwrite: 'auto',
          });

        panels.forEach((panel, i) => {
          ScrollTrigger.create({
            trigger: panel,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: () => moveTo(i),
            onEnterBack: () => moveTo(i),
          });
        });

        // Phone finale — the WHOLE finale (phone rising + screen waking) plays
        // as the final section scrolls into view and is fully complete the
        // moment it reaches the top, i.e. exactly when the sphere has centred
        // into the phone. Nothing is left to a pinned hold, so there is no
        // extra scroll after the sphere meets the phone.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: finale.current,
              // Start exactly where the sphere begins centring (same 'top 60%'
              // trigger below) so the phone rises WITH the sphere — not while
              // the previous "Why Choose" copy is still on screen — and both
              // finish together as the section reaches the top.
              start: 'top 60%',
              end: 'top top',
              scrub: 1,
            },
          })
          .to(phone.current, { yPercent: 0, ease: 'power2.out', duration: 1 }, 0)
          .to(screenGlow.current, { opacity: 1, duration: 0.4 }, 0.6)
          .to(screenUI.current, { opacity: 1, y: 0, duration: 0.4 }, 0.75);
      };

      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => setupJourney(DESKTOP_POS));
      mm.add('(max-width: 767px)', () => setupJourney(MOBILE_POS));
    }, scene);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <main className="relative">
      <section ref={scene} className="relative">
        {/* Persistent stage: phone (behind) + sphere (on top), pinned. */}
        <div className="pointer-events-none sticky top-0 h-[100svh] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Phone ref={phone} glowRef={screenGlow} uiRef={screenUI} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              ref={mover}
              className="gpu relative z-10"
              style={{ width: 'min(72vw, 600px)', willChange: 'transform' }}
            >
              <SpherePlaceholder ref={sphere} breathe className="w-full" />
            </div>
          </div>
        </div>

        {/* Scenes activate over the pinned stage. */}
        <div className="relative z-10 -mt-[100svh]">
          {/* ===== 1 · HERO — sphere right ===== */}
          <Scene side="left" width="md:max-w-[48%]" vAlign="end">
            <p data-reveal className="eyebrow mb-6 opacity-0">
              AI Voice Agents
            </p>
            <h1 data-reveal className="text-display-lg font-semibold text-ink opacity-0">
              Get More <span className="text-accent">Customers</span>
            </h1>
            <p
              data-reveal
              className="mt-5 max-w-xl text-2xl font-medium leading-snug text-ink opacity-0 md:text-3xl"
            >
              With our AI voice agent that never sleeps.
            </p>
            <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-muted opacity-0">
              It answers calls, qualifies leads, books appointments and follows up automatically —
              24 hours a day.
            </p>
            <div data-reveal className="mt-9 flex flex-col gap-4 opacity-0 sm:flex-row">
              <MagneticButton
                variant="primary"
                strength={0.5}
                className="w-full sm:w-auto"
                onClick={openCalendly}
              >
                Schedule a Call
              </MagneticButton>
              <MagneticButton
                variant="secondary"
                strength={0.5}
                className="w-full sm:w-auto"
                onClick={() => lenis?.scrollTo('#live-demo')}
              >
                Watch Live Demo
              </MagneticButton>
            </div>
            <ul data-reveal className="mt-11 flex flex-wrap gap-x-8 gap-y-3 opacity-0">
              {['24/7 Available', 'Human-like Conversations', 'Multilingual', 'CRM Integrated'].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="h-4 w-4 text-accent" />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </Scene>

          {/* ===== 2 · PRICING — sphere left ===== */}
          <Scene id="pricing" side="right" width="md:max-w-[64%]">
            <h2 data-reveal className="text-display-sm font-semibold text-ink opacity-0">
              Pricing
            </h2>

            {/* One cohesive, compact panel — every plan is a stacked row,
                divided by hairlines, so the whole structure reads at a glance. */}
            <div
              data-reveal
              className="mt-8 overflow-hidden rounded-[24px] glass opacity-0 shadow-[0_30px_80px_-40px_rgba(17,17,17,0.3)]"
            >
              {PLANS.map((plan, i) => (
                <PlanRow key={plan.name} plan={plan} first={i === 0} />
              ))}
            </div>

            {/* Feature comparison */}
            <div data-reveal className="mt-6 rounded-[24px] glass p-7 opacity-0">
              <p className="text-sm font-semibold text-ink">
                What&apos;s Included With Every Premium Plan
              </p>
              <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {INCLUDED.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-muted">
                    <Check className="h-4 w-4 shrink-0 text-accent" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </Scene>

          {/* ===== 3 · LIVE DEMO — sphere right ===== */}
          <Scene id="live-demo" side="left" width="md:max-w-[54%]">
            <p data-reveal className="eyebrow mb-3 opacity-0">
              Hear It In Action
            </p>
            <h2 data-reveal className="text-display-sm font-semibold text-ink opacity-0">
              Real AI Conversations.
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {CONVERSATIONS.map((c) => (
                <ConversationCard key={c.name} item={c} />
              ))}
            </div>
          </Scene>

          {/* ===== 4 · WHY CHOOSE — sphere left ===== */}
          <Scene side="right" width="md:max-w-[48%]">
            <h2 data-reveal className="text-display-sm font-semibold text-ink opacity-0">
              Why Choose MotionOfAI Voice Agent
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  data-reveal
                  className="group rounded-[24px] glass p-6 opacity-0 transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.02]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110">
                    <b.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-medium text-ink">{b.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{b.copy}</p>
                </div>
              ))}
            </div>
          </Scene>

          {/* ===== 5 · BOOK A DISCOVERY CALL — sphere into phone ===== */}
          <section id="book" ref={finale} data-va-panel className="relative min-h-[100svh]">
            <div className="flex h-[100svh] items-center">
              <div className="shell w-full">
                <div className="flex h-full flex-col items-center justify-between py-24 text-center md:flex-row md:justify-between md:py-0 md:text-left">
                  <div data-reveal className="max-w-xs opacity-0">
                    <h2 className="text-display-sm font-semibold text-ink">Grow While You Sleep</h2>
                    <p className="mt-5 text-lg leading-relaxed text-muted">
                      Your AI Voice Agent continuously reaches potential customers, follows up with
                      leads and books appointments — even outside business hours.
                    </p>
                  </div>

                  {/* centre gap reserved for the phone/sphere finale */}
                  <div className="hidden shrink-0 md:block md:w-[34%]" />

                  <div
                    data-reveal
                    className="flex w-full justify-center opacity-0 sm:w-auto md:w-[33%]"
                  >
                    <MagneticButton
                      onClick={openCalendly}
                      variant="primary"
                      strength={0.5}
                      className="w-full sm:w-auto"
                    >
                      Schedule a Call
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Scene shell — full-height, content pinned to one side (sphere takes  */
/* the other). Content fades in place via [data-reveal].                */
/* ------------------------------------------------------------------ */
function Scene({ id, side = 'left', width = 'md:max-w-[48%]', vAlign = 'center', children }) {
  // side === 'left'  → copy left,  sphere right
  // side === 'right' → copy right, sphere left
  const justify = side === 'left' ? 'md:justify-start' : 'md:justify-end';
  // On mobile the sphere sits above; vAlign="end" drops the copy into the
  // lower area so it never fights the sphere. Desktop stays centred.
  const valign = vAlign === 'end' ? 'items-end md:items-center' : 'items-center';
  return (
    <section
      id={id}
      data-va-panel
      className={`relative flex min-h-[100svh] ${valign} py-20 md:py-24`}
    >
      <div className="shell w-full">
        <div className={`flex ${justify}`}>
          <div className={`w-full ${width}`}>{children}</div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Compact pricing row — lives inside the single panel. Hairline divider */
/* between rows, gentle tint on hover (no lift/scale). Quick-Start wears  */
/* a subtle amber gradient; Growth carries an animated "Most Popular".    */
/* ------------------------------------------------------------------ */
function PlanRow({ plan, first }) {
  const amber = plan.highlight === 'amber';
  return (
    <div
      className={`group relative flex flex-col gap-3 px-5 py-4 transition-colors duration-300 sm:flex-row sm:items-center sm:gap-4 ${
        first ? '' : 'border-t border-hairline'
      } ${
        amber
          ? 'bg-gradient-to-r from-amber-100 via-amber-50 to-orange-50 hover:from-amber-200/80 hover:to-orange-100'
          : 'hover:bg-ink/[0.035]'
      }`}
    >
      {/* Name + badge + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold text-ink">{plan.name}</h3>
          {plan.badge && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white transition-transform duration-300 group-hover:scale-110 ${
                amber ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-accent'
              }`}
            >
              {plan.badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted">{plan.detail}</p>
        {plan.tagline && <p className="text-xs font-medium text-amber-600">{plan.tagline}</p>}
      </div>

      {/* Price */}
      <div className="shrink-0 sm:w-36 sm:text-right">
        <div className="flex items-baseline gap-1 sm:justify-end">
          <span className="text-base font-semibold text-ink">{plan.price}</span>
          {plan.unit && <span className="text-xs text-muted">{plan.unit}</span>}
        </div>
        {plan.total && <p className="text-[11px] text-muted">{plan.total}</p>}
      </div>

      {/* Compact inline CTA — same height as the row, never heavy */}
      <button
        type="button"
        className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
          amber
            ? 'border-amber-400/60 text-amber-700 hover:border-transparent hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-500 hover:text-white'
            : 'border-ink/15 text-ink hover:border-transparent hover:bg-accent hover:text-white'
        }`}
      >
        {plan.cta}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Conversation card — real audio playback + reveal-on-click transcript */
/* ------------------------------------------------------------------ */
function ConversationCard({ item }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [openT, setOpenT] = useState(false);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  return (
    <div
      data-reveal
      className="flex flex-col rounded-[24px] glass p-6 opacity-0 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:bg-accent/[0.06]"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-accent">
          {item.tag}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
          {item.status}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold text-ink">{item.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.summary}</p>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause recording' : 'Play recording'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-all duration-300 hover:bg-accent hover:scale-105"
        >
          {playing ? <IconPause className="h-4 w-4" /> : <IconPlay className="h-4 w-4" />}
        </button>
        <div className="flex flex-1 items-center justify-between text-xs text-muted">
          <span>{item.duration}</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Lead Score {item.score}
          </span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={item.audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <button
        type="button"
        onClick={() => setOpenT((v) => !v)}
        className="mt-5 flex items-center gap-1.5 text-sm font-medium text-accent"
      >
        View Transcript
        <IconChevron className={`h-4 w-4 transition-transform ${openT ? 'rotate-180' : ''}`} />
      </button>
      {openT && (
        <p className="mt-3 border-t border-hairline pt-3 text-sm leading-relaxed text-muted">
          {item.transcript}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Premium phone — finale surface (unchanged mechanism).                */
/* ------------------------------------------------------------------ */
const Phone = forwardRef(function Phone({ glowRef, uiRef }, ref) {
  return (
    <div
      ref={ref}
      className="gpu relative aspect-[9/19] h-[58vh] max-h-[620px] rounded-[2.6rem] bg-ink p-[10px] shadow-[0_50px_130px_-40px_rgba(17,17,17,0.5)] md:h-[68vh]"
      style={{ willChange: 'transform' }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2.05rem] bg-canvas">
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 42%, rgba(37,99,235,0.14), rgba(255,255,255,0) 62%)',
          }}
        />
        <div className="absolute left-1/2 top-3 h-1.5 w-16 -translate-x-1/2 rounded-full bg-ink/70" />

        <div ref={uiRef} className="absolute inset-0">
          <div className="absolute left-1/2 top-10 flex -translate-x-1/2 flex-col items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="flex flex-col items-center text-[11px] font-semibold uppercase leading-tight tracking-eyebrow text-ink">
              <span>Get</span>
              <span>More</span>
              <span>Customers</span>
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-16 flex flex-col items-center gap-5">
            <div className="flex h-8 items-center gap-[3px]">
              {WAVE.map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] animate-breathe rounded-full bg-accent/80"
                  style={{ height: `${h}px`, animationDelay: `${i * 0.12}s`, animationDuration: '2.2s' }}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-muted">MotionOfAI</p>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Content data                                                        */
/* ------------------------------------------------------------------ */
const PLANS = [
  {
    name: 'Quick-Start',
    highlight: 'amber',
    badge: 'Try it out',
    price: '₹5,000',
    unit: '+ taxes',
    detail: '500 Minutes · All Features Unlocked',
    tagline: 'Get started immediately',
    cta: 'Buy Now',
  },
  {
    name: 'Starter',
    price: '₹4.00',
    unit: '/min',
    detail: '10,000 Minutes',
    total: '₹40,000 + taxes',
    cta: 'Get Started',
  },
  {
    name: 'Growth',
    badge: 'Most Popular',
    price: '₹3.50',
    unit: '/min',
    detail: '25,000 Minutes',
    total: '₹87,500 + taxes',
    cta: 'Get Started',
  },
  {
    name: 'Scale',
    price: '₹3.25',
    unit: '/min',
    detail: '1 Lakh Minutes',
    total: '₹3.25 Lakh + taxes',
    cta: 'Get Started',
  },
  {
    name: 'Enterprise',
    price: 'Custom Pricing',
    detail: 'Custom · 5 Lakh+ Minutes',
    total: 'Talk to us for a quote',
    cta: 'Speak With Team',
  },
];

const INCLUDED = [
  'Multiple Schedules',
  'Concurrent Calls',
  'APIs & Webhooks',
  'Campaign Auto-Dialer',
  'WhatsApp Follow-ups',
  'Multiple Agents',
  'Knowledge Base',
  'CRM & Sheets Sync',
  'Call Recording',
  'Priority Support',
];

const CONVERSATIONS = [
  {
    tag: 'Restaurant',
    status: 'Table Booked',
    name: 'Aarav — Table for Four',
    summary: 'Booked a Saturday dinner reservation and captured a birthday note for the kitchen.',
    duration: '1:24',
    score: 92,
    audio: '/audio/restaurant-booking.mp3',
    transcript:
      'AI: Thanks for calling! How many guests and what evening works for you? Caller: Four, this Saturday around 8. AI: Booked for 8pm Saturday — anything special? Caller: It’s my wife’s birthday. AI: Noted, we’ll have something ready. See you then!',
  },
  {
    tag: 'Real Estate',
    status: 'Qualified Lead',
    name: 'Priya — 3BHK Enquiry',
    summary: 'Qualified budget and preferred location, then scheduled a Sunday site visit.',
    duration: '2:03',
    score: 88,
    audio: '/audio/real-estate-enquiry.mp3',
    transcript:
      'Caller: I’m looking for a 3BHK in the north zone. AI: Great — what budget range should I keep in mind? Caller: Around 1.2 crore. AI: Perfect, we have three matches. Shall I book a site visit this Sunday? Caller: Yes, morning works. AI: Done — you’ll get a confirmation on WhatsApp.',
  },
  {
    tag: 'Healthcare',
    status: 'Appointment Set',
    name: 'Rahul — Dental Consult',
    summary: 'Confirmed symptoms, offered open slots and booked a Tuesday appointment.',
    duration: '1:47',
    score: 90,
    audio: '/audio/clinic-appointment.mp3',
    transcript:
      'Caller: I’ve had tooth pain for two days. AI: I’m sorry to hear that — would tomorrow or Tuesday suit you? Caller: Tuesday afternoon. AI: Booked for 3pm Tuesday with Dr. Mehta. A reminder will be sent an hour before.',
  },
  {
    tag: 'Photography',
    status: 'Hot Lead',
    name: 'Sneha — December Wedding',
    summary: 'Captured date, venue and package interest, then routed instantly to the owner.',
    duration: '2:35',
    score: 95,
    audio: '/audio/wedding-photography.mp3',
    transcript:
      'Caller: We’re getting married in December and need a photographer. AI: Congratulations! Do you have a date and venue? Caller: 14th, at Lakeside Gardens. AI: Lovely — I’ll connect you with our lead photographer now to discuss packages.',
  },
];

const BENEFITS = [
  {
    icon: IconTrend,
    title: 'Increase Conversions',
    copy: 'Every call answered in one ring and every lead followed up — no opportunity slips away.',
  },
  {
    icon: IconMoon,
    title: 'Works While You Sleep',
    copy: 'Your AI employee runs 24/7, capturing customers at 2am as easily as 2pm.',
  },
  {
    icon: IconHeadset,
    title: 'Reduce Staff Workload',
    copy: 'Repetitive calls, bookings and FAQs handled automatically, freeing your team for real work.',
  },
  {
    icon: IconScale,
    title: 'Scale Without Hiring',
    copy: 'Handle hundreds of simultaneous conversations without adding a single headcount.',
  },
];

const WAVE = [10, 18, 26, 14, 22, 30, 16, 24, 12, 20, 28, 14];

/* ------------------------------------------------------------------ */
/* Line icons — 1.5 stroke, currentColor.                              */
/* ------------------------------------------------------------------ */
function Svg({ children, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
function Check({ className }) {
  return (
    <Svg className={className}>
      <path d="M5 12.5l4 4 10-10" />
    </Svg>
  );
}
function IconPlay({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}
function IconPause({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
    </svg>
  );
}
function IconChevron({ className }) {
  return (
    <Svg className={className}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}
function IconTrend({ className }) {
  return (
    <Svg className={className}>
      <path d="M4 15l5-5 3 3 6-6M15 4h5v5" />
    </Svg>
  );
}
function IconMoon({ className }) {
  return (
    <Svg className={className}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </Svg>
  );
}
function IconHeadset({ className }) {
  return (
    <Svg className={className}>
      <path d="M5 13v-1a7 7 0 0 1 14 0v1" />
      <rect x="3.5" y="13" width="3.5" height="6" rx="1.5" />
      <rect x="17" y="13" width="3.5" height="6" rx="1.5" />
      <path d="M19 19a4 4 0 0 1-4 4h-2" />
    </Svg>
  );
}
function IconScale({ className }) {
  return (
    <Svg className={className}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Svg>
  );
}
