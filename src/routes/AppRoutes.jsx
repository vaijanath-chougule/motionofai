import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader';

// Route-level code splitting. The home chunk carries the story; the
// Voice Agent page (future Three.js host) loads only when visited.
const Home = lazy(() => import('../pages/Home'));
const WebsitesPage = lazy(() => import('../pages/WebsitesPage'));
const VoiceAgentPage = lazy(() => import('../pages/VoiceAgentPage'));
const AIVideoProductionPage = lazy(() => import('../pages/AIVideoProductionPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/3d-websites" element={<WebsitesPage />} />
        <Route path="/voice-agents" element={<VoiceAgentPage />} />
        <Route path="/ai-video-production" element={<AIVideoProductionPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
