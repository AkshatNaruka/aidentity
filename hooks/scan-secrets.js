#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook: block writes that look like live credentials.
 *
 * Matches high-confidence shapes only. It is a seatbelt, not a secrets scanner:
 * pair it with a real scanner in CI.
 *
 * Exit 2 blocks the tool call.
 */
const fs = require("fs");

const PATTERNS = [
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key id"],
  [/\bASIA[0-9A-Z]{16}\b/, "AWS temporary access key"],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b/, "GitHub token"],
  [/\bgithub_pat_[A-Za-z0-9_]{40,}\b/, "GitHub fine-grained token"],
  [/\bsk-[A-Za-z0-9]{32,}\b/, "OpenAI-style secret key"],
  [/\bsk-ant-[A-Za-z0-9_-]{32,}\b/, "Anthropic API key"],
  [/\bxox[baprs]-[A-Za-z0-9-]{20,}\b/, "Slack token"],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, "Google API key"],
  [/-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, "private key block"],
];

function read() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

const payload = read();
const input = payload.tool_input || {};
const text = [input.content, input.new_string, input.command, input.file_text]
  .filter(Boolean)
  .join("\n");

if (!text) process.exit(0);

for (const [re, label] of PATTERNS) {
  if (re.test(text)) {
    process.stderr.write(
      `Blocked: the content looks like a ${label}. Use an environment variable or a secret manager. ` +
        `If this is a test fixture, use an obviously fake value.\n`
    );
    process.exit(2);
  }
}

process.exit(0);
