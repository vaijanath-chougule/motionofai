import { useCallback, useEffect, useRef, useState } from 'react';
import { isLowPowerDevice, isTouch } from '../utils/device';

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
export function useImageSequence({ frameCount, getUrl, getFallbackUrl, concurrency = 8 }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const loadedRef = useRef([]); // boolean per frame
  const targetRef = useRef(0); // desired frame index (float)
  const drawnRef = useRef(-1); // last frame actually painted
  const rafRef = useRef(0);
  const ctxRef = useRef(null);
  const [loadedCount, setLoadedCount] = useState(0);

  // Low-latency 2D context, cached. `desynchronized` lets the browser
  // skip a compositor hop so painted frames land closer to the scroll
  // that requested them (noticeably tighter on mobile). Smoothing state
  // is (re)applied on resize, since sizing the canvas resets it.
  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: false, desynchronized: true });
    }
    return ctxRef.current;
  }, []);

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

    const ctx = getCtx();
    if (!ctx) return;

    // Clear the previous frame for cleaner transitions
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cw = canvas.width;
    const ch = canvas.height;
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cw / ch;
    let dw;
    let dh;
    if (ir > cr) { dh = ch; dw = ch * ir; } else { dw = cw; dh = cw / ir; }
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }, [frameCount, getCtx]);

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
    // Cap device-pixel ratio: full DPR on capable devices, trimmed on
    // low-power phones where filling 3x pixels every frame is what starves
    // the scroll of frames. The image is in motion — the drop is invisible.
    const cap = isLowPowerDevice() ? 1.5 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, cap);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    // Sizing the canvas resets context state — reapply smoothing. 'medium'
    // on touch is materially cheaper than 'high' and indistinguishable on
    // a moving, cover-fit frame.
    const ctx = getCtx();
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = isTouch() ? 'medium' : 'high';
    }
    drawnRef.current = -1; // force repaint at new size
    paint(targetRef.current);
  }, [paint, getCtx]);

  useEffect(() => {
    imagesRef.current = new Array(frameCount);
    loadedRef.current = new Array(frameCount).fill(false);
    resize();

    let cancelled = false;
    let inFlight = 0;

    // CRITICAL OPTIMIZATION: Priority loading strategy
    // Load frames in this order for smooth scrolling:
    // 1. Every 4th frame first (0, 4, 8, 12...) - provides skeleton coverage
    // 2. Every 2nd frame (2, 6, 10, 14...) - fills half the gaps
    // 3. Remaining frames (1, 3, 5, 7...) - completes the sequence
    // This ensures smooth scrolling even before all frames load.
    const loadOrder = [];

    // Phase 1: Every 4th frame (0, 4, 8, 12, 16...)
    for (let i = 0; i < frameCount; i += 4) {
      loadOrder.push(i);
    }

    // Phase 2: Every other frame not yet added (2, 6, 10, 14...)
    for (let i = 2; i < frameCount; i += 4) {
      loadOrder.push(i);
    }

    // Phase 3: Fill remaining gaps (1, 3, 5, 7, 9, 11...)
    for (let i = 1; i < frameCount; i += 2) {
      if (!loadOrder.includes(i)) {
        loadOrder.push(i);
      }
    }

    // Phase 4: Any remaining frames
    for (let i = 0; i < frameCount; i++) {
      if (!loadOrder.includes(i)) {
        loadOrder.push(i);
      }
    }

    let cursor = 0;

    const onOne = (i, img) => {
      if (cancelled) return;
      imagesRef.current[i] = img;
      loadedRef.current[i] = true;
      setLoadedCount((c) => c + 1);
      // Repaint if this frame is at/near what we currently want.
      if (Math.abs(i - Math.round(targetRef.current)) <= 2 || drawnRef.current === -1) {
        scheduleDraw();
      }
      inFlight -= 1;
      pump();
    };

    function pump() {
      while (!cancelled && inFlight < concurrency && cursor < loadOrder.length) {
        const i = loadOrder[cursor];
        cursor += 1;
        inFlight += 1;
        const img = new Image();
        img.decoding = 'async';
        // High priority for first 10 frames in load order (skeleton)
        img.fetchPriority = cursor <= 10 ? 'high' : 'auto';
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
