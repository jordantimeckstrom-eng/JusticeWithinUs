#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${1:?Usage: scripts/merge_external_repo.sh <repo_url> [remote_name] [branch_name]}"
REMOTE_NAME="${2:-upstream_repo}"
BRANCH_NAME="${3:-master}"

if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git remote set-url "$REMOTE_NAME" "$REPO_URL"
else
  git remote add "$REMOTE_NAME" "$REPO_URL"
fi

git fetch "$REMOTE_NAME" --prune

git merge --allow-unrelated-histories "$REMOTE_NAME/$BRANCH_NAME"
