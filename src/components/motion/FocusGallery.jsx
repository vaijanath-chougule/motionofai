import { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { prefersReducedMotion } from '../../utils/device';

/**
 * FocusGallery — a magnetic focus field for a row of cards. Cover Flow, not a
 * lightbox: the row REORGANISES around the cursor. Nothing opens, nothing
 * leaves the row, nothing goes fullscreen.
 *
 * ── CONTINUOUS, NOT DISCRETE ───────────────────────────────────────────────
 * There is no "focused card" boolean anywhere in here. Every card computes a
 * weight from its distance to the cursor, and every visual property is a
 * function of that weight. Crossing from card 2 to card 3 does not switch a
 * flag — the two weights trade places continuously, so at the midpoint BOTH
 * cards sit at ~1.37 and the row reads as a wave passing under the cursor.
 *
 * The falloff is a fourth-order (super-)Gaussian rather than a plain one:
 *
 *      w = exp(−(d / SIGMA)⁴)          d = distance in card-pitches
 *
 * The flat top means a card holds its full hero size across the middle of its
 * own slot instead of peaking only at the exact centre pixel; the steep
 * shoulders mean the neighbour has already receded to ~0.81. A plain Gaussian
 * gives one or the other, never both.
 *
 * ── TWO INDEPENDENT INPUTS ─────────────────────────────────────────────────
 *   `hover`  0 → 1, is the cursor in the row at all (sprung, so entering and
 *            leaving the row settles rather than snaps)
 *   `w`      0 → 1, this card's share of the cursor's attention
 * Resting state is `hover = 0`, where every mapping collapses to identity —
 * scale 1 and no lift, regardless of w.
 *
 * ── VERTICAL SAFETY ────────────────────────────────────────────────────────
 * A hero at 1.5× is ~660px tall and lifts 40px, which on a short viewport
 * would run into the fixed navbar or off the bottom of the section. Rather
 * than shrink the cards (their resting dimensions are load-bearing elsewhere),
 * the HERO SCALE ITSELF is clamped at measure time to whatever keeps 24px
 * under the navbar and 32px above the section floor. Tall viewports get the
 * full 1.5; short ones degrade smoothly and never clip.
 *
 * ── NO REACT STATE ON THE HOT PATH ─────────────────────────────────────────
 * Pointer movement writes ONE MotionValue. Everything else is useTransform.
 *
 * Disabled by construction for coarse pointers, prefers-reduced-motion, and
 * any caller passing `enabled: false` (how phones and tablets opt out). When
 * inactive it renders a plain <div> and the markup is unchanged.
 *
 * @typedef {Object} GalleryMetrics
 * @property {number[]} centers    Layout centre of each card, row coordinates.
 * @property {number}   pitch      Distance between adjacent centres.
 * @property {number}   heroScale  Largest scale that still clears navbar + floor.
 *
 * @typedef {Object} FocusController
 * @property {boolean} active
 * @property {import('react').RefObject<HTMLElement>} rowRef
 * @property {{onPointerEnter: Function, onPointerMove: Function, onPointerLeave: Function}} rowHandlers
 * @property {import('framer-motion').MotionValue<number>} cursor
 * @property {import('framer-motion').MotionValue<number>} hover
 * @property {import('react').MutableRefObject<GalleryMetrics>} metrics
 */

// ── Reusable motion constants ───────────────────────────────────────────────

export const FOCUS_MOTION = {
  /** Hero size when the cursor is on a card. Hard ceiling, never exceeded. */
  HERO_SCALE: 1.5,
  HERO_SCALE_MAX: 1.55,
  /** Everything the cursor is not near. Stays plainly visible. */
  RECEDED_SCALE: 0.78,
  /** Hero rise. */
  HERO_LIFT: -40,
  /** How far a neighbour slides away from the cursor to open up room. */
  NEIGHBOUR_PUSH: 20,
  /** Falloff width, in card-pitches. Governs how tightly focus is held. */
  SIGMA: 0.75,
  /** Width of the band that gets pushed aside, centred one pitch out. */
  PUSH_SIGMA: 0.9,
  /** Clearances the hero must always respect. */
  NAVBAR_GAP: 24,
  FLOOR_GAP: 32,
  /** Sub-pixel slack so rounding can never eat into the two gaps above. */
  CLEARANCE_SAFETY: 1,
  Z_RANGE: 100,
};

/** One spring drives the whole field. */
export const FOCUS_SPRING = { stiffness: 380, damping: 32, mass: 0.8 };

/** The cursor itself is smoothed a little so the wave trails the pointer. */
export const CURSOR_SPRING = { stiffness: 420, damping: 40, mass: 0.6 };

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const NAVBAR_SELECTOR = 'header nav';

/**
 * Attention weight for a card `d` pitches from the cursor.
 * Fourth-order Gaussian: flat across a card's own slot, steep beyond it.
 */
const weightAt = (d) => Math.exp(-((d / FOCUS_MOTION.SIGMA) ** 4));

/**
 * How strongly a card at distance `d` is pushed aside. Peaks at one pitch out
 * (the immediate neighbours) and tapers both ways, so the hero never shoves
 * itself and distant cards barely drift.
 */
const pushAt = (d) => Math.exp(-(((d - 1) / FOCUS_MOTION.PUSH_SIGMA) ** 2));

/**
 * @param {{ enabled?: boolean }} [options]
 * @returns {FocusController}
 */
export function useFocusGallery({ enabled = true } = {}) {
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  const reduce = prefersReducedMotion();
  const active = Boolean(enabled) && finePointer && !reduce;

  const rowRef = useRef(null);
  const cursorRaw = useMotionValue(0);
  const cursor = useSpring(cursorRaw, CURSOR_SPRING);
  const hoverRaw = useMotionValue(0);
  const hover = useSpring(hoverRaw, FOCUS_SPRING);

  /** @type {import('react').MutableRefObject<GalleryMetrics>} */
  const metrics = useRef({ centers: [], pitch: 1, heroScale: FOCUS_MOTION.HERO_SCALE });

  // Layout geometry plus the largest hero scale this viewport can safely show.
  // offsetLeft/offsetWidth are layout values, immune to the transforms this
  // effect applies, so a magnified card can never feed back into its own
  // measurement and oscillate.
  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const items = Array.from(row.children);
    if (!items.length) return;

    const centers = items.map((el) => el.offsetLeft + el.offsetWidth / 2);
    const pitch =
      centers.length > 1
        ? (centers[centers.length - 1] - centers[0]) / (centers.length - 1)
        : items[0].offsetWidth;

    const {
      HERO_SCALE,
      HERO_SCALE_MAX,
      HERO_LIFT,
      NAVBAR_GAP,
      FLOOR_GAP,
      CLEARANCE_SAFETY,
    } = FOCUS_MOTION;

    // Vertical budget. The card's resting centre is fixed; a hero grows about
    // that centre and then lifts, so both edges are a function of scale.
    const rowRect = row.getBoundingClientRect();
    const height = items[0].offsetHeight;
    const centreY = rowRect.top + items[0].offsetTop + height / 2 + HERO_LIFT;

    const nav = document.querySelector(NAVBAR_SELECTOR);
    const ceiling =
      (nav ? nav.getBoundingClientRect().bottom : 0) + NAVBAR_GAP + CLEARANCE_SAFETY;
    const floor = window.innerHeight - FLOOR_GAP - CLEARANCE_SAFETY;

    // top = centreY − S·h/2 ≥ ceiling   and   bottom = centreY + S·h/2 ≤ floor
    const byCeiling = (2 * (centreY - ceiling)) / height;
    const byFloor = (2 * (floor - centreY)) / height;
    const heroScale = Math.max(
      1,
      Math.min(HERO_SCALE, HERO_SCALE_MAX, byCeiling, byFloor),
    );

    metrics.current = { centers, pitch: pitch || 1, heroScale };
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || !active) return undefined;
    measure();
    window.addEventListener('resize', measure);
    if (typeof ResizeObserver === 'undefined') {
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => {
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, [active, measure]);

  // Losing the effect mid-hover must not strand the row mid-wave.
  useEffect(() => {
    if (!active) hoverRaw.set(0);
  }, [active, hoverRaw]);

  const onPointerEnter = useCallback(
    (event) => {
      if (!active || event.pointerType !== 'mouse') return;
      measure();
      const row = rowRef.current;
      if (row) {
        // Seed BOTH the target and the spring before the wave rises, so
        // entering the row does not sweep the field across from wherever the
        // cursor was last parked.
        const rect = row.getBoundingClientRect();
        const at = event.clientX - rect.left + row.scrollLeft;
        cursorRaw.jump(at);
        cursor.jump(at);
      }
      hoverRaw.set(1);
    },
    [active, cursor, cursorRaw, hoverRaw, measure],
  );

  const onPointerMove = useCallback(
    (event) => {
      if (!active || event.pointerType !== 'mouse') return;
      const row = rowRef.current;
      if (!row) return;
      const rect = row.getBoundingClientRect();
      cursorRaw.set(event.clientX - rect.left + row.scrollLeft);
      if (hoverRaw.get() !== 1) hoverRaw.set(1);
    },
    [active, cursorRaw, hoverRaw],
  );

  const onPointerLeave = useCallback(() => hoverRaw.set(0), [hoverRaw]);

  return {
    active,
    rowRef,
    cursor,
    hover,
    metrics,
    rowHandlers: { onPointerEnter, onPointerMove, onPointerLeave },
  };
}

/**
 * One card in the field.
 *
 * @param {{
 *   index: number,
 *   controller: FocusController,
 *   elementRef?: import('react').Ref<HTMLDivElement>,
 *   className?: string,
 *   style?: import('react').CSSProperties,
 *   children?: import('react').ReactNode,
 * } & Record<string, unknown>} props
 */
export function FocusItem({ index, controller, elementRef, className, style, children, ...rest }) {
  const { active, cursor, hover, metrics } = controller;
  const { RECEDED_SCALE, HERO_LIFT, NEIGHBOUR_PUSH, Z_RANGE } = FOCUS_MOTION;

  // Signed distance to the cursor, in card-pitches.
  const offset = useTransform(cursor, (x) => {
    const { centers, pitch } = metrics.current;
    const centre = centers[index];
    if (centre === undefined) return Number.POSITIVE_INFINITY;
    return (centre - x) / pitch;
  });

  // This card's share of the cursor's attention.
  const weight = useTransform(offset, (o) => (Number.isFinite(o) ? weightAt(Math.abs(o)) : 0));

  // Every mapping below blends between "resting" and "field engaged" by
  // `hover`, so the row is untouched until the cursor is actually over it and
  // unwinds smoothly the moment it leaves.
  const scale = useTransform([hover, weight], ([h, w]) => {
    const hero = metrics.current.heroScale;
    return 1 + h * (RECEDED_SCALE - 1 + w * (hero - RECEDED_SCALE));
  });

  const y = useTransform([hover, weight], ([h, w]) => h * w * HERO_LIFT);

  // Neighbours slide AWAY from the cursor, opening room for the hero.
  const x = useTransform([hover, offset], ([h, o]) => {
    if (!Number.isFinite(o)) return 0;
    const d = Math.abs(o);
    return h * Math.sign(o) * NEIGHBOUR_PUSH * pushAt(d) * (1 - weightAt(d));
  });

  // NOTHING dims, tints or blurs. No opacity, brightness, saturation, contrast,
  // grayscale, blur or backdrop-filter is written by this component, on the
  // hero or on the rest. Every video stays perfectly clear at all times; focus
  // is carried entirely by size, lift and layering. Leaving `filter` unset also
  // means the cards never get a filter-induced compositing layer, so playback
  // is untouched.

  // Depth is z-index alone, ordered by attention.
  const zIndex = useTransform([hover, weight], ([h, w]) => Math.round(h * w * Z_RANGE));

  // Exposed to CSS so the card's own title/eyebrow/button can respond without
  // this module reaching into ReelCard's markup. Already sprung.
  const focusAmount = useTransform([hover, weight], ([h, w]) => h * w);

  if (!active) {
    return (
      <div ref={elementRef} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={elementRef}
      data-reel-focus=""
      className={className}
      style={{
        ...style,
        scale,
        x,
        y,
        zIndex,
        // Growth is symmetric about the card's own axis, so a card expands
        // from where it already sits and the row's layout boxes never move.
        transformOrigin: 'center center',
        '--reel-focus': focusAmount,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
