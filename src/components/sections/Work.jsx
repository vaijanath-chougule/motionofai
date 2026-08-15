import { useScrollReveal } from '../../hooks/useScrollReveal';
import WorkCard from '../work/WorkCard';
import { WORK_ITEMS } from '../../utils/constants';

/**
 * Work — a luxury masonry grid. Cards reveal on scroll and zoom softly
 * on hover. Image placeholders swap 1:1 for real case-study media.
 */
export default function Work() {
  const scope = useScrollReveal({ stagger: 0.09 });

  return (
    <section id="work" ref={scope} className="relative py-28 md:py-40">
      <div className="shell">
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

        {/* CSS columns = true masonry, no layout library needed */}
        <div className="[column-fill:_balance] gap-6 sm:columns-2 lg:columns-3">
          {WORK_ITEMS.map((item, i) => (
            <div key={item.id} className="reveal mb-6 break-inside-avoid">
              <WorkCard item={item} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
