#!/usr/bin/env node
/**
 * Aidentity MCP server (stdio, zero dependencies).
 *
 * Tools:
 *   search_skills(query, category, source, limit)
 *   find_skills_for_task(task, limit)      ranked, with a reason for each match
 *   recommend(task, limit)                 bundle + skills + context cost
 *   get_skill(id)                          metadata, security and full SKILL.md
 *   list_bundles()
 *   list_roles()
 *   setup_role(role, profile, task, platform, global, dry_run)
 *   verify_skill_security(id)
 *   install_skill(id, platform, global, dry_run)
 *   installed_skills(global)
 *   remove_skill(id, platform, global)
 *   doctor(global)
 *
 * Resources:
 *   aidentity://registry/summary
 *   aidentity://security/summary
 *   aidentity://skill/{id}
 *
 * Install and remove are dry-run unless dry_run is explicitly false.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { registry, bundles, search, recommend, suggest } = require("./lib/search");
const { AGENT_TARGETS } = require("./lib/agents");
const {
  rolesData,
  securityData,
  getSecurityRecord,
  buildRolePlan,
  generateSetupPrompt,
  executeSetup,
} = require("./lib/setup");
const {
  installSkills,
  removeSkill,
  listInstalled,
  doctor,
} = require("./lib/installed");

const ROOT = path.join(__dirname, "..");
const PLATFORMS = Object.fromEntries(
  Object.entries(AGENT_TARGETS).map(([key, target]) => [key, target.skillsDir])
);

const SITE = "https://akshatnaruka.github.io/aidentity";

const TOOLS = [
  {
    name: "find_skills_for_task",
    description:
      "Primary entry point. Given a description of what you are about to do, return the skills that apply, ranked, each with the reason it matched and its context cost in tokens. Call this before starting a task you do not have a skill for.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "What you are about to do, in your own words, e.g. 'add postgres migrations to a node api'" },
        limit: { type: "number", description: "Max results (default 6)" },
        category: { type: "string", description: "Optional category filter, e.g. 'security'" },
        distributable_only: { type: "boolean", description: "Only return skills that can be installed from the registry" },
      },
      required: ["task"],
    },
  },
  {
    name: "search_skills",
    description: "Keyword search over the index. Prefer find_skills_for_task for natural-language tasks.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords, e.g. 'postgres migrations' or 'code review'" },
        limit: { type: "number", description: "Max results (default 8)" },
        category: { type: "string" },
        source: { type: "string", description: "Source key, e.g. 'mattpocock'" },
      },
      required: ["query"],
    },
  },
  {
    name: "recommend",
    description: "Recommend a curated bundle and specific skills for a task, with the total context cost.",
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
    description: "Get one skill with metadata, security status, context cost, and its full SKILL.md instructions.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "Skill id, e.g. 'mattpocock/engineering/code-review'" } },
      required: ["id"],
    },
  },
  {
    name: "list_bundles",
    description: "List curated task-based install sets, with skill counts and total context cost.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_roles",
    description: "List all job roles with their skills, rules, subagents, commands and hooks.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "setup_role",
    description:
      "Build a role-based setup plan and prompt (Individual or Enterprise profile) and optionally install skills, rules, subagents, commands and hooks. Dry-run by default.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string", description: "Role slug or alias, e.g. 'software-engineer', 'architect', 'designer'" },
        profile: { type: "string", enum: ["individual", "enterprise"], description: "Default 'individual'" },
        task: { type: "string", description: "Optional project requirement to tailor the skill set" },
        platform: { type: "string", enum: Object.keys(PLATFORMS), description: "Default 'claude'" },
        global: { type: "boolean", description: "Install into the home directory instead of the project" },
        dry_run: { type: "boolean", description: "Default true" },
      },
      required: ["role"],
    },
  },
  {
    name: "verify_skill_security",
    description: "Check the security verification report and SHA-256 digest for one skill or the whole registry.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "Optional skill id. Omit for the registry-wide summary." } },
    },
  },
  {
    name: "install_skill",
    description:
      "Install security-verified hosted skills into an agent's skills directory and record them in the project manifest. Dry-run by default; pass dry_run:false to write.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Skill id, or several ids separated by commas" },
        ids: { type: "array", items: { type: "string" }, description: "Several skill ids at once" },
        platform: { type: "string", enum: Object.keys(PLATFORMS) },
        global: { type: "boolean", description: "Install into the home directory instead of the project" },
        dry_run: { type: "boolean", description: "Default true" },
      },
      required: ["platform"],
    },
  },
  {
    name: "installed_skills",
    description: "List what this project (or the home directory) already has installed, with integrity status and context cost.",
    inputSchema: {
      type: "object",
      properties: { global: { type: "boolean" } },
    },
  },
  {
    name: "remove_skill",
    description: "Remove an installed skill and update the manifest. Dry-run by default.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        platform: { type: "string", enum: Object.keys(PLATFORMS) },
        global: { type: "boolean" },
        dry_run: { type: "boolean", description: "Default true" },
      },
      required: ["id"],
    },
  },
  {
    name: "doctor",
    description: "Health check: detected agents, manifest state, content drift, untracked skill directories.",
    inputSchema: {
      type: "object",
      properties: { global: { type: "boolean" } },
    },
  },
];

const RESOURCES = [
  {
    uri: "aidentity://registry/summary",
    name: "Registry summary",
    description: "Counts, categories, sources and the endpoint list for the Aidentity registry.",
    mimeType: "application/json",
  },
  {
    uri: "aidentity://security/summary",
    name: "Security summary",
    description: "Registry-wide security verification results and policy.",
    mimeType: "application/json",
  },
];

function findSkill(id) {
  const exact = registry.skills.find((entry) => entry.id === id);
  if (exact) return exact;
  const partial = registry.skills.filter((entry) => entry.id.endsWith(`/${id}`) || entry.name === id);
  if (partial.length === 1) return partial[0];
  if (partial.length > 1) throw new Error(`"${id}" matches ${partial.length} skills: ${partial.map((s) => s.id).join(", ")}`);
  const near = suggest(id, 5);
  throw new Error(`unknown skill id: ${id}${near.length ? `. Did you mean: ${near.map((s) => s.id).join(", ")}` : ""}`);
}

function getSkill(id) {
  const skill = findSkill(id);
  const sec = getSecurityRecord(skill.id);
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
    author: skill.source.author,
    tokens: skill.tokens || null,
    security: {
      status: sec.status,
      verified: Boolean(sec.verified),
      risk_level: sec.risk_level,
      files_scanned: sec.files_scanned,
      sha256: sec.sha256,
    },
    install: skill.install,
    page: `${SITE}/skills/${skill.id}/`,
    upstream: skill.upstream ? skill.upstream.url : skill.source.url,
    content,
  };
}

function installFromArgs(args) {
  const ids = Array.isArray(args.ids) && args.ids.length ? args.ids : String(args.id || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length) throw new Error("provide id or ids");
  const platform = args.platform;
  if (!PLATFORMS[platform]) throw new Error(`platform must be one of: ${Object.keys(PLATFORMS).join(", ")}`);
  const dryRun = args.dry_run !== false;

  const skills = ids.map(findSkill);
  for (const skill of skills) {
    if (!skill.distributable || !skill.path) {
      throw new Error(`${skill.id} is index-only (${skill.source.license}); read it at ${skill.upstream ? skill.upstream.url : skill.source.url}`);
    }
    const sec = getSecurityRecord(skill.id);
    if (!sec.verified) throw new Error(`security verification failed for ${skill.id} (${sec.status}); installation blocked.`);
  }

  const result = installSkills(skills, {
    agentKey: platform,
    global: Boolean(args.global),
    cwd: process.cwd(),
    dryRun,
    allSkills: registry.skills,
  });

  return {
    dry_run: dryRun,
    platform,
    requested: ids,
    installed: result.installed.map((entry) => ({
      id: entry.id,
      destination: entry.destination,
      content_hash: entry.hash,
    })),
    failed: result.failed,
    note: dryRun ? "dry run: nothing was written. Call again with dry_run:false to install." : undefined,
  };
}

function callTool(name, args = {}) {
  switch (name) {
    case "find_skills_for_task": {
      const results = search(args.task || "", {
        limit: args.limit || 6,
        category: args.category,
        distributable: Boolean(args.distributable_only),
      });
      return {
        task: args.task,
        count: results.length,
        results,
        suggestions: results.length ? [] : suggest(args.task || "", 5),
      };
    }
    case "search_skills":
      return search(args.query || "", {
        limit: args.limit || 8,
        category: args.category,
        source: args.source,
      });
    case "recommend":
      return recommend(args.task || "", args.limit || 5);
    case "get_skill":
      return getSkill(args.id);
    case "list_bundles":
      return bundles.map((bundle) => {
        const skills = bundle.skills.map((id) => registry.skills.find((s) => s.id === id)).filter(Boolean);
        return {
          slug: bundle.slug,
          name: bundle.name,
          description: bundle.description,
          skills: skills.length,
          tokens: skills.reduce((sum, skill) => sum + (skill.tokens || 0), 0),
          ids: skills.map((skill) => skill.id),
          install: `npx aidentity add ${skills.map((skill) => skill.id).join(" ")}`,
        };
      });
    case "list_roles":
      return rolesData.roles.map((r) => ({
        slug: r.slug,
        name: r.name,
        aliases: r.aliases || [],
        description: r.description,
        skills_count: (r.skills || []).length,
        rules_count: (r.rules || []).length,
        agents_count: (r.agents || []).length,
        setup_command: `npx aidentity setup ${r.slug} --profile <individual|enterprise>`,
      }));
    case "setup_role": {
      const plan = buildRolePlan({
        role: args.role,
        profile: args.profile || "individual",
        task: args.task || "",
        agent: args.platform || "claude",
      });
      const execution = executeSetup(plan, {
        global: Boolean(args.global),
        dryRun: args.dry_run !== false,
      });
      return { ...plan, prompt: generateSetupPrompt(plan), execution };
    }
    case "verify_skill_security": {
      if (args.id) {
        const skill = findSkill(args.id);
        return { id: skill.id, name: skill.name, license: skill.source.license, ...getSecurityRecord(skill.id) };
      }
      return {
        name: securityData.name,
        version: securityData.version,
        total_skills: securityData.total_skills,
        verified_skills: securityData.verified_skills,
        failed_skills: securityData.failed_skills,
        total_files_scanned: securityData.total_files_scanned,
        critical_findings: securityData.critical_findings,
        advisories: securityData.advisories,
        policy: securityData.policy,
      };
    }
    case "install_skill":
      return installFromArgs(args);
    case "installed_skills": {
      const items = listInstalled({ global: Boolean(args.global), cwd: process.cwd() });
      const tokens = items.reduce((sum, item) => {
        const skill = registry.skills.find((entry) => entry.id === item.id);
        return sum + (skill && skill.tokens ? skill.tokens : 0);
      }, 0);
      return { count: items.length, tokens, items };
    }
    case "remove_skill": {
      if (args.dry_run !== false) {
        const items = listInstalled({ global: Boolean(args.global), cwd: process.cwd() })
          .filter((item) => item.id === args.id);
        return { dry_run: true, would_remove: items, note: "call again with dry_run:false to remove." };
      }
      return removeSkill({
        id: args.id,
        agent: args.platform,
        global: Boolean(args.global),
        cwd: process.cwd(),
      });
    }
    case "doctor":
      return doctor({ global: Boolean(args.global), cwd: process.cwd() });
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

function listResources() {
  return RESOURCES;
}

function readResource(uri) {
  if (uri === "aidentity://registry/summary") {
    return {
      uri,
      mimeType: "application/json",
      text: JSON.stringify(
        {
          name: "aidentity",
          version: registry.version,
          generated_at: registry.generated_at,
          total: registry.total,
          distributable: registry.distributable,
          by_source: registry.by_source,
          endpoints: {
            registry: `${SITE}/registry.json`,
            search: `${SITE}/search.json`,
            security: `${SITE}/security.json`,
            llms: `${SITE}/llms.txt`,
          },
        },
        null,
        2
      ),
    };
  }
  if (uri === "aidentity://security/summary") {
    return {
      uri,
      mimeType: "application/json",
      text: JSON.stringify(
        {
          total_skills: securityData.total_skills,
          verified_skills: securityData.verified_skills,
          critical_findings: securityData.critical_findings,
          policy: securityData.policy,
        },
        null,
        2
      ),
    };
  }
  const match = uri.match(/^aidentity:\/\/skill\/(.+)$/);
  if (match) {
    const skill = getSkill(decodeURIComponent(match[1]));
    return { uri, mimeType: "text/markdown", text: skill.content || skill.description };
  }
  throw new Error(`unknown resource: ${uri}`);
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
        capabilities: { tools: {}, resources: { subscribe: false, listChanged: false } },
        serverInfo: { name: "aidentity", version: "1.3.0" },
        instructions:
          "Aidentity indexes AI agent skills. Use find_skills_for_task before starting unfamiliar work, then get_skill to read the instructions or install_skill to add it to the project.",
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
  if (method === "resources/list") {
    send({ jsonrpc: "2.0", id, result: { resources: listResources() } });
    return;
  }
  if (method === "resources/read") {
    try {
      send({ jsonrpc: "2.0", id, result: { contents: [readResource(params?.uri)] } });
    } catch (error) {
      send({ jsonrpc: "2.0", id, error: { code: -32602, message: error.message } });
    }
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
