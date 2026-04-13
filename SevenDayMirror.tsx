import React, { useEffect, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useOuroborosState } from "./App";

type DayMap = Record<string, Record<string, boolean>>;
type RealityEntry = {
  id: string;
  at: number;
  source: "signalr" | "manual" | "system";
  message: string;
};

type SevenDayMirrorProps = {
  chainCount: number;
  setChainCount: React.Dispatch<React.SetStateAction<number>>;
};

const SEVEN_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return d.toISOString().slice(0, 10);
});

const shellStyle: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.12)",
  background:
    "linear-gradient(160deg, rgba(255,150,70,0.18) 0%, rgba(88,107,255,0.16) 50%, rgba(27,30,55,0.55) 100%)",
  color: "#fff",
  padding: 16,
  boxShadow: "0 20px 70px rgba(0,0,0,0.35)",
};

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: 12,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
};

export default function SevenDayMirror({ chainCount, setChainCount }: SevenDayMirrorProps) {
  const [spineHistory, setSpineHistory] = useOuroborosState<DayMap>("juscr_spine_history", {});
  const [pillarHistory, setPillarHistory] = useOuroborosState<DayMap>("juscr_pillar_history", {});
  const [realityLog, setRealityLog] = useOuroborosState<RealityEntry[]>("juscr_reality_log", []);
  const [liveTick, setLiveTick] = useState(Date.now());
  const [signalRStatus, setSignalRStatus] = useState<"disconnected" | "connected">("disconnected");

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const pushReality = (entry: Omit<RealityEntry, "id" | "at">) => {
    const next = { ...entry, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, at: Date.now() };
    setRealityLog((prev) => [next, ...prev].slice(0, 100));
  };

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://your-signalr.azurewebsites.net/hub/bidHub")
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection
      .start()
      .then(() => {
        setSignalRStatus("connected");
        pushReality({ source: "system", message: "SignalR cosmic hub connected" });
      })
      .catch((err) => {
        console.error("SignalR failed", err);
        pushReality({ source: "system", message: "SignalR connection failed; running local-only" });
      });

    connection.on("NewBid", (bid: unknown) => {
      const today = SEVEN_DAYS[6];
      setSpineHistory((prev) => ({
        ...prev,
        [today]: { ...(prev[today] || {}), [`external-${Date.now()}`]: true },
      }));
      pushReality({ source: "signalr", message: `Mirror ingested external bid: ${JSON.stringify(bid)}` });
      setChainCount((c) => c + 1);
    });

    connection.onclose(() => {
      setSignalRStatus("disconnected");
      pushReality({ source: "system", message: "SignalR disconnected" });
    });

    return () => {
      void connection.stop();
    };
  }, [setChainCount, setRealityLog, setSpineHistory]);

  const syncWithRedis = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/ledger/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spineHistory, pillarHistory, realityLog, chainCount }),
      });
      const synced = (await res.json()) as { success?: boolean };
      if (synced.success) {
        pushReality({ source: "system", message: "Redis Ouroboros sync complete" });
      }
    } catch {
      pushReality({ source: "system", message: "Offline mode active; localStorage remains sovereign" });
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
      void syncWithRedis();
    }, 60000);

    return () => clearInterval(interval);
  }, [pillarHistory, spineHistory]);

  const dawnProgress = useMemo(() => {
    const now = new Date();
    return Math.min((((now.getHours() * 60 + now.getMinutes()) / 1440) * 100), 100);
  }, [liveTick]);

  return (
    <section style={shellStyle}>
      <div
        style={{
          ...cardStyle,
          marginBottom: 12,
          background:
            "linear-gradient(90deg, rgba(255,180,112,0.33), rgba(155,108,255,0.24), rgba(96,242,220,0.23))",
          animation: "dawnPulse 5s ease-in-out infinite",
        }}
      >
        <div style={{ fontWeight: 700, letterSpacing: 1 }}>7-DAY RITUAL MIRROR</div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.92 }}>
          {signalRStatus.toUpperCase()} • REDIS SYNC • {new Date(liveTick).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div style={{ marginTop: 8, fontSize: 12 }}>Dawn pulse: {dawnProgress.toFixed(1)}%</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 10,
        }}
      >
        {SEVEN_DAYS.map((day, i) => {
          const spineDone = Object.values(spineHistory[day] || {}).filter(Boolean).length;
          const pillarDone = Object.values(pillarHistory[day] || {}).filter(Boolean).length;
          const isToday = i === 6;

          return (
            <article
              key={day}
              style={{
                ...cardStyle,
                borderColor: isToday ? "rgba(255,193,94,0.8)" : "rgba(255,255,255,0.18)",
              }}
            >
              <div style={{ fontWeight: 700 }}>{day.slice(5)}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{spineDone}/7 spine rites</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>{pillarDone} pillars</div>
            </article>
          );
        })}
      </div>

      <div style={{ ...cardStyle, marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Reality anchors</div>
        <div style={{ maxHeight: 180, overflowY: "auto", fontSize: 12, lineHeight: 1.5 }}>
          {realityLog.slice(0, 8).map((entry) => (
            <div key={entry.id}>
              {new Date(entry.at).toLocaleTimeString()} — [{entry.source}] {entry.message}
            </div>
          ))}
          {realityLog.length === 0 && <div>No echo left unheard.</div>}
        </div>
      </div>
    </section>
  );
}
