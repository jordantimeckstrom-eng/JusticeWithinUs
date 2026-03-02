# Merge repos helper

This repository includes helper scripts to merge an upstream repository into the current branch with unrelated history support.

## Generic command

```bash
scripts/merge_external_repo.sh \
  https://github.com/galacticcouncil/intergalactic-asset-metadata.git \
  intergalactic \
  master
```

## Hydration shortcut command

```bash
scripts/merge_hydration_repo.sh \
  https://github.com/galacticcouncil/hydration-node.git \
  hydration \
  master
```

## What the merge scripts do

1. Add (or update) a Git remote.
2. Fetch from that remote.
3. Merge `<remote>/<branch>` with `--allow-unrelated-histories`.

## Notes

In this execution environment, outbound access to GitHub returns `403` via the configured tunnel, so the fetch/merge step cannot complete here.
