#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook: block destructive shell commands.
 *
 * Wire it for the Bash matcher in .claude/settings.json:
 *   "command": "node hooks/block-dangerous.js"
 *
 * Reads the hook payload from stdin. Exit 2 blocks the tool call and sends
 * stderr back to the model. Exit 0 allows it.
 */
const fs = require("fs");

const PATTERNS = [
  { re: /\brm\s+(-[a-z]*[rf][a-z]*\s+)+(\/|~|\$HOME)(\s|$)/i, why: "recursive delete of home or root" },
  { re: /\bgit\s+push\b[^\n]*(\s--force\b|\s-f\b)/i, why: "force push" },
  { re: /\bgit\s+reset\s+--hard\b/i, why: "hard reset discards uncommitted work" },
  { re: /\bgit\s+clean\s+-[a-z]*[fd]/i, why: "git clean deletes untracked files" },
  { re: /\b(DROP|TRUNCATE)\s+(TABLE|DATABASE|SCHEMA)\b/i, why: "destructive SQL" },
  { re: /:\(\)\s*\{\s*:\|:&\s*\};:/, why: "fork bomb" },
  { re: /\bcurl\b[^\n|]*\|\s*(sh|bash|zsh)\b/i, why: "piping a remote script into a shell" },
  { re: /\bmkfs(\.\w+)?\s+\/dev\//i, why: "filesystem format" },
  { re: /\bdd\b[^\n]*\bof=\/dev\//i, why: "raw write to a device" },
  { re: /\bchmod\s+-R\s+777\s+\//i, why: "world-writable root" },
];

function read() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

const payload = read();
const command = (payload.tool_input && payload.tool_input.command) || "";

for (const { re, why } of PATTERNS) {
  if (re.test(command)) {
    process.stderr.write(
      `Blocked: ${why}.\nCommand: ${command}\nIf this is intentional, run it yourself outside the agent.\n`
    );
    process.exit(2);
  }
}

process.exit(0);
