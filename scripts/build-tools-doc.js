#!/usr/bin/env node

/**
 * Generate tools/README.md from registry/tools.json.
 * The JSON is canonical; the markdown is a view. Never hand-edit the output.
 *
 * Usage: node scripts/build-tools-doc.js [--check]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "registry", "tools.json");
const OUT = path.join(ROOT, "tools", "README.md");
const data = JSON.parse(fs.readFileSync(SRC, "utf8"));

const esc = (value) => String(value).replace(/\|/g, "\\|");

function jsonSnippet(tool, indent = "  ") {
  const lines = [
    "{",
    `${indent}"mcpServers": {`,
    `${indent}  "${tool.id}": {`,
    `${indent}    "command": "${tool.command[0]}",`,
    `${indent}    "args": ${JSON.stringify(tool.command.slice(1))}`,
  ];
  if (tool.env.length) {
    lines.push(`${indent}    ,"env": { ${tool.env.map((key) => `"${key}": "\${${key}}"`).join(", ")} }`);
  }
  lines.push(`${indent}  }`, `${indent}}`, "}");
  return "```json\n" + lines.join("\n") + "\n```";
}

function opencodeSnippet(tool) {
  const config = {
    mcp: {
      [tool.id]: {
        type: "local",
        command: tool.command,
        enabled: true,
        ...(tool.env.length
          ? { environment: Object.fromEntries(tool.env.map((key) => [key, `{env:${key}}`])) }
          : {}),
      },
    },
  };
  return "```json\n" + JSON.stringify(config, null, 2) + "\n```";
}

function codexSnippet(tool) {
  const lines = [
    `[mcp_servers.${tool.id}]`,
    `command = "${tool.command[0]}"`,
    `args = ${JSON.stringify(tool.command.slice(1))}`,
  ];
  if (tool.env.length) {
    lines.push(`env = { ${tool.env.map((key) => `${key} = "\${${key}}"`).join(", ")} }`);
  }
  return "```toml\n" + lines.join("\n") + "\n```";
}

const categories = [...new Set(data.tools.map((tool) => tool.category))];
const lines = [
  "# Tools",
  "",
  "MCP servers worth wiring into an agent, grouped by what they are for. Each entry has a",
  "one-paragraph use case, an install command, and config for Claude Code, Cursor,",
  "Codex, Gemini CLI and OpenCode.",
  "",
  "This file is generated from [`registry/tools.json`](../registry/tools.json). Edit the JSON, not this page.",
  "",
  `**${data.tools.length} tools · ${categories.length} categories**`,
  "",
  "> **Token cost is real.** Every MCP server you enable adds tool definitions to the",
  "> model's context. Enable one or two per task, not the whole list. Prefer read-only",
  "> scopes and project-scoped tokens.",
  "",
  "## Categories",
  "",
  categories.map((cat) => `- [${cat}](#${cat.replace(/[^a-z0-9]+/gi, "-").toLowerCase()})`).join("\n"),
  "",
  "---",
  "",
];

for (const category of categories) {
  lines.push(`## ${category}`, "");
  for (const tool of data.tools.filter((t) => t.category === category)) {
    lines.push(
      `### ${tool.name}`,
      "",
      `**${tool.description}**  `,
      `[${tool.url.replace("https://github.com/", "")}](${tool.url}) · ${tool.license}`,
      "",
      tool.when_to_use,
      "",
      "```bash",
      tool.install,
      "```",
      "",
      "<details><summary>Config for five clients</summary>",
      "",
      "**Claude Code** — `claude mcp add " + tool.id + " -- " + tool.command.join(" ") + "`, or `.mcp.json`:",
      "",
      jsonSnippet(tool),
      "",
      "**Cursor** — `.cursor/mcp.json`:",
      "",
      jsonSnippet(tool),
      "",
      "**Codex** — `~/.codex/config.toml`:",
      "",
      codexSnippet(tool),
      "",
      "**Gemini CLI** — `~/.gemini/settings.json`:",
      "",
      jsonSnippet(tool),
      "",
      "**OpenCode** — `opencode.json`:",
      "",
      opencodeSnippet(tool),
      "",
      "</details>",
      ""
    );
    if (tool.env.length) {
      lines.push(`> Requires: ${tool.env.map((key) => "`" + key + "`").join(", ")}. Use a scoped token.`, "");
    }
  }
}

lines.push(
  "---",
  "",
  "## Adding a tool",
  "",
  "1. Confirm the server exists, is maintained, and has a license.",
  "2. Add it to `registry/tools.json` with a real use case and a working install command.",
  "3. Run `node scripts/build-tools-doc.js` and commit both files.",
  ""
);

const output = lines.join("\n");
if (process.argv.includes("--check")) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (current !== output) {
    console.error("tools/README.md is stale. Run: node scripts/build-tools-doc.js");
    process.exit(1);
  }
  console.log("tools/README.md is up to date");
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, output);
console.log(`Wrote tools/README.md (${data.tools.length} tools, ${categories.length} categories)`);
