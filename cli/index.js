#!/usr/bin/env node

/**
 * aidentity — install agent skills, role setups, and verify security from the registry.
 *
 *   aidentity list [--category <name>] [--source <key>]
 *   aidentity search <query>
 *   aidentity recommend "<task>"
 *   aidentity setup [role] [--profile individual|enterprise] [--agent claude|cursor|codex|gemini|opencode|copilot] [--prompt] [--dry-run] [--global]
 *   aidentity audit [--id <skill-id>] [--json]
 *   aidentity info <id>
 *   aidentity add <id> [--agent claude|opencode|codex|cursor|copilot|gemini] [--global]
 *
 * Reads registry/skills.json and registry/security.json from the package.
 * Copies verified skills, rules, subagents, commands, and hooks into the target agent's folder.
 */

const fs = require("fs");
const path = require("path");
const { recommend } = require("./lib/recommend");
const {
  rolesData,
  securityData,
  findRole,
  getSecurityRecord,
  buildRolePlan,
  generateSetupPrompt,
  executeSetup,
} = require("./lib/setup");

const ROOT = path.join(__dirname, "..");
const REGISTRY = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "skills.json"), "utf8"));

const AGENTS = {
  claude: { dir: ".claude/skills", label: "Claude Code" },
  opencode: { dir: ".opencode/skills", label: "OpenCode" },
  codex: { dir: ".codex/skills", label: "Codex" },
  cursor: { dir: ".cursor/skills", label: "Cursor" },
  copilot: { dir: ".github/skills", label: "GitHub Copilot" },
  gemini: { dir: ".gemini/skills", label: "Gemini CLI" },
};

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const dim = (value) => (color ? `\x1b[2m${value}\x1b[0m` : String(value));
const bold = (value) => (color ? `\x1b[1m${value}\x1b[0m` : String(value));
const red = (value) => (color ? `\x1b[31m${value}\x1b[0m` : String(value));
const green = (value) => (color ? `\x1b[32m${value}\x1b[0m` : String(value));

function fail(message) {
  console.error(red("error ") + message);
  process.exit(1);
}

const BOOLEAN_FLAGS = new Set(["global", "dry-run", "help", "json", "distributable", "prompt", "list"]);

function args(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (BOOLEAN_FLAGS.has(key) || !next || next.startsWith("--")) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i += 1;
      }
    } else {
      positional.push(token);
    }
  }
  return { positional, flags };
}

function resolve(id) {
  const exact = REGISTRY.skills.find((skill) => skill.id === id);
  if (exact) return exact;
  const partial = REGISTRY.skills.filter((skill) => skill.id.endsWith(`/${id}`) || skill.name === id);
  if (partial.length === 1) return partial[0];
  if (partial.length > 1) {
    fail(`"${id}" matches ${partial.length} skills. Be more specific:\n  ${partial.map((s) => s.id).join("\n  ")}`);
  }
  fail(`No skill with id "${id}". Try: aidentity search ${id}`);
}

function detectAgent() {
  const cwd = process.cwd();
  // Exact skills directory wins: an existing .github/ is not a Copilot signal
  // (almost every repo has one), but .github/skills/ is.
  for (const [key, agent] of Object.entries(AGENTS)) {
    if (fs.existsSync(path.join(cwd, agent.dir))) return key;
  }
  for (const [key, agent] of Object.entries(AGENTS)) {
    if (key === "copilot") continue;
    const toolRoot = agent.dir.split("/")[0];
    if (fs.existsSync(path.join(cwd, toolRoot))) return key;
  }
  return null;
}

function printSkill(skill) {
  const sec = getSecurityRecord(skill.id);
  console.log(`${bold(skill.name)}  ${dim(skill.id)}`);
  console.log(`  ${skill.description}`);
  console.log(
    `  ${dim("source:")} ${skill.source.repo}  ${dim("license:")} ${skill.source.license}  ${dim("status:")} ${skill.status}`
  );
  console.log(
    `  ${dim("security:")} ${sec.verified ? green(sec.status) : red(sec.status)} (${sec.files_scanned} files${sec.sha256 ? ` · sha256:${sec.sha256.slice(0, 16)}` : ""})`
  );
  console.log(`  ${dim("install:")} ${skill.install || "not hosted — " + (skill.upstream ? skill.upstream.url : skill.source.url)}`);
}

const { positional, flags } = args(process.argv.slice(2));
const [command, value] = positional;

switch (command) {
  case "list": {
    let list = REGISTRY.skills;
    if (flags.category) list = list.filter((skill) => skill.category === flags.category);
    if (flags.source) list = list.filter((skill) => skill.source.key === flags.source);
    if (flags.distributable) list = list.filter((skill) => skill.distributable);
    console.log(dim(`${list.length} skills`));
    for (const skill of list) {
      console.log(`${skill.name.padEnd(38)} ${dim(skill.id)}`);
    }
    break;
  }

  case "search": {
    if (!value) fail("usage: aidentity search <query>");
    const query = value.toLowerCase();
    const matches = REGISTRY.skills.filter((skill) =>
      `${skill.name} ${skill.description} ${skill.category} ${skill.tags.join(" ")} ${skill.source.repo}`
        .toLowerCase()
        .includes(query)
    );
    if (!matches.length) fail(`nothing matches "${value}"`);
    for (const skill of matches.slice(0, 20)) {
      console.log(`${skill.name.padEnd(38)} ${dim(skill.id)}`);
      console.log(`  ${dim(skill.description.slice(0, 110))}`);
    }
    if (matches.length > 20) console.log(dim(`… and ${matches.length - 20} more`));
    break;
  }

  case "recommend": {
    if (!value) fail('usage: aidentity recommend "<task>"');
    const result = recommend(value, 6);
    if (result.bundle) {
      console.log(bold(`bundle: ${result.bundle.name}`) + `  ${dim(result.bundle.slug)}`);
      console.log(`  ${result.bundle.description}`);
      console.log(`  ${dim("install:")} ${result.install_bundle}`);
      console.log("");
    }
    if (result.from_bundle.length) {
      console.log(dim("from the bundle:"));
      for (const skill of result.from_bundle) {
        console.log(`${skill.name.padEnd(38)} ${dim(skill.id)}`);
        console.log(`  ${skill.install || "index only"}`);
      }
      console.log("");
    }
    if (!result.skills.length) {
      console.log("No direct matches. Try broader words, or browse: aidentity list");
      break;
    }
    for (const skill of result.skills) {
      console.log(`${skill.name.padEnd(38)} ${dim(skill.id)}`);
      console.log(`  ${skill.description.slice(0, 110)}`);
      console.log(`  ${dim(skill.install || "index only — " + skill.upstream)}`);
    }
    break;
  }

  case "roles": {
    console.log(dim(`${rolesData.roles.length} roles · profiles: individual, enterprise\n`));
    for (const role of rolesData.roles) {
      console.log(`${bold(role.slug.padEnd(22))} ${role.name.padEnd(22)} ${dim(role.description)}`);
    }
    console.log(dim(`\nRun: aidentity setup <role> [--profile individual|enterprise] [--prompt]`));
    break;
  }

  case "setup":
  case "init": {
    if (flags.list || value === "list") {
      console.log(dim(`${rolesData.roles.length} role setups available:\n`));
      for (const role of rolesData.roles) {
        console.log(
          `${role.slug.padEnd(22)} ${String(role.skills.length).padStart(2)} skills  ${String(role.rules.length).padStart(1)} rules  ${String(role.agents.length).padStart(1)} agents  ${dim(role.name)}`
        );
      }
      break;
    }

    const roleQuery = value || flags.role || flags.task;
    if (!roleQuery) {
      fail(
        `usage: aidentity setup <role> [--profile individual|enterprise] [--agent claude|cursor|codex|gemini|opencode|copilot] [--prompt] [--dry-run]\n  Run "aidentity setup --list" to see all 20 roles.`
      );
    }

    const matchedRole = findRole(roleQuery);
    if (!matchedRole) {
      fail(`unknown role "${roleQuery}". Run: aidentity setup --list`);
    }

    const profileKey = flags.profile === "enterprise" ? "enterprise" : "individual";
    const detectedAgent = flags.agent || detectAgent() || "claude";
    const plan = buildRolePlan({
      role: matchedRole,
      profile: profileKey,
      task: flags.task || "",
      agent: detectedAgent,
    });

    if (flags.json) {
      console.log(JSON.stringify({ ...plan, prompt: generateSetupPrompt(plan) }, null, 2));
      break;
    }

    if (flags.prompt) {
      console.log(generateSetupPrompt(plan));
      break;
    }

    if (!flags.agent && !detectAgent()) {
      fail(
        `could not detect an agent in ${process.cwd()}.\n  pass one with --agent (${Object.keys(AGENTS).join(" | ")}) or pass --prompt to generate a setup prompt.`
      );
    }

    const res = executeSetup(plan, { global: Boolean(flags.global), dryRun: Boolean(flags["dry-run"]) });
    console.log(
      `${bold(plan.role.name)} (${plan.profile.name} profile) → ${AGENTS[plan.agent]?.label || plan.agent}`
    );
    console.log(dim(`  ${plan.role.description}\n`));
    for (const action of res.actions) {
      const tag = action.status === "installed" ? green("installed") : action.status === "would-install" ? bold("would install") : dim("skipped");
      console.log(`  ${tag.padEnd(16)} [${action.kind.padEnd(7)}] ${action.id} → ${dim(action.destination)}`);
    }
    console.log(
      `\n${bold(res.installed_count)} items ${res.dry_run ? "planned (dry-run)" : "installed"} · all skills security-verified (0 critical findings)`
    );
    break;
  }

  case "audit":
  case "security": {
    const targetId = value || flags.id;
    if (targetId) {
      const skill = resolve(targetId);
      const sec = getSecurityRecord(skill.id);
      if (flags.json) {
        console.log(JSON.stringify({ id: skill.id, ...sec }, null, 2));
        break;
      }
      console.log(`${bold(skill.name)}  ${dim(skill.id)}`);
      console.log(`  status:        ${sec.verified ? green(sec.status) : red(sec.status)}`);
      console.log(`  risk level:    ${sec.risk_level}`);
      console.log(`  files scanned: ${sec.files_scanned}`);
      console.log(`  sha256:        ${sec.sha256 || "n/a (index-only pointer)"}`);
      console.log(`  license:       ${skill.source.license} (${skill.source.repo})`);
      if (sec.advisories && sec.advisories.length) {
        for (const adv of sec.advisories) {
          console.log(`  advisory:      [${adv.rule}] ${adv.file}:${adv.line} — ${adv.message}`);
        }
      }
      process.exit(sec.verified ? 0 : 1);
    }

    if (flags.json) {
      console.log(JSON.stringify(securityData, null, 2));
      process.exit(securityData.critical_findings ? 1 : 0);
    }

    console.log(`${bold("Aidentity Skill Security Report")}`);
    console.log(`  skills verified: ${green(`${securityData.verified_skills}/${securityData.total_skills}`)}`);
    console.log(`  files scanned:   ${securityData.total_files_scanned}`);
    console.log(`  critical issues: ${securityData.critical_findings === 0 ? green("0") : red(securityData.critical_findings)}`);
    console.log(`  advisories:      ${securityData.advisories || 0}`);
    console.log(`  checks:          ${(securityData.policy?.checks || []).join(", ")}`);
    process.exit(securityData.critical_findings ? 1 : 0);
  }

  case "info": {
    if (!value) fail("usage: aidentity info <id>");
    printSkill(resolve(value));
    break;
  }

  case "add":
  case "install": {
    if (!value) fail("usage: aidentity add <id> [--agent claude] [--global]");
    const skill = resolve(value);

    if (!skill.distributable || !skill.path) {
      console.log(`${skill.name} is indexed but not hosted — its upstream license does not permit redistribution.`);
      console.log(`Read it here: ${skill.upstream ? skill.upstream.url : skill.source.url}`);
      process.exit(2);
    }

    const sec = getSecurityRecord(skill.id);
    if (!sec.verified) {
      fail(`security verification failed for "${skill.id}" (status: ${sec.status}). Installation blocked.`);
    }

    const agentKey = flags.agent || detectAgent();
    if (!agentKey) {
      fail(
        `could not detect an agent in ${process.cwd()}.\n  pass one with --agent: ${Object.keys(AGENTS).join(" | ")}`
      );
    }
    const agent = AGENTS[agentKey];
    if (!agent) fail(`unknown agent "${agentKey}". Options: ${Object.keys(AGENTS).join(" | ")}`);

    const home = process.env.HOME || process.env.USERPROFILE;
    const base = flags.global ? path.join(home, agent.dir) : path.join(process.cwd(), agent.dir);
    const destination = path.join(base, path.basename(skill.id));
    const source = path.join(ROOT, path.dirname(skill.path));

    if (flags["dry-run"]) {
      console.log(`${bold("would install")} ${skill.name} → ${path.relative(process.cwd(), destination) || destination}`);
      console.log(
        dim(`  ${agent.label} · ${skill.source.repo} · ${skill.source.license} · security: ${sec.status} (sha256:${(sec.sha256 || "").slice(0, 12)})`)
      );
      break;
    }

    if (fs.existsSync(destination)) {
      fail(`${destination} already exists. Remove it first, or install a different skill.`);
    }

    fs.mkdirSync(base, { recursive: true });
    fs.cpSync(source, destination, { recursive: true });
    console.log(`${bold("installed")} ${skill.name} → ${path.relative(process.cwd(), destination) || destination}`);
    console.log(
      dim(`  ${agent.label} · ${skill.source.repo} · ${skill.source.license} · security: ${sec.status} (sha256:${(sec.sha256 || "").slice(0, 12)})`)
    );
    break;
  }

  case "agents": {
    for (const [key, agent] of Object.entries(AGENTS)) {
      console.log(`${key.padEnd(10)} ${agent.dir.padEnd(18)} ${dim(agent.label)}`);
    }
    break;
  }

  case "mcp": {
    require("./mcp");
    break;
  }

  case undefined:
  case "help":
  case "--help":
  case "-h": {
    console.log(`aidentity — ${REGISTRY.total} agent skills, security-verified & indexed
  
Usage
  aidentity setup <role> [options]      install role skills, rules, subagents & hooks (or --prompt)
  aidentity roles                       list all 21 roles (developer, architect, pm, designer, etc.)
  aidentity audit [skill-id]            verify skill security status & SHA-256 digests
  aidentity search <query>              find a skill
  aidentity recommend "<task>"          bundle + skills for a task
  aidentity info <id>                   show source, license, security status, install path
  aidentity add <id> [options]          install a security-verified skill into your agent
  aidentity list                        list everything
  aidentity agents                      supported agent directories
  aidentity mcp                         run local stdio MCP server for agent integration

Options
  --profile <p>     individual (default) | enterprise
  --prompt          print a copy-paste AI setup prompt for the role & profile
  --agent <name>    ${Object.keys(AGENTS).join(" | ")}
  --global          install into ~/ instead of the current project
  --dry-run         preview planned files without writing
  --category <c>    filter list
  --source <key>    filter list

Examples
  aidentity setup software-engineer --profile individual --agent claude
  aidentity setup architect --profile enterprise --prompt
  aidentity audit mattpocock/engineering/code-review
  aidentity add systematic-debugging --agent cursor`);
    break;
  }

  default:
    fail(`unknown command "${command}". Run: aidentity help`);
}
