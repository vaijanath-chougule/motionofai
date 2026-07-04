import { Suspense } from 'react';
import { useInView } from '../../hooks/useInView';

/**
 * Extension point for heavy, lazy content (Three.js <Canvas>, GLB
 * models, big videos). Renders nothing until the slot nears the
 * viewport, then mounts `children` inside a Suspense boundary.
 *
 * Usage when you're ready to drop in WebGL:
 *
 *   const VoiceCanvas = lazy(() => import('../three/VoiceCanvas'));
 *   <DeferredMount minHeight="100vh" fallback={<SpherePlaceholder />}>
 *     <VoiceCanvas />
 *   </DeferredMount>
 *
 * `minHeight` reserves space so mounting causes ZERO layout shift.
 */
export default function DeferredMount({ children, fallback = null, minHeight = 'auto', rootMargin = '400px' }) {
  const [ref, inView] = useInView({ rootMargin });
  return (
    <div ref={ref} style={{ minHeight }}>
      {inView ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
}
