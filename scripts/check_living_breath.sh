#!/usr/bin/env bash
set -euo pipefail

API_URL="${1:-http://localhost:5000/api/ledgerbridge/email}"
FROM_NAME="${2:-First Monitor}"
AMOUNT="${3:-4.20}"
BODY="${4:-A whisper from the old world}"

printf 'Posting Living Breath ceremony to: %s\n' "$API_URL"

http_code="$(curl -sS -o /tmp/living_breath_response.json -w '%{http_code}' \
  -X POST "$API_URL" \
  -H 'Content-Type: application/json' \
  -d "{\"fromName\":\"$FROM_NAME\",\"amount\":$AMOUNT,\"body\":\"$BODY\"}")"

if [[ "$http_code" -lt 200 || "$http_code" -ge 300 ]]; then
  echo "Living Breath test failed with HTTP status $http_code"
  echo "Response body:"
  cat /tmp/living_breath_response.json
  exit 1
fi

echo "Living Breath endpoint accepted payload (HTTP $http_code)"
echo "Response body:"
cat /tmp/living_breath_response.json
