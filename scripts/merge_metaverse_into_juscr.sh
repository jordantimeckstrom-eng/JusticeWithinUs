#!/usr/bin/env bash
set -euo pipefail

# Merge the `metaverse` branch from a JUSCR repository into the current branch.
# Usage:
#   scripts/merge_metaverse_into_juscr.sh <repo-url> [metaverse-branch]
# Example:
#   scripts/merge_metaverse_into_juscr.sh https://github.com/<org>/JUSCR.git metaverse

REPO_URL="${1:-}"
METAVERSE_BRANCH="${2:-metaverse}"
REMOTE_NAME="juscr"

if [[ -z "$REPO_URL" ]]; then
  echo "Usage: $0 <repo-url> [metaverse-branch]" >&2
  exit 1
fi

if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git remote set-url "$REMOTE_NAME" "$REPO_URL"
else
  git remote add "$REMOTE_NAME" "$REPO_URL"
fi

if [[ "$METAVERSE_BRANCH" == refs/* ]]; then
  SOURCE_REF="$METAVERSE_BRANCH"
else
  SOURCE_REF="refs/heads/$METAVERSE_BRANCH"
fi

REMOTE_TRACKING_REF="refs/remotes/$REMOTE_NAME/$METAVERSE_BRANCH"

git fetch "$REMOTE_NAME" "+$SOURCE_REF:$REMOTE_TRACKING_REF"
git merge --allow-unrelated-histories "$REMOTE_TRACKING_REF"
