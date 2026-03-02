# One-Sided Realm Mapper (Mirror-Hypothesis)

## Purpose
Create a personal, **one-sided** realm mapper for imagination scaffolding and weekly orientation.

- No static historical storage.
- GPS + Sun/Moon position accurate for present and near-future planning windows.
- Two-part cadence:
  - **Day 1:** Analytical review (reflection + pattern detection).
  - **Days 2–8:** Future setup (intentional environment design and pacing).

---

## Design Principles
1. **Human-controlled, advisory-only:** The system suggests; the user decides.
2. **Ephemeral memory by default:** Keep only session state in RAM unless explicitly exported.
3. **Body-first pacing:** Broken-back day mode reduces cognitive and physical load.
4. **Mirror-hypothesis framing:** Treat outputs as "paired reflections" (observation vs setup), not objective destiny.
5. **Low-friction interaction:** 3–5 minute check-ins; minimal typing; visual cues.

---

## Functional Scope

### Inputs
- Current GPS (lat/lon, optional altitude).
- Device date/time + timezone.
- Optional subjective markers (pain level, energy, focus, mood).
- Optional tags for environmental context (light, noise, posture, hydration).

### Computed Signals
- Solar position (azimuth/elevation) for now + selected future windows.
- Lunar position (azimuth/elevation), illumination, moon phase.
- Anchor moments:
  - sunrise, solar noon, sunset
  - moonrise, moon transit, moonset (where available)

### Outputs
- **Weekly Observation Dashboard** with two panes:
  - **Pane A (Day 1): Analytical Review**
  - **Pane B (Days 2–8): Future Setup Grid**
- Session-only personalized prompts (“imagination scaffolding cards”).
- Body-safe scheduling suggestions based on chosen intensity.

---

## No Static Data Storage Mode

### Policy
- Keep all computed values in memory only.
- Purge state on session close / idle timeout.
- Optional manual export creates a local file only when user explicitly clicks **Export Snapshot**.

### Implementation Pattern
- In-memory store (e.g., Zustand/Redux store without persistence plugins).
- `sessionStorage` disabled for core personal signals.
- `localStorage` used only for non-personal UI preferences (theme, font size) if desired.
- Telemetry off by default.

---

## Weekly Dashboard Structure

## Day 1: Analytical Review (10–20 minutes)
Sections:
1. **Sky Context Summary**
   - Last 7-day sun/moon arcs (computed on demand, not stored).
2. **Pattern Reflection**
   - Prompts:
     - “What was over-forced?”
     - “What worked with less strain?”
     - “Where did spine discomfort flare?”
3. **Load Audit**
   - Green/Yellow/Red intensity zones.
4. **Mirror Statement**
   - “Observed wheel” vs “Desired wheel” short text.

## Days 2–8: Future Setup (3–7 minutes/day)
Daily cards:
1. **Celestial Timing Card**
   - Best low-strain windows based on sun elevation and selected preference.
2. **Environment Setup Card**
   - Light position, seating orientation, movement reminder.
3. **Focused Action Card**
   - 1 core task + 1 supportive task + 1 recovery task.
4. **Stop Rule Card**
   - Clear cutoff condition before flare escalation.

---

## Broken Back Day Protocol (Body-Safe Mode)
> Non-medical wellness workflow; not a substitute for professional care.

### Trigger
Activate when pain/spasm/fatigue exceeds user threshold.

### Protocol
1. **Reduce intensity to minimum viable output** (single priority only).
2. **Switch to 20/8 cadence** (20 min gentle focus, 8 min decompression).
3. **Use posture rotation prompts** every cycle.
4. **Require stop-check** after 2 cycles.
5. **Auto-downgrade dashboard** to essentials:
   - one task,
   - one breath/mobility reminder,
   - one time anchor (sun/moon checkpoint).

### Anti-Flare Rules
- No stacked deadlines in body-safe mode.
- No “catch-up sprint” after flare.
- Replace force language with adaptation language.

---

## Sun/Moon GPS Accuracy Notes
For practical accuracy, use a proven astronomy library:
- JS options: `astronomy-engine`, `suncalc`, `luxon` (time handling).
- Inputs: lat/lon/timezone + UTC timestamp.
- Recompute every 1–5 minutes for live position indicators.

Suggested formulas/services:
- Solar azimuth/elevation from observer location and Julian date.
- Lunar azimuth/elevation with parallax correction.
- Sunrise/sunset and moonrise/moonset via event solving for local horizon crossing.

---

## Dashboard Wireframe (Text)

- Header: location • local time • current moon phase
- Left Column (Review/Setup)
  - Reflection prompts
  - Load zone selector
  - Mirror statement
- Right Column (Sky + Plan)
  - Sun/Moon compass dial
  - Today’s low-strain windows
  - 3-card action stack (core/support/recovery)
- Footer
  - Broken Back Day toggle
  - Stop rule status
  - Export Snapshot (manual)

---

## Suggested Build Sequence
1. Build read-only sky computation module.
2. Build in-memory state and weekly dashboard skeleton.
3. Add Day 1 reflection flow.
4. Add Days 2–8 setup cards.
5. Add Broken Back Day protocol toggle + rules.
6. Validate timezone/GPS edge cases.
7. Optional: add manual export/import for user-owned snapshots.

---

## Minimal Acceptance Criteria
- App works with only current GPS + time.
- Sun/moon positions update without page reload.
- No personal entries persist after session end.
- Weekly mode cleanly separates Review day and Setup days.
- Broken Back Day mode reduces workload and enforces stop rules.
