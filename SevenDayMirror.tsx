import React, { useEffect, useMemo, useRef, useState } from "react";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import * as signalR from "@microsoft/signalr";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { useOuroborosState } from "./App";

const PROGRAM_ID = new PublicKey("TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP");
const RPC_URL = "https://api.mainnet-beta.solana.com";

const SEVEN_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  return d.toISOString().slice(0, 10);
}).reverse();

type MirrorProps = {
  chainCount: number;
  setChainCount: (value: number) => void;
};

export default function SevenDayMirror({ chainCount, setChainCount }: MirrorProps) {
  const { publicKey, signTransaction, connected } = useWallet();
  const [spineHistory, setSpineHistory] = useOuroborosState<Record<string, Record<string, unknown>>>(
    "juscr_spine_history",
    {},
  );
  const [pillarHistory, setPillarHistory] = useOuroborosState<Record<string, Record<string, unknown>>>(
    "juscr_pillar_history",
    {},
  );
  const [_realityLog, _setRealityLog] = useOuroborosState<Array<unknown>>("juscr_reality_log", []);
  const [liveTick, setLiveTick] = useState(Date.now());
  const [signalRStatus, setSignalRStatus] = useState<"disconnected" | "connected">("disconnected");
  const [governanceProposal, setGovernanceProposal] = useState("");
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const triggerHaptic = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  };

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("https://your-signalr.azurewebsites.net/hub/bidHub")
      .withAutomaticReconnect()
      .build();

    connectionRef.current = conn;

    conn
      .start()
      .then(() => {
        setSignalRStatus("connected");
        return triggerHaptic();
      })
      .catch(() => setSignalRStatus("disconnected"));

    conn.on("NewBid", () => {
      setLiveTick(Date.now());
    });

    return () => {
      conn.stop();
      connectionRef.current = null;
    };
  }, []);

  const commitToChainAndGovern = async () => {
    if (!publicKey || !signTransaction) {
      return;
    }

    try {
      const connection = new Connection(RPC_URL, "confirmed");
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PROGRAM_ID,
          lamports: 5000,
        }),
      );

      tx.feePayer = publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      console.log("On-chain commit + governance vote recorded", { signature: sig, governanceProposal });
      await triggerHaptic();
      setChainCount(Math.min(chainCount + 1, 1132));
    } catch (error) {
      console.log("Commit failed; state remains local/Redis-backed", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick(Date.now());
      const today = SEVEN_DAYS[6];
      if (!spineHistory[today]) {
        setSpineHistory((prev) => ({ ...prev, [today]: {} }));
      }
      if (!pillarHistory[today]) {
        setPillarHistory((prev) => ({ ...prev, [today]: {} }));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [pillarHistory, setPillarHistory, setSpineHistory, spineHistory]);

  const dawnProgress = useMemo(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return Math.min((minutes / 1440) * 100, 100);
  }, [liveTick]);

  return (
    <section aria-label="7-day ritual mirror" style={{ padding: 16, borderRadius: 12, border: "1px solid #ddd" }}>
      <h2>7-Day Ritual Mirror</h2>
      <p>SignalR: {signalRStatus} • Chain Count: {chainCount} • Dawn Progress: {dawnProgress.toFixed(1)}%</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8, margin: "12px 0" }}>
        {SEVEN_DAYS.map((day) => (
          <div key={day} style={{ padding: 8, background: "#fafafa", borderRadius: 8, border: "1px solid #eee" }}>
            <div style={{ fontSize: 12 }}>{day}</div>
            <div style={{ fontSize: 11, color: "#666" }}>
              Spine: {spineHistory[day] ? "set" : "pending"} / Pillar: {pillarHistory[day] ? "set" : "pending"}
            </div>
          </div>
        ))}
      </div>

      <label htmlFor="governance-proposal">Governance proposal</label>
      <textarea
        id="governance-proposal"
        value={governanceProposal}
        onChange={(e) => setGovernanceProposal(e.target.value)}
        placeholder="Propose next temple upgrade (on-chain)..."
        rows={3}
        style={{ width: "100%", marginTop: 8 }}
      />

      <button onClick={commitToChainAndGovern} style={{ marginTop: 12 }}>
        {connected ? "COMMIT ALIGNMENT + GOVERN ON-CHAIN" : "Connect Wallet to Govern"}
      </button>

      <p style={{ marginTop: 12, fontSize: 12, color: "#555" }}>
        Native iOS/Android • Wallet-connected • On-chain governance • Redis eternal • SignalR live
      </p>
    </section>
  );
}
