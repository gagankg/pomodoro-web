# Pomodoro App — INIT.md

## Project Overview

A Pomodoro timer app built to feel like a physical instrument — not a productivity dashboard. The attached reference images show Teenage Engineering hardware (OP-1 field, OP-XY, K.O. II). Use them as the primary visual reference throughout. Every design decision should be answerable with: "does this look like it belongs on that hardware?"

The UI is a single fixed-width device rendered in the browser. It does not reflow, respond, or adapt. It sits centered on the page like an object on a desk.

---

## Non-Negotiable Constraints

- Device body: fixed `480px` wide. No responsive breakpoints. No fluid layout.
- On viewports narrower than 480px: show the device centered with horizontal scroll. Do not reflow or scale down.
- Do not use Tailwind for any visual property — color, shadow, gradient, border, radius. Tailwind handles spacing and flex layout only. All surface aesthetics live in `index.css` via CSS variables.
- No decorative UI chrome — no drop shadows as style, no card components, no modals. Depth comes only from physical surface simulation.
- One accent color: `#E8500A` (TE orange). Used only for the START button and active phase indicator. Nowhere else.

---

## Visual Design Language

### Reference

See attached images. The target aesthetic is the OP-1 field colorway: light aluminum body, dark LCD panel, muted button faces, orange accent. Use the K.O. II as reference for button density and label placement. Use the OP-XY for label typography style.

### Layout — Device Zones

The device is divided into five horizontal bands, top to bottom:

```
┌─────────────────────────────────────────────┐
│  HEADER BAR                                 │  ~40px  — product name, model no., dot grid
├─────────────────────────────────────────────┤
│                                             │
│  LCD DISPLAY PANEL                          │  ~180px — task input, timer, mode dots, queue
│                                             │
├─────────────────────────────────────────────┤
│  SOUND SELECTOR STRIP                       │  ~48px  — OFF / AMBIENT / LO-FI / NOISE / RAIN
├─────────────────────────────────────────────┤
│  CONTROLS ROW                               │  ~96px  — START, RESET, SKIP, steppers, knob, toggles
├─────────────────────────────────────────────┤
│  SESSION FOOTER                             │  ~32px  — 4 session dots (left), PC-25 (right)
└─────────────────────────────────────────────┘
```

Each zone is a flex row. No CSS grid. Explicit pixel gaps between elements.

Button labels (RESET, SKIP, FOCUS, BREAK, VOL, etc.) are silk-screened above their buttons — small uppercase `DM Mono`, 9px, `--text-label`, rendered as a separate `<span>` above each element.

### Header Bar — Dot-Matrix Grid

The top-right corner of the header carries a decorative dot-matrix grid — a signature TE detail visible on all three reference devices. Render it as a CSS `radial-gradient` repeat pattern, not an image or SVG.

```css
.dot-grid {
  width: 48px;
  height: 24px;
  background-image: radial-gradient(circle, #A8A49C 1px, transparent 1px);
  background-size: 6px 6px;
  opacity: 0.6;
}
```

- Fixed size: `48px × 24px`, top-right of header bar, vertically centered
- Dot color: `--border-inset` (`#A8A49C`) — same muted tone as physical edge details
- No interaction, no hover state — purely structural decoration
- Do not use SVG, canvas, or JS to generate this

### Task Queue Placement

Lives inside the LCD panel. Layout within the panel, top to bottom:

```
[ task name input — full width                         ]
[ track · task · intention                             ]  ← subtext, hidden when typing
[ ──────────────────────────────────────────────────── ]
[ 15:00               ● FOCUS        ● break           ]
[ queued tasks (scrollable, max 2 visible)             ]
[ #0                                                   ]  ← session index, bottom-right
```

Completed tasks: `opacity: 0.35`, `text-decoration: line-through`. LCD panel height is fixed — queue scrolls internally, never expands the panel.

### Controls Row — Element Order (left to right)

```
[ START ]  [ RESET ]  [ SKIP ]  ·  [ − FOCUS + ]  [ − BREAK + ]  [ VOL KNOB ]  [ NOTIF TOGGLE ]  [ SOUND PAUSE TOGGLE ]
```

- START: large, orange, leftmost
- RESET / SKIP: square hardware buttons
- Separator dot between skip and steppers (like TE hardware)
- Focus / Break steppers: dark button variant
- Volume knob: rightmost of the main cluster, sits between steppers and toggles
- Toggles: two small rocker switches, far right, stacked or side-by-side

### Color Palette

```css
--bg-body:        #D4D0C8;  /* warm aluminum device body */
--bg-display:     #141412;  /* dark LCD panel */
--bg-button:      #C2BEB6;  /* muted button face */
--bg-button-dark: #2A2A28;  /* dark button (steppers) */
--accent:         #E8500A;  /* TE orange — START + active indicator only */
--text-display:   #E8E4D8;  /* LCD text */
--text-label:     #7A7570;  /* silk-screen labels */
--text-dim:       #4A4845;  /* inactive labels */
--border-inset:   #A8A49C;  /* physical edge detail */
--lcd-green:      #4ADE80;  /* active phase dot */
--lcd-dim:        #3A3A38;  /* inactive phase dot */
--knob-body:      #3A3835;  /* dark knob cap */
--knob-marker:    #E8E4D8;  /* white position marker line on knob */
--toggle-on:      #4ADE80;  /* rocker switch ON state indicator */
--toggle-off:     #3A3A38;  /* rocker switch OFF state */
```

### Typography

- **Timer digits**: `Share Tech Mono` (Google Fonts)
- **All labels, inputs, UI text**: `DM Mono` (Google Fonts)
- **Label style**: uppercase, `letter-spacing: 0.15em`, 9px, `--text-label`
- **Task input**: `DM Mono`, lowercase placeholder, `--text-dim`
- **No other fonts**

### Surface CSS

Copy these exactly. Do not approximate with Tailwind.

**Device casing:**
```css
background: linear-gradient(160deg, #DEDAD2 0%, #C8C4BC 100%);
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.6),
  inset 0 -1px 0 rgba(0,0,0,0.15),
  0 4px 24px rgba(0,0,0,0.25),
  0 1px 4px rgba(0,0,0,0.2);
border-radius: 12px;
```

**LCD panel:**
```css
background: #141412;
box-shadow:
  inset 0 2px 8px rgba(0,0,0,0.8),
  inset 0 0 0 1px rgba(0,0,0,0.5);
border-radius: 4px;
```

**Hardware button (rest):**
```css
background: linear-gradient(180deg, #CECAC2 0%, #B8B4AC 100%);
box-shadow:
  0 2px 0 #8A8680,
  0 3px 4px rgba(0,0,0,0.3),
  inset 0 1px 0 rgba(255,255,255,0.5);
border-radius: 6px;
```

**Hardware button (pressed) — on `mousedown`, removed on `mouseup`:**
```css
box-shadow:
  0 0px 0 #8A8680,
  inset 0 2px 4px rgba(0,0,0,0.4);
transform: translateY(2px);
transition: none;
```

**START button (orange):**
```css
background: linear-gradient(180deg, #F06020 0%, #C84010 100%);
box-shadow:
  0 3px 0 #882808,
  0 4px 6px rgba(0,0,0,0.4),
  inset 0 1px 0 rgba(255,255,255,0.2);
```

**Sound selector — active:**
```css
background: #2A2A28;
color: #E8E4D8;
box-shadow: inset 0 1px 3px rgba(0,0,0,0.6);
```

**Sound selector — inactive:**
```css
background: transparent;
color: var(--text-dim);
```

**Volume knob:**
```css
/* Knob body — round, dark, raised */
width: 40px;
height: 40px;
border-radius: 50%;
background: radial-gradient(circle at 35% 35%, #5A5550, #2A2520);
box-shadow:
  0 3px 0 #1A1510,
  0 4px 8px rgba(0,0,0,0.5),
  inset 0 1px 0 rgba(255,255,255,0.1);

/* Position marker — thin white line, rotates with value */
/* Rendered as a pseudo-element or inner div, rotated via JS/CSS transform */
/* Range: -135deg (min) to +135deg (max), centered at 0deg = 50% volume */
```

**Rocker toggle switch (outer housing):**
```css
width: 28px;
height: 16px;
border-radius: 3px;
background: #1A1A18;
box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);
```

**Rocker toggle switch (rocker paddle):**
```css
/* Two halves — top half and bottom half, or left/right depending on orientation */
/* Active half: raised, lighter; inactive half: recessed, darker */
width: 12px;
height: 14px;
border-radius: 2px;
/* ON side */
background: linear-gradient(180deg, #4ADE80 0%, #22C55E 100%);
box-shadow: 0 1px 0 #15803D, inset 0 1px 0 rgba(255,255,255,0.2);
/* OFF side */
background: #3A3835;
box-shadow: inset 0 1px 2px rgba(0,0,0,0.6);
```

### Motion Rules

- **All button presses**: `translateY(2px)` + shadow collapse on `mousedown`. `transition: none`. Instant.
- **Timer digits**: no animation. Instant flip.
- **Phase transition**: LCD panel opacity flicker — `1 → 0.6 → 1` over `200ms`. Nothing else animates.
- **Sound selector**: instant highlight shift.
- **Volume knob rotation**: CSS `transform: rotate(Ndeg)` updated directly on `mousemove` during drag. No transition — follows cursor exactly.
- **Rocker toggle**: immediate visual state swap on click. No slide animation.
- **No other animations.**

---

## Volume Knob — Functional Spec

The volume knob controls the gain for all app-generated audio: ambient sound and UI sound feedback.

- Rendered as a round dark knob with a white position marker line
- Interaction: click and drag up/down (or circular drag) to rotate; scroll wheel also works
- Rotation range: −135° (min/mute) to +135° (max), 0° = 50% volume
- Maps rotation to `gainNode.gain.value` via Web Audio API (0.0 to 1.0, logarithmic curve)
- Knob position persisted in `localStorage` as `pomo_volume` (0.0–1.0)
- Label: `VOL` silk-screened above

Implementation:
```js
// Drag delta → rotation
const MIN_ANGLE = -135;
const MAX_ANGLE = 135;
// On mousemove during drag: deltaY maps to angle change
// angle = clamp(prevAngle - deltaY * sensitivity, MIN_ANGLE, MAX_ANGLE)
// volume = (angle - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE)  → 0.0 to 1.0
// Apply log curve: gainNode.gain.value = Math.pow(volume, 2)
```

---

## Mechanical Toggle Switches

Two rocker switches in the controls row, right side, each with a silk-screened label above.

### Toggle 1 — NOTIF
- Controls: browser notifications on/off
- ON: notifications enabled; OFF: silent
- Default: OFF (permission not requested until first switch to ON)
- State persisted: `pomo_notif_enabled` (boolean)

### Toggle 2 — SND PAUSE
- Controls: whether ambient sound pauses during break phase
- ON: sound pauses on break; OFF: sound continues through break
- Default: ON
- State persisted: `pomo_sound_pause` (boolean)

Both toggles use the rocker switch CSS defined above. Label sits above the switch housing in `DM Mono` uppercase 9px.

---

## Sound Feedback System

All UI sounds generated via Web Audio API — no audio files. All tones routed through the master gain node controlled by the volume knob.

### Sonic Character — TE Reference

Teenage Engineering devices do not use musical chimes or soft UI tones. Their feedback is:
- **Dry and immediate** — no reverb, no sustain, no warmth
- **Lo-fi digital** — square and sawtooth waves dominate; sine only for specific alert tones
- **Short and percussive** — most sounds are under 40ms; the key is the attack, not the tail
- **Slightly harsh** — think PO-series beeps, not macOS notification tones
- **Pitch-varied by function** — different interaction classes use clearly distinct registers, not subtle variations

Every sound should feel like it comes from a small speaker inside a plastic enclosure. Not a studio monitor.

### Sound Events

| Event | Character | Waveform | Freq | Duration | Decay |
|---|---|---|---|---|---|
| Button press (START/RESET/SKIP) | Hard click — mechanical key bottom-out | Square | 180 Hz | 20ms | 15ms, abrupt |
| Stepper +/− | Dry blip, pitch up for +, down for − | Square | 1200 Hz / 900 Hz | 25ms | 20ms, abrupt |
| Sound mode select | Short digital tick — PO-style | Square | 1400 Hz | 15ms | 10ms, instant |
| Knob turn (per detent) | Faint ratchet tick | Square | 2000 Hz | 10ms | 8ms, instant, gain 0.08 |
| Rocker toggle ON | Two-layer click: high snap + low thud | Square 2200 Hz + Square 160 Hz | 18ms each | Simultaneous, abrupt |
| Rocker toggle OFF | Reverse: low thud + high snap | Square 160 Hz + Square 2200 Hz | 18ms each | Simultaneous, abrupt |
| START (begin session) | Rising two-tone blip — OP-1 boot feel | Sawtooth 440 Hz → 880 Hz | 60ms each | 40ms each, fast |
| PAUSE | Single flat blip — muted, lower register | Square | 330 Hz | 40ms | 30ms |
| Phase transition (focus→break) | Descending two-tone — work done signal | Sawtooth 660 Hz → 440 Hz | 80ms each | 60ms each |
| Phase transition (break→focus) | Ascending two-tone — attention signal | Sawtooth 440 Hz → 660 Hz | 80ms each | 60ms each |
| Session complete (4 sessions) | Three-step blip sequence — PO alarm style | Square 880→1100→1400 Hz | 50ms each | 35ms each, staggered 60ms apart |
| Long break triggered | Slower three-step descent | Square 660→440→330 Hz | 70ms each | 50ms each, staggered 80ms apart |
| RESET | Flat single blip — neutral, no pitch character | Square | 220 Hz | 30ms | 20ms |
| SKIP | Short rising blip | Square | 550 Hz → 770 Hz | 25ms each | 15ms each |
| Task added | Soft double-tick | Square | 1000 Hz + 1200 Hz | 15ms each, 30ms apart | Instant |
| Invalid input | Low buzz — error feel | Sawtooth | 100 Hz | 80ms | 60ms, slow decay |

### Key Principle: Layering for Hardware Feel

TE buttons feel physical because their sounds have two layers — a high transient (the click of the key mechanism) and a low body (the resonance of the enclosure). Replicate this on important buttons:

```js
function playLayeredClick(highFreq, lowFreq, duration) {
  playTone(highFreq, duration, 'square', 0.01); // mechanism click
  playTone(lowFreq, duration, 'square', 0.02);  // body resonance
}
// Use for: START, RESET, SKIP, rocker toggles
```

### Implementation

```js
// useSound.js
let ctx = null;
let masterGain = null;

function initAudio() {
  if (ctx) return;
  ctx = new AudioContext();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.5; // default; overridden by volume knob
  masterGain.connect(ctx.destination);
}

function playTone(frequency, durationMs, type = 'square', decayMs = 20, gainLevel = 0.3) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decayMs / 1000);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + durationMs / 1000);
}

function playSequence(tones) {
  // tones: [{ freq, duration, type, decay, delay }]
  tones.forEach(({ freq, duration, type, decay, delay = 0 }) => {
    setTimeout(() => playTone(freq, duration, type, decay), delay);
  });
}
```

- `initAudio()` called once on first user interaction — never on mount (browser autoplay policy)
- `masterGain.gain.value` updated directly by volume knob drag
- Sound feedback fires on every interaction regardless of ambient sound mode
- Knob at minimum mutes all audio — ambient and feedback both
- All sounds intentionally dry — do not add reverb, delay, or any effects chain

---

## Accessibility

Minimum viable — hardware aesthetic must not come at the cost of basic usability.

### Required ARIA

| Element | Attribute | Value |
|---|---|---|
| START button | `aria-label` | `"Start focus session"` / `"Pause"` / `"Resume"` — reflects current state |
| RESET button | `aria-label` | `"Reset timer"` |
| SKIP button | `aria-label` | `"Skip to next phase"` |
| NOTIF toggle | `role="switch"`, `aria-checked` | `"true"` / `"false"` |
| SND PAUSE toggle | `role="switch"`, `aria-checked` | `"true"` / `"false"` |
| Sound selector buttons | `aria-pressed` | `"true"` on active mode |
| Volume knob | `role="slider"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label="Volume"` | |
| Timer display | `aria-live="polite"`, `aria-label` | Updated on phase change only, not every second |
| Focus duration input | `aria-label` | `"Focus duration in minutes"` |
| Break duration input | `aria-label` | `"Break duration in minutes"` |

### Focus Rings

All interactive elements must have a visible focus ring. Hardware aesthetic uses a thin inset ring — do not remove outlines entirely:

```css
:focus-visible {
  outline: 2px solid #E8500A;
  outline-offset: 2px;
}
```

Use `outline`, not `box-shadow`, so it stacks correctly on top of existing button shadows.

### Focus Order

Tab order must follow the visual left-to-right, top-to-bottom layout: task input → START → RESET → SKIP → focus stepper − → focus stepper input → focus stepper + → break stepper − → break stepper input → break stepper + → volume knob → NOTIF toggle → SND PAUSE toggle → sound selector tabs.

- **Framework**: React (Vite)
- **Styling**: Tailwind for flex layout and spacing only. `index.css` for all visual surface properties.
- **Fonts**: `Share Tech Mono`, `DM Mono` via Google Fonts — loaded in `index.html`
- **State**: `useReducer` for timer FSM; `useState` for UI; `useEffect` for tick
- **Audio**: Web Audio API for UI sound feedback + gain control; `<audio>` tags for ambient loops
- **Notifications**: Browser Notification API
- **Persistence**: `localStorage`

---

## Architecture Notes

- Timer FSM: `idle | running | paused | break | complete`
- Use `Date.now()` delta per tick — not `setInterval` alone — to prevent drift
- Single shared `AudioContext` and `masterGain` — created on first interaction, never recreated
- `localStorage` read on mount; write on every relevant state change
- Sound files: lazy-loaded, do not block render
- Flat component tree — no prop drilling beyond one level

---

## Features

### Core Timer

- Countdown in MM:SS, `Share Tech Mono`, inside LCD panel
- Default: 15 min focus / 5 min break
- Active phase: `● FOCUS` (green dot) or `● BREAK` (dim dot)
- Persists across tab visibility changes via `visibilitychange` event

### Controls

- **START / PAUSE** — large orange button, leftmost; `Space` key
- **RESET** — square button; `↺`; `R` key
- **SKIP** — square button; `⏭`; `S` key
- **Focus stepper** — `−` / `+` dark buttons, numeric readout between; click to type
- **Break stepper** — same
- **Volume knob** — drag to rotate; controls master gain; see knob spec above
- **NOTIF toggle** — rocker switch; notifications on/off
- **SND PAUSE toggle** — rocker switch; ambient pauses on break on/off
- Duration input: integers 1–120; reverts on invalid
- Duration changes mid-session apply to next session

### Task Input

- Inside LCD panel, top section
- Placeholder: `what are you working on?` (`DM Mono`, dim)
- Subtext: `track · task · intention` — hidden once typing begins
- Skippable
- Optional note: `+` button at input row edge; expands second line inside panel
- Active task visible in panel during session
- **Task name: max 40 characters.** `maxLength={40}` on the input. No overflow — characters simply stop being accepted. No error state needed.
- **Note field: max 80 characters.**
- Long task names truncate with `text-overflow: ellipsis` in the display view (outside of edit mode)
- Task queue: multiple tasks, advances on complete or skip
- Completed tasks: `opacity: 0.35`, strikethrough; scrollable inside fixed panel

### Session Tracking

- 4 dot indicators in footer
- Session index in LCD panel bottom-right
- Long break after 4 sessions: 3× break duration (not separately configurable)
- Resets on page reload

### Ambient Sound

- Modes: `OFF` | `AMBIENT` | `LO-FI` | `NOISE` | `RAIN`
- Hardware selector strip
- Plays during focus; SND PAUSE toggle controls break behavior
- Volume controlled by knob

**Audio sources — generated via Web Audio API, no external files required:**

All ambient modes are synthesized. Do not reference external URLs or audio files.

| Mode | Generation method |
|---|---|
| `AMBIENT` | Filtered pink noise — `AudioBufferSourceNode` with white noise buffer + `BiquadFilterNode` (lowpass, freq 800Hz, Q 0.5) |
| `LO-FI` | Brown noise — same as ambient but lowpass at 400Hz + subtle bitcrusher effect (reduce sample resolution via `ScriptProcessorNode`) |
| `NOISE` | Flat white noise — `AudioBufferSourceNode` with unfiltered white noise buffer |
| `RAIN` | White noise + bandpass filter (800–2000Hz) + low-frequency amplitude modulation (0.5–2Hz LFO on gain) to simulate rain variation |

White noise buffer generation (run once on `initAudio`, reuse buffer):
```js
function createNoiseBuffer(ctx) {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds, looped
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}
```

All ambient nodes connect through `masterGain`. Switching modes: stop current source node, create and start new one — no crossfade.

### Notifications

- Controlled by NOTIF toggle
- Permission requested on first toggle to ON
- Audio chime on phase switch (see sound feedback table)

### Keyboard Shortcuts

| Key             | Action                                      |
|-----------------|---------------------------------------------|
| `Space`         | Start / Pause                               |
| `R`             | Reset                                       |
| `S`             | Skip phase                                  |
| `↑` / `↓`       | Volume up / down (5% increments); only when task input is not focused |

### Tab Visibility Behavior

When the browser tab loses focus (`visibilitychange` → hidden):
- Timer **continues running** — do not pause automatically
- Audio pauses (ambient + feedback silenced while hidden)
- On tab return (`visibilitychange` → visible): recalculate `remaining` using `Date.now()` delta from when the tab was hidden; resume audio if it was playing
- If the timer completed while the tab was hidden: fire the phase transition sound and browser notification immediately on return; advance to the next phase in `idle` state (user must press START)

### Persistence (localStorage)

| Key                   | Value           |
|-----------------------|-----------------|
| `pomo_focus_duration` | number (min)    |
| `pomo_break_duration` | number (min)    |
| `pomo_sound_mode`     | string          |
| `pomo_active_task`    | string          |
| `pomo_task_queue`     | JSON array      |
| `pomo_volume`         | number (0–1)    |
| `pomo_notif_enabled`  | boolean         |
| `pomo_sound_pause`    | boolean         |
| `pomo_timer_snapshot` | JSON: `{ phase, remaining, mode, timestamp }` — written every 5s while running |

**Tab close and reopen behavior:**
On every write to `pomo_timer_snapshot`, include `timestamp: Date.now()`. On mount, read the snapshot. If `mode` was `running` or `paused`:
- Calculate elapsed: `Date.now() - snapshot.timestamp`
- If elapsed < remaining: restore timer to `remaining - elapsed`, phase preserved, mode set to `paused` (user must press START to resume)
- If elapsed >= remaining: discard snapshot, initialize to `idle` with next phase ready
- Display a one-line notice inside the LCD panel on restore: `RESUMED FROM LAST SESSION` — dismiss on first keypress or START

---

## File Structure

```
/src
  /components
    Device.jsx         # Outer casing + five zone layout
    Display.jsx        # LCD panel — task, timer, mode dots, queue, session index
    Controls.jsx       # START / RESET / SKIP / steppers / knob / toggles
    VolumeKnob.jsx     # Drag-to-rotate knob + gain control
    RockerToggle.jsx   # Reusable rocker switch component
    SoundSelector.jsx  # Horizontal mode strip
    SessionDots.jsx    # 4-dot footer
  /hooks
    useTimer.js        # FSM + Date.now() tick
    useSound.js        # AudioContext + masterGain + playTone + ambient
    useNotifications.js
    useLocalStorage.js
  /utils
    time.js            # formatMMSS(), clampDuration()
    knob.js            # angleToDeg(), angleToVolume(), logCurve()
  /assets
    /sounds            # Loopable ambient .mp3 files
  App.jsx
  main.jsx
  index.css
```

---

## State Shape

```js
// Timer (useReducer)
{
  mode: 'idle' | 'running' | 'paused' | 'break' | 'complete',
  phase: 'focus' | 'break',
  remaining: number,
  focusDuration: number,
  breakDuration: number,
  sessionIndex: number,
  totalSessions: number,
}

// Tasks
{
  active: { id, name, note } | null,
  queue: [{ id, name, note, status: 'pending' | 'active' | 'done' }],
}

// Settings (from localStorage, managed in App.jsx)
{
  volume: number,          // 0.0–1.0
  soundMode: string,
  notifEnabled: boolean,
  soundPauseOnBreak: boolean,
  focusDuration: number,
  breakDuration: number,
}
```

---

## Behavior Rules

- Timer does not auto-start on phase transition — user must press START
- Skip during active focus does not count as completed session
- Duration changes mid-session apply to next session only
- Sound feedback fires on every interaction regardless of ambient mode
- Knob at minimum = full mute (ambient + feedback)
- Volume knob position persisted; restored on reload
- Device is 480px fixed — horizontal scroll on narrow viewports, no reflow
- Tab hidden: timer keeps running, audio pauses, recalculates on return
- Tab closed and reopened: restore from `pomo_timer_snapshot` if < remaining time has elapsed; otherwise idle
- Task name capped at 40 chars; note capped at 80; truncated with ellipsis in display view
- `↑` / `↓` keys adjust volume 5% per press when task input is not focused

---

## Out of Scope (v1)

- Analytics, history, heatmaps
- User accounts or sync
- Drag-to-reorder task queue
- Mobile gestures
- Theme switching
- Additional toggle functions beyond NOTIF and SND PAUSE
