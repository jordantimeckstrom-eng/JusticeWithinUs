# Merge repos helper

This repository now includes a helper script to merge the upstream Hydration Node repository into the current branch with unrelated history support.

## Command

```bash
scripts/merge_hydration_repo.sh \
  https://github.com/galacticcouncil/hydration-node.git \
  hydration \
  master
```

## What it does

1. Adds (or updates) a Git remote named `hydration`.
2. Fetches from that remote.
3. Merges `hydration/master` with `--allow-unrelated-histories`.

## Notes

In this execution environment, outbound access to GitHub returns `403` via the configured tunnel, so the fetch/merge step cannot complete here.
