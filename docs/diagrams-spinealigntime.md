# SpineAlignTime Diagrams

## Mermaid Architecture Diagram
```mermaid
flowchart TD
  subgraph EXT[External Realms]
    E1[Email Handlers]
    E2[SignalR Hub]
    E3[External APIs]
  end

  subgraph INTEGRATION[Integration Layer]
    I1[emailIngestion.ts]
    I2[signalRListener.ts / signalRBroadcast.ts]
    I3[externalDataIngestion.ts]
  end

  subgraph BRIDGE[LedgerBridge]
    B1[getLedgerDispatch()]
    B2[setLedgerDispatch()]
  end

  subgraph CONTEXT[LedgerContext]
    C1[ledgerReducer]
    C2[Sacred State (Ledger)]
    C3[dispatch: INGEST_BID, DIGEST_GHOST, EVOLVE_SYSTEM]
  end

  subgraph APP[PhoenixFly Shell]
    A1[Dashboard]
    A2[SpineAlign]
    A3[Time Auction]
    A4[Tribes]
    A5[School]
    A6[Phoenix Chain]
  end

  EXT --> INTEGRATION
  INTEGRATION --> BRIDGE
  BRIDGE --> CONTEXT
  CONTEXT --> APP
  APP --> INTEGRATION
  I2 -->|NewBid| CONTEXT
  CONTEXT -->|UpdatedBidBroadcast| I2
```

## Sequence Diagram
1. Startup: `LedgerProvider` mounts -> `setLedgerDispatch(dispatch)`.
2. SignalR init: `initializeSignalRConnection()` calls `getLedgerDispatch()` and registers handlers.
3. Inbound: SignalR `NewBid` -> listener validates -> `dispatch({ type: 'INGEST_BID', payload })`.
4. Reducer: `ledgerReducer` updates state -> side effect triggers `emitCeremony('UpdatedBidBroadcast', payload)`.
5. Outbound: `signalRBroadcast.invoke('UpdatedBidBroadcast', payload)` -> external nodes sync.
