#!/usr/bin/env node
/**
 * Claude Code Stop hook: run the project's tests before the agent finishes.
 *
 * Only fires when package.json has a "test" script. Set TEST_ON_STOP=0 to
 * disable. If the payload says stop_hook_active, exit immediately to avoid a
 * loop.
 *
 * Exit 2 sends the failure back to the model and asks it to continue.
 */
const fs = require("fs");
const { spawnSync } = require("child_process");

if (process.env.TEST_ON_STOP === "0") process.exit(0);

function read() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

const payload = read();
if (payload.stop_hook_active) process.exit(0);

if (!fs.existsSync("package.json")) process.exit(0);

let pkg;
try {
  pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
} catch {
  process.exit(0);
}

if (!pkg.scripts || !pkg.scripts.test || /no test specified/i.test(pkg.scripts.test)) {
  process.exit(0);
}

const result = spawnSync("npm", ["test", "--silent"], {
  encoding: "utf8",
  timeout: 120000,
  env: { ...process.env, CI: "1" },
});

if (result.status === 0) process.exit(0);

const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim().slice(-2000);
process.stderr.write(`Tests failed. Fix them before finishing.\n\n${output}\n`);
process.exit(2);
