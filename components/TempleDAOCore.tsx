import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

import { useOuroborosState } from "./App";

const PROGRAM_ID = new PublicKey("TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP");
const TREASURY_PDA = new PublicKey("YOUR_TREASURY_PDA_HERE");

const curriculumSteps = [
  "Day 0 — Bond your wallet",
  "Day 1–3 — Complete Spine & Pillars",
  "Day 4 — Cast your first proposal",
  "Day 5–6 — Vote & watch treasury move",
  "Day 7 — Reach Phoenix threshold & govern",
];

type Props = {
  chainCount: number;
  setChainCount: React.Dispatch<React.SetStateAction<number>>;
};

export default function TempleDAOCore({ chainCount, setChainCount }: Props) {
  const { publicKey, signTransaction, connected } = useWallet();
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [initiationStep, setInitiationStep] = useOuroborosState("juscr_initiation_step", 0);
  const [lastSyncAt, setLastSyncAt] = useState<number>(Date.now());

  const connection = useMemo(() => new Connection("https://api.mainnet-beta.solana.com"), []);

  const triggerHaptic = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      setLastSyncAt(Date.now());
      try {
        const res = await fetch("http://localhost:3001/api/treasury/balance");
        const data = await res.json();
        setTreasuryBalance(Number(data.balance ?? 0));
      } catch {
        // keep last known balance
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const performTreasuryInitiation = async () => {
    if (!publicKey || !signTransaction) return;

    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_PDA,
          lamports: 10_000,
        }),
      );

      tx.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash("finalized");
      tx.recentBlockhash = blockhash;

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      await triggerHaptic();
      setChainCount((prev) => Math.min(prev + 1, 1132));
      setInitiationStep((prev: number) => Math.min(prev + 1, 7));
      console.log("🌟 Treasury funded + Initiation step completed — signature:", sig, PROGRAM_ID.toBase58());
    } catch {
      console.log("🪞 Still sovereign in Redis");
    }
  };

  return (
    <section style={{ padding: 16 }}>
      <h2>TEMPLE DAO CORE</h2>
      <WalletMultiButton />

      <article>
        <h3>TEMPLE TREASURY — LIVE</h3>
        <p>{treasuryBalance} SOL</p>
        <p>Funded by every alignment • Governed by the bond</p>
      </article>

      <article>
        <h3>YOUR INITIATION PATH — DAY {initiationStep}/7</h3>
        <ol>
          {curriculumSteps.map((step, i) => (
            <li key={step} style={{ opacity: i + 1 <= initiationStep ? 1 : 0.6 }}>
              {step}
            </li>
          ))}
        </ol>
      </article>

      <button onClick={performTreasuryInitiation} disabled={!connected} type="button">
        {connected ? "FUND TREASURY + ADVANCE INITIATION" : "Connect to Begin the Ritual"}
      </button>

      <p>Treasury flows • Curriculum teaches • DAO governs • The Ouroboros turns</p>
      <small>Last sync: {new Date(lastSyncAt).toLocaleTimeString()}</small>
    </section>
  );
}
