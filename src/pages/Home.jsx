import { useRef } from 'react';
import Hero from '../components/hero/Hero';
import ServiceShowcase from '../components/services/ServiceShowcase';
import Work from '../components/sections/Work';
import Process from '../components/sections/Process';
import FinalCTA from '../components/sections/FinalCTA';

/**
 * The story, top to bottom. Hero is eager (it's the LCP). The three
 * service sections are now composed into one ServiceShowcase of premium
 * cards; each media surface lazy-mounts its own device-appropriate video
 * via IntersectionObserver. The genuinely heavy route (/voice-agents +
 * future Three.js) is what we code-split at the router.
 */
export default function Home() {
  const main = useRef(null);
  return (
    <main ref={main} className="relative">
      <Hero />
      <ServiceShowcase />
      <Work />
      <Process />
      <FinalCTA />
    </main>
  );
}
