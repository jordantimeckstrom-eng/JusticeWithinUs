# Replit Integration

This repository now includes a GitHub Actions workflow that validates connectivity to:

- `https://juscr-fre-for-all.replit.app/`

## What was added

- Workflow: `.github/workflows/replit-integration.yml`
- Script: `scripts/check_replit_integration.sh`
- Local Living Breath smoke test script: `scripts/check_living_breath.sh`

## How it works

The workflow runs on:

- Pushes to `main`
- Manual trigger (`workflow_dispatch`)

It executes the integration script, which:

1. Sends a request to the Replit URL.
2. Fails if the HTTP status is not in the 2xx/3xx range.
3. Logs whether an HTML payload is returned.

## Local Living Breath curl test

When your Flask server is running on `localhost:5000`, run:

```bash
./scripts/check_living_breath.sh
```

Default payload:

- `fromName`: `First Monitor`
- `amount`: `4.20`
- `body`: `A whisper from the old world`

Custom values can be passed as positional args:

```bash
./scripts/check_living_breath.sh <api_url> <fromName> <amount> <body>
```
