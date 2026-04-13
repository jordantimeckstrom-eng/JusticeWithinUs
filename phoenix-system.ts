import express from "express";

const app = express();
app.use(express.json());

app.post("/api/ledger/sync", async (req, res) => {
  // TODO: forward payload to the real OuroborosManager persistence layer.
  console.log("🪞 Mirror requested Redis sync", {
    at: new Date().toISOString(),
    payloadKeys: Object.keys(req.body || {}),
  });

  res.json({ success: true, timestamp: Date.now() });
});

const port = Number(process.env.PHOENIX_API_PORT || 3001);
app.listen(port, () => {
  console.log(`🔥 Phoenix API listening on ${port} — universal access`);
});
