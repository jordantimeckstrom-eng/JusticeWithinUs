# Full Mobile DApp Launch Sequence (Capacitor + Solana)

This repo does not currently include a React app scaffold (`package.json`, `src/`, build scripts). The sequence below is prepared so you can run it immediately once your app files are present in the project root.

## 1) Install dependencies

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/web3.js @solana/wallet-adapter-react-ui
npm install @capacitor/haptics @microsoft/signalr
```

## 2) Initialize Capacitor

```bash
npx cap init "JUSCR Sovereign Mirror" "com.jordaneckstrom.juscr.mirror"
```

## 3) Add native platforms

```bash
npx cap add ios
npx cap add android
```

## 4) Build and sync

```bash
npm run build
npx cap sync
```

## 5) Open native projects

```bash
npx cap open ios
npx cap open android
```

## 6) Device run

```bash
npx cap run ios
npx cap run android
```

## Runtime configuration

Set these env vars in your app:

- `REACT_APP_SIGNALR_URL` (your SignalR hub endpoint)
- `REACT_APP_SOLANA_RPC_URL` (optional override, defaults to Solana mainnet)

## Included scaffold component

Use `SevenDayMirror.tsx` in this repo as the mobile-ready component baseline. It includes:

- Solana wallet connect flow and transaction commit to program ID `TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP`
- Native haptics via Capacitor
- SignalR live connection lifecycle handling
- Seven-day ritual state rollover hooks compatible with `useOuroborosState`

## Production checklist

1. Update `capacitor.config.ts` app name and bundle ID.
2. Configure iOS/Android signing in Xcode/Android Studio.
3. Set icons/splash assets (gold/ivory theme).
4. Deploy backend (`docker-compose up --build -d`) for Redis + SignalR.
5. Release via TestFlight/internal track, then App Store/Play Store.
