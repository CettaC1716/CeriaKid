# CLAUDE.md — CeriaKids AI & Engineering Guidelines

## 1. Motion & Animation Skill (`rossark-motion-skill`)
- Always consult `/MOTION.md` and `/skills/rossark-motion-skill/SKILL.md` before creating or modifying any character animation, mascot behavior, SVG/Canvas scene, or UI transition.
- Use the Web/React motion primitives in `src/utils/rossarkMotion.ts` (`wave`, `loop`, `bell`, `seg`, `seeded`, `track`, `flow`, `useLoopClock`, `useOneShotClock`) for procedural animations.
- Follow the core principles:
  - **Never teleport**: Smoothly interpolate transforms; for sprite-sheet poses in `CharviMascot.tsx`, use discrete sharp frames (no shader frame-blending ghosting) paired with ping-pong playback and 60fps procedural breathing/weight-shift layers.
  - **Calm by default & small amplitudes**: Subtle breathing (`1–1.5%`), natural asymmetric blinks (`Close ~85ms -> Closed ~65ms -> Reopen ~110ms`), and seeded variety (`seeded(i)`) instead of `Math.random()`.
  - **Layout stability**: Never animate layout dimensions (`width`, `height`, `top`, `left`); animate `transform` around natural pivots (`50% 94%` for grounded characters).

## 2. Locked UI Components
- The visual layout and proportions of `src/components/OnboardingView.tsx`, `src/components/HabitatWorlds.tsx`, and `src/components/BentoActionCards.tsx` are locked. Do not alter their layout unless explicitly requested by the user.
