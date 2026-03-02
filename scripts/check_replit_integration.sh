#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-https://juscr-fre-for-all.replit.app/}"

printf 'Checking integration endpoint: %s\n' "$TARGET_URL"

http_code="$(curl -sS -L -o /tmp/replit_integration_body.txt -w '%{http_code}' "$TARGET_URL")"

if [[ "$http_code" -lt 200 || "$http_code" -ge 400 ]]; then
  echo "Endpoint check failed with HTTP status $http_code"
  exit 1
fi

echo "Endpoint responded with HTTP status $http_code"

grep -qi "<html" /tmp/replit_integration_body.txt && echo "HTML payload detected" || echo "Non-HTML payload detected"

echo "Integration check complete"
