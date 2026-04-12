# Treasure Valley Spine Availability Pack

This pack includes all three requested deployment pieces:
1. Exact glyph image prompt
2. Full Zapier Tables schema
3. Ready-to-import Zapier blueprint JSON

## 1) Exact Glyph Image Prompt

### Grok Imagine / Midjourney / DALL·E prompt

```text
Create a premium social media status card for a chiropractic / spine-alignment brand in Treasure Valley, Idaho.

Style: modern, clean, high contrast, mobile-first readability, subtle mystical-tech vibe.
Canvas: 1080x1350 (Instagram/Threads portrait). Also ensure safe crop for 1:1.

Background:
- Deep violet to teal gradient (#2D1366 to #0D9488), smooth diagonal blend
- Soft glow accents, faint grain texture, low clutter

Main layout:
- Left side: large circular status beacon with bright emerald glow (AVAILABLE state)
- Center: minimal stylized vertebrae/spine icon in white line art
- Right side headline text:
  TREASURE VALLEY SPINE
  OPEN TODAY

Typography:
- Clean geometric sans-serif (similar to Inter, Manrope, or Sora)
- Bold for headline, regular for supporting text
- White text with slight shadow for readability

Bottom info strip:
- "7-day dashboard live • DM \"SPINE\" to book"
- Small ouroboros symbol/icon at bottom-right (minimal, elegant)

Brand mood:
- Professional wellness + tech automation
- Inviting, trustworthy, premium

Output variants:
- Variant A: AVAILABLE (green beacon)
- Variant B: LIMITED (amber beacon)
- Variant C: BOOKED (red beacon)
- Variant D: TRAVELING (cyan beacon + tiny van icon)

No watermark. No extra logos. Keep spacing generous and text legible on mobile.
```

### Canva build spec (manual fallback)

- **Size**: 1080 × 1350
- **Gradient**: `#2D1366` → `#0D9488`
- **Status circle** (left):
  - Available: `#22C55E`
  - Limited: `#F59E0B`
  - Booked: `#EF4444`
  - Traveling: `#06B6D4`
- **Headline**: `TREASURE VALLEY SPINE`
- **Sub-headline**: `OPEN TODAY` / `2 SLOTS LEFT` / `BOOKED` / `IN VALLEY THIS WEEK`
- **Footer**: `7-day dashboard active • DM "SPINE" to book`

---

## 2) Full Zapier Tables Schema

Use one table named **Spine Availability Dashboard** with these fields:

```json
{
  "table_name": "Spine Availability Dashboard",
  "fields": [
    {
      "key": "date",
      "label": "Date",
      "type": "date",
      "required": true,
      "description": "Calendar date for each day in the rolling 15-day window (7 before to 7 after today)."
    },
    {
      "key": "status",
      "label": "Status",
      "type": "single_select",
      "required": true,
      "options": ["Available", "Limited", "Booked", "Traveling"],
      "default": "Available"
    },
    {
      "key": "slots_open",
      "label": "Slots Open",
      "type": "number",
      "required": true,
      "default": 0,
      "min": 0
    },
    {
      "key": "glyph_color",
      "label": "Glyph Color",
      "type": "formula",
      "formula": "IF({status}=\"Available\",\"🟢\",IF({status}=\"Limited\",\"🟡\",IF({status}=\"Booked\",\"🔴\",\"🚐\")))"
    },
    {
      "key": "last_updated",
      "label": "Last Updated",
      "type": "updated_at"
    },
    {
      "key": "dashboard_url",
      "label": "Dashboard URL",
      "type": "text",
      "default": "timeauction.jordanteckstrom.com/availability"
    },
    {
      "key": "today_glyph",
      "label": "Today's Glyph",
      "type": "formula",
      "formula": "IF({status}=\"Available\",\"🦴🟢 TREASURE VALLEY SPINE OPEN\\n\" & {slots_open} & \" slots available today → DM \\\"SPINE\\\" + your preferred window\\n7-day dashboard live → \" & {dashboard_url},IF({status}=\"Limited\",\"🦴🟡 2 slots left — first come, first aligned\\nDM \\\"SPINE\\\" to claim today\\n7-day dashboard live → \" & {dashboard_url},IF({status}=\"Booked\",\"🦴🔴 CLOSED — next openings in dashboard\\nJoin next wave → DM \\\"SPINE\\\"\\n7-day dashboard live → \" & {dashboard_url},\"🦴🚐 IN THE VALLEY THIS WEEK\\nCheck windows + book fast → DM \\\"SPINE\\\"\\n7-day dashboard live → \" & {dashboard_url})))"
    },
    {
      "key": "should_post",
      "label": "Should Post",
      "type": "formula",
      "formula": "IF({date}=TODAY(),TRUE,FALSE)"
    },
    {
      "key": "post_hashtags",
      "label": "Post Hashtags",
      "type": "text",
      "default": "#TreasureValleySpine #SpineAlignment #AvailableNow"
    }
  ]
}
```

### Seed rows recommendation

- Generate rows for `today - 7 days` through `today + 7 days`.
- Keep exactly one **today** row with `Should Post = TRUE`.
- All automation should key off today’s row to avoid accidental historical posts.

---

## 3) Ready-to-Import Zapier Blueprint JSON (Atomic Posting)

> Notes:
> - Zapier export/import formats vary by account and app versions.
> - The JSON below is a blueprint-style config you can map step-by-step in the Zap editor.

```json
{
  "zap_name": "Ouroboros - Spine Availability to Threads",
  "version": "2026-04",
  "description": "Atomic availability glyph posting with lock to prevent duplicates.",
  "trigger": {
    "app": "Zapier Tables",
    "event": "Updated Record",
    "table": "Spine Availability Dashboard",
    "watch_fields": ["status", "slots_open"],
    "sample_filters": {
      "should_post": true
    }
  },
  "steps": [
    {
      "name": "Filter - status changed and glyph exists",
      "app": "Filter by Zapier",
      "conditions": [
        {
          "field": "today_glyph",
          "operator": "exists"
        },
        {
          "field": "today_glyph",
          "operator": "not_equals",
          "value": ""
        }
      ]
    },
    {
      "name": "Storage Get Lock",
      "app": "Storage by Zapier",
      "event": "Get Value",
      "input": {
        "key": "spine-glyph-lock"
      }
    },
    {
      "name": "Filter - lock must be empty",
      "app": "Filter by Zapier",
      "conditions": [
        {
          "field": "storage_get_lock.value",
          "operator": "does_not_exist"
        }
      ]
    },
    {
      "name": "Storage Set Lock",
      "app": "Storage by Zapier",
      "event": "Set Value",
      "input": {
        "key": "spine-glyph-lock",
        "value": "locked",
        "ttl_seconds": 60
      }
    },
    {
      "name": "Compose post body",
      "app": "Formatter by Zapier",
      "event": "Text",
      "transform": "Append",
      "input": {
        "value_a": "{{trigger.today_glyph}}",
        "value_b": "\n\n{{trigger.post_hashtags}}"
      },
      "output_key": "threads_post_text"
    },
    {
      "name": "Post to Threads",
      "app": "Threads by Unshape",
      "event": "Create Post",
      "input": {
        "text": "{{steps.compose_post_body.threads_post_text}}",
        "media_type": "image",
        "media_url": "https://YOUR_CDN_OR_STATIC_HOST/spine-glyph-available.png"
      }
    },
    {
      "name": "Optional - Write post log",
      "app": "Zapier Tables",
      "event": "Create Record",
      "table": "Glyph Ghost Log",
      "input": {
        "timestamp": "{{zap_meta_human_now}}",
        "event": "posted",
        "status": "{{trigger.status}}",
        "slots_open": "{{trigger.slots_open}}",
        "post_text": "{{steps.compose_post_body.threads_post_text}}"
      }
    },
    {
      "name": "Release lock",
      "app": "Storage by Zapier",
      "event": "Delete Value",
      "input": {
        "key": "spine-glyph-lock"
      }
    }
  ],
  "error_path": {
    "on_lock_present": {
      "action": {
        "app": "Zapier Tables",
        "event": "Create Record",
        "table": "Glyph Ghost Log",
        "input": {
          "timestamp": "{{zap_meta_human_now}}",
          "event": "skipped",
          "reason": "rapid toggle (lock present)",
          "status": "{{trigger.status}}"
        }
      }
    }
  },
  "operational_notes": [
    "If Threads app is unavailable, swap posting step to Postpone or Buffer fallback.",
    "Keep lock TTL between 45-90 seconds.",
    "Only one row per date should exist to avoid trigger ambiguity."
  ]
}
```

## Suggested rollout checklist

1. Create table and fields exactly as above.
2. Seed 15-day window rows.
3. Upload four glyph variants (available/limited/booked/traveling) to a stable URL.
4. Build Zap steps in order and run manual tests for each status.
5. Toggle rapidly 3-4 times to confirm lock behavior and no duplicates.
6. Validate post text formatting on Threads mobile.
