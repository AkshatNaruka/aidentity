#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook: format the file that was just written.
 *
 * Only runs a formatter that is already installed in the project. Missing
 * formatters are skipped silently — a hook must never break an edit.
 *
 * Exit 0 always.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function read() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

const payload = read();
const file = payload.tool_input && (payload.tool_input.file_path || payload.tool_input.path);
if (!file || !fs.existsSync(file)) process.exit(0);

const root = process.cwd();
const localBin = (name) => {
  const candidate = path.join(root, "node_modules", ".bin", name);
  return fs.existsSync(candidate) ? candidate : null;
};

const ext = path.extname(file).toLowerCase();
let command = null;
let args = [file];

if ([".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss", ".md", ".yaml", ".yml", ".html"].includes(ext)) {
  const prettier = localBin("prettier");
  if (prettier) {
    command = prettier;
    args = ["--write", file];
  }
} else if (ext === ".py") {
  const ruff = localBin("ruff");
  if (ruff) {
    command = ruff;
    args = ["format", file];
  }
} else if (ext === ".go") {
  command = "gofmt";
  args = ["-w", file];
} else if (ext === ".rs") {
  command = "rustfmt";
  args = [file];
}

if (!command) process.exit(0);

const result = spawnSync(command, args, { stdio: "ignore", timeout: 15000 });
if (result.error) process.exit(0);
process.exit(0);
