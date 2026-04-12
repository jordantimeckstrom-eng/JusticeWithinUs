# Temple DAO — Build, Deploy, and Smoke Test (Devnet)

## 1) Prerequisites

```bash
solana --version
anchor --version
rustc --version
node -v
```

## 2) Configure Solana

```bash
solana config set --url devnet
solana config set --keypair ~/.config/solana/id.json
solana airdrop 2
solana balance
```

## 3) Configure Anchor program ID

Make sure these match exactly:

- `declare_id!` in `programs/temple-dao/src/lib.rs`
- `[programs.devnet].temple_dao` in your `Anchor.toml`

Example `Anchor.toml`:

```toml
[programs.devnet]
temple_dao = "TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
```

## 4) Build and deploy

```bash
anchor build
anchor keys list
anchor deploy
```

If you see a program-id mismatch:

```bash
anchor keys sync
anchor build
anchor deploy
```

## 5) Run smoke script

The script at `scripts/devnet-smoke.ts` does:

1. `initialize_dao` (skips if already initialized)
2. `propose`
3. `vote`

Run it from your Anchor workspace root:

```bash
anchor run devnet-smoke
```

(If your workspace does not define this script, run with your preferred ts-node/tsx entrypoint.)

## 6) Verify transactions

```bash
solana confirm <TX_SIGNATURE> -v
```

## 7) Enact after voting period

`enact` can only be called after the configured voting window ends.

Use your client to call:

```ts
await program.methods
  .enact()
  .accounts({ proposal: proposalPda })
  .rpc();
```

## Security notes

- Do not trust off-chain alignment score input directly in production.
- Add signed attestation verification for voter weight.
- Add treasury timelock and transfer caps before enabling fund movement.
