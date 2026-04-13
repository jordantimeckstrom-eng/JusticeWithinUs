# Phoenix Thread + Base Name Binding Deployment Ritual

This flow deploys the Solana Anchor program and executes a genesis bind operation for the sovereign Base name NFT (`jordaneckstrom.base.eth`).

## 1) Build and deploy Anchor program

```bash
anchor build
anchor deploy
```

## 2) Execute Base-name genesis bind

```bash
node -e 'const { bindGenesisToBaseName } = require("./phoenix-system"); bindGenesisToBaseName("jordaneckstrom.base.eth").then(console.log);'
```

## 3) Build and sync mobile clients

```bash
npm run build
npx cap sync ios
npx cap sync android
npx cap open ios
npx cap open android
```

## Notes

- The attestation proof should be validated on-chain or by a deterministic verifier before enabling mint/govern actions.
- Keep the genesis bind authority in secure custody (hardware wallet + multisig ceremony recommended).
