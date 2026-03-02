# Connecting Dune API Analysis

This repository now includes a script + GitHub Action to run Dune queries and export results.

## 1) Add secret

In GitHub repo settings, add:

- `DUNE_API_KEY` (required)

## 2) Run from GitHub Actions

Workflow: **Dune API Analysis** (`.github/workflows/dune-analysis.yml`)

Inputs:
- `query_id` (required)
- `parameters` (optional JSON object)
- `timeout_seconds` (optional, default `300`)

Artifacts produced:
- `artifacts/dune_results.json`
- `artifacts/dune_results.csv`

## 3) Run locally

```bash
export DUNE_API_KEY=your_api_key
python scripts/dune_analysis.py --query-id 123456
```

With parameters:

```bash
python scripts/dune_analysis.py \
  --query-id 123456 \
  --parameters '{"wallet":"0xabc..."}'
```
