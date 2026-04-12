import React, { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import * as signalR from "@microsoft/signalr";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

/**
 * NOTE:
 * - This component is scaffolded as a drop-in starting point for the mobile DApp flow.
 * - It expects your existing useOuroborosState hook to be available from ./App.
 */
import { useOuroborosState } from "./App";

const PROGRAM_ID = new PublicKey("TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP");
const RPC_URL = process.env.REACT_APP_SOLANA_RPC_URL ?? clusterApiUrl("mainnet-beta");
const SIGNALR_URL =
  process.env.REACT_APP_SIGNALR_URL ?? "https://your-signalr.azurewebsites.net/hub/bidHub";

const makeSevenDays = (): string[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
};

type MirrorProps = {
  chainCount: number;
  setChainCount: React.Dispatch<React.SetStateAction<number>>;
};

export default function SevenDayMirror({ chainCount, setChainCount }: MirrorProps) {
  const { publicKey, signTransaction, connected } = useWallet();

  const [spineHistory, setSpineHistory] = useOuroborosState("juscr_spine_history", {} as Record<string, unknown>);
  const [pillarHistory, setPillarHistory] = useOuroborosState(
    "juscr_pillar_history",
    {} as Record<string, unknown>,
  );
  const [realityLog] = useOuroborosState("juscr_reality_log", [] as unknown[]);
  const [liveTick, setLiveTick] = useState<number>(Date.now());
  const [signalRStatus, setSignalRStatus] = useState<"connected" | "disconnected" | "connecting">(
    "disconnected",
  );

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const sevenDays = useMemo(() => makeSevenDays(), []);

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.impact({ style });
  };

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = conn;
    setSignalRStatus("connecting");

    conn
      .start()
      .then(async () => {
        setSignalRStatus("connected");
        await triggerHaptic(ImpactStyle.Light);
      })
      .catch(() => setSignalRStatus("disconnected"));

    conn.on("NewBid", async () => {
      setLiveTick(Date.now());
      await triggerHaptic(ImpactStyle.Light);
    });

    conn.onreconnected(() => setSignalRStatus("connected"));
    conn.onclose(() => setSignalRStatus("disconnected"));

    return () => {
      void conn.stop();
      connectionRef.current = null;
    };
  }, []);

  const commitToChain = async () => {
    if (!publicKey || !signTransaction) return;

    try {
      const connection = new Connection(RPC_URL, "confirmed");
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

      const tx = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PROGRAM_ID,
          lamports: 5000,
        }),
      );

      const signedTx = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

      setChainCount((prev) => Math.min(prev + 1, 1132));
      await triggerHaptic(ImpactStyle.Medium);
      console.info("On-chain commit signature:", signature);
    } catch (error) {
      console.warn("Chain commit failed. Keeping state in Redis/local store.", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick(Date.now());
      const today = sevenDays[6];

      if (!spineHistory[today]) {
        setSpineHistory((prev: Record<string, unknown>) => ({ ...prev, [today]: {} }));
      }

      if (!pillarHistory[today]) {
        setPillarHistory((prev: Record<string, unknown>) => ({ ...prev, [today]: {} }));
      }

      // Place any Redis flush or scheduled chain sync here.
    }, 60_000);

    return () => clearInterval(interval);
  }, [pillarHistory, setPillarHistory, setSpineHistory, sevenDays, spineHistory]);

  const now = new Date();
  const dawnProgress = Math.min(((now.getHours() * 60 + now.getMinutes()) / 1440) * 100, 100);

  return (
    <section style={{ padding: 16, borderRadius: 16, background: "#121212", color: "#f8f3e7" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>7-Day Ritual Mirror</h2>
        <WalletMultiButton />
      </header>

      <p style={{ marginTop: 10, opacity: 0.9 }}>
        Native iOS/Android • Wallet-connected • Solana mainnet • Redis eternal • SignalR live
      </p>

      <div style={{ marginTop: 12 }}>
        <strong>SignalR:</strong> {signalRStatus}
      </div>
      <div>
        <strong>Live tick:</strong> {new Date(liveTick).toLocaleTimeString()}
      </div>
      <div>
        <strong>Reality log entries:</strong> {realityLog.length}
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Dawn progress:</strong> {dawnProgress.toFixed(1)}%
        <div style={{ height: 8, background: "#333", borderRadius: 999, marginTop: 6 }}>
          <div
            style={{
              width: `${dawnProgress}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #e7c67a, #f4ecd6)",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8, marginTop: 16 }}>
        {sevenDays.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              padding: "10px 4px",
              borderRadius: 10,
              background: spineHistory[d] ? "#1f3a2f" : "#2a2a2a",
            }}
          >
            {d.slice(5)}
          </div>
        ))}
      </div>

      <button
        type="button"
        style={{
          marginTop: 16,
          padding: "10px 14px",
          borderRadius: 10,
          border: "none",
          background: connected ? "#e7c67a" : "#6e6e6e",
          color: "#111",
          fontWeight: 700,
          cursor: connected ? "pointer" : "not-allowed",
        }}
        onClick={() => void commitToChain()}
        disabled={!connected}
      >
        {connected ? "IMMORTALIZE ON SOLANA (Mobile)" : "Connect Wallet to Commit"}
      </button>

      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>Chain count: {chainCount}</div>
    </section>
  );
}
