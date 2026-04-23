import { runScenario } from "../lib/scenario.mjs";
import { Blob } from "node:buffer";
import { createCookieJar, getEnvString, readJsonSafe, timedFetch } from "../lib/http.mjs";

function strongPassword() {
  return getEnvString("PASSWORD", "Codal@123");
}

function email() {
  return getEnvString("EMAIL", "bench-uploader@zeon.local");
}

async function authCookie(baseUrl) {
  const jar = createCookieJar();
  await timedFetch(`${baseUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Benchmark Uploader",
      email: email(),
      password: strongPassword(),
      confirmPassword: strongPassword(),
    }),
  }).catch(() => {});

  const { res } = await timedFetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email(), password: strongPassword() }),
  });
  jar.setFromSetCookie(res.headers.get("set-cookie"));
  return jar.header();
}

function tinyPngBytes() {
  // 1x1 transparent PNG
  const b64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBAf8X7nYAAAAASUVORK5CYII=";
  return Buffer.from(b64, "base64");
}

await runScenario({
  scenario: "upload_burst",
  setup: async (ctx) => {
    ctx.cookie = await authCookie(ctx.baseUrl);
  },
  worker: async (ctx) => {
    const url = `${ctx.baseUrl}/uploads`;
    const form = new FormData();
    form.append("file", new Blob([tinyPngBytes()], { type: "image/png" }), "bench.png");

    const { res, durationMs } = await timedFetch(url, {
      method: "POST",
      headers: { Cookie: ctx.cookie },
      body: form,
    });
    const payload = await readJsonSafe(res);
    const ok = res.ok && Boolean(payload?.url || payload?.data?.url);
    return { ok, durationMs };
  },
});

