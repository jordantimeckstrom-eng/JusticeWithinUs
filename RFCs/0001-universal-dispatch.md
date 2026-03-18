# RFC 0001: Universal Dispatch Bridge and Triple-Entry Feedback Cycle

## Summary
Expose a global dispatch for non-UI processes and implement a Triple-Entry anchoring layer with SignalR inbound and outbound synchronization.

## Motivation
Webhooks, schedulers, listeners, and ingestion jobs need a safe path into application state. They must be able to mutate state, produce auditable receipts, and participate in the same ceremony stream as the UI.

## API

### LedgerBridge
- `setLedgerDispatch(dispatch: React.Dispatch<Action>): void`
- `getLedgerDispatch(): React.Dispatch<Action>`

### SignalR Listener
- `initializeSignalRConnection(hubUrl: string): HubConnection`
- On `NewBid` -> validate -> dedupe -> `dispatch({ type: 'INGEST_BID', payload })`

### SignalR Broadcaster
- `initializeSignalRBroadcast(hubUrl: string): Promise<void>`
- `emitCeremony(event: string, payload: unknown): Promise<void>`

## Reducer Side Effects
Recommended patterns:

1. A middleware-like wrapper such as `dispatchWithSideEffects(action)` that records the action for later broadcast.
2. A provider-level `useEffect` that watches `lastAction` and calls `emitCeremony()` after local state has been updated.

The goal is to keep the reducer pure while still making ceremonies externally visible.

## Triple-Entry Receipt
```ts
import { sha256 } from 'crypto-js';

function sortKeys(value: any): any {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeys(value[key]);
        return acc;
      }, {} as Record<string, unknown>);
  }
  return value;
}

function canonicalize(payload: any) {
  return JSON.stringify(sortKeys(payload));
}

function mkTripleEntryHash(payload: any) {
  const canonical = canonicalize(payload);
  const payloadHash = sha256(canonical).toString();
  const ts = new Date().toISOString();
  return `${Date.now().toString(36)}_${btoa(JSON.stringify({ payloadHash, ts }))}`;
}
```

## Persistence
- State key: `jwu-state-v1`
- Counter key: `jwu-chaincount-v1`
- Migration path: `migrateState(oldState, fromVersion, toVersion)`

## Security
- SignalR sessions should use JWT bearer tokens.
- Inbound webhooks should verify HMAC signatures.
- Exports should support AES-GCM encryption with a user passphrase.
- Reducers should reject unauthorized ceremonies through explicit guards.

## Tests
- **Unit**: reducer actions, canonicalization, receipt determinism.
- **Integration**: SignalR event -> dispatch -> state -> emitCeremony -> hub receives.
- **Chaos**: reconnects, duplicate deliveries, replay attempts.

## Deployment
- Host the SignalR hub on Azure SignalR or a self-hosted service with a Redis backplane.
- In CI, run migration tests and SignalR contract tests.

## Migration Guidance
1. Introduce typed actions before exposing `getLedgerDispatch()` broadly.
2. Add deduplication and idempotency checks before enabling external ingestion.
3. Roll out anchor persistence as an additive field to avoid breaking existing state snapshots.
