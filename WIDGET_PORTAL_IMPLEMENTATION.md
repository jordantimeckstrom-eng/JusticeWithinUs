# Widget Portal Implementation (Capacitor + iOS WidgetKit + Android App Widget)

This runbook wires a home-screen widget to your existing Capacitor app so users can:

- glance alignment/thread/treasury data from the home screen,
- tap the widget,
- deep-link directly into the `mirror` or `dao-core` tab.

---

## 1) Shared deep-link contract

Use the same scheme on both platforms:

- `juscr://mirror`
- `juscr://dao-core`

Capacitor app side (`src/App.tsx`):

```tsx
import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

export function useWidgetDeepLink(setTab: (tab: 'mirror' | 'dao-core') => void) {
  useEffect(() => {
    const sub = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      if (url.includes('juscr://mirror')) setTab('mirror');
      if (url.includes('juscr://dao-core')) setTab('dao-core');
    });

    return () => {
      sub.then((s) => s.remove());
    };
  }, [setTab]);
}
```

---

## 2) Shared widget data keys

Use the same logical keys on iOS (App Group defaults) and Android (`SharedPreferences`):

- `alignment` (0..7)
- `thread_balance` (integer PT)
- `treasury_balance` (string, formatted)
- `initiation_step` (string)
- `base_name` (string, default `jordaneckstrom.base.eth`)

From React, update these keys whenever Mirror/DAO data changes.

---

## 3) iOS implementation (WidgetKit)

### A. Create widget target

1. `npx cap sync ios`
2. `npx cap open ios`
3. In Xcode: **File → New Target → Widget Extension**
4. Name it `TempleMirrorWidget`
5. Add App Group capability to **both** app + widget:
   - `group.com.jordaneckstrom.juscr.mirror`

### B. Widget timeline/provider

In `TempleMirrorWidget.swift`, read values from App Group:

```swift
import WidgetKit
import SwiftUI

struct Entry: TimelineEntry {
    let date: Date
    let alignment: Int
    let thread: Int
    let treasury: String
    let step: String
    let baseName: String
}

struct Provider: TimelineProvider {
    private let group = UserDefaults(suiteName: "group.com.jordaneckstrom.juscr.mirror")

    func placeholder(in context: Context) -> Entry {
        Entry(date: Date(), alignment: 5, thread: 420, treasury: "$0", step: "I", baseName: "jordaneckstrom.base.eth")
    }

    func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
        completion(readEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        let entry = readEntry()
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date().addingTimeInterval(900)
        completion(Timeline(entries: [entry], policy: .after(next)))
    }

    private func readEntry() -> Entry {
        Entry(
            date: Date(),
            alignment: group?.integer(forKey: "alignment") ?? 0,
            thread: group?.integer(forKey: "thread_balance") ?? 0,
            treasury: group?.string(forKey: "treasury_balance") ?? "$0",
            step: group?.string(forKey: "initiation_step") ?? "-",
            baseName: group?.string(forKey: "base_name") ?? "jordaneckstrom.base.eth"
        )
    }
}
```

Attach deep-link tap from widget view:

```swift
struct TempleMirrorWidgetEntryView: View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("7-DAY MIRROR").font(.caption2)
            Text("ALIGNMENT \(entry.alignment)/7").bold()
            Text("\(entry.thread) PT")
            Text("Treasury \(entry.treasury)").font(.caption)
            Text("Step \(entry.step)").font(.caption)
            Text(entry.baseName).font(.caption2)
        }
        .padding(10)
        .widgetURL(URL(string: "juscr://mirror"))
    }
}
```

### C. Trigger widget refresh after writes

When iOS native layer writes values, call:

```swift
WidgetCenter.shared.reloadTimelines(ofKind: "TempleMirrorWidget")
```

---

## 4) Android implementation (AppWidgetProvider)

### A. Manifest receiver

In `android/app/src/main/AndroidManifest.xml` add receiver inside `<application>`:

```xml
<receiver
  android:name=".TempleMirrorWidget"
  android:exported="false">
  <intent-filter>
    <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
  </intent-filter>
  <meta-data
    android:name="android.appwidget.provider"
    android:resource="@xml/temple_widget_info" />
</receiver>
```

### B. Provider class

`android/app/src/main/java/.../TempleMirrorWidget.kt`:

```kotlin
class TempleMirrorWidget : AppWidgetProvider() {
  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray
  ) {
    val prefs = context.getSharedPreferences("temple_widget", Context.MODE_PRIVATE)
    val alignment = prefs.getInt("alignment", 0)
    val thread = prefs.getInt("thread_balance", 0)
    val treasury = prefs.getString("treasury_balance", "$0") ?: "$0"
    val step = prefs.getString("initiation_step", "-") ?: "-"
    val base = prefs.getString("base_name", "jordaneckstrom.base.eth") ?: "jordaneckstrom.base.eth"

    appWidgetIds.forEach { id ->
      val views = RemoteViews(context.packageName, R.layout.temple_widget)
      views.setTextViewText(R.id.alignment, "ALIGNMENT $alignment/7")
      views.setTextViewText(R.id.thread, "$thread PT")
      views.setTextViewText(R.id.treasury, "Treasury $treasury")
      views.setTextViewText(R.id.step, "Step $step")
      views.setTextViewText(R.id.baseName, base)

      val intent = Intent(Intent.ACTION_VIEW, Uri.parse("juscr://mirror"))
      intent.setPackage(context.packageName)
      val pending = PendingIntent.getActivity(
        context,
        id,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      views.setOnClickPendingIntent(R.id.widget_root, pending)

      appWidgetManager.updateAppWidget(id, views)
    }
  }
}
```

### C. Widget provider XML

`android/app/src/main/res/xml/temple_widget_info.xml`:

```xml
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="180dp"
    android:minHeight="110dp"
    android:updatePeriodMillis="900000"
    android:initialLayout="@layout/temple_widget"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen" />
```

---

## 5) React → native shared storage bridge

For production, use a tiny Capacitor plugin to write widget payload to:

- iOS: App Group `UserDefaults(suiteName: ...)`
- Android: `SharedPreferences("temple_widget")`

Minimal TS call shape:

```ts
await TempleWidgetBridge.setSnapshot({
  alignment,
  thread_balance,
  treasury_balance,
  initiation_step,
  base_name: 'jordaneckstrom.base.eth',
});
```

Invoke after every data refresh and after alignment commits.

---

## 6) Build/run checklist

```bash
npx cap sync ios
npx cap open ios
npx cap sync android
npx cap open android
```

Verify:

1. Widget appears in iOS + Android widget pickers.
2. Widget shows alignment/thread/treasury/step/base name.
3. Tapping widget opens `mirror` tab via `juscr://mirror`.
4. Data refresh is visible within 15 minutes (or immediately after manual reload/update broadcast).

---

## 7) Recommended next seam

- **Realtime refresh**: push widget updates from SignalR events.
- **Quick action**: add `Commit Alignment` using iOS `AppIntent` and Android widget button + broadcast receiver.
- **Security**: avoid storing sensitive keys in shared widget storage; store only display-safe snapshots.
