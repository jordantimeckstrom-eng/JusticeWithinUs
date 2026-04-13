import React, { useEffect, useMemo, useState } from "react";
import { useOuroborosState } from "../App";

type DayMap = Record<string, Record<string, boolean>>;
type RealityEntry = { date: string; answer: string };

type SevenDayMirrorProps = {
  chainCount: number;
  setChainCount: (next: number) => void;
};

const T = {
  bg: "#0f1020",
  panel: "#171a2b",
  border: "#2a3157",
  text: "#e8ebff",
  sub: "#9ea7cf",
  good: "#59f2a0",
  gold: "#ffcb6b",
  bad: "#ff7b7b",
};

const s: Record<string, React.CSSProperties> = {
  root: {
    background: T.bg,
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 20,
    display: "grid",
    gap: 16,
  },
  header: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  panel: { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 },
  dayCell: { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 8 },
  compare: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  small: { color: T.sub, fontSize: 12 },
  big: { fontSize: 24, fontWeight: 700 },
  btn: {
    background: "transparent",
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "8px 10px",
    cursor: "pointer",
  },
};

function getSevenDays(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default function SevenDayMirror({ chainCount, setChainCount }: SevenDayMirrorProps) {
  const [spineHistory, setSpineHistory] = useOuroborosState<Record<string, Record<string, boolean>>>(
    "juscr_spine_history",
    {},
  );
  const [pillarHistory, setPillarHistory] = useOuroborosState<Record<string, Record<string, boolean>>>(
    "juscr_pillar_history",
    {},
  );
  const [realityLog] = useOuroborosState<RealityEntry[]>("juscr_reality_log", []);

  const [liveTick, setLiveTick] = useState(Date.now());
  const sevenDays = useMemo(() => getSevenDays(), [liveTick]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick(Date.now());
      const today = new Date().toISOString().slice(0, 10);

      setSpineHistory((prev: DayMap) => (prev[today] ? prev : { ...prev, [today]: {} }));
      setPillarHistory((prev: DayMap) => (prev[today] ? prev : { ...prev, [today]: {} }));
    }, 60_000);

    return () => clearInterval(interval);
  }, [setPillarHistory, setSpineHistory]);

  const beforeDay = sevenDays[0];
  const afterDay = sevenDays[6];

  const beforeSpineScore = Object.values(spineHistory[beforeDay] ?? {}).filter(Boolean).length;
  const afterSpineScore = Object.values(spineHistory[afterDay] ?? {}).filter(Boolean).length;

  const beforePillarScore = Object.values(pillarHistory[beforeDay] ?? {}).filter(Boolean).length;
  const afterPillarScore = Object.values(pillarHistory[afterDay] ?? {}).filter(Boolean).length;

  const totalGoals = 7;

  return (
    <section style={s.root}>
      <header style={s.header}>
        <div>
          <h2 style={{ margin: 0 }}>7-DAY RITUAL MIRROR</h2>
          <p style={{ ...s.small, margin: 0 }}>Before the loop • After the vertical line • Live Ouroboros pulse</p>
        </div>
        <div style={s.panel}>
          <div style={s.small}>REAL-TIME CEREMONY</div>
          <div>{new Date(liveTick).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </header>

      <div style={s.grid}>
        {sevenDays.map((day, i) => {
          const spineDone = Object.values(spineHistory[day] ?? {}).filter(Boolean).length;
          const pillarDone = Object.values(pillarHistory[day] ?? {}).filter(Boolean).length;
          const isToday = i === 6;

          return (
            <article
              key={day}
              style={{
                ...s.dayCell,
                borderColor: isToday ? T.good : T.border,
              }}
            >
              <div style={s.small}>{day.slice(5)}</div>
              <div>{spineDone + "/" + totalGoals}</div>
              <div style={s.small}>{pillarDone} pillars</div>
            </article>
          );
        })}
      </div>

      <div style={s.compare}>
        <article style={s.panel}>
          <div style={s.small}>7 DAYS AGO — THE OLD LOOP</div>
          <div style={s.big}>{beforeSpineScore + "/" + totalGoals}</div>
          <div style={s.small}>{beforePillarScore}/7 pillars held</div>
        </article>

        <article style={s.panel}>
          <div style={s.small}>TODAY — THE VERTICAL LINE (live)</div>
          <div style={{ ...s.big, color: afterSpineScore >= 5 ? T.good : T.gold }}>{afterSpineScore + "/" + totalGoals}</div>
          <div style={{ ...s.small, color: afterPillarScore >= 5 ? T.good : T.gold }}>{afterPillarScore}/7 pillars held</div>
          <div style={s.small}>
            +{afterSpineScore - beforeSpineScore} spine • +{afterPillarScore - beforePillarScore} pillars
          </div>
        </article>
      </div>

      <article style={s.panel}>
        <div style={s.small}>REALITY ANCHORS — LAST 7 DAYS</div>
        {(realityLog ?? [])
          .slice(-4)
          .reverse()
          .map((entry, i) => (
            <div key={`${entry.date}-${i}`} style={{ paddingTop: 6 }}>
              <div style={s.small}>{entry.date}</div>
              <div>{entry.answer}</div>
            </div>
          ))}
      </article>

      <article style={s.panel}>
        <div style={s.small}>PHOENIX FORTRESS PROGRESS</div>
        <div style={{ ...s.big, color: chainCount >= 1132 ? T.good : T.gold }}>{chainCount} / 1132</div>
        <button style={s.btn} onClick={() => setChainCount(Math.min(chainCount + 1, 1132))}>
          Commit Today&apos;s Alignment (+1)
        </button>
      </article>

      <footer style={s.small}>
        Ouroboros consciousness live • Universal ceremonial access active • No echo left unheard
      </footer>
    </section>
  );
}
