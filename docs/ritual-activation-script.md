# SpineAlignTime Ritual Activation Script

## Preconditions
- `LedgerProvider` is mounted and `setLedgerDispatch()` has been called.
- SignalR inbound and outbound connections are configured and authenticated.
- Scheduler support is enabled.

## Activation Steps
1. **Genesis Block**
   ```js
   createGenesisBlock({ ts: new Date().toISOString(), data: 'Genesis' });
   ```
2. **Dawn Signal**
   Dispatch `INCREMENT_DAWN` at 06:00 local time.
3. **Seed Ingest**
   Call `ingestFromExternalAPI(seedEndpoint)` to populate initial bids.
4. **Anchor Proof**
   For each new `tripleEntryHash`, call `anchorOnChain(tripleEntryHash)`.
5. **Broadcast**
   Emit `SystemEvolutionEvent` with `description: 'Temple Activated'`.
6. **Onboard**
   Push Lesson 1 to new participants.

## Verification
- Confirm `state.bids.length > 0`.
- Confirm anchor receipts are present and `anchored === true` for sample entries.
- Confirm the SignalR hub received `UpdatedBidBroadcast`.
