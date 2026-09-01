import { useScrollReveal } from '../../hooks/useScrollReveal';
import WorkCard from '../work/WorkCard';
import VoiceCallCard from '../work/VoiceCallCard';
import HealthCallCard from '../work/HealthCallCard';
import { WORK_ITEMS } from '../../utils/constants';

/**
 * Work — a custom grid layout showcasing projects. Cards reveal on scroll and zoom softly
 * on hover. Desktop uses a specific 3-column arrangement with the ALTA Yacht as the hero card.
 */
export default function Work() {
  const scope = useScrollReveal({ stagger: 0.09 });

  return (
    <section id="work" ref={scope} className="relative py-28 md:py-40">
      {/* Wider than the site-wide .shell (1600 / lg:px-16) on purpose: this is the
          only 3-up card grid on the page, and the old shell left ~280px of dead
          margin per side at 2000px+. That margin becomes card width instead.
          Padding is px-6 md:px-10 — deliberately the SAME scale ServiceShowcase
          above uses, so the two sections still read as one rhythm rather than
          Work bulging out. Heading + capsule share this container so they stay
          flush with the grid's left edge. */}
      <div className="mx-auto w-full max-w-[1720px] px-6 md:px-10">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            {/* SELECTED WORK — premium capsule badge matching the site-wide label system */}
            <div className="reveal mb-5 sm:mb-6">
              <span
                className="inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{
                  background: 'linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(245,243,255,0.9) 100%)',
                  borderColor: 'rgba(147,197,253,0.7)',
                  color: '#4f46e5',
                  boxShadow: '0 2px 12px -4px rgba(79,70,229,0.18)',
                }}
              >
                Selected Work
              </span>
            </div>

            {/* Heading — "Proof, not" stays dark charcoal; "promises." carries the Wenilo gradient */}
            <h2 className="reveal max-w-2xl text-display-md font-bold leading-[1.05] text-ink">
              Proof, not
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 48%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                promises.
              </span>
            </h2>
          </div>
          {/* Supporting text — pill badge coordinated with SELECTED WORK label */}
          <div className="reveal">
            <span
              className="inline-flex items-center whitespace-nowrap rounded-full border px-5 py-2 text-sm font-medium"
              style={{
                background: 'linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(245,243,255,0.9) 100%)',
                borderColor: 'rgba(147,197,253,0.6)',
                color: '#4338ca',
                boxShadow: '0 2px 14px -4px rgba(79,70,229,0.15)',
                letterSpacing: '0.01em',
              }}
            >
              A glimpse of work we've engineered to convert.
            </span>
          </div>
        </div>

        {/* Custom grid layout matching hand-drawn reference.
            Columns 1 and 2 are deliberately EQUAL (1fr / 1fr) so the two 16:9
            cards that head them — AI Product Ad and Nova Voice — come out the
            same width, and therefore the same media height and same total card
            height. They were 4/12 vs 5/12 before, which is why the left card
            read as the smaller sibling.
            Column 3 sizing is two-stage, on purpose:
              • lg (1024–1535): 0.65fr. That fraction reproduces the width the
                portrait column had under the old 12-col grid to within ~3% at
                every breakpoint in the range, so the wedding cards keep their
                scale and their titles keep fitting on one line.
              • 2xl (1536+): pinned to 350px, the width those cards already had.
                Above this point the wider container is handing out real extra
                space, and it should all go to the two 16:9 columns — a fraction
                here would inflate the portrait cards instead, which is exactly
                what "do not resize the Wedding Invitation card" rules out.
            A fixed track cannot be used at lg: at 1024 it would leave only
            ~273px per video column, making the portrait cards the widest in the
            grid. minmax(0,1fr) keeps a wide child from pushing those two out.

            Cards in columns 1–2 are now DIRECT grid items rather than children
            of two flex columns. That is what lets ALTA span both tracks; a card
            nested inside one column could never cross into the other. Desktop
            rows fall out of auto-placement:
              row 1  AI Product Ad │ Nova Voice
              row 2  ALTA Yacht Website (col-span-2)
              row 3  Vanta Labs   │ Orbit Health
            Column 3 stays one flex column, explicitly pinned to track 3 and
            spanning all three rows, so it is placed BEFORE auto-placement runs
            and the ALTA span can never reach into it. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_0.65fr] lg:grid-rows-[auto_auto_auto] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_350px]">
          {/* Row 1 — the two matched 16:9 peers */}
          <div className="reveal">
            <WorkCard item={WORK_ITEMS[0]} index={0} />
          </div>
          <div className="reveal">
            <VoiceCallCard to={WORK_ITEMS[1].to} />
          </div>

          {/* Row 2 — ALTA, one 16:9 card across columns 1+2. Its media well is
              the same aspect-ratio: 16/9 frame every other landscape card uses,
              so the extra width buys a proportionally taller video, never a
              stretched or cropped one. */}
          <div className="reveal lg:col-span-2">
            <WorkCard item={WORK_ITEMS[2]} index={2} />
          </div>

          {/* Row 3 — the cards ALTA used to sit above, now side by side */}
          <div className="reveal">
            <WorkCard item={WORK_ITEMS[3]} index={3} />
          </div>
          <div className="reveal">
            <HealthCallCard to={WORK_ITEMS[5].to} />
          </div>

          {/* Column 3: two tall portrait cards — untouched, independent */}
          <div className="reveal flex flex-col gap-6 lg:col-start-3 lg:row-start-1 lg:row-span-3">
            <WorkCard item={WORK_ITEMS[4]} index={4} />
            <WorkCard item={WORK_ITEMS[6]} index={6} />
          </div>
        </div>
      </div>
    </section>
  );
}
