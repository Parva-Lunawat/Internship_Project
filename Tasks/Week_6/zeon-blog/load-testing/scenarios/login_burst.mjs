import { runScenario } from "../lib/scenario.mjs";
import { createCookieJar, getEnvString, readJsonSafe, timedFetch } from "../lib/http.mjs";

function strongPassword() {
  return getEnvString("PASSWORD", "Codal@123");
}

function email() {
  return getEnvString("EMAIL", "bench-user@zeon.local");
}

async function ensureUser(baseUrl) {
  // Signup is idempotent for our needs; ignore "already exists".
  const url = `${baseUrl}/auth/signup`;
  await timedFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Benchmark User",
      email: email(),
      password: strongPassword(),
      confirmPassword: strongPassword(),
    }),
  }).catch(() => {});
}

await runScenario({
  scenario: "login_burst",
  setup: async (ctx) => {
    await ensureUser(ctx.baseUrl);
  },
  worker: async (ctx) => {
    const jar = createCookieJar();
    const url = `${ctx.baseUrl}/auth/login`;
    const { res, durationMs } = await timedFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email(), password: strongPassword() }),
    });

    // Keep cookie parsing to confirm real auth, but do not reuse jar across requests
    // so this scenario measures full login work.
    jar.setFromSetCookie(res.headers.get("set-cookie"));
    const payload = await readJsonSafe(res);
    const ok = res.ok && Boolean(payload?.data?.accessToken || jar.header());
    return { ok, durationMs };
  },
});

