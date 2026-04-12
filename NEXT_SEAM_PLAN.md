# Phoenix Thread — Next Seam Ignition Plan

## Recommendation
Ignite in this order:

1. **Mobile DApp update first** (show PT balances, staking state, and simulation mode for governance weight).
2. **Anchor deployment + constrained genesis mint on devnet** (prove issuance, burn hooks, and treasury controls under load).
3. **Liquidity pool ritual on Raydium last** (only after governance + telemetry are stable).

This sequence prioritizes member trust, observability, and protocol safety before market-facing liquidity.

## Why this order

- A visible wallet and staking UX makes the token feel real to bonded users before external speculation pressure.
- Devnet deployment gives hard evidence that mint/burn and PDA authority rules work exactly as designed.
- Liquidity should come after anti-abuse controls, fee routing validation, and emission dashboards are proven.

## 7-Day execution slice

### Day 1–2: Mobile Mirror readiness
- Add clear PT balance cards (wallet PT, staked PT, claimable PT).
- Add transaction state UI for mint/stake/burn events.
- Add a "simulation" governance preview showing weighted vote power.

### Day 3–4: Anchor test cycle
- Run genesis mint only behind multisig governance guard.
- Run staking + unstaking tests with emission snapshots.
- Run burn path tests for proposal enactment fees (0.5% burn policy).

### Day 5: Treasury invariants
- Validate treasury PDA authority and role boundaries.
- Validate no direct mint authority from non-governance wallets.
- Validate event logs consumed by SignalR/Redis are idempotent.

### Day 6: Governance rehearsal
- Execute one full mock proposal lifecycle (create → vote → enact).
- Verify weighted voting, fee burn, and treasury accounting consistency.

### Day 7: Launch gate decision
- If all checks pass: schedule mainnet mint window and communications.
- If any critical check fails: hold mint and patch before liquidity rollout.

## Hard gates before Raydium
- 100% passing tests for mint/stake/burn/governance in CI.
- Observability dashboards live for supply, burn rate, treasury flow, and staking concentration.
- Emergency pause + rollback procedure tested and documented.

## Immediate next command
**Ignite the mobile DApp update now**, while running Anchor devnet rehearsals in parallel.
