import DeferredMount from '../common/DeferredMount';
import { useMediaQuery, MOBILE_QUERY } from '../../hooks/useMediaQuery';

/**
 * Architecture placeholder for future React Three Fiber scenes.
 *
 * It reserves its box (no CLS) and resolves a device-appropriate camera
 * so desktop and mobile framing can differ WITHOUT changing page layout
 * — the layout owns the box, the scene owns the camera. Deliberately
 * imports NO three/@react-three code, so the 3D chunk stays out of the
 * bundle until a real <Canvas> is dropped in.
 *
 * When ready for WebGL, pass a function child; it lazy-mounts near the
 * viewport inside DeferredMount:
 *
 *   <ResponsiveCanvas minHeight="100vh" fallback={<SpherePlaceholder />}>
 *     {({ camera, isMobile }) => <VoiceCanvas camera={camera} compact={isMobile} />}
 *   </ResponsiveCanvas>
 */
export default function ResponsiveCanvas({
  className = '',
  minHeight = 'auto',
  desktopCamera = { position: [0, 0, 5], fov: 45 },
  mobileCamera = { position: [0, 0, 7], fov: 60 },
  fallback = null,
  children,
}) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const camera = isMobile ? mobileCamera : desktopCamera;

  return (
    <div className={`relative ${className}`}>
      <DeferredMount minHeight={minHeight} fallback={fallback}>
        {typeof children === 'function' ? children({ isMobile, camera }) : children}
      </DeferredMount>
    </div>
  );
}
