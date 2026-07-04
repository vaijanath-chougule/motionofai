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
            <p className="reveal eyebrow mb-6">Selected Work</p>
            <h2 className="reveal max-w-2xl text-display-md font-semibold text-ink">
              Proof, not <span className="text-accent">promises</span>.
            </h2>
          </div>
          <p className="reveal max-w-xs text-base leading-relaxed text-muted">
            A glimpse of experiences we've engineered to convert.
          </p>
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
