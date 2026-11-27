#!/usr/bin/env node

/**
 * aidentity — install agent skills, role setups, and verify security from the registry.
 *
 *   aidentity list [--category <name>] [--source <key>]
 *   aidentity search <query> [--json] [--category <c>] [--limit <n>]
 *   aidentity recommend "<task>" [--json]
 *   aidentity setup [role] [--profile individual|enterprise] [--agent <name>] [--prompt] [--dry-run] [--global]
 *   aidentity audit [--id <skill-id>] [--json]
 *   aidentity info <id> [--json]
 *   aidentity add <id...> [--agent <name>] [--global] [--force] [--dry-run]
 *   aidentity installed [--global] [--json]
 *   aidentity remove <id> [--agent <name>] [--global]
 *   aidentity update [<id...>] [--global] [--dry-run]
 *   aidentity doctor [--global] [--json]
 *   aidentity app [--port <n>] [--no-open]
 *
 * Reads registry/skills.json and registry/security.json from the package.
 * Every install is recorded in .aidentity/installed.json.
 */

const fs = require("fs");
const path = require("path");
const { recommend, search, suggest, registry: REGISTRY } = require("./lib/search");
const { AGENT_TARGETS, detectAgent } = require("./lib/agents");
const {
  rolesData,
  securityData,
  findRole,
  getSecurityRecord,
  buildRolePlan,
  generateSetupPrompt,
  executeSetup,
} = require("./lib/setup");
const {
  installSkills,
  removeSkill,
  listInstalled,
  updateSkills,
  doctor,
  contentHash,
  manifestPath,
} = require("./lib/installed");

const ROOT = path.join(__dirname, "..");

const AGENTS = Object.fromEntries(
  Object.entries(AGENT_TARGETS).map(([key, target]) => [key, { dir: target.skillsDir, label: target.label }])
);

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const dim = (value) => (color ? `\x1b[2m${value}\x1b[0m` : String(value));
const bold = (value) => (color ? `\x1b[1m${value}\x1b[0m` : String(value));
const red = (value) => (color ? `\x1b[31m${value}\x1b[0m` : String(value));
const green = (value) => (color ? `\x1b[32m${value}\x1b[0m` : String(value));
const yellow = (value) => (color ? `\x1b[33m${value}\x1b[0m` : String(value));

function fail(message, code = 1) {
  console.error(red("error ") + message);
  process.exit(code);
}

function json(value) {
  console.log(JSON.stringify(value, null, 2));
}

const BOOLEAN_FLAGS = new Set([
  "global", "dry-run", "help", "json", "distributable", "prompt", "list", "force", "no-open", "verbose", "web",
]);

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
  const near = suggest(id, 5);
  fail(
    `No skill with id "${id}".` +
      (near.length ? `\n  Did you mean: ${near.map((s) => s.id).join(", ")}` : "") +
      `\n  Try: aidentity search "${id}"`
  );
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
  if (skill.tokens) console.log(`  ${dim("context:")} ~${skill.tokens} tokens`);
  console.log(`  ${dim("install:")} ${skill.install || "not hosted — " + (skill.upstream ? skill.upstream.url : skill.source.url)}`);
}

function printSearchResult(result) {
  console.log(`${result.name.padEnd(38)} ${dim(result.id)}`);
  console.log(`  ${dim(result.description.slice(0, 120))}`);
  if (result.why) console.log(`  ${dim(`matched: ${result.why}`)}`);
  if (result.tokens) console.log(`  ${dim(`~${result.tokens} tokens · ${result.license}`)}`);
}

function resolveAgent(flags, { required = true } = {}) {
  const key = flags.agent || detectAgent();
  if (!key) {
    if (!required) return null;
    fail(`could not detect an agent in ${process.cwd()}.\n  pass one with --agent: ${Object.keys(AGENTS).join(" | ")}`);
  }
  if (!AGENTS[key]) fail(`unknown agent "${key}". Options: ${Object.keys(AGENTS).join(" | ")}`);
  return key;
}

const { positional, flags } = args(process.argv.slice(2));
const [command, value] = positional;

switch (command) {
  case "list": {
    if (flags.installed) {
      // Handled below by "installed"; kept here so `list --installed` works.
      command_installed();
      break;
    }
    let list = REGISTRY.skills;
    if (flags.category) list = list.filter((skill) => skill.category === flags.category);
    if (flags.source) list = list.filter((skill) => skill.source.key === flags.source);
    if (flags.distributable) list = list.filter((skill) => skill.distributable);
    if (flags.json) {
      json(list.map(({ id, name, category, tags, status, source }) => ({ id, name, category, tags, status, license: source.license })));
      break;
    }
    console.log(dim(`${list.length} skills`));
    for (const skill of list) {
      console.log(`${skill.name.padEnd(38)} ${dim(skill.id)}`);
    }
    break;
  }

  case "search": {
    if (!value) fail('usage: aidentity search <query> [--category <c>] [--limit <n>] [--json]');
    const query = positional.slice(1).join(" ");
    const results = search(query, {
      limit: Number(flags.limit) || 10,
      category: flags.category,
      source: flags.source,
      license: flags.license,
      distributable: Boolean(flags.distributable),
    });
    if (flags.json) {
      json({ query, count: results.length, results, suggestions: results.length ? [] : suggest(query) });
      break;
    }
    if (!results.length) {
      const near = suggest(query);
      console.log(`nothing matches "${query}"`);
      if (near.length) {
        console.log(dim("\ndid you mean:"));
        for (const entry of near) console.log(`  ${entry.name.padEnd(38)} ${dim(entry.id)}`);
      }
      break;
    }
    for (const result of results) printSearchResult(result);
    break;
  }

  case "recommend": {
    if (!value) fail('usage: aidentity recommend "<task>" [--json]');
    const task = positional.slice(1).join(" ");
    const result = recommend(task, Number(flags.limit) || 6);
    if (flags.json) {
      json(result);
      break;
    }
    if (result.bundle) {
      console.log(bold(`bundle: ${result.bundle.name}`) + `  ${dim(result.bundle.slug)}`);
      console.log(`  ${result.bundle.description}`);
      if (result.bundle.tokens) console.log(`  ${dim(`~${result.bundle.tokens} tokens installed`)}`);
      console.log(`  ${dim("install:")} ${result.install_bundle}`);
      console.log("");
    }
    if (result.from_bundle.length) {
      console.log(dim("from the bundle:"));
      for (const skill of result.from_bundle) {
        console.log(`${skill.name.padEnd(38)} ${dim(skill.id)}`);
      }
      console.log("");
    }
    if (!result.skills.length) {
      console.log(`No direct matches for "${task}".`);
      if (result.suggestions.length) {
        console.log(dim("Closest entries:"));
        for (const entry of result.suggestions) console.log(`  ${entry.name.padEnd(38)} ${dim(entry.id)}`);
      }
      break;
    }
    for (const skill of result.skills) printSearchResult(skill);
    break;
  }

  case "roles": {
    if (flags.json) {
      json(rolesData.roles.map(({ slug, name, description, skills, rules, agents }) => ({
        slug, name, description, skills: skills.length, rules: rules.length, agents: agents.length,
      })));
      break;
    }
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
      if (flags.json) {
        json(rolesData.roles.map(({ slug, name, skills, rules, agents }) => ({
          slug, name, skills: skills.length, rules: rules.length, agents: agents.length,
        })));
        break;
      }
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
        `usage: aidentity setup <role> [--profile individual|enterprise] [--agent ${Object.keys(AGENTS).join("|")}] [--prompt] [--dry-run]\n  Run "aidentity setup --list" to see all ${rolesData.roles.length} roles.`
      );
    }

    const matchedRole = findRole(roleQuery);
    if (!matchedRole) fail(`unknown role "${roleQuery}". Run: aidentity setup --list`);

    const profileKey = flags.profile === "enterprise" ? "enterprise" : "individual";
    const detectedAgent = flags.agent || detectAgent() || "claude";
    const plan = buildRolePlan({
      role: matchedRole,
      profile: profileKey,
      task: flags.task || "",
      agent: detectedAgent,
    });

    if (flags.json) {
      json({ ...plan, prompt: generateSetupPrompt(plan) });
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
      const tag =
        action.status === "installed"
          ? green("installed")
          : action.status === "would-install"
            ? bold("would install")
            : dim("skipped");
      console.log(`  ${tag.padEnd(16)} [${action.kind.padEnd(7)}] ${action.id} → ${dim(action.destination)}`);
    }
    console.log(
      `\n${bold(res.installed_count)} items ${res.dry_run ? "planned (dry-run)" : "installed"} · all skills security-verified (0 critical findings)`
    );
    if (!res.dry_run) console.log(dim(`  recorded in ${path.relative(process.cwd(), manifestPath({ cwd: process.cwd() }))}`));
    break;
  }

  case "audit":
  case "security": {
    const targetId = value || flags.id;
    if (targetId) {
      const skill = resolve(targetId);
      const sec = getSecurityRecord(skill.id);
      if (flags.json) {
        json({ id: skill.id, ...sec });
        process.exit(sec.verified ? 0 : 1);
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
      json(securityData);
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
    if (!value) fail("usage: aidentity info <id> [--json]");
    const skill = resolve(value);
    if (flags.json) {
      json({ ...skill, security: getSecurityRecord(skill.id) });
      break;
    }
    printSkill(skill);
    break;
  }

  case "add":
  case "install": {
    const ids = positional.slice(1);
    if (!ids.length) fail("usage: aidentity add <id...> [--agent <name>] [--global] [--force] [--dry-run]");

    const skills = ids.map((id) => resolve(id));
    const agentKey = resolveAgent(flags, { required: !flags["dry-run"] });
    const options = {
      agentKey: agentKey || "claude",
      global: Boolean(flags.global),
      cwd: process.cwd(),
      dryRun: Boolean(flags["dry-run"]),
      force: Boolean(flags.force),
      allSkills: REGISTRY.skills,
    };

    // Security gate: refuse the whole batch before writing anything.
    for (const skill of skills) {
      if (!skill.distributable || !skill.path) {
        console.log(`${skill.name} is indexed but not hosted — its upstream license does not permit redistribution.`);
        console.log(`Read it here: ${skill.upstream ? skill.upstream.url : skill.source.url}`);
        process.exit(2);
      }
      const sec = getSecurityRecord(skill.id);
      if (!sec.verified) fail(`security verification failed for "${skill.id}" (status: ${sec.status}). Installation blocked.`);
    }

    if (flags["dry-run"]) {
      for (const skill of skills) {
        const destination = path.join(
          flags.global ? process.env.HOME || process.env.USERPROFILE : process.cwd(),
          AGENTS[options.agentKey].dir,
          path.basename(skill.id)
        );
        console.log(`${bold("would install")} ${skill.name} → ${path.relative(process.cwd(), destination) || destination}`);
      }
      break;
    }

    const result = installSkills(skills, options);
    for (const entry of result.installed) {
      const skill = skills.find((s) => s.id === entry.id);
      const sec = getSecurityRecord(entry.id);
      console.log(`${bold("installed")} ${skill.name} → ${path.relative(process.cwd(), entry.destination) || entry.destination}`);
      console.log(dim(`  ${AGENTS[options.agentKey].label} · ${skill.source.repo} · ${skill.source.license} · ${entry.hash.slice(0, 19)}…`));
      if (sec.files_scanned) console.log(dim(`  verified: ${sec.files_scanned} files, 0 critical findings`));
    }
    for (const entry of result.failed) {
      console.error(red("failed ") + entry.id + ": " + entry.error);
    }
    if (flags.json) json(result);
    if (result.failed.length) process.exit(1);
    break;
  }

  case "installed":
  case "list-installed": {
    command_installed();
    break;
  }

  case "remove":
  case "uninstall": {
    if (!value) fail("usage: aidentity remove <id> [--agent <name>] [--global]");
    const agentKey = flags.agent;
    const result = removeSkill({ id: value, agent: agentKey, global: Boolean(flags.global), cwd: process.cwd() });
    if (flags.json) {
      json(result);
      break;
    }
    for (const entry of result.removed) {
      console.log(`${bold("removed")} ${entry.id} ${dim(entry.tracked ? "" : "(untracked, removed from default location)")}`);
      console.log(dim(`  ${path.relative(process.cwd(), entry.path) || entry.path}`));
    }
    break;
  }

  case "update": {
    const ids = positional.slice(1);
    const results = updateSkills({
      ids,
      global: Boolean(flags.global),
      cwd: process.cwd(),
      dryRun: Boolean(flags["dry-run"]),
      registry: REGISTRY,
    });
    if (flags.json) {
      json(results);
      break;
    }
    if (!results.length) {
      console.log("nothing installed to update");
      break;
    }
    for (const result of results) {
      const label =
        result.status === "current"
          ? dim("current")
          : result.status === "updated"
            ? green("updated")
            : result.status === "repaired"
              ? green("repaired")
              : result.status === "would-update" || result.status === "would-repair"
                ? bold(result.status.replace("would-", "would "))
                : result.status === "gone"
                  ? yellow("gone")
                  : red("failed");
      console.log(`${label.padEnd(14)} ${result.id}${result.message ? dim(` — ${result.message}`) : ""}`);
    }
    break;
  }

  case "doctor": {
    const report = doctor({ global: Boolean(flags.global), cwd: process.cwd() });
    if (flags.json) {
      json(report);
      process.exit(report.healthy ? 0 : 1);
    }
    console.log(bold("Aidentity doctor"));
    console.log(`  root:      ${report.root}`);
    console.log(`  manifest:  ${report.manifest_exists ? report.manifest : dim("none — nothing installed yet")}`);
    console.log(`  agents:    ${report.agents.length ? report.agents.map((a) => a.label).join(", ") : dim("none detected")}`);
    console.log(`  installed: ${report.installed.length}`);
    if (report.installed.length) {
      for (const item of report.installed) {
        const tag = item.status === "ok" ? green("ok") : item.status === "modified" ? yellow("modified") : red("missing");
        console.log(`    ${tag.padEnd(10)} ${item.id} ${dim(item.path)}`);
      }
    }
    if (report.orphans.length) {
      console.log(`  untracked: ${report.orphans.length}`);
      for (const orphan of report.orphans) console.log(`    ${dim(orphan.path)}`);
    }
    if (!report.problems.length) console.log(green("\n  healthy"));
    else for (const problem of report.problems) console.log(`  ${problem.level.padEnd(6)} ${problem.message}`);
    process.exit(report.healthy ? 0 : 1);
  }

  case "verify": {
    const report = doctor({ global: Boolean(flags.global), cwd: process.cwd() });
    const broken = report.installed.filter((item) => item.status !== "ok");
    if (flags.json) {
      json({ checked: report.installed.length, broken, healthy: broken.length === 0 });
      process.exit(broken.length ? 1 : 0);
    }
    console.log(
      broken.length
        ? red(`${broken.length} of ${report.installed.length} installed skills do not match their recorded hash`)
        : green(`all ${report.installed.length} installed skills match their recorded hash`)
    );
    for (const item of broken) console.log(`  ${item.status.padEnd(10)} ${item.id} ${dim(item.path)}`);
    process.exit(broken.length ? 1 : 0);
  }

  case "app": {
    const { startApp } = require("../app/server");
    const port = Number(flags.port) || 7419;
    const cwd = process.cwd();

    // Prefer the desktop shell when Electron is installed; fall back to the
    // same UI in a browser tab so the app is usable from a bare `npx`.
    let electronPath = null;
    if (!flags.web) {
      try {
        electronPath = require("electron");
      } catch {
        electronPath = null;
      }
    }

    if (typeof electronPath === "string") {
      const { spawn } = require("child_process");
      const env = { ...process.env, AIDENTITY_CWD: cwd, AIDENTITY_PORT: String(port) };
      delete env.ELECTRON_RUN_AS_NODE;
      const child = spawn(electronPath, [path.join(ROOT, "app", "main.js")], {
        stdio: "inherit",
        env,
      });
      child.on("exit", (code) => process.exit(code || 0));
      break;
    }

    console.log(dim("Electron is not installed — opening the app in your browser."));
    console.log(dim("  for the desktop window: npm i -D electron && aidentity app\n"));
    startApp({ port, open: !flags["no-open"], cwd });
    break;
  }

  case "agents": {
    if (flags.json) {
      json(Object.entries(AGENTS).map(([key, agent]) => ({ key, dir: agent.dir, label: agent.label })));
      break;
    }
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
  aidentity roles                       list all ${rolesData.roles.length} roles
  aidentity search <query>              find a skill by task, technology or keyword
  aidentity recommend "<task>"          bundle + skills for a task
  aidentity info <id>                   source, license, security, context cost
  aidentity add <id...> [options]       install security-verified skills (tracked)
  aidentity installed                   what is installed here, and is it intact
  aidentity remove <id>                 uninstall a skill and update the manifest
  aidentity update [<id...>]            re-install skills whose package content changed
  aidentity verify                      check installed skills against recorded hashes
  aidentity doctor                      agents, manifest, drift, untracked skills
  aidentity audit [skill-id]            security status & SHA-256 digests
  aidentity app                         open the desktop app
  aidentity list                        list everything
  aidentity agents                      supported agent directories
  aidentity mcp                         run local stdio MCP server for agent integration

Options
  --profile <p>     individual (default) | enterprise
  --prompt          print a copy-paste AI setup prompt for the role & profile
  --agent <name>    ${Object.keys(AGENTS).join(" | ")}
  --global          install into ~/ instead of the current project
  --force           overwrite an existing skill directory
  --dry-run         preview planned files without writing
  --json            machine-readable output (every command)
  --category <c>    filter search / list
  --source <key>    filter search / list
  --limit <n>       max results

Examples
  aidentity setup software-engineer --profile individual --agent claude
  aidentity search "postgres migrations"
  aidentity recommend "build a stripe billing flow"
  aidentity add supabase/supabase-postgres-best-practices --agent cursor
  aidentity installed
  aidentity doctor`);
    break;
  }

  default:
    fail(`unknown command "${command}". Run: aidentity help`);
}

function command_installed() {
  const items = listInstalled({ global: Boolean(flags.global), cwd: process.cwd() });
  if (flags.json) {
    json({ count: items.length, items });
    return;
  }
  if (!items.length) {
    console.log(`nothing installed in ${process.cwd()}`);
    console.log(dim("install something: aidentity search \"postgres\""));
    return;
  }
  console.log(dim(`${items.length} installed · ${manifestPath({ global: Boolean(flags.global), cwd: process.cwd() })}\n`));
  const tokens = items.reduce((sum, item) => {
    const skill = REGISTRY.skills.find((entry) => entry.id === item.id);
    return sum + (skill && skill.tokens ? skill.tokens : 0);
  }, 0);
  for (const item of items) {
    const tag = item.status === "ok" ? green("ok") : item.status === "modified" ? yellow("modified") : red("missing");
    const skill = REGISTRY.skills.find((entry) => entry.id === item.id);
    console.log(`${tag.padEnd(10)} ${item.name.padEnd(34)} ${dim(item.path)}`);
    if (skill && skill.tokens) console.log(`           ${dim(`~${skill.tokens} tokens · ${item.agent}`)}`);
  }
  if (tokens) console.log(dim(`\n~${tokens} tokens of context added by these skills`));
}
