#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${1:-https://github.com/K-Dense-AI/claude-scientific-skills.git}"
REMOTE_NAME="${2:-claude_scientific_skills}"
TAG_NAME="${3:-v2.25.0}"

if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git remote set-url "$REMOTE_NAME" "$REPO_URL"
else
  git remote add "$REMOTE_NAME" "$REPO_URL"
fi

git fetch "$REMOTE_NAME" "refs/tags/$TAG_NAME:refs/tags/$TAG_NAME" --prune

git merge --allow-unrelated-histories --no-ff "$TAG_NAME"
