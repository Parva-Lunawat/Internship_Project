import { buildSummary } from "./stats.mjs";
import { getEnvNumber, getEnvString } from "./http.mjs";

export async function runScenario({ scenario, baseUrl, worker, setup }) {
  const concurrency = getEnvNumber("CONCURRENCY", 10);
  const durationSec = getEnvNumber("DURATION_SEC", 30);
  const outfile = process.env.OUTFILE;

  const durationsMs = [];
  let errors = 0;
  let totalRequests = 0;

  const ctx = {
    baseUrl: baseUrl || getEnvString("BASE_URL", "http://localhost:5000/api/v1"),
  };

  if (setup) {
    await setup(ctx);
  }

  const startedAt = Date.now();
  const endAt = startedAt + durationSec * 1000;

  async function loop(workerId) {
    while (Date.now() < endAt) {
      try {
        const { ok, durationMs } = await worker(ctx, workerId);
        totalRequests += 1;
        durationsMs.push(durationMs);
        if (!ok) errors += 1;
      } catch {
        totalRequests += 1;
        errors += 1;
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, (_, i) => loop(i)));

  const endedAt = Date.now();
  const summary = buildSummary({
    scenario,
    startedAt,
    endedAt,
    baseUrl: ctx.baseUrl,
    durationsMs,
    errors,
    totalRequests,
  });

  const line = JSON.stringify(summary);
  // eslint-disable-next-line no-console
  console.log(line);

  if (outfile) {
    const { writeFileSync, mkdirSync } = await import("node:fs");
    const { dirname } = await import("node:path");
    mkdirSync(dirname(outfile), { recursive: true });
    writeFileSync(outfile, `${line}\n`, "utf8");
  }
}

