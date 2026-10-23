// liveFace.tsx: a living face for SVG characters (Web / React SVG + motion.ts).
//
// Nothing ever swaps drawings: the pupil SLIDES, the eyelid LOWERS and RISES, the
// cheek pushes up for a happy squint, the mouth OPENS and CLOSES. One clock per
// character drives every channel through keyframe tracks via direct DOM updates
// (60fps without React re-renders).
//
// Needs `motion.ts` (the engine) next to it.
//
// Usage (see SKILL.md, "Characters"):
//   1. Draw your character's eyes as plain whites, with no pupils.
//   2. Inside the same <g> transform as the head, draw two <LiveEye> on top,
//      then anything that must cover the eyelids (nose, hair, glasses).
//   3. One `useChoreoClock(choreo.period, live)` per character.
import { useEffect, useRef } from 'react';
import { track, useLoopClock, type Keys, type SharedValue } from './motion';

export { track, type Key, type Keys } from './motion';

/**
 * One character's choreography. `lookX`/`lookY`: pupil offset in eye units.
 * `lid`: upper eyelid, 0 open to 1 closed (`lidRight` for a one-eyed blink or wink).
 * `cheek`: 0 to 1, the cheek rising into a happy squint. `mouth`: open-mouth depth.
 * `tilt`: head rotation in degrees (applied by you, on the head layer).
 */
export type Choreo = {
  period: number;
  lookX: Keys;
  lookY: Keys;
  lid: Keys;
  lidRight?: Keys;
  cheek?: Keys;
  mouth?: Keys;
  tilt?: Keys;
};

/** The character's clock: a loop of `period` ms, frozen at 0 when `live` is false. */
export const useChoreoClock = useLoopClock;

/** A rounded pill (stadium) path centred on (cx, cy). */
export function pill(cx: number, cy: number, w: number, h: number): string {
  const r = Math.min(w, h) / 2;
  const x = cx - w / 2;
  const y = cy - h / 2;
  return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
}

/** Where one eye sits, in the head's own coordinates. */
export type EyeGeometry = {
  /** Centre of the eye white. */
  cx: number;
  cy: number;
  /** Size of the eye white (a pill). */
  w: number;
  h: number;
  /** Pupil size, and its top edge measured from the top of the eye white. */
  pupilW: number;
  pupilH: number;
  pupilTop: number;
  /** Radius of the highlight dot. 0 for none. */
  shine: number;
};

export type FaceInk = {
  white: string;
  pupil: string;
  /** The skin colour: eyelid and cheek are skin sliding over the white. */
  skin: string;
  /** Lines: lash edge, closed eye, happy-squint arc. */
  line: string;
  lineWidth?: number;
};

/**
 * A living eye. Pupil and shine slide, clipped to the white. The lid and cheek
 * are skin clipped to a pill 2 units LARGER than the white: clipped to the exact
 * white, the anti-aliased white edge leaks around a closed eye and reads as
 * glasses. The closed-eye line appears only when the lid is nearly down.
 */
export function LiveEye({
  side,
  eye,
  ink,
  choreo,
  clock,
  id,
}: {
  /** -1 the eye on the viewer's left, 1 the right (mirrors the closed-eye line). */
  side: -1 | 1;
  eye: EyeGeometry;
  ink: FaceInk;
  choreo: Choreo;
  clock: SharedValue<number>;
  /** UNIQUE on screen: SVG clip ids are global. */
  id: string;
}) {
  const { cx, cy, w, h, pupilW: pw, pupilH: ph } = eye;
  const lidKeys = side === 1 && choreo.lidRight ? choreo.lidRight : choreo.lid;
  const top = cy - h / 2 + eye.pupilTop;
  const lidH = h + 4;
  const lw = ink.lineWidth ?? 5;

  const pupilRef = useRef<SVGRectElement | null>(null);
  const shineRef = useRef<SVGCircleElement | null>(null);
  const lidRef = useRef<SVGRectElement | null>(null);
  const lashRef = useRef<SVGLineElement | null>(null);
  const closedRef = useRef<SVGPathElement | null>(null);
  const cheekRef = useRef<SVGRectElement | null>(null);
  const happyRef = useRef<SVGPathElement | null>(null);

  const closedD = `M${cx - side * w * 0.37} ${cy}H${cx + side * w * 0.13}Q${cx + side * w * 0.33} ${cy} ${cx + side * w * 0.37} ${cy + h * 0.17}`;
  const happyD = `M${cx - w * 0.4} ${cy - h * 0.1}Q${cx} ${cy - h * 0.7} ${cx + w * 0.4} ${cy - h * 0.1}`;

  useEffect(() => {
    let raf = 0;
    const apply = () => {
      const t = clock.value;
      const lx = track(t, choreo.lookX);
      const ly = track(t, choreo.lookY);
      const l = track(t, lidKeys);
      const c = choreo.cheek ? track(t, choreo.cheek) : 0;

      if (pupilRef.current) {
        pupilRef.current.setAttribute('x', String(cx + lx - pw / 2));
        pupilRef.current.setAttribute('y', String(top + ly));
      }
      if (shineRef.current) {
        shineRef.current.setAttribute('cx', String(cx + lx - pw * 0.22));
        shineRef.current.setAttribute('cy', String(top + ly + eye.shine + 1.6));
      }
      if (lidRef.current) {
        lidRef.current.setAttribute('height', String(l * lidH));
      }
      if (lashRef.current) {
        const y = cy - h / 2 - 2 + l * lidH;
        const on = Math.min(1, l / 0.06) * Math.min(1, Math.max(0, (0.95 - l) / 0.08));
        lashRef.current.setAttribute('y1', String(y));
        lashRef.current.setAttribute('y2', String(y));
        lashRef.current.setAttribute('stroke-opacity', String(on));
      }
      if (closedRef.current) {
        const op = Math.min(1, Math.max(0, (l - 0.88) / 0.12));
        closedRef.current.setAttribute('stroke-opacity', String(op));
      }
      if (cheekRef.current) {
        cheekRef.current.setAttribute('y', String(cy + h / 2 + 2 - c * lidH));
        cheekRef.current.setAttribute('height', String(c * lidH));
      }
      if (happyRef.current) {
        const op = Math.min(1, Math.max(0, (c - 0.86) / 0.14));
        happyRef.current.setAttribute('stroke-opacity', String(op));
      }

      raf = requestAnimationFrame(apply);
    };

    apply();
    return () => cancelAnimationFrame(raf);
  }, [clock, choreo, lidKeys, cx, cy, w, h, pw, top, lidH, eye.shine]);

  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={pill(cx, cy, w, h)} />
        </clipPath>
        <clipPath id={`${id}Skin`}>
          <path d={pill(cx, cy, w + 2, h + 2)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect
          ref={pupilRef}
          x={cx + track(0, choreo.lookX) - pw / 2}
          y={top + track(0, choreo.lookY)}
          width={pw}
          height={ph}
          rx={pw / 2}
          fill={ink.pupil}
        />
        {eye.shine > 0 ? (
          <circle
            ref={shineRef}
            cx={cx + track(0, choreo.lookX) - pw * 0.22}
            cy={top + track(0, choreo.lookY) + eye.shine + 1.6}
            r={eye.shine}
            fill={ink.white}
          />
        ) : null}
      </g>
      <g clipPath={`url(#${id}Skin)`}>
        <rect
          ref={lidRef}
          x={cx - w / 2 - 2}
          y={cy - h / 2 - 2}
          width={w + 4}
          height={track(0, lidKeys) * lidH}
          fill={ink.skin}
        />
        <line
          ref={lashRef}
          x1={cx - w / 2 - 2}
          x2={cx + w / 2 + 2}
          y1={cy - h / 2 - 2}
          y2={cy - h / 2 - 2}
          stroke={ink.line}
          strokeWidth={lw * 0.6}
          strokeOpacity={0}
        />
        {choreo.cheek ? (
          <rect
            ref={cheekRef}
            x={cx - w / 2 - 2}
            y={cy + h / 2 + 2}
            width={w + 4}
            height={0}
            fill={ink.skin}
          />
        ) : null}
      </g>
      <path
        ref={closedRef}
        d={closedD}
        stroke={ink.line}
        strokeWidth={lw}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0}
        fill="none"
      />
      {choreo.cheek ? (
        <path
          ref={happyRef}
          d={happyD}
          stroke={ink.line}
          strokeWidth={lw}
          strokeLinecap="round"
          strokeOpacity={0}
          fill="none"
        />
      ) : null}
    </g>
  );
}

/**
 * A living open mouth: the dark inside deepens and shallows, the tongue follows.
 * `x0`/`x1` are the corners, `top` the upper lip line, `tilt` how much higher the
 * right corner sits. It never fully closes: with the teeth on top it reads as talking.
 */
export function LiveMouth({
  x0,
  x1,
  top,
  tilt = 0,
  ink,
  choreo,
  clock,
  restDepth = 11,
}: {
  x0: number;
  x1: number;
  top: number;
  tilt?: number;
  ink: { mouth: string; tongue: string; teeth?: string };
  choreo: Choreo;
  clock: SharedValue<number>;
  /** Depth used when the choreography has no `mouth` track. */
  restDepth?: number;
}) {
  const mid = (x0 + x1) / 2;
  const darkRef = useRef<SVGPathElement | null>(null);
  const tongueRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const apply = () => {
      const t = clock.value;
      const d = choreo.mouth ? track(t, choreo.mouth) : restDepth;
      if (darkRef.current) {
        darkRef.current.setAttribute(
          'd',
          `M${x0} ${top}L${x1} ${top - tilt}Q${x1 + 2} ${top + d} ${mid} ${top + d}Q${x0 - 2} ${top + d} ${x0} ${top}Z`,
        );
      }
      if (tongueRef.current) {
        const r = Math.min(d * 0.36, (x1 - x0) * 0.22);
        tongueRef.current.setAttribute('cy', String(top + d - r - 1.5));
        tongueRef.current.setAttribute('r', String(r));
      }
      raf = requestAnimationFrame(apply);
    };
    apply();
    return () => cancelAnimationFrame(raf);
  }, [clock, choreo.mouth, restDepth, x0, x1, top, tilt, mid]);

  const d0 = choreo.mouth ? track(0, choreo.mouth) : restDepth;
  const r0 = Math.min(d0 * 0.36, (x1 - x0) * 0.22);

  return (
    <g>
      <path
        ref={darkRef}
        d={`M${x0} ${top}L${x1} ${top - tilt}Q${x1 + 2} ${top + d0} ${mid} ${top + d0}Q${x0 - 2} ${top + d0} ${x0} ${top}Z`}
        fill={ink.mouth}
      />
      <circle ref={tongueRef} cx={mid + 1} cy={top + d0 - r0 - 1.5} r={r0} fill={ink.tongue} />
      {ink.teeth ? (
        <path
          d={`M${x0 + 1} ${top}L${x1 - 1} ${top - tilt}L${x1 - 1.5} ${top - tilt + 5}L${x0 + 1.5} ${top + 5}Z`}
          fill={ink.teeth}
        />
      ) : null}
    </g>
  );
}
