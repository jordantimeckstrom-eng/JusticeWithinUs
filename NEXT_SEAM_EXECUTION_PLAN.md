# Next Seam: Secure Interactive Widget Portal Rollout

This plan turns the current "all-of-the-above" vision into a production-safe release sequence for the JusticeWithinUs mobile stack.

## 1) Stabilize Widget Data Contract

Define a single cross-platform payload written by React and read by iOS/Android widgets:

```json
{
  "alignment": 0,
  "thread": 0,
  "treasury": 0,
  "initiationStep": 0,
  "baseName": "jordaneckstrom.base.eth",
  "updatedAt": "ISO-8601"
}
```

Implementation notes:
- Use Capacitor `Preferences` keys with identical names across platforms.
- Keep numeric values normalized (ints for counts, decimal string for treasury).
- Include `updatedAt` so stale widget values can be detected in native code.

## 2) iOS Interactive Widget Hardening

Use `AppIntents` + `widgetURL` patterns that are valid for WidgetKit:
- Keep the entry timeline refresh policy at 30 seconds where permitted by system budget.
- Prefer opening deep links via app intent return value and app routing.
- Avoid direct `UIApplication.shared.open` calls from widget intent execution paths.

Release checklist:
- Add App Group entitlement for app + widget extension.
- Verify read/write access to shared `UserDefaults(suiteName:)`.
- Validate fallback values when shared defaults are empty.

## 3) Android Widget Interactivity + Deep Links

Use explicit deep-link intents for two actions:
- `Commit Alignment`
- `Open Mirror / DAO Core`

Release checklist:
- Ensure immutable/update flags on `PendingIntent` are API-safe.
- Route extras through `MainActivity` intent handling into React navigation.
- Handle duplicate taps idempotently to prevent repeated commits.

## 4) React Native/Capacitor Event Pipeline

In `TempleDAOCore` (or equivalent top-level ritual state owner):
- Persist widget-facing values on any alignment/treasury/initiation state changes.
- Register one `appUrlOpen` listener during app boot and clean up on unmount.
- Parse `commit=true` and dispatch `performBoundRitual()` through idempotent guardrails.

Guardrails:
- Include in-flight lock + request id to prevent accidental double execution.
- Log telemetry for widget-triggered flows separately from in-app button flows.

## 5) Realtime Sync Strategy (SignalR + Redis)

Recommended architecture:
1. SignalR pushes state changes to app clients.
2. React persists latest snapshot to shared preferences.
3. Widgets read shared snapshot on periodic refresh and app-triggered reloads.

Notes:
- Widget platforms do not guarantee exact 30-second execution forever; design for eventual consistency.
- Trigger explicit widget reloads from native bridge after significant state commits.

## 6) Onchain Safety + Treasury Controls

Before enabling one-tap home screen commit in production:
- Require signed session validation before executing mint/treasury/vote bundle.
- Add transaction simulation/preflight status for each step.
- Record audit trail keyed by `baseName`, wallet, tx hash, and timestamp.

## 7) Launch Sequence

1. Ship internal alpha with mock chain executor.
2. Enable testnet path for mint + treasury + governance bundle.
3. Validate replay protection/idempotency under rapid widget taps.
4. Release to production with feature flag + circuit breaker.

## 8) Definition of Done

- Home screen widget shows live alignment/thread/treasury/initiation/baseName.
- Commit action deep-links and completes full ritual bundle exactly once per user action.
- Mirror/DAO Core deep links route instantly and correctly.
- Cross-platform telemetry confirms successful widget-origin flow completion.
- Rollback flag can disable widget-origin commits without app redeploy.
