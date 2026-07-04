import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Apple-style scroll-driven image sequence.
 *
 * Preloads a numbered frame set (concurrency-limited so it never blocks
 * the main thread), draws the current frame cover-fit onto a canvas at
 * capped DPR, and exposes setProgress(0..1) for a ScrollTrigger to
 * scrub. Draws the NEAREST already-loaded frame while the rest stream
 * in, so the hero is interactive immediately and gets sharper as frames
 * arrive — no white flash, no blocking.
 *
 * @param {number}  frameCount  total frames
 * @param {(i:number)=>string} getUrl  1-based index -> primary url (WebP)
 * @param {(i:number)=>string} [getFallbackUrl] 1-based index -> fallback (JPG)
 * @param {number}  concurrency parallel image requests
 */
export function useImageSequence({ frameCount, getUrl, getFallbackUrl, concurrency = 6 }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const loadedRef = useRef([]); // boolean per frame
  const targetRef = useRef(0); // desired frame index (float)
  const drawnRef = useRef(-1); // last frame actually painted
  const rafRef = useRef(0);
  const [loadedCount, setLoadedCount] = useState(0);

  // --- cover-fit blit in device pixels ---
  const paint = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const i = Math.max(0, Math.min(frameCount - 1, Math.round(index)));

    // Walk to the nearest loaded frame (prefer <= target, else >).
    let f = i;
    if (!loadedRef.current[f]) {
      let lo = f;
      let hi = f;
      while (lo >= 0 || hi < frameCount) {
        if (lo >= 0 && loadedRef.current[lo]) { f = lo; break; }
        if (hi < frameCount && loadedRef.current[hi]) { f = hi; break; }
        lo -= 1;
        hi += 1;
      }
    }
    const img = imagesRef.current[f];
    if (!img || !loadedRef.current[f]) return;
    if (f === drawnRef.current) return; // nothing changed
    drawnRef.current = f;

    const ctx = canvas.getContext('2d', { alpha: false });
    const cw = canvas.width;
    const ch = canvas.height;
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cw / ch;
    let dw;
    let dh;
    if (ir > cr) { dh = ch; dw = ch * ir; } else { dw = cw; dh = cw / ir; }
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }, [frameCount]);

  const scheduleDraw = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      paint(targetRef.current);
    });
  }, [paint]);

  const setProgress = useCallback((p) => {
    targetRef.current = Math.max(0, Math.min(1, p)) * (frameCount - 1);
    scheduleDraw();
  }, [frameCount, scheduleDraw]);

  // --- canvas sizing (DPR-capped) ---
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    drawnRef.current = -1; // force repaint at new size
    paint(targetRef.current);
  }, [paint]);

  useEffect(() => {
    imagesRef.current = new Array(frameCount);
    loadedRef.current = new Array(frameCount).fill(false);
    resize();

    let cancelled = false;
    let cursor = 0;
    let inFlight = 0;

    const onOne = (i, img) => {
      if (cancelled) return;
      imagesRef.current[i] = img;
      loadedRef.current[i] = true;
      setLoadedCount((c) => c + 1);
      // Repaint if this frame is at/near what we currently want.
      if (Math.abs(i - Math.round(targetRef.current)) <= 1 || drawnRef.current === -1) {
        scheduleDraw();
      }
      inFlight -= 1;
      pump();
    };

    function pump() {
      while (!cancelled && inFlight < concurrency && cursor < frameCount) {
        const i = cursor;
        cursor += 1;
        inFlight += 1;
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => onOne(i, img);
        img.onerror = () => {
          // WebP undecodable (rare) → retry this frame once as JPG.
          if (getFallbackUrl && !img.dataset.fallback) {
            img.dataset.fallback = '1';
            img.src = getFallbackUrl(i + 1);
            return;
          }
          inFlight -= 1;
          pump();
        };
        img.src = getUrl(i + 1);
      }
    }
    pump();

    const ro = new ResizeObserver(resize);
    if (canvasRef.current) ro.observe(canvasRef.current);
    window.addEventListener('resize', resize);

    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount]);

  return { canvasRef, setProgress, loadedCount, frameCount };
}
