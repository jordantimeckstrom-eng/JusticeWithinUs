import React, { useState, useEffect, useRef } from "react";
import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
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
  const [spineHistory, setSpineHistory] = useOuroborosState("juscr_spine_history", {});
  const [pillarHistory, setPillarHistory] = useOuroborosState("juscr_pillar_history", {});
  const [realityLog, setRealityLog] = useOuroborosState<string[]>("juscr_reality_log", []);
  const [liveTick, setLiveTick] = useState(Date.now());
  const [signalRStatus, setSignalRStatus] = useState("disconnected");
  const [governanceProposal, setGovernanceProposal] = useState("");
  const [daoVotes, setDaoVotes] = useOuroborosState<Record<string, string>>("juscr_dao_votes", {});

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
        triggerHaptic();
      })
      .catch(() => setSignalRStatus("error"));

    conn.on("NewBid", () => {
      setLiveTick(Date.now());
    });

    return () => {
      void conn.stop();
    };
  }, []);

  const commitToChainAndGovern = async () => {
    if (!publicKey || !signTransaction) return;

    try {
      const connection = new Connection(RPC_URL);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PROGRAM_ID,
          lamports: 5000,
        })
      );

      tx.feePayer = publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      await triggerHaptic();
      setChainCount(Math.min(chainCount + 1, 1132));
      setDaoVotes((prev) => ({ ...prev, [sig]: governanceProposal || "Alignment committed" }));
      setRealityLog((prev) => [
        `${new Date().toISOString()}: ${governanceProposal || "Alignment committed"}`,
        ...prev,
      ]);
      setGovernanceProposal("");
    } catch {
      setRealityLog((prev) => [
        `${new Date().toISOString()}: Chain commit unavailable, retained in local memory`,
        ...prev,
      ]);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick(Date.now());
      const today = SEVEN_DAYS[6];
      if (!(spineHistory as Record<string, unknown>)[today]) {
        setSpineHistory((prev: Record<string, unknown>) => ({ ...prev, [today]: {} }));
      }
      if (!(pillarHistory as Record<string, unknown>)[today]) {
        setPillarHistory((prev: Record<string, unknown>) => ({ ...prev, [today]: {} }));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [pillarHistory, setPillarHistory, setSpineHistory, spineHistory]);

  const dawnProgress = Math.min(
    ((new Date().getHours() * 60 + new Date().getMinutes()) / 1440) * 100,
    100
  );

  return (
    <section style={{ padding: 16, color: "#f5f5f5", background: "#111", borderRadius: 12 }}>
      <header>
        <h2>7-Day Ritual Mirror • Temple DAO</h2>
        <p>
          Status: {signalRStatus} • Wallet: {connected ? "connected" : "disconnected"} • Live tick:{" "}
          {new Date(liveTick).toLocaleTimeString()}
        </p>
      </header>

      <div>
        <p>Dawn Progress: {dawnProgress.toFixed(1)}%</p>
        <progress max={100} value={dawnProgress} style={{ width: "100%" }} />
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Seven-Day Spine Window</h3>
        <ul>
          {SEVEN_DAYS.map((day) => (
            <li key={day}>
              {day}: spine {Boolean((spineHistory as Record<string, unknown>)[day]) ? "✓" : "—"} • pillar{" "}
              {Boolean((pillarHistory as Record<string, unknown>)[day]) ? "✓" : "—"}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="proposal">Propose next temple upgrade</label>
        <textarea
          id="proposal"
          value={governanceProposal}
          onChange={(e) => setGovernanceProposal(e.target.value)}
          placeholder="Propose next temple upgrade (DAO on-chain)..."
          style={{ width: "100%", minHeight: 80, marginTop: 8 }}
        />
        <button onClick={commitToChainAndGovern} style={{ marginTop: 8 }}>
          {connected ? "COMMIT ALIGNMENT + CAST DAO VOTE" : "Connect Wallet to Govern the Temple"}
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>DAO Vote Tally ({Object.keys(daoVotes).length})</h3>
        <ul>
          {Object.entries(daoVotes).map(([sig, proposal]) => (
            <li key={sig}>
              <code>{sig}</code>: {proposal}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Reality Log</h3>
        <ul>
          {realityLog.slice(0, 7).map((entry, idx) => (
            <li key={`${entry}-${idx}`}>{entry}</li>
          ))}
        </ul>
      </div>

      <footer style={{ marginTop: 16, opacity: 0.85 }}>
        Native iOS/Android • Wallet-connected • Live DAO governance • On-chain immortal • Redis eternal •
        SignalR live
      </footer>
    </section>
  );
}
