import AIVideoProduction from '../components/sections/AIVideoProduction';
import AIVideoCTA from '../components/sections/AIVideoCTA';

/**
 * /ai-video-production — dedicated page for the AI Video Production
 * portfolio. Reached from the ServiceShowcase "AI Video Production"
 * card and the nav link. Navbar is global (App shell); this page just
 * hosts the cinematic two-column section as its own route rather than
 * rendering it inline below the home cards.
 *
 * The portfolio gallery is followed by the final CTA — a cinematic,
 * near-black closing scene with a live Calendly booking widget.
 */
export default function AIVideoProductionPage() {
  return (
    <main className="relative">
      <AIVideoProduction />
      <AIVideoCTA />
    </main>
  );
}
