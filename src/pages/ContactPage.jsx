import FinalCTA from '../components/sections/FinalCTA';

/**
 * /contact — the contact hero as its own destination. Reached from the nav
 * "Contact" link so a click lands directly on the full contact view rather
 * than scrolling to the closing band of the home page. Reuses the exact
 * FinalCTA section (heading · subtitle · premium contact row · button) and
 * centres it in the viewport for a clean, standalone premium page.
 */
export default function ContactPage() {
  return (
    <main className="relative flex min-h-[100svh] flex-col">
      <FinalCTA />
    </main>
  );
}
