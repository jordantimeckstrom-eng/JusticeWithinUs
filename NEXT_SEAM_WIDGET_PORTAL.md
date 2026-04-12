# Next Seam: Sovereign Widget Portal (Execution Blueprint)

This blueprint turns the fused Temple experience into an implementation-ready delivery path for iOS + Android + React/Capacitor.

## 1) Core principle

Make the widget a **fast command surface**, while all privileged actions (mint, treasury transfer, initiation state mutation) execute in-app after secure validation.

## 2) Architecture slices

### A. Shared state contract (single schema)
Use one typed payload for both widget platforms.

```ts
export type TempleWidgetState = {
  alignment: number;        // 0..7
  threadBalance: number;    // PT
  treasuryBalance: number;  // SOL or display token
  initiationStep: number;   // 1..7
  baseName: string;         // jordaneckstrom.base.eth
  updatedAt: string;        // ISO date
};
```

Store this in Capacitor `Preferences` and mirror to native shared stores:
- iOS App Group `UserDefaults`
- Android `SharedPreferences`

### B. Widget command protocol
Use deep links as commands (not direct chain writes inside widget code):
- `juscr://mirror?commit=true`
- `juscr://mirror`
- `juscr://dao-core`

On app open, route and execute command through a single command handler that:
1. verifies wallet/session
2. validates anti-replay nonce
3. performs ritual transaction pipeline
4. emits success/failure event back to state

### C. Realtime stream (SignalR)
Subscribe once in app runtime and project incoming deltas into the shared widget state:
- alignment changes
- thread balance deltas
- treasury flow updates
- initiation step progression

Widget refresh cadence:
- iOS timeline reload after state write (`WidgetCenter.shared.reloadAllTimelines()`)
- Android `AppWidgetManager` update broadcast

## 3) Security hardening for one-tap commit

1. **Intent signing**: include nonce in deep link command context.
2. **In-app verification only**: never mint/fund directly in extension/provider code.
3. **Idempotency key**: `commit:{date}:{wallet}` to prevent duplicate daily commits.
4. **Rate limit**: reject repeated commit command attempts within a short window.

## 4) Delivery milestones

### Milestone 1 — State + Deep Link foundation
- Normalize state schema in React.
- Add a central `handleWidgetCommand(url)` function.
- Write widget state on every relevant data change.

### Milestone 2 — iOS interactive widget
- Add `CommitAlignmentIntent` button.
- Wire app group reads.
- Trigger app deep link and timeline refresh.

### Milestone 3 — Android interactive widget
- Add commit `PendingIntent` and route extras.
- Read/write shared prefs contract.
- Broadcast updates on state change.

### Milestone 4 — SignalR + observability
- Push realtime updates into widget state.
- Add command outcome telemetry (`commit_started`, `commit_succeeded`, `commit_failed`).

## 5) Definition of done

- Widget displays alignment/thread/treasury/step/base name from live shared state.
- Widget commit button opens app and executes one ritual commit path.
- Duplicate commit attempts are idempotently rejected.
- Deep links route reliably to Mirror and DAO Core tabs.
- Realtime updates are visible on widget within one refresh cycle.

## 6) Ignite-next recommendation

Next seam to ignite: **Ritual Trust Layer** — add signed command receipts + on-chain transaction journal so every widget-triggered action produces a verifiable, replay-safe audit trail bound to `jordaneckstrom.base.eth`.
