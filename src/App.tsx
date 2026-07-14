import { useState } from "react";
import { LedgerProvider, useLedger } from "./LedgerContext";
import "./styles.css";

const tabs = ["Zenith", "SpineAlign", "Fortress", "Time Auction", "Tribes", "School", "Ouroboros Ward"] as const;

type Tab = (typeof tabs)[number];

function Panel() {
  const [tab, setTab] = useState<Tab>("Zenith");
  const [memory, setMemory] = useState("");
  const ledger = useLedger();

  return <main className="shell">
    <header className="hero">
      <p className="eyebrow">JUSCR Sovereign Circuit</p>
      <h1>The Vertical Line Wins.</h1>
      <p>Encrypted ledger, mock Human Network VOPRF, threshold DKG simulation, and webhook-ready time-auction flows in one Vite app.</p>
      <code>Nullifier {ledger.nullifier.slice(0, 18)}… · localStorage: juscr.enc.v2</code>
    </header>

    <nav className="tabs">{tabs.map((t) => <button className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>{t}</button>)}</nav>

    <section className="grid">
      <article className="card wide">
        <h2>{tab}</h2>
        {tab === "Zenith" && <p>Dashboard pulse: {ledger.events.length} events, {ledger.bids.length} bids, {ledger.guardians.length || 0} guardian shares.</p>}
        {tab === "SpineAlign" && <button onClick={() => ledger.commit("SPINE_ALIGN", "Reality check passed across the 22-wheel frame")}>Commit alignment check</button>}
        {tab === "Fortress" && <p>AES-GCM persistence is active. Refresh and the recoverable encrypted state remains sealed behind the derived nullifier.</p>}
        {tab === "Time Auction" && <BidForm />}
        {tab === "Tribes" && <p>Tribe cells coordinate bids, school proofs, and memory imports while preserving sovereign local state.</p>}
        {tab === "School" && <button onClick={() => ledger.commit("SCHOOL_PROOF", "Lesson proof sealed into Ouroboros memory")}>Seal lesson proof</button>}
        {tab === "Ouroboros Ward" && <><textarea value={memory} onChange={(e) => setMemory(e.target.value)} placeholder="Import memory…" /><button onClick={() => ledger.importMemory(memory)}>Import memory</button></>}
      </article>

      <article className="card">
        <h3>Threshold DKG</h3>
        <p>t=4 / n=6 simulation activates after the fourth bid.</p>
        {ledger.guardians.map((g) => <small key={g.id}>{g.id}: {g.share.slice(0, 8)}…</small>)}
      </article>

      <article className="card events">
        <h3>Ouroboros Ledger</h3>
        {ledger.events.map((event) => <div key={event.id}><strong>{event.type}</strong><span>{event.detail}</span><time>{new Date(event.at).toLocaleString()}</time></div>)}
      </article>
    </section>
  </main>;
}

function BidForm() {
  const ledger = useLedger();
  const [amount, setAmount] = useState(111);
  const [bidder, setBidder] = useState("temple@juscr.local");
  return <form onSubmit={(e) => { e.preventDefault(); ledger.addBid({ source: "manual", amount, bidder }); }}>
    <input value={bidder} onChange={(e) => setBidder(e.target.value)} />
    <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
    <button>Ingest bid</button>
  </form>;
}

export default function App() {
  return <LedgerProvider><Panel /></LedgerProvider>;
}
