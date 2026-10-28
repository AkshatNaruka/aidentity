#!/usr/bin/env node
/**
 * Aidentity MCP server (stdio, zero dependencies).
 *
 * Tools:
 *   search_skills(query, limit)
 *   recommend(task, limit)
 *   get_skill(id)
 *   list_bundles()
 *   install_skill(id, platform, global, dry_run)
 *
 * Install is dry-run unless dry_run is explicitly false.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { registry, bundles, search, recommend } = require("./lib/recommend");

const ROOT = path.join(__dirname, "..");
const PLATFORMS = {
  claude: ".claude/skills",
  cursor: ".cursor/skills",
  codex: ".codex/skills",
  gemini: ".gemini/skills",
  opencode: ".opencode/skills",
  copilot: ".github/skills",
};

const TOOLS = [
  {
    name: "search_skills",
    description: "Search the Aidentity index of AI agent skills by task, technology or keyword.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What you need, e.g. 'postgres migrations' or 'code review'" },
        limit: { type: "number", description: "Max results (default 8)" },
      },
      required: ["query"],
    },
  },
  {
    name: "recommend",
    description: "Recommend a bundle and specific skills for a task.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string" },
        limit: { type: "number" },
      },
      required: ["task"],
    },
  },
  {
    name: "get_skill",
    description: "Get one skill with metadata and its full SKILL.md instructions.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "Skill id, e.g. mattpocock/engineering/code-review" } },
      required: ["id"],
    },
  },
  {
    name: "list_bundles",
    description: "List task-based install sets.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "install_skill",
    description:
      "Install a hosted skill into an agent's skills directory. Dry-run by default; pass dry_run:false to write.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        platform: { type: "string", enum: Object.keys(PLATFORMS) },
        global: { type: "boolean", description: "Install into the home directory instead of the project" },
        dry_run: { type: "boolean", description: "Default true" },
      },
      required: ["id", "platform"],
    },
  },
];

function getSkill(id) {
  const skill = registry.skills.find((entry) => entry.id === id);
  if (!skill) throw new Error(`unknown skill id: ${id}`);
  let content = null;
  if (skill.distributable && skill.path) {
    const file = path.join(ROOT, skill.path);
    if (fs.existsSync(file)) content = fs.readFileSync(file, "utf8");
  }
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    tags: skill.tags,
    status: skill.status,
    license: skill.source.license,
    source: skill.source.repo,
    install: skill.install,
    page: `https://akshatnaruka.github.io/aidentity/skills/${skill.id}/`,
    upstream: skill.upstream ? skill.upstream.url : skill.source.url,
    content,
  };
}

function installSkill({ id, platform, global = false, dry_run = true }) {
  if (!PLATFORMS[platform]) throw new Error(`platform must be one of: ${Object.keys(PLATFORMS).join(", ")}`);
  const skill = registry.skills.find((entry) => entry.id === id);
  if (!skill) throw new Error(`unknown skill id: ${id}`);
  if (!skill.distributable || !skill.path) {
    throw new Error(`${id} is index-only (${skill.source.license}); install it from ${skill.upstream ? skill.upstream.url : skill.source.url}`);
  }
  const base = global
    ? path.join(process.env.HOME || process.env.USERPROFILE, PLATFORMS[platform])
    : path.join(process.cwd(), PLATFORMS[platform]);
  const destination = path.join(base, path.basename(skill.id));
  if (dry_run) return { dry_run: true, source: path.dirname(skill.path), destination, skill: skill.id };
  if (fs.existsSync(destination)) throw new Error(`${destination} already exists`);
  fs.mkdirSync(base, { recursive: true });
  fs.cpSync(path.join(ROOT, path.dirname(skill.path)), destination, { recursive: true });
  return { dry_run: false, installed: skill.id, destination };
}

function callTool(name, args = {}) {
  switch (name) {
    case "search_skills":
      return search(args.query || "", args.limit || 8);
    case "recommend":
      return recommend(args.task || "", args.limit || 5);
    case "get_skill":
      return getSkill(args.id);
    case "list_bundles":
      return bundles.map((bundle) => ({
        slug: bundle.slug,
        name: bundle.name,
        description: bundle.description,
        skills: bundle.skills.length,
        install: `node scripts/install.js ${bundle.slug} --platform <name>`,
      }));
    case "install_skill":
      return installSkill(args);
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

function send(message) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line) => {
  const text = line.trim();
  if (!text) return;
  let request;
  try {
    request = JSON.parse(text);
  } catch {
    send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } });
    return;
  }
  const { id, method, params } = request;
  if (method === "initialize") {
    send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: params?.protocolVersion || "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "aidentity", version: "1.0.0" },
      },
    });
    return;
  }
  if (method === "notifications/initialized") return;
  if (method === "ping") {
    send({ jsonrpc: "2.0", id, result: {} });
    return;
  }
  if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    return;
  }
  if (method === "tools/call") {
    try {
      const result = callTool(params?.name, params?.arguments || {});
      send({
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: false },
      });
    } catch (error) {
      send({
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true },
      });
    }
    return;
  }
  send({ jsonrpc: "2.0", id, error: { code: -32601, message: `method not found: ${method}` } });
});
