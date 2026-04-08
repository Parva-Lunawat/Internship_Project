import { runScenario } from "../lib/scenario.mjs";
import { timedFetch } from "../lib/http.mjs";

await runScenario({
  scenario: "public_blogs",
  worker: async (ctx) => {
    const url = `${ctx.baseUrl}/blogs?page=1&pageSize=6`;
    const { res, durationMs } = await timedFetch(url, { method: "GET" });
    return { ok: res.ok, durationMs };
  },
});

