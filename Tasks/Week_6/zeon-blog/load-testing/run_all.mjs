import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const scenarios = [
  "public_blogs",
  "blog_detail",
  "login_burst",
  "write_burst",
  "upload_burst",
  "mixed_traffic",
];

const outDir = process.env.OUT_DIR || "bench-results";
mkdirSync(outDir, { recursive: true });

function runScenario(name) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join("load-testing", "scenarios", `${name}.mjs`)], {
      stdio: ["ignore", "pipe", "inherit"],
      env: process.env,
    });

    let stdout = "";
    child.stdout.on("data", (d) => (stdout += d.toString("utf8")));

    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(`${name} exited with code ${code}`));
      const line = stdout.trim().split("\n").pop();
      if (!line) return reject(new Error(`${name} produced no output`));
      writeFileSync(join(outDir, `${name}.json`), `${line}\n`, "utf8");
      resolve();
    });
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

