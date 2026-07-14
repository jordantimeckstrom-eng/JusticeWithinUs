import http from "node:http";

const port = Number(process.env.PORT ?? 8787);
const events = [];

function send(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "Content-Type, Authorization",
    "access-control-allow-methods": "GET, POST, OPTIONS",
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true, service: "juscr-sovereign-circuit" });
  if (req.method === "GET" && req.url === "/external-data") return send(res, 200, { at: new Date().toISOString(), bids: events.length });
  if (req.method === "POST" && req.url === "/email-webhook") {
    try {
      const body = await readJson(req);
      const amount = Number(body.amount ?? body.bid ?? 0);
      const bidder = String(body.from ?? body.email ?? "unknown");
      const event = { id: crypto.randomUUID(), source: "email", amount, bidder, receivedAt: new Date().toISOString(), raw: body };
      events.push(event);
      return send(res, 202, { accepted: true, event });
    } catch (error) {
      return send(res, 400, { accepted: false, error: error instanceof Error ? error.message : "invalid json" });
    }
  }
  send(res, 404, { error: "not found" });
});

server.listen(port, () => console.log(`JUSCR webhook server listening on :${port}`));
