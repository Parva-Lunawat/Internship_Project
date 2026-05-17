import { runScenario } from "../lib/scenario.mjs";
import { timedFetch } from "../lib/http.mjs";

await runScenario({
  scenario: "public_blogs",
  setup: async (ctx) => {
    if (process.env.SITE_URL) {
      ctx.baseUrl = ctx.siteUrl;
    }
  },
  worker: async (ctx) => {
    const url = process.env.SITE_URL
      ? `${ctx.siteUrl}/blogs?page=1`
      : `${ctx.apiBaseUrl}/blogs?page=1&pageSize=6`;
    const { res, durationMs } = await timedFetch(url, { method: "GET" });
    return { ok: res.ok, durationMs };
  },
});

