---
name: rossark-motion-skill
description: Bring anything drawn to life with calm, believable motion. It covers characters and creatures (gliding pupils, blinks, breathing, head tilts), full-body acting (landing, waving, leaning, levitating, kicking a ball), plants, fabric, fire, smoke, water, weather, lights, machines, vehicles, icons, logos, charts and whole scenes. Use it whenever someone asks to animate an illustration, an icon, a mascot or a scene, to make something "feel alive", to add idle motion, to turn a static drawing into a living one, or to recreate the motion of a reference video. Comes with a small motion engine and templates for React Native (react-native-svg + Reanimated) and SwiftUI (TimelineView + Canvas), tools that measure a reference video frame by frame, and offline rendering to video, in a phone frame too. The method also works on the web.
---

# rossark-motion-skill: bring anything to life

A method for making drawn things feel alive without making them busy. It came from a production app's onboarding and paywall art, where the brief was "it has to feel ALIVE" and "NO TELEPORTING in the animation". It works the same for a character, a houseplant, a candle, a rainy street, a logo or a chart.

## 0. Read the project's notes first

Before touching anything, look for the project's motion notes:
- a `MOTION.md` next to the art (search the repo for it);
- the project's `CLAUDE.md`;
- any saved memory about animation.

**Project rules override everything below.** They usually name the existing motion code, the art kit, what the rig can't do, and what the owner has banned.

If the project has no notes:
1. Copy `MOTION.md` from this skill's folder next to the art. Its Part 1 is this method in short form.
2. Fill in Part 2 as you learn the project.
3. Keep it up to date after each round.

## 1. Principles

These hold for anything you animate.

1. **Never teleport.** Interpolate everything. A pupil slides, a door swings, a flame leans; nothing snaps from one drawing to another.
2. **Calm by default.** Use timed motion with strong curves. No bouncy overshoot unless the project explicitly wants a bouncy brand.
3. **Small amplitudes.** Life is subtle. See the table in section 3; when unsure, halve it.
4. **Arcs and pivots.** Real things rotate around a joint. Draw every moving part as its own layer and rotate it around its pivot: a stem's base, a door's hinge, a head's neck, a lamp's hook. Sliding in a straight line looks mechanical.
5. **Overlap and follow-through.** Parts don't move together. The tip of a branch moves later and further than its base; hair and tails lag behind the head; a hanging sign keeps swinging after the wind stops. In practice, give each part the same wave with a phase delay that grows along the chain.
6. **Variety without chaos.**
   - Repeated items (raindrops, leaves, stars, bubbles) each get their own phase and a slightly different speed and size, from `seeded(i)`.
   - Never `Math.random()` per frame, and never everything in sync.
   - Things on the same screen breathe out of phase.
7. **One main action per scene, plus two or three idle loops.** The main action tells the story: the alarm rings, the plant gets watered, the chart draws on. The loops only say "this place is alive". Side characters, mascots and backgrounds stay quiet.
8. **Opacity only to appear or disappear** (steam, a drop, a sparkle, a notification). Never use it to dim something halfway.
9. **The layout never moves.** Motion happens inside the drawing (transforms on groups), never by resizing or moving the view on the page.
10. **Reduced motion means still.**
    - Loops freeze at frame 0, which must be a good drawing.
    - One-shot scenes show their final frame, which must read on its own.
11. **Nothing runs unseen.** Off screen, hidden or in the background, every clock is paused.
12. **Give every move enough frames.** At 30 fps, anything shorter than about 100 ms is two or three frames and flickers. Make fast moves (blinks, contact, snaps) last long enough, and render or export at 60 fps when the platform allows.

## 2. The engine

The templates have one small engine per platform:
- **Web / React:** `src/utils/rossarkMotion.ts`;
- **React Native:** `templates/react-native/motion.ts`;
- **SwiftUI:** `templates/swiftui/Motion.swift`.

Copy it into the project, unless the project's notes name its own.

- **Clocks.** Everything that moves reads a clock.
  - `useLoopClock(period, live)` / `LoopClock` loops forever, for idle life.
  - `useOneShotClock(duration, play, reduced)` / `OneShotClock` plays once and holds, for a scene that tells an action.
  - Use one clock per character, object group or scene, never one per tiny part.
- **Tracks.** Keyframes `[ms, value, 'out'?]` read with `track(t, keys)`. Each segment eases in and out, or eases out when marked `'out'`. The last key equals the first, so a loop never jumps.
  - `track` stops at every key, which is right for ONE move (a blink, a lid, a door).
  - For acting, a chain of poses (a body, arms, a head turn), use `flow(t, keys)` with keys `[ms, value]`. It passes through every key with a continuous speed and never overshoots one. With `track`, the character stops dead at each pose and reads as a robot (section 5).
- **Shaping helpers:**
  - `wave(t, period, phase)` gives a smooth -1 to 1, for sway, bob and breathing;
  - `loop(t, period, phase)` gives 0 to 1 progress, for drift and falling;
  - `bell(p)` fades in and out over a loop;
  - `seg(t, a, b)` turns a window of a one-shot clock into 0 to 1, for one beat of a scene;
  - `seeded(i)` gives stable per-item variety.
- **Curves.**
  - Things that travel (gaze, sway, a door, a lid closing) use ease-in-out `bezier(0.77, 0, 0.175, 1)`.
  - Things that open or arrive (a mouth, a lid reopening, a prop appearing, a bar growing) use ease-out `bezier(0.23, 1, 0.32, 1)`.
  - Only things leaving or falling away use ease-in.
  - Endless loops (rain, conveyor, gears, rotation) are linear.

## 3. Recipes by subject

Numbers are in drawing units (the artwork's own coordinate system) and milliseconds. They are starting points, not laws.

| Subject | What lives | Recipe |
|---|---|---|
| **Character, creature** | eyes, breath, head | See section 4. Breathing 1–2 units over 3–5 s; head tilt 3–6°; a blink every 3–4 s |
| **Tail, ears, hair, antenna** | follow-through | Rotation around the root, `wave` with the phase delayed 0.1–0.2 per segment; 4–10° |
| **Plant, tree, grass** | sway | Rotation around the base, 1.5–4°, 3–6 s per cycle. Leaves add their own small sway with a phase from `seeded(i)`; tips move more than the base |
| **Flag, curtain, cloth, scarf** | wave | Split into strips or points; each one offsets by `wave(t, period, phase = k·i)`, so the wave travels along the length. Amplitude grows away from the fixed edge |
| **Fire, candle** | flicker | Lean the flame 2–4° and stretch it 3–6% in the drawing on two waves of different periods (for example 700 and 1100 ms); the inner flame moves on a third. No random jitter |
| **Smoke, steam** | rise | Wisps rise 8–14 units while `bell(p)` fades them in and out; 2–3 wisps out of phase |
| **Water** | ripples, waves | Ripples are rings that grow 0 → 1 and fade with `bell`. Surface waves are a path whose points follow `wave` with a travelling phase. Floating things bob 1–2 units and rock 2° |
| **Rain, snow, leaves falling** | fall | `loop` per item with a seeded phase, speed (±20%) and x drift. Snow sways sideways with a slow `wave`. Linear |
| **Clouds, sky** | drift | Horizontal `loop` over 20–60 s; layers further back move slower (parallax). Sun rays rotate one turn in 30–60 s |
| **Lights, lamps, stars, screens** | glow, twinkle | A glow grows 2–5% in the drawing over 2–4 s. Stars twinkle with a small scale and an opacity dip at seeded times. An LED blinks on and off. A screen flickers rarely, never constantly |
| **Machines, gears, fans, clocks** | mechanism | Gears rotate linearly at speeds set by their tooth ratio. A clock hand steps once a second with ease-out; the colon blinks every 0.5 s. A fan spins steadily |
| **Phone, alarm, notification** | buzz | Bursts of ±3° (4 cycles in about 0.45 s), then a pause; vibration ticks show only during the burst. A notification slides in with ease-out and stays |
| **Vehicles** | ride | The body bobs 0.5–1 unit; wheels rotate linearly; scenery passes in parallax `loop`s. Never shake the whole frame |
| **Something waiting to be tapped** (a box, a gift, a card) | a jiggle | It never sits still while it waits: a quick, small squash-and-widen pulse (1.5–3%) on a 200–350 ms beat, with the bulge moving to one side and then the other (about 1% of its width). Stop it during the tap's anticipation, and bring it back once the object is at rest again |
| **Floating, levitating** | a float | It rises in from well below (a quarter to a third of its height) and slows, drifts a few percent of its height down and back, and leaves rising as it fades. Its feet hang limp and its shadow breathes with the height (section 5) |
| **Icon, logo** | a moment | Play once on appear (a draw-on, a small turn, a blink), then rest. No endless loops on UI chrome. A press is a 0.97 scale on the button, not inside the drawing |
| **Chart, diagram** | draw-on | One-shot: lines draw with a stroke-dash offset, bars grow from their base with ease-out and a small stagger (40–80 ms), and numbers count up with ease-out. Final frame = the data |
| **Scene** | a story | One one-shot action when the scene appears (section 6), then the idle loops of whatever is in it |

## 4. Characters in depth

**The live face.** The templates (`templates/react-native/liveFace.tsx` and `templates/swiftui/LiveFace.swift`) use the engine:
1. Draw the eyes as plain whites, with no pupils (if the art comes from a kit, use its "no pupils" option).
2. On top, in the head's coordinates, draw the two live eyes. The pupil slides, clipped to the white; the lid and cheek are skin clipped to a shape 2 units LARGER than the white. With the exact white, the anti-aliased edge leaks around a closed eye and looks like glasses.
3. Then draw whatever covers the lids (nose, fringe, glasses), then the live mouth.

A `Choreo` holds the tracks:

| Track | What it moves |
|---|---|
| `lookX` / `lookY` | pupil offset |
| `lid` (and `lidRight`) | upper eyelid, from 0 (open) to 1 (closed) |
| `cheek` | happy squint, from 0 to 1 |
| `mouth` | depth of the open mouth |
| `tilt` | head rotation, in degrees, which you apply to the head layer |

The recipe for one loop of 6 to 9 s:
- **Gaze:** a resting gaze, plus one or two glances at something in the scene. Glide there in about 500 ms and hold for at least 1 s.
- **Blinks:** one every 3 to 4 s. Close in about 110 ms, hold 30–50 ms, and reopen in about 190 ms with `'out'`: reopening is slower than closing. Let the lower lid rise about 15% to meet the upper one, so the eye closes near its middle. Blink on head turns. Now and then, a double blink. A shorter blink (a 70 ms close) is only two frames at 30 fps and reads as a flicker.
- **The loop closes:** the last key equals the first.

| Feeling | Gaze | Lid | Extra |
|---|---|---|---|
| tired | down or at a screen | rests at 0.3 to 0.4 | slow blinks, one heavy blink |
| sad | down and away | rests at 0.1 | slow blinks, one slow look up |
| happy | at the viewer and at a friend | 0 | `cheek` up once per loop |
| talking | at the listener | 0 | `mouth` in syllables (8 to 14, around 180 ms each) |
| focused | fixed on the task | 0.1 | rare blinks, small saccades |
| sleepless | wide, at the ceiling, then the clock | 0 | a slow, tired close near the end |

**Body and head.**
- **Layers:** split the character into back hair, body, head (with the live face) and front (hands, held props).
- **Breathing:** the character's layer rises 1 to 2 units, with ease-in-out.
- **Head tilt:** the head and back hair rotate around the neck pivot. Don't tilt if a hand touches the face; it would come apart.
- **Cropped by an edge:** draw a few units below the crop, so the cut never shows when the character rises.
- **Creatures without a face rig:** breathing, ear and tail follow-through, and an occasional whole-head turn still make them feel alive.

## 5. Acting: a character that feels alive

Section 4 makes a face alive. This section is for a whole character, or a creature, that performs: arrives, lands, gestures, shifts its weight, reacts, plays with something. A character can hit every pose and still read as a robot. What makes it alive is how it moves between the poses, and the fact that it never fully stops.

**The rules:**

1. **Poses flow; they don't stop.** Read every acting channel with `flow`, never `track`. `track` drops the speed to zero at each key, so the character freezes at every pose. To hold a pose, repeat its value in the keys; the idle layer keeps the hold moving.
2. **Never a frozen frame (moving holds).** While the character is on screen, every channel carries a small idle layer, even in a "still" pose. Use periods that divide the loop, and give each part its own:
   - breathing: the body's height ±1–1.5% over 2–3 s;
   - limbs: a few degrees of sway on two different periods, with the left and right sides out of phase;
   - joints (elbows, knees, wrists): a few degrees;
   - head tilt: ±2° over 4–5 s;
   - weight: a little sideways drift over 4–5 s;
   - head turn: a hint, about 5% of a full turn.
3. **Layer every channel.** Final value = key pose (`flow`) + idle (`wave`s) + follow-through (a delayed copy of the parent) + accents (a `wave` switched on by a `seg` window: a hand waving, wings flapping, a tail wagging).
4. **Follow-through by delay, not by springs.** A child part reads its parent a moment earlier, 60–150 ms, at 0.3–0.6 of its strength:
   - **Counter-motion:** `head(t) = own(t) − 0.45 × lean(t − 110 ms)`. The head rights itself a beat after the body leans.
   - **Trailing:** `joint(t) += 0.45 × (parent(t − 90 ms) − parent(t))`. When the parent swings, the child lags and then catches up, with no overshoot. Forearms, hands, tails, ears and hair all work this way.
5. **Bend the limbs.** A limb is two segments that share one round joint, driven by two angles: the root's angle `a` and the joint's bend `e`. For an arm, `a` is the shoulder's outward angle (0 hangs down) and the forearm points at `a + e`. Straight limbs only swing like pendulums; the joint is where the acting happens. Keep both segments about the same length. Starting angles for common arm gestures:

   | Gesture | a | e | Note |
   |---|---|---|---|
   | wave | 60° | +110° | forearm up beside the head, waving ±10–15° every 0.6–0.9 s |
   | hand on the hip | 30° | −95° | the hand goes behind the body and the joint breaks the silhouette |
   | fist pump, cheer | 55° | +60° | |
   | arms flung for balance | 80–120° | about 0 | |
   | arms up in a V | 150° | 0 | a raised straight limb can stretch about 30% (cartoon reach) |

6. **Turn without new drawings (2.5D).** A `yaw` from −1 to 1 slides each part by its depth:
   - what sticks out the most (a nose, a beak, a snout) slides the most, about 13% of the head's width;
   - the eyes and mouth slide about 10%;
   - the outline doesn't move;
   - parts at the back (ears, back hair) slide the other way, about 9%, so the far one tucks behind the head;
   - prints and stripes on the chest slide 8–12% of the torso's width, clipped to it.

   The pupils lead the turn. Blink on a head turn, as people do.
7. **Shift the weight.** The hips slide sideways and carry everything above them. The legs rotate from the hips so the feet stay planted: the angle is about the shift divided by the leg's length, in radians. The leg that carries no weight lifts out a little.
8. **Land like a body.**
   - **Air time:** hover a moment, then fall with gravity, `lift = top × (1 − k²)`, stretching 5–10%. Right before contact, the arms go up.
   - **Contact:** squash 15–20%, snap the arms out, recover with one small overshoot, then settle.
   - **A hop:** crouch 5–10%, stretch 5–10%, a parabola up and down, then the same squash.
9. **Keep the volume.** When the height scales by `sy`, the width scales by `1 / sy^0.6`.
10. **Break the symmetry.** Left and right never mirror each other. Give them different angles, phases and bends. A symmetric pose reads as a mannequin.
11. **In the air, the feet hang.** Anything held up by nothing hangs. That covers floating, levitating, hovering before a fall and being carried:
    - the legs fall limp and close together;
    - the toes point down, the foot turned 60–80° at the ankle;
    - one knee folds a little, so that leg reads shorter, and the two legs trade slowly;
    - the arms hang a little out and sway.

    Float rather than stand: rise in from well below and slow, drift a few percent of the body's height down and back, and leave rising as you fade. Flatten the feet just before they touch down.
12. **The shadow moves with the height.** The shadow stays on the floor, with a visible gap under anything in the air. Its size scales with the distance (for example `1 − height / 220` in the drawing's units), so it breathes as a body floats and grows as it falls. A shadow that never changes pins the body to the ground. Its shape follows the camera (rule 14): a thin pill for a flat view, a wide oval for a view from above.
13. **Props and contact.**
    - **Entry:** a prop enters already moving, from beyond the visible edge. In a device frame, that means beyond the screen's edge.
    - **Rolling:** a rolling prop turns by the distance over its radius (`angle = Δx / r`) and slows to a stop with ease-out.
    - **Eyes:** the eyes and head follow the prop, toward it as it comes and after it as it goes. Blink on the turn toward it.
    - **A strike (a kick, a hit, a swing):**
      - the weight goes onto the support side and the free limbs open for balance;
      - the striking limb winds up and stops at the top;
      - it swings through the prop at its fastest: contact at the middle of the swing, never at the end;
      - it follows through and comes back, with the opposite arm swinging against it.
    - **Launch:** a launched prop flies as a throw, `x = x0 + vx·s` and `y = y0 − vy·s + g·s²/2` (s in seconds), spinning. It squashes for 60–100 ms at contact (about 15% along the hit, 10% wider across it).
    - **Afterwards:** the character watches it go, then reacts.
14. **The camera angle is a build, not a tweak.** A flat side view keeps the drawing's own proportions and a thin pill shadow. A camera a little above the character (friendly and toy-like, common in games, avatars and reward screens) changes the whole build. Nudging a side-view body by a few percent doesn't get there: it just reads as stretched. In head widths:
    - the head is 40–50% of the total height;
    - the torso is short, about 0.6 head widths tall, and narrower than the head, tapering a little toward the waist;
    - the head sits right on the collar, with no neck showing;
    - the legs are short, a quarter of the height or less, and close together;
    - the arms hang to about the hips;
    - the feet are round, dark shapes seen from above, with their tops tucked under the sock or the trouser;
    - the floor shows, so the shadow is a wide oval (1.3–1.5 head widths, about a third as tall as wide). The feet stand in its lower half.

    Keep these numbers in one `build` object, so the whole body changes in one place. Compute where the feet touch the floor from them.
15. **Frame it for where it will be seen.** On a phone screen, make the character as big as the screen allows, with room for its widest pose and its highest jump, and set its feet in the lower part of the screen. A small figure lost in the middle of the screen reads as a placeholder.

**Before calling it alive, check:**
- [ ] Nothing is frozen while the character is on screen, even in a held pose.
- [ ] There is no moment where every part stops at once.
- [ ] The head and the outer parts of the limbs arrive after the body.
- [ ] Left and right don't mirror each other.
- [ ] The weight moves from one side to the other at least once.
- [ ] The head turns at least once, and the character blinks on the turn.
- [ ] Landings squash and keep the volume.
- [ ] Anything in the air has hanging feet and a shadow that changes with its height.
- [ ] Every prop enters from off screen already moving, and the eyes follow it.

## 6. Scenes that tell an action

Some scenes tell a small story: the phone buzzes, she picks it up, the alarm stops. Here's how to build one.

1. **The clock:** a one-shot clock of a few seconds that starts when the scene appears.
2. **The beats:** each beat is a window, with `seg(t, a, b)` turning it into 0 to 1. Write them as data, for example `{ ring: [0, 900], reach: [900, 1500], stop: [1500, 1700] }`.
3. **Overlap:** the next beat starts a little before the last one ends.
4. **The end:** the scene holds on its final frame and only the idle loops keep running.
5. **A carousel of scenes:** the one leaving finishes its exit before the next one starts (or crossfades over it, never through an empty or dark frame). Only the scene on screen runs.

## 7. Motion in an interface

Illustrations live inside an interface, and the interface has its own rules. These follow Emil Kowalski's design-engineering rules and Benji Taylor's "Family values" (simplicity, fluidity, delight).

1. **Frequency decides how much.** The more often people see something, the less it should move:
   - Hundreds of times a day (shortcuts, typing, a list scroll): no animation
   - Tens of times a day (hovers, tab switches, toggles): a minimal, fast change
   - Now and then (sheets, toasts, a screen change): a standard transition
   - Rarely (onboarding, rewards, celebrations, empty states): full delight: characters, scenes, a story
2. **Every motion has a purpose.** Show where something came from and where it goes; show that a state changed; confirm a touch; explain how something works; or celebrate a rare moment.
3. **Continuity: fly, don't teleport.**
4. **Durations.** Press feedback: 100–160 ms; small popovers/tooltips: 125–200 ms; menus: 150–250 ms; sheets/modals: 200–500 ms. Keep interface moves under 300 ms when you can.
5. **Curves.** Entering/responding: strong ease-out (`cubic-bezier(0.23, 1, 0.32, 1)`). Moving on screen: strong ease-in-out (`cubic-bezier(0.77, 0, 0.175, 1)`). Constant motion: linear.
6. **Asymmetric timing.** Fast where the system answers, quicker exits than entrances, blink closes faster than it opens.
7. **Nothing appears from nothing.** Enter from scale 0.9–0.97 with opacity, never from scale 0.
8. **Press feedback.** Scale to ~0.97 on press and return.
9. **Interruptible.** Continue from current value toward the new target; never jump.
10. **Glitches cost trust.** Check at full resolution and full frame rate.

## 8. Performance and pitfalls

- **Clocks:** one clock per character, group or scene; everything else is a function of its time.
- **Pausing:** pause clocks off screen, when hidden, in the background and with reduced motion.
- **Many items** (particles, leaves, stars): draw them in one SVG or one `Canvas`, computing each from the same clock, never one animated view each.
- **Unique SVG ids:** clip paths are global to the screen.
- **Drawing traps that show up in motion:**
  - **A seam where two edges meet:** draw the shape as ONE outline instead of a cutout landing on an outline.
  - **Overlapping parts in one path:** fill each part on its own.
  - **A glasses ring around closed eyes:** clip the lid to a shape 2 units larger than the eye white.

## 9. Workflow

1. **Read** the project notes (`MOTION.md` and `CLAUDE.md`) and the header comments of the art file; decisions recorded there are law.
2. **List** what could live in the drawing: the main subject, its parts and pivots, repeated items, light, the background.
3. **Pick** ONE main action and two or three idle loops. Cut the rest.
4. **Split** the art into layers at their pivots, without changing how it looks at frame 0.
5. **Tune** by putting every number in a token object at the top of the file, so "slower", "smaller" or "less" is a one-line change.
6. **Check** frame 0 (reduced motion), the final frame of one-shots, and that every loop closes without a jump.
7. **Run** the project's type check, lint and tests.
8. **Hand off** in plain words: what moves, what was left still on purpose, and what hasn't been seen on a real device yet.
