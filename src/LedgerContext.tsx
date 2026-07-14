import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { decryptState, deriveNullifier, encryptState, simulateDkg } from "./crypto";

export type LedgerEvent = { id: string; type: string; detail: string; at: string };
export type Bid = { id: string; source: "manual" | "email" | "ghost"; amount: number; bidder: string; at: string };
export type LedgerState = { events: LedgerEvent[]; bids: Bid[]; nullifier: string; guardians: ReturnType<typeof simulateDkg> };

type LedgerApi = LedgerState & {
  commit: (type: string, detail: string) => void;
  addBid: (bid: Omit<Bid, "id" | "at">) => void;
  importMemory: (text: string) => void;
};

const STORAGE_KEY = "juscr.enc.v2";
const DEFAULT_SEED = "vertical-line-wins";
const LedgerContext = createContext<LedgerApi | null>(null);

function initialState(nullifier: string): LedgerState {
  return {
    nullifier,
    guardians: [],
    bids: [],
    events: [{ id: crypto.randomUUID(), type: "GENESIS", detail: "JUSCR Sovereign Circuit initialized", at: new Date().toISOString() }],
  };
}

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LedgerState | null>(null);

  useEffect(() => {
    deriveNullifier(DEFAULT_SEED).then(async (nullifier) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setState(await decryptState<LedgerState>(stored, nullifier));
          return;
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setState(initialState(nullifier));
    });
  }, []);

  useEffect(() => {
    if (state) encryptState(state, state.nullifier).then((payload) => localStorage.setItem(STORAGE_KEY, payload));
  }, [state]);

  const api = useMemo<LedgerApi | null>(() => {
    if (!state) return null;
    const commit = (type: string, detail: string) => setState((s) => s && ({ ...s, events: [{ id: crypto.randomUUID(), type, detail, at: new Date().toISOString() }, ...s.events] }));
    return {
      ...state,
      commit,
      addBid: (bid) => setState((s) => s && ({
        ...s,
        bids: [{ ...bid, id: crypto.randomUUID(), at: new Date().toISOString() }, ...s.bids],
        events: [{ id: crypto.randomUUID(), type: "BID_INGESTED", detail: `${bid.source} bid from ${bid.bidder}: $${bid.amount}`, at: new Date().toISOString() }, ...s.events],
        guardians: s.guardians.length || s.bids.length + 1 < 4 ? s.guardians : simulateDkg(),
      })),
      importMemory: (text) => commit("MEMORY_IMPORT", text.slice(0, 180)),
    };
  }, [state]);

  if (!api) return <div className="boot">Deriving sovereign nullifier…</div>;
  return <LedgerContext.Provider value={api}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used inside LedgerProvider");
  return ctx;
}
