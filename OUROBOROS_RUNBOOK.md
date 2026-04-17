# Ouroboros Temple Operations Runbook

This runbook captures the activation and operations flow for the email-to-ceremony pipeline.

## 1) First Breath: Local Curl Activation Test

Use this command to verify end-to-end ingestion into `/api/ledgerbridge/email`:

```bash
curl -X POST http://localhost:5000/api/ledgerbridge/email \
  -H "Content-Type: application/json" \
  -d '{"fromName":"First Monitor","amount":4.20,"body":"A whisper from the old world"}'
```

### Expected behavior

- Flask receives a JSON POST at `POST /api/ledgerbridge/email`.
- Server broadcasts to connected WebSocket clients.
- The browser UI listener on `ws://localhost:5000` displays a success message.
- A new Auction bid appears with a generated `tripleEntryHash`.
- Idempotent consumer behavior suppresses duplicate ceremony records.

## 2) Eternal Whispers: Zapier Email Parser Wiring

Use this when moving from manual activation to continuous email ingestion.

1. Create a Zap in Zapier.
2. Trigger: **Email Parser by Zapier**.
3. Action: **Webhooks by Zapier** with `POST`.
4. URL: `http://<public-host>:5000/api/ledgerbridge/email`.
5. Payload type: `JSON`.
6. Map fields:
   - `fromName` -> parsed sender name
   - `amount` -> parsed bid amount
   - `body` -> parsed email body
7. Enable the Zap.

### Deployment note

For local development, expose the Flask service with a tunnel (for example `ngrok`) so Zapier can reach the webhook URL.

## 3) Recommended Sequence

1. Run the curl activation test first.
2. Confirm real-time UI update and ledger insertion.
3. Then enable Zapier for continuous operation.
4. After throughput confidence is established, proceed with Solana anchoring integration.

## 4) Solana Anchor Next Step (Stub-to-Live)

When ready to anchor ceremonies on-chain:

- Add `@solana/web3.js` to the runtime where the anchor function executes.
- Replace the stub with transaction build/sign/send flow.
- Persist transaction signature alongside `tripleEntryHash` for verifiable linkage.

## 5) Minimal Incident Checklist

If ceremonies do not appear in UI:

- Verify Flask server is running on port `5000`.
- Verify WebSocket clients are connected.
- Verify POST payload is valid JSON with required keys.
- Verify dedupe logic is not suppressing the event as a duplicate.
- Verify Zapier task history for webhook delivery errors.
