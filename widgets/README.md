# Seven Day Dashboard Widget

Use `SevenDayDashboardWidget` to load and render the most recent seven days of dashboard metrics from your API.

## Expected API response

The widget calls:

- `GET <endpoint>?range=7d`

And expects JSON shaped like:

```json
{
  "data": [
    {
      "date": "2026-04-06",
      "visitors": 230,
      "conversions": 11,
      "revenue": 1240
    }
  ]
}
```

## Basic usage

```tsx
import { SevenDayDashboardWidget } from "./widgets/SevenDayDashboardWidget";

export default function DashboardPage() {
  return (
    <main>
      <SevenDayDashboardWidget endpoint="/api/dashboard" />
    </main>
  );
}
```
