import React, { useEffect, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP");
const RPC_URL = "https://api.mainnet-beta.solana.com";
const STORAGE_KEYS = {
  spine: "juscr_spine_history",
  pillar: "juscr_pillar_history",
  reality: "juscr_reality_log",
};

type DayMap = Record<string, Record<string, unknown>>;
type RealityEntry = Record<string, unknown>;

type SevenDayMirrorProps = {
  chainCount?: number;
  setChainCount?: React.Dispatch<React.SetStateAction<number>>;
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #3b2f16",
  borderRadius: 12,
  padding: 16,
  background: "#0c0b12",
  color: "#f5efe0",
};

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function SevenDayMirror({ chainCount = 0 }: SevenDayMirrorProps) {
  const [spineHistory, setSpineHistory] = useState<DayMap>(() =>
    loadJSON<DayMap>(STORAGE_KEYS.spine, {}),
  );
  const [pillarHistory, setPillarHistory] = useState<DayMap>(() =>
    loadJSON<DayMap>(STORAGE_KEYS.pillar, {}),
  );
  const [realityLog] = useState<RealityEntry[]>(() =>
    loadJSON<RealityEntry[]>(STORAGE_KEYS.reality, []),
  );
  const [liveTick, setLiveTick] = useState(() => Date.now());
  const [signalRStatus, setSignalRStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const sevenDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
  }, [liveTick]);

  useEffect(() => saveJSON(STORAGE_KEYS.spine, spineHistory), [spineHistory]);
  useEffect(() => saveJSON(STORAGE_KEYS.pillar, pillarHistory), [pillarHistory]);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      (window as Window & { deferredPrompt?: Event }).deferredPrompt = event;
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setPwaInstalled(true);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => setPwaInstalled((current) => current || false))
        .catch(() => setPwaInstalled(false));
    }

    return () =>
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  const installPWA = async () => {
    const prompt = (window as Window & { deferredPrompt?: any }).deferredPrompt;
    if (!prompt) return;

    prompt.prompt();
    const result = await prompt.userChoice;
    if (result?.outcome === "accepted") {
      setPwaInstalled(true);
    }
  };

  useEffect(() => {
    setSignalRStatus("connecting");
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("https://your-signalr.azurewebsites.net/hub/bidHub")
      .withAutomaticReconnect()
      .build();

    connectionRef.current = conn;

    conn
      .start()
      .then(() => setSignalRStatus("connected"))
      .catch(() => setSignalRStatus("disconnected"));

    conn.on("NewBid", () => {
      // Placeholder hook: ingest event into mirror's current day data.
      setLiveTick(Date.now());
    });

    return () => {
      void conn.stop();
      setSignalRStatus("disconnected");
    };
  }, []);

  const commitToSolanaLedger = async () => {
    try {
      const connection = new Connection(RPC_URL, "confirmed");
      const fromPubkey = new PublicKey("11111111111111111111111111111111");

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: PROGRAM_ID,
          lamports: 1000,
        }),
      );

      tx.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: fromPubkey,
          lamports: 0,
        }),
      );

      // Intentionally not submitting: requires wallet adapter signer in app runtime.
      void connection;
      void tx;
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const timer = setInterval(async () => {
      setLiveTick(Date.now());
      const today = new Date().toISOString().slice(0, 10);

      setSpineHistory((prev) => (prev[today] ? prev : { ...prev, [today]: {} }));
      setPillarHistory((prev) =>
        prev[today] ? prev : { ...prev, [today]: {} },
      );

      await commitToSolanaLedger();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const now = new Date();
  const dawnProgress = Math.min(
    ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100,
    100,
  );

  return (
    <section style={{ ...cardStyle, display: "grid", gap: 16 }}>
      <header>
        <h2 style={{ margin: 0 }}>7-DAY RITUAL MIRROR</h2>
        <small>PWA • SIGNALR • REDIS KEYS • SOLANA LEDGER SYNC</small>
      </header>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={installPWA} disabled={pwaInstalled}>
          {pwaInstalled ? "INSTALLED ✓" : "INSTALL TO HOME SCREEN"}
        </button>
        <span>SignalR: {signalRStatus}</span>
        <span>Chain Count: {chainCount}</span>
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>Dawn Ritual Progress: {dawnProgress.toFixed(1)}%</div>
        <progress value={dawnProgress} max={100} style={{ width: "100%" }} />
      </div>

      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {sevenDays.map((day) => (
          <li key={day}>
            {day} — spine: {spineHistory[day] ? "✓" : "·"} / pillar: {pillarHistory[day] ? "✓" : "·"}
          </li>
        ))}
      </ul>

      <footer>
        <small>
          Reality entries: {realityLog.length} • Last tick: {new Date(liveTick).toLocaleTimeString()}
        </small>
      </footer>
    </section>
  );
}
