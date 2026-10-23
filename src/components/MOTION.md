# MOTION.md: living illustrations in this project

> Copy this file next to the project's art (for example `src/art/MOTION.md`) and fill in **Part 2** as you learn the project. Part 1 is the method and stays as it is. The `rossark-motion-skill` reads this file first, and Part 2 overrides the skill's defaults.

---

## Part 1. The method

**The goal:** anything drawn (a character, a plant, a flame, a street, a logo, a chart) feels alive and calm. Nothing teleports, nothing bounces, nothing shouts.

### Principles
1. **Never teleport:** interpolate everything; never swap drawings.
2. **Calm by default:** strong curves, no bouncy overshoot.
3. **Small amplitudes:** when unsure, halve it.
4. **Arcs and pivots:** each moving part is a layer rotating around its joint (stem base, hinge, neck, hook).
5. **Overlap and follow-through:** tips and trailing parts move later and further; give each part the same wave with a growing phase delay.
6. **Variety without chaos:**
   - repeated items get a seeded phase, speed and size;
   - nothing moves in sync, and there's no random value per frame.
7. **One main action per scene, plus two or three idle loops.** Side things stay quiet.
8. **Opacity only to appear or disappear.**
9. **The layout never moves:** motion lives inside the drawing.
10. **Reduced motion:** loops freeze on a good frame 0, and one-shots show their final frame.
11. **Nothing runs unseen:** pause off screen, when hidden and in the background.
12. **Enough frames:** anything under ~100 ms flickers at 30 fps; render and export at 60 when you can. Blinks close in ~110 ms and reopen in ~190 ms.
13. **Interface rules:**
    - frequency decides how much (often seen = barely moves; rare moments get the delight);
    - every motion has a purpose;
    - shared elements travel, never teleport;
    - interface moves stay under 300 ms;
    - exits are faster than entrances;
    - nothing appears from scale 0;
    - interruptions continue from the current value.

### The engine
- **Clocks:** a loop clock for idle life, a one-shot clock for a scene that tells an action. One per character, group or scene.
- **Tracks:** keyframes `[ms, value, 'out'?]` read with `track(t, keys)`. The last key equals the first. `track` stops at every key, so use it for one move (a blink, a lid). For acting (a chain of poses), use `flow(t, keys)`, which passes through the keys without stopping and never overshoots.
- **Helpers:**
  - `wave` (−1 to 1), for sway and breathing;
  - `loop` (0 to 1), for drift and falling;
  - `bell`, to fade in and out;
  - `seg`, for one beat of a one-shot;
  - `seeded(i)`, for per-item variety.
- **Curves:**
  - travel uses ease-in-out `(0.77, 0, 0.175, 1)`;
  - open and arrive use ease-out `(0.23, 1, 0.32, 1)`;
  - leaving uses ease-in;
  - endless loops are linear.

### Quick recipes
| Subject | Recipe |
|---|---|
| Character | breathing 1–2 units over 3–5 s; a blink every 3–4 s; pupils glide; head tilt 3–6° |
| Waiting to be tapped | a jiggle every ~270 ms: squash 2%, widen 2%, the bulge trading sides |
| Floating figure | rises in from 30% of its height below, drifts 5% down and up, leaves rising |
| Tail, hair, ears | rotation around the root, phase delayed along the chain, 4–10° |
| Plant | sway 1.5–4° around the base over 3–6 s; leaves on seeded phases |
| Cloth, flag | a wave that travels along the length, growing away from the fixed edge |
| Fire | a lean of 2–4° and a 3–6% stretch on two waves of different periods |
| Smoke, steam | rises 8–14 units and fades in and out with `bell` |
| Water | ripples grow and fade; floating things bob 1–2 units and rock 2° |
| Rain, snow | seeded `loop`s; snow sways sideways |
| Sky | clouds drift over 20–60 s with parallax; sun rays take 30–60 s per turn |
| Lights | a glow of 2–5% over 2–4 s; stars twinkle at seeded times |
| Machines | gears turn linearly by ratio; a clock hand steps with ease-out |
| Phone | ±3° bursts, then a pause |
| Icon, logo | plays once on appear, then rests |
| Chart | a one-shot draw-on, with bars staggered 40–80 ms |

### Acting (a whole character)
- **Every channel:** key pose (`flow`) + idle (`wave`s, never off while on stage) + follow-through (the parent read 90–140 ms earlier) + accents (a `wave` inside a `seg` window).
- **Arms:** an upper arm and a forearm share a round elbow; the forearm points at shoulder angle + elbow bend.
- **Head turns:** slide the face toward the turn (eyes 10, nose 13 in a 100-wide head) and the ears the other way. Blink on the turn.
- **Weight:** the hips shift and carry the upper body, and the legs angle to keep the feet under it.
- **Landing:** hover, then fall with gravity and stretch; squash hard (0.8) on contact and keep the volume (`width = 1 / height^0.6`).
- **In the air:** limp feet (toes down, one knee folded, trading slowly). The shadow stays on the floor and scales with the height.
- **Props:** enter from off screen already moving and roll by distance / radius. The eyes follow them. A kick hits at the middle of the swing; the prop leaves as a throw, spinning, with a short squash.
- **Asymmetry:** the arms never mirror each other.
- **Camera:** a view from a little above is a whole build, not a tweak: the head is 40–50% of the height, the torso is short and narrower than the head, the legs are short, the feet are round from above, and the shadow is a wide oval with the feet in its lower half. Keep it in one `build` object. A flat view keeps a thin pill shadow.
- **Framing:** on a phone, as big as the screen allows, with the feet low.

### From a reference video
- Contact sheets at the full frame rate (`tools/sheet.sh`).
- Measure motion with numbers (`tools/track_edges.py`): a 2% jiggle or a 5% float doesn't show to the eye.
- Sample colors from pixels (`tools/sample_colors.py`).
- Go part by part: feet, shadow, hands, head.
- Compare proportions as ratios of one unit (head widths). "Stretched" means a ratio is far off.
- Compare your render with the reference at the same moments.
- Don't publish a copy of someone else's art.

### Performance
- Everything is a function of one clock's time.
- Draw many items in one SVG or `Canvas`.
- Reset repeating animations to 0 before starting, and cancel them on cleanup.
- Declare curves at the top of the module.

### Workflow
1. Read Part 2 and the art file's header comments.
2. List what could live in the drawing.
3. Pick one main action and two or three idle loops.
4. Split the art into layers at their pivots.
5. Put the numbers in tokens.
6. Check frame 0, the final frames and the loop seams. For a character, look at a contact sheet of every 4th frame of your own render.
7. Run the checks.
8. Hand off: what moves, and what hasn't been seen on a real device.

---

## Part 2. This project

### Where the code is
- **Platform:** Web (React 19 + TypeScript + Vite + WebGL2 / Canvas / SVG + Tailwind CSS)
- **Motion engine and live face:**
  - `src/utils/rossarkMotion.ts` (Web implementation of `useLoopClock`, `useOneShotClock`, `useReducedMotion`, `track`, `flow`, `wave`, `loop`, `bell`, `seg`, `seeded`, `bezier`, `travelCurve`, `openCurve`, `fallCurve`)
  - `src/components/CharviMascot.tsx` (WebGL + 60fps `requestAnimationFrame` living-idle procedural transform rig + discrete sprite-sheet choreographer)
- **Art kit, characters, poses:**
  - `/public/assets/budi/` — 4x5 WebP sprite sheets (5 columns × 4 rows = 20 frames per sheet) + `avatar_closeup.webp`:
    - `idle_talk_sheet.webp` (Row 0: Neutral standing `0`, blink frames `9` [half-closed] and `4` [closed]; Row 1: Talking syllable frames `10..19`)
    - `wave_sheet.webp` (Pose `wave` 👋, frames `0..19`)
    - `cheer_think_sheet.webp` (Row 0: `cheer` ✊ `0..9`; Row 1: `think` 🤔 `10..19`)
    - `react_thumbs_sheet.webp` (Row 0: `surprised` 😲 `0..9`; Row 1: `thumbsup` 👍 `10..19`)
  - Pivot & coordinate system: Budi stands grounded on the stage with `transformOrigin: '50% 94%'` (feet planted on the ground shadow oval).
- **Existing animated pieces to copy from:**
  - `src/components/CharviMascot.tsx` (Budi 3D mascot with procedural 60fps breathing, micro-nods, weight shift, blink choreography, syllable speech cadence, and WebGL real-time uniform recoloring)
  - `src/components/HabitatWorlds.tsx` (Layered scenic environment: Pagi Cerah, Sore Senja, Malam Bintang)
  - `src/components/OnboardingView.tsx` (Main Beranda stage, Studio Gaya Budi ✨, and 3-step Spotlight Tour Bersama Budi)

### The owner's rules
- **"Matikan Interpolasi Crossfade Antar-Frame di Shader (No uFrameMix / No Frame Blending)" (2026-10-22):**
  - *"Hapus pencampuran (blend/mix) antara uFrameA dan uFrameB pada transisi antar-frame berurutan karena menyebabkan efek bayangan hantu (4 tangan dan wajah ganda yang kabur). Gunakan perpindahan frame diskrit yang tajam (discrete frame stepping / Math.floor) sehingga di setiap waktu hanya 1 frame utuh dan tajam (100% opacity) yang dirender ke layar."*
- **"Perbaiki Mode Idle Agar 100% Tajam & Tenang + Procedural Living Idle (Opsi A)" (2026-10-22):**
  - *"Saat mode Idle (diam berdiri), jangan memutar frame 0..9 terus-menerus. Kunci tampilan pada Frame 0 (berdiri netral tajam) dan hanya tampilkan frame berkedip sesekali setiap 3.5–5.5 detik"* dengan kedipan asimetris (`0 -> 9 -> 4 -> 9 -> 0`), dipadukan dengan napas multi-sine 60fps (`scaleY`/`scaleX` menjaga volume dari pivot kaki `50% 94%`), anggukan kepala mikro (`rotateZ`), dan pergeseran tumpuan halus (`translateX`).
- **"Ubah Loop Berbicara Menjadi Ritme Suku Kata Alami (Natural Syllable Cadence)" (2026-10-22):**
  - *"Gunakan pola Ping-Pong dengan ritme suku kata alami (Syllable Pattern): mainkan variasi bukaan mulut secara lembut dengan kecepatan 140ms–180ms per frame, lalu setiap 4–5 suku kata berikan jeda singkat (pause 220ms–300ms pada frame berdiri netral tersenyum / frame 0) seolah Budi sedang mengambil jeda antar-kata atau koma. Begitu event suara selesai (onend pada SpeechSynthesis), segera kembali ke Frame 0."*
- **"Sesuaikan Kecepatan Pemutaran Frame Diskrit (10–12 FPS)" (2026-10-22):**
  - *"Saat menjalankan pose aktif (Sapa, Semangat, Mikir, Kaget, Jempol), putar urutan frame secara tegas (tanpa blur/blend) pada kecepatan 10–12 fps (sekitar 85ms–100ms per frame) dengan urutan maju lalu mundur (ping-pong) kembali ke Frame 0."*
- **"LOCKED DESIGN RULE" (`OnboardingView.tsx`, `HabitatWorlds.tsx`, `BentoActionCards.tsx`):**
  - Do not alter the locked Beranda layout, card grid positions, or stage geometry unless explicitly requested by the user.

### Rig limits
- **Pre-rendered 3D Sprite Sheets (`CharviMascot.tsx`):**
  - Budi's arms, hands, head, eyes, and mouth are baked into pre-rendered 3D sprite-sheet cells (not separate 2D SVG limb layers).
  - Because arms and head move significantly across frames `0..19` in action sheets, shader crossfading (`mix(frameA, frameB)`) creates ghosted limbs and double faces—so frame transitions MUST be discrete (`100%` opacity single frame) while continuous life (breathing, weight shift, micro-tilt, ground shadow breathing) is applied smoothly at 60fps to the character container and shadow around pivot `50% 94%`.
- **Uniform Recoloring (`uOutfitTheme`):**
  - The WebGL fragment shader recolors Budi's red school uniform pixels (`hat`, `tie`, `shorts`) in real time (`0` = Merah SD, `1` = Biru Kapten, `2` = Hijau Petualang, `3` = Ungu Juara) using a smooth luminance-preserving red-dominance mask that avoids warm skin tones, white shirt pixels, and accessories.

### How changes are checked
- **Build & Type Check:** Run `compile_applet` (`npm run build` / `tsc`) and `lint_applet` (`npm run lint`) to verify zero TypeScript or bundler errors.
- **Visual & Runtime Verification:** Preview in the AI Studio Web preview (`3000` port) across idle, blink, speaking (`window.speechSynthesis`), all 5 action poses (`wave`, `cheer`, `think`, `surprised`, `thumbsup`), outfit shader themes (`0..3`), and the 3-step Spotlight Onboarding Tutorial.
