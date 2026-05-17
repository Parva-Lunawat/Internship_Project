import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));

const defaultScenarios = [
  "public_blogs",
  "blog_detail",
  "login_burst",
  "write_burst",
  "upload_burst",
  "comment_creation_burst",
  "comment_listing",
  "mixed_traffic",
];

const scenarios = (process.env.SCENARIOS || defaultScenarios.join(","))
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

const outDir = resolve(scriptDir, process.env.OUT_DIR || "bench-results");
mkdirSync(outDir, { recursive: true });

function runScenario(name) {
  const scenarioPath = join(scriptDir, "scenarios", `${name}.mjs`);
  const moduleUrl = pathToFileURL(scenarioPath);
  moduleUrl.searchParams.set("run", `${Date.now()}-${name}`);

  const previousOutfile = process.env.OUTFILE;
  process.env.OUTFILE = join(outDir, `${name}.json`);

  return import(moduleUrl.href).finally(() => {
    if (typeof previousOutfile === "string") {
      process.env.OUTFILE = previousOutfile;
    } else {
      delete process.env.OUTFILE;
    }
  });
}

for (const name of scenarios) {
  // eslint-disable-next-line no-console
  console.log(`Running ${name}...`);
  // eslint-disable-next-line no-await-in-loop
  await runScenario(name);
}

// eslint-disable-next-line no-console
console.log(`Saved summaries to ${outDir}/`);

