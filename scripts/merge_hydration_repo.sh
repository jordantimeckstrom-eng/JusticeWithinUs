#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${1:-https://github.com/galacticcouncil/hydration-node.git}"
REMOTE_NAME="${2:-hydration}"
BRANCH_NAME="${3:-master}"

if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git remote set-url "$REMOTE_NAME" "$REPO_URL"
else
  git remote add "$REMOTE_NAME" "$REPO_URL"
fi

git fetch "$REMOTE_NAME" --prune

git merge --allow-unrelated-histories "$REMOTE_NAME/$BRANCH_NAME"
