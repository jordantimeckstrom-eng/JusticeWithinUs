# React Native Widgets Exploration (April 2026)

This repository currently does not contain a React Native or Capacitor mobile project structure (no `ios/`, `android/`, `src/`, or `package.json` files in the tracked tree).

To make progress on the requested “Explore React Native widgets” seam, this document captures a practical implementation blueprint you can apply once the mobile workspace is present.

## Current-state assessment

- React Native does **not** provide first-party home screen widgets.
- Widgets are native platform features:
  - iOS: WidgetKit + SwiftUI.
  - Android: AppWidgetProvider + RemoteViews (or Glance where suitable).
- Your shared app state must be written into native-readable storage:
  - iOS: App Group `UserDefaults`.
  - Android: `SharedPreferences`.

## Recommended path for your current stack

Because your product direction references a Capacitor-hosted React app, the lowest-risk path is:

1. Keep current web/react logic for the 7-Day Ritual Mirror.
2. Add native widget targets/extensions.
3. Push condensed Mirror state into shared storage whenever state changes.
4. Open Mirror tab/deep link from widget tap.

## Data contract (shared state)

Use one canonical payload across both platforms:

```json
{
  "alignment": 6,
  "thread": 420,
  "baseName": "jordaneckstrom.base.eth",
  "treasury": 12.5,
  "initiationStep": "Day 4 · Voice"
}
```

Keys should stay stable and versioned (`mirror.v1.*`) to avoid widget/app drift.

## iOS implementation blueprint

### 1) Shared storage write (app side)

- Configure App Group entitlement for app and widget extension.
- Write app state to `UserDefaults(suiteName: "group.com.jordaneckstrom.juscr.mirror")`.
- Trigger timeline refresh after writes.

### 2) Widget provider read (widget side)

- In `TimelineProvider`, read the same keys from App Group defaults.
- Provide placeholders/snapshots for empty state.
- Refresh every 15–30 minutes, plus explicit reload on app writes.

### 3) Tap behavior

- Use `widgetURL(URL(string: "juscr://mirror"))` to deep-link directly into Mirror tab.

## Android implementation blueprint

### 1) Shared storage write (app side)

- Write mirror keys into `SharedPreferences("TempleSharedPrefs", MODE_PRIVATE)`.
- Broadcast widget update intent (or call `AppWidgetManager`) after write.

### 2) App widget render

- In `TempleMirrorWidget : AppWidgetProvider`, read prefs and bind values in `RemoteViews`.
- Support small + medium sizes with glanceable priority fields:
  - Alignment (x/7)
  - Thread balance
  - Base name
  - Treasury flow

### 3) Tap behavior

- Attach `PendingIntent` to open `MainActivity` with deep-link extras (`mirror`).

## React/TypeScript integration point

Wherever your ritual state updates (e.g., reducer, Zustand store, or `useEffect`), mirror minimal state to native storage.

Pseudo-flow:

1. App state changes.
2. Build compact payload.
3. Persist to shared storage.
4. Request widget refresh.

This keeps the widget fast and avoids recomputing heavy logic inside native extensions.

## Security + integrity guardrails

- Only display sensitive values when `baseName` verification flag is true.
- Avoid storing private keys or raw auth tokens in widget-readable storage.
- Include a `lastUpdated` timestamp so stale widget state is obvious.

## Migration note (full React Native later)

If you migrate from Capacitor to full RN later:

- iOS widget code remains native (WidgetKit).
- Android widget code remains native (AppWidget/Glance).
- Only the JS bridge layer changes.

That means investing in native widget targets now is not throwaway work.

## Definition of done for this seam

- [ ] Home screen widget installs on iOS + Android.
- [ ] Widget reflects current alignment/thread/baseName/treasury/initiation step.
- [ ] Tap opens Mirror tab directly.
- [ ] Widget hides full details when base-name verification is missing.
- [ ] Updates occur on state changes + scheduled refresh.
