// PoC for the saju-pillars-v1 HTTP contract.
// Mirrors api/saju-pillars.ts but runs over a local http server so the contract
// can be exercised end-to-end without a Vercel deploy.
//
// Usage (build saju-core first so dist exists):
//   npm run build --workspace @saju-lab/saju-core
//   node scripts/poc-saju-pillars.mjs
//
// Optional: set SAJU_API_KEY to require an x-api-key header.

import http from "node:http";
import crypto from "node:crypto";
import { buildSajuPillarsV1Response } from "../packages/saju-core/dist/index.js";

function apiKeyMatches(expected, provided) {
  if (!provided) return false;
  const a = crypto.createHash("sha256").update(expected).digest();
  const b = crypto.createHash("sha256").update(provided).digest();
  return crypto.timingSafeEqual(a, b);
}

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ contract: "saju-pillars-v1", error: { code: "METHOD_NOT_ALLOWED", message: "Use POST." } }));
    return;
  }
  const requiredKey = process.env.SAJU_API_KEY;
  if (requiredKey && !apiKeyMatches(requiredKey, req.headers["x-api-key"])) {
    res.statusCode = 401;
    res.end(JSON.stringify({ contract: "saju-pillars-v1", error: { code: "UNAUTHORIZED", message: "Missing or invalid x-api-key." } }));
    return;
  }
  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    let body;
    try {
      body = JSON.parse(raw || "null");
    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({ contract: "saju-pillars-v1", error: { code: "INVALID_BODY", message: "Body must be valid JSON." } }));
      return;
    }
    const result = buildSajuPillarsV1Response(body);
    res.statusCode = result.status;
    res.end(JSON.stringify(result.ok ? result.data : result.error));
  });
});

async function call(port, payload) {
  const response = await fetch(`http://127.0.0.1:${port}/api/saju-pillars`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  return { status: response.status, body: await response.json() };
}

server.listen(0, async () => {
  const { port } = server.address();
  const valid = await call(port, {
    birthDate: "1990-01-01",
    birthTime: "10:30",
    calendar: "solar",
    timezone: "Asia/Seoul",
    sex: "male"
  });
  const lunar = await call(port, {
    birthDate: "1990-01-01",
    birthTime: "10:30",
    calendar: "lunar",
    sex: "male"
  });

  console.log("# valid request → status", valid.status);
  console.log(JSON.stringify(valid.body, null, 2));
  console.log("\n# lunar request → status", lunar.status);
  console.log(JSON.stringify(lunar.body, null, 2));

  server.close();
});
