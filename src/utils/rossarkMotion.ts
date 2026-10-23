// motion.ts / rossarkMotion.ts: the motion engine for living illustrations (Web / React adaptation of rossark-motion-skill).
//
// Everything that moves reads a clock: a looping clock for idle life, a one-shot
// clock for a scene that tells an action. Values come from keyframe tracks and a
// few shaping helpers matching `templates/react-native/motion.ts` 1:1.
import { useEffect, useState } from 'react';

/** Cubic-bezier solver matching `Easing.bezierFn(x1, y1, x2, y2)` */
export function bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveCurveX = (x: number) => {
    let t2 = x;
    for (let i = 0; i < 8; i++) {
      const x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < 1e-6) return t2;
      const d2 = sampleCurveDerivativeX(t2);
      if (Math.abs(d2) < 1e-6) break;
      t2 = t2 - x2 / d2;
    }
    let t0 = 0;
    let t1 = 1;
    t2 = x;
    while (t0 < t1) {
      const x2 = sampleCurveX(t2);
      if (Math.abs(x2 - x) < 1e-6) return t2;
      if (x > x2) t0 = t2;
      else t1 = t2;
      t2 = (t1 - t0) * 0.5 + t0;
    }
    return t2;
  };

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return sampleCurveY(solveCurveX(t));
  };
}

// ⚠️ Keep curves at the TOP of the module.
/** Things that travel (gaze, sway, a head turning, a lid closing). */
export const EASE_IN_OUT = bezier(0.77, 0, 0.175, 1);
/** Things that open or arrive (a mouth, a lid reopening, a prop appearing). */
export const EASE_OUT = bezier(0.23, 1, 0.32, 1);
/** Only for things leaving or falling away. Never for something the eye is waiting on. */
export const EASE_IN = bezier(0.55, 0, 1, 0.45);

// Aliases for convenience
export const travelCurve = EASE_IN_OUT;
export const openCurve = EASE_OUT;
export const fallCurve = EASE_IN;

/** A keyframe: time (ms), value, and the curve of the segment ARRIVING here ('out', or ease-in-out by default). */
export type Key = readonly [number, number, 'out'?];
export type Keys = readonly Key[];
export type TrackKey = Key;

/** The value of a track at time `t`. The last key should equal the first, so loops never jump. */
export function track(t: number, keys: Keys): number {
  if (keys.length === 0) return 0;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const k1 = keys[i];
    if (t <= k1[0]) {
      const k0 = keys[i - 1];
      const span = k1[0] - k0[0];
      const p = span > 0 ? (t - k0[0]) / span : 1;
      const e = k1[2] === 'out' ? EASE_OUT(p) : EASE_IN_OUT(p);
      return k0[1] + (k1[1] - k0[1]) * e;
    }
  }
  return keys[keys.length - 1][1];
}

/** A key pose for `flow`: time (ms) and value, sorted by time. */
export type FlowKey = readonly [number, number];

/**
 * A smooth track through key poses, for acting (a body, arms, a head turn).
 * `track` eases in and out of EVERY key, so the motion stops at each one: fine for one
 * move (a blink, a lid), but a chain of poses then reads as stop-and-go, like a robot.
 * `flow` passes through the keys with a continuous speed and never overshoots one
 * (a monotone cubic). Repeat a value to hold, and layer idle life on top of the hold.
 */
export function flow(t: number, k: readonly FlowKey[]): number {
  const n = k.length;
  if (n === 0) return 0;
  if (t <= k[0][0]) return k[0][1];
  if (t >= k[n - 1][0]) return k[n - 1][1];
  let i = 0;
  while (k[i + 1][0] < t) i++;
  function slope(j: number): number {
    return (k[j + 1][1] - k[j][1]) / (k[j + 1][0] - k[j][0]);
  }
  function tangent(j: number): number {
    if (j === 0 || j === n - 1) return 0;
    const a = slope(j - 1);
    const b = slope(j);
    if (a * b <= 0) return 0;
    const h0 = k[j][0] - k[j - 1][0];
    const h1 = k[j + 1][0] - k[j][0];
    const w0 = 2 * h1 + h0;
    const w1 = h1 + 2 * h0;
    return (w0 + w1) / (w0 / a + w1 / b);
  }
  const h = k[i + 1][0] - k[i][0];
  const s = (t - k[i][0]) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * k[i][1] +
    (s3 - 2 * s2 + s) * h * tangent(i) +
    (-2 * s3 + 3 * s2) * k[i + 1][1] +
    (s3 - s2) * h * tangent(i + 1)
  );
}

/** 0 → 1 inside the window [a, b] of a clock (eased), 0 before it, 1 after. One beat of a scene. */
export function seg(t: number, a: number, b: number, curve: 'out' | 'inOut' = 'out'): number {
  if (t <= a) return 0;
  if (t >= b) return 1;
  const p = (t - a) / (b - a);
  return curve === 'out' ? EASE_OUT(p) : EASE_IN_OUT(p);
}

/** A smooth back-and-forth from -1 to 1. `phase` (0 to 1) offsets one item from the next. */
export function wave(t: number, period: number, phase = 0): number {
  return Math.sin((t / period + phase) * Math.PI * 2);
}

/** Progress through a loop, 0 to 1, with a phase (for drifting or falling items). */
export function loop(t: number, period: number, phase = 0): number {
  const p = (t / period + phase) % 1;
  return p < 0 ? p + 1 : p;
}

/** 0 at both ends of a loop and 1 in the middle: fade in and out (steam, sparkles, ripples). */
export function bell(p: number): number {
  return Math.sin(Math.PI * Math.min(1, Math.max(0, p)));
}

/** A stable pseudo-random number in [0, 1) for item `i`: variety that is the same every render. */
export function seeded(i: number, salt = 0): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Checks whether the user prefers reduced motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

/**
 * A looping clock from 0 to `period` ms. Frozen at 0 when `live` is false
 * (reduced motion, off screen, hidden): frame 0 must be a good drawing.
 */
export function useLoopClock(period: number, live = true): number {
  const reduced = useReducedMotion();
  const [t, setT] = useState(0);

  useEffect(() => {
    // Always reset to 0 first before starting
    setT(0);
    if (!live || reduced || period <= 0) return;

    let rafId = 0;
    let startOffset: number | null = null;

    const tick = (now: number) => {
      if (document.hidden) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (startOffset === null) startOffset = now;
      const elapsed = (now - startOffset) % period;
      setT(elapsed);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [live, period, reduced]);

  return !live || reduced ? 0 : t;
}

/**
 * A clock that plays ONCE from 0 to `duration` ms when `play` turns true, and
 * holds at the end (a scene that tells an action, a chart drawing itself on).
 * With reduced motion it jumps straight to the end: the final frame is the one
 * that carries meaning, so it must read on its own.
 */
export function useOneShotClock(duration: number, play: boolean, reducedOverride?: boolean): number {
  const systemReduced = useReducedMotion();
  const reduced = reducedOverride ?? systemReduced;
  const [t, setT] = useState(() => (reduced ? duration : 0));

  useEffect(() => {
    if (!play) {
      setT(0);
      return;
    }
    if (reduced || duration <= 0) {
      setT(duration);
      return;
    }

    setT(0);
    let rafId = 0;
    let startTime: number | null = null;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = Math.min(duration, now - startTime);
      setT(elapsed);
      if (elapsed < duration) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [play, reduced, duration]);

  return reduced && play ? duration : t;
}
