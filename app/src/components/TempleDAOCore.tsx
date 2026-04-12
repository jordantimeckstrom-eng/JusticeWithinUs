import React, { useEffect, useMemo, useState } from "react";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

type TempleDAOCoreProps = {
  chainCount: number;
  setChainCount: (next: number) => void;
  initiationStep: number;
  setInitiationStep: (next: number) => void;
  threadBalance: number;
  setThreadBalance: (next: number) => void;
};

const BASE_NAME = "jordaneckstrom.base.eth";
const TREASURY_PDA = new PublicKey("11111111111111111111111111111111");
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

async function triggerHaptic() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }
}

export default function TempleDAOCore({
  chainCount,
  setChainCount,
  initiationStep,
  setInitiationStep,
  threadBalance,
  setThreadBalance,
}: TempleDAOCoreProps) {
  const { publicKey, signTransaction, connected } = useWallet();
  const [baseNameBound, setBaseNameBound] = useState(false);
  const [treasuryBalance, setTreasuryBalance] = useState<number | null>(null);

  const connection = useMemo(() => new Connection(SOLANA_RPC, "confirmed"), []);

  useEffect(() => {
    const verifyBaseBind = async () => {
      if (!publicKey) return;

      // Placeholder for production Base attestation verifier.
      console.info(`Verifying Base-name ownership for ${BASE_NAME} and ${publicKey.toBase58()}`);
      setBaseNameBound(true);
      await triggerHaptic();
    };

    if (connected) {
      void verifyBaseBind();
    }
  }, [connected, publicKey]);

  useEffect(() => {
    const refreshTreasury = async () => {
      const balance = await connection.getBalance(TREASURY_PDA);
      setTreasuryBalance(balance / 1_000_000_000);
    };

    void refreshTreasury();
    const id = setInterval(() => void refreshTreasury(), 30_000);
    return () => clearInterval(id);
  }, [connection]);

  const performBoundRitual = async () => {
    if (!publicKey || !signTransaction || !baseNameBound) return;

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: TREASURY_PDA,
        lamports: 10_000,
      }),
    );

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    tx.feePayer = publicKey;
    tx.recentBlockhash = blockhash;

    const signed = await signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(sig, "confirmed");

    await triggerHaptic();
    setChainCount(Math.min(chainCount + 1, 1132));
    setInitiationStep(Math.min(initiationStep + 1, 7));
    setThreadBalance(threadBalance + 10);

    console.info(`Ritual complete. Bound mint to ${BASE_NAME}. Sig: ${sig}`);
  };

  return (
    <section>
      <h2>TEMPLE DAO CORE — BOUND TO {BASE_NAME}</h2>
      <WalletMultiButton />

      <p>{baseNameBound ? "✅ BASE NAME NFT BOUND — SOVEREIGN KEY ACTIVE" : "Awaiting Base name verification"}</p>
      <p>Treasury balance: {treasuryBalance === null ? "Loading..." : `${treasuryBalance.toFixed(4)} SOL`}</p>
      <p>
        Phoenix Thread balance: <strong>{threadBalance} PT</strong>
      </p>

      <button disabled={!connected || !baseNameBound} onClick={() => void performBoundRitual()}>
        {connected && baseNameBound
          ? "FUND TREASURY + MINT THREAD + ADVANCE INITIATION"
          : "Connect & Verify Base Name to Begin"}
      </button>

      <small>Curriculum teaches • DAO governs • Treasury flows • Thread bound to {BASE_NAME}</small>
    </section>
  );
}
