# Operationalize the Anchor (Solana Memo)

This guide takes the SpineAlignTime flow from simulated anchoring to a real Solana transaction.

## 1) Fund the signer (devnet)

```bash
solana config set --url https://api.devnet.solana.com
solana airdrop 2
```

## 2) (Optional) Deploy a custom program

If/when you have compiled program bytecode, estimate rent and deploy:

```bash
solana rent 18504
solana program deploy ./target/deploy/justice_within_us.so
```

> The script below does **not** require a custom program; it anchors into the SPL Memo program directly.

## 3) Anchor the first tripleEntryHash

Install dependency if needed:

```bash
npm install @solana/web3.js
```

Run:

```bash
node scripts/anchor_triple_entry_hash.js \
  --hash "<tripleEntryHash>" \
  --keypair ~/.config/solana/id.json \
  --message-id "ingest-bid-0001" \
  --rpc https://api.devnet.solana.com
```

Environment-variable alternative:

```bash
TRIPLE_ENTRY_HASH="<tripleEntryHash>" \
SOLANA_KEYPAIR=~/.config/solana/id.json \
SOLANA_RPC_URL=https://api.devnet.solana.com \
MESSAGE_ID=ingest-bid-0001 \
node scripts/anchor_triple_entry_hash.js
```

## 4) Expected output

The script prints:

- Signer public key
- Transaction signature
- Explorer URL
- Serialized memo payload containing `tripleEntryHash`, `messageId`, and timestamp

## Notes

- Default network is **devnet**.
- Memo Program ID used: `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`.
- `messageId` is included in payload for app-level idempotency correlation.
