# Replit Integration

This repository now includes a GitHub Actions workflow that validates connectivity to:

- `https://replit.com/@eckstromj1123/JUSCR-FreForAll?s=app`

## What was added

- Workflow: `.github/workflows/replit-integration.yml`
- Script: `scripts/check_replit_integration.sh`

## How it works

The workflow runs on:

- Pushes to `main`
- Manual trigger (`workflow_dispatch`)

It executes the integration script, which:

1. Sends a request to the Replit URL.
2. Fails if the HTTP status is not in the 2xx/3xx range.
3. Logs whether an HTML payload is returned.
