#!/usr/bin/env node

/**
 * aidentity — install agent skills from the registry.
 *
 *   aidentity list [--category <name>] [--source <key>]
 *   aidentity search <query>
 *   aidentity info <id>
 *   aidentity add <id> [--agent claude|opencode|codex|cursor|copilot|gemini] [--global]
 *
 * Reads registry/skills.json from the package. Copies the skill directory
 * into the target agent's skills folder. Nothing leaves your machine.
 */

const fs = require("fs");
const path = require("path");
const { recommend } = require("./lib/recommend");

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

function fail(message) {
  console.error(red("error ") + message);
  process.exit(1);
}

const BOOLEAN_FLAGS = new Set(["global", "dry-run", "help", "json", "distributable"]);

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
  console.log(`${bold(skill.name)}  ${dim(skill.id)}`);
  console.log(`  ${skill.description}`);
  console.log(
    `  ${dim("source:")} ${skill.source.repo}  ${dim("license:")} ${skill.source.license}  ${dim("status:")} ${skill.status}`
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
    if (!value) fail("usage: aidentity recommend \"<task>\"");
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
      console.log(dim(`  ${agent.label} · ${skill.source.repo} · ${skill.source.license}`));
      break;
    }

    if (fs.existsSync(destination)) {
      fail(`${destination} already exists. Remove it first, or install a different skill.`);
    }

    fs.mkdirSync(base, { recursive: true });
    fs.cpSync(source, destination, { recursive: true });
    console.log(`${bold("installed")} ${skill.name} → ${path.relative(process.cwd(), destination) || destination}`);
    console.log(dim(`  ${agent.label} · ${skill.source.repo} · ${skill.source.license}`));
    break;
  }

  case "agents": {
    for (const [key, agent] of Object.entries(AGENTS)) {
      console.log(`${key.padEnd(10)} ${agent.dir.padEnd(18)} ${dim(agent.label)}`);
    }
    break;
  }

  case undefined:
  case "help":
  case "--help":
  case "-h": {
    console.log(`aidentity — ${REGISTRY.total} agent skills, verified weekly

Usage
  aidentity search <query>              find a skill
  aidentity recommend "<task>"          bundle + skills for a task
  aidentity info <id>                   show source, license, install path
  aidentity add <id> [options]          install into your agent
  aidentity list                        list everything
  aidentity agents                      supported agent directories

Options
  --agent <name>    ${Object.keys(AGENTS).join(" | ")}
  --global          install into ~/ instead of the current project
  --category <c>    filter list
  --source <key>    filter list

Examples
  aidentity add mattpocock/engineering/code-review
  aidentity add systematic-debugging --agent cursor
  aidentity search "security review"`);
    break;
  }

  default:
    fail(`unknown command "${command}". Run: aidentity help`);
}
