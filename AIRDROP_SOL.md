# Airdrop SOL (Devnet/Testnet/Localnet)

Use the helper script:

```bash
./airdrop-sol.sh <AMOUNT_SOL> [NETWORK] [RECIPIENT_PUBKEY]
```

Examples:

```bash
./airdrop-sol.sh 2
./airdrop-sol.sh 1 testnet
./airdrop-sol.sh 1 devnet <RECIPIENT_PUBKEY>
```

Direct Solana CLI commands:

```bash
solana airdrop 2 --url https://api.devnet.solana.com
solana airdrop 1 <RECIPIENT_PUBKEY> --url https://api.devnet.solana.com
```

Notes:
- Mainnet does **not** support airdrops.
- If airdrop is rate-limited, retry after a short delay.
