/**
 * Role & profile setup engine for Aidentity.
 *
 * Resolves a role (by slug, alias, or requirement query) and profile
 * (individual vs enterprise), verifies every skill against registry/security.json,
 * and either generates a one-shot AI setup prompt or installs the full setup
 * (skills, rules, agents, commands, hooks) into the target agent workspace.
 */

const fs = require("fs");
const path = require("path");
const { registry, bundles, recommend, tokens } = require("./search");
const { AGENT_TARGETS } = require("./agents");

const ROOT = path.join(__dirname, "..", "..");
const ROLES_FILE = path.join(ROOT, "roles", "roles.json");
const SECURITY_FILE = path.join(ROOT, "registry", "security.json");

const rolesData = fs.existsSync(ROLES_FILE)
  ? JSON.parse(fs.readFileSync(ROLES_FILE, "utf8"))
  : { profiles: {}, roles: [] };
const securityData = fs.existsSync(SECURITY_FILE)
  ? JSON.parse(fs.readFileSync(SECURITY_FILE, "utf8"))
  : { skills: {} };

function findRole(query) {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();
  const slugified = q.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // 1. Exact slug or alias match
  for (const role of rolesData.roles) {
    if (
      role.slug === q ||
      role.slug === slugified ||
      role.name.toLowerCase() === q ||
      (role.aliases || []).includes(q) ||
      (role.aliases || []).includes(slugified)
    ) {
      return role;
    }
  }

  // 2. Token scoring across role name, aliases, categories, and description
  const queryTokens = tokens(q);
  if (!queryTokens.length) return null;

  const ranked = rolesData.roles
    .map((role) => {
      const nameStr = `${role.slug} ${role.name} ${(role.aliases || []).join(" ")}`.toLowerCase();
      const catStr = (role.categories || []).join(" ").toLowerCase();
      const descStr = (role.description || "").toLowerCase();
      let score = 0;
      for (const t of queryTokens) {
        if (nameStr.includes(t)) score += 6;
        if (catStr.includes(t)) score += 4;
        if (descStr.includes(t)) score += 2;
      }
      return { role, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0] ? ranked[0].role : null;
}

function getSecurityRecord(skillId) {
  const sec = (securityData.skills && securityData.skills[skillId]) || null;
  return (
    sec || {
      status: "unverified",
      risk_level: "unknown",
      verified: false,
      files_scanned: 0,
      sha256: null,
    }
  );
}

function buildRolePlan({ role: roleInput, profile: profileKey = "individual", task = "", agent = "claude" }) {
  const profile = rolesData.profiles[profileKey] || rolesData.profiles.individual || {
    name: profileKey === "enterprise" ? "Enterprise" : "Individual",
    description: "",
    enforce_security_gate: true,
    install_hooks: ["hooks/block-dangerous.js", "hooks/scan-secrets.js"],
    extra_skills: [],
  };

  const role = typeof roleInput === "string" ? findRole(roleInput) : roleInput || findRole(task) || findRole("software-engineer");
  if (!role) {
    throw new Error(`Unknown role "${roleInput}". Run: aidentity setup --list`);
  }

  // Combine role skills + enterprise extra skills + optional task-recommended skills
  const skillIds = new Set([...(role.skills || []), ...(profile.extra_skills || [])]);
  if (task) {
    const rec = recommend(task, 4);
    for (const s of rec.skills) {
      if (s.status === "stable" && s.install) skillIds.add(s.id);
    }
  }

  const resolvedSkills = [];
  for (const id of skillIds) {
    const skill = registry.skills.find((s) => s.id === id);
    if (!skill || !skill.distributable || skill.status !== "stable") continue;
    const sec = getSecurityRecord(skill.id);
    if (profile.enforce_security_gate && !sec.verified) continue;
    resolvedSkills.push({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      license: skill.source.license,
      source: skill.source.repo,
      path: skill.path,
      tokens: skill.tokens || null,
      install: skill.install,
      security: {
        status: sec.status,
        verified: Boolean(sec.verified),
        sha256: sec.sha256 ? sec.sha256.slice(0, 16) : null,
      },
    });
  }

  const hooks = [...new Set([...(role.hooks || []), ...(profile.install_hooks || [])])];
  const rules = [...new Set(role.rules || [])];
  const agents = [...new Set(role.agents || [])];
  if (profileKey === "enterprise" && !agents.includes("agents/security-auditor.md")) {
    agents.push("agents/security-auditor.md");
  }
  const commands = [...new Set(role.commands || [])];
  if (profileKey === "enterprise" && !commands.includes("commands/review.md")) {
    commands.push("commands/review.md");
  }

  return {
    role: {
      slug: role.slug,
      name: role.name,
      description: role.description,
      categories: role.categories,
      bundles: role.bundles,
    },
    profile: {
      slug: profileKey === "enterprise" ? "enterprise" : "individual",
      name: profile.name,
      description: profile.description,
    },
    agent: AGENT_TARGETS[agent] ? agent : "claude",
    skills: resolvedSkills,
    rules,
    agents,
    commands,
    hooks,
    cli_command: `npx aidentity setup ${role.slug} --profile ${profileKey === "enterprise" ? "enterprise" : "individual"} --agent ${agent}`,
  };
}

function generateSetupPrompt(plan) {
  const isEnterprise = plan.profile.slug === "enterprise";
  const skillLines = plan.skills
    .map(
      (s) =>
        `  - \`${s.id}\` (${s.license} · security: ${s.security.status}${s.security.sha256 ? ` · sha256:${s.security.sha256}` : ""}): ${(s.description || "").replace(/\s*—\s*/g, ", ").replace(/\s*–\s*/g, " - ")}`
    )
    .join("\n");

  const ruleLines = plan.rules.length
    ? plan.rules.map((r) => `  - \`${r}\``).join("\n")
    : "  - None required for this role (use project conventions)";

  const agentLines = plan.agents.length
    ? plan.agents.map((a) => `  - \`${a}\``).join("\n")
    : "  - None required";

  const hookLines = plan.hooks.length
    ? plan.hooks.map((h) => `  - \`${h}\``).join("\n")
    : "  - `hooks/scan-secrets.js`";

  return `# Aidentity Setup Prompt: ${plan.role.name} (${plan.profile.name})

Set up my AI agent environment for the **${plan.role.name}** role using the **${plan.profile.name}** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
\`\`\`bash
${plan.cli_command}
\`\`\`

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against \`https://akshatnaruka.github.io/aidentity/security.json\` (or local \`registry/security.json\`) that \`verified === true\` and \`risk_level === "safe"\`.
2. Never install any skill where \`distributable === false\`, \`content_url === null\`, or \`status !== "stable"\`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
${
  isEnterprise
    ? `4. **Enterprise Governance**: Enable all pre-tool security hooks (\`block-dangerous.js\`, \`scan-secrets.js\`), post-edit formatting (\`format-on-save.js\`), and test verification (\`test-on-stop.js\`). Require security and supply-chain review before shipping.`
    : `4. **Individual Guardrails**: Enable \`block-dangerous.js\` and \`scan-secrets.js\` to prevent accidental destructive commands or credential leaks.`
}

## 3. Verified Skills for ${plan.role.name} (${plan.skills.length})
Install with \`npx aidentity add <id> --agent ${plan.agent}\`:
${skillLines}

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or \`AGENTS.md\`:
${ruleLines}

## 5. Scoped Subagents & Slash Commands
- Subagents:
${agentLines}
- Guardrail Hooks:
${hookLines}`;
}

function executeSetup(plan, { global = false, dryRun = false, cwd = process.cwd() } = {}) {
  const target = AGENT_TARGETS[plan.agent];
  if (!target) {
    throw new Error(`Unknown agent "${plan.agent}". Supported: ${Object.keys(AGENT_TARGETS).join(", ")}`);
  }

  const baseRoot = global ? process.env.HOME || process.env.USERPROFILE : cwd;
  const actions = [];

  const copyItem = (relSource, destSubdir, destName, kind, meta = {}) => {
    const src = path.join(ROOT, relSource);
    const destDir = path.join(baseRoot, destSubdir);
    const dest = path.join(destDir, destName);
    const relDest = path.relative(cwd, dest) || dest;

    if (!fs.existsSync(src)) {
      actions.push({ kind, id: relSource, status: "skipped", reason: "source missing", destination: relDest });
      return;
    }

    if (dryRun) {
      actions.push({ kind, id: relSource, status: "would-install", destination: relDest });
      return;
    }

    fs.mkdirSync(destDir, { recursive: true });
    if (fs.statSync(src).isDirectory()) {
      fs.cpSync(src, dest, { recursive: true, force: true });
    } else {
      fs.copyFileSync(src, dest);
    }
    actions.push({ kind, id: relSource, status: "installed", destination: relDest, absolute: dest, ...meta });
  };

  // 1. Skills (already security-gated in buildRolePlan)
  for (const skill of plan.skills) {
    const skillDir = path.dirname(skill.path);
    copyItem(skillDir, target.skillsDir, path.basename(skill.id), "skill", {
      skillId: skill.id,
      skillName: skill.name,
      sourceRepo: skill.source,
      sourceLicense: skill.license,
    });
  }

  // 2. Rules
  for (const rulePath of plan.rules) {
    const parts = rulePath.split("/");
    const name = parts.length > 2 ? `${parts[1]}-${parts[parts.length - 1]}` : path.basename(rulePath);
    copyItem(rulePath, target.rulesDir, name, "rule");
  }

  // 3. Subagents
  for (const agentPath of plan.agents) {
    copyItem(agentPath, target.agentsDir, path.basename(agentPath), "agent");
  }

  // 4. Commands
  for (const cmdPath of plan.commands) {
    copyItem(cmdPath, target.commandsDir, path.basename(cmdPath), "command");
  }

  // 5. Hooks
  for (const hookPath of plan.hooks) {
    copyItem(hookPath, target.hooksDir, path.basename(hookPath), "hook");
  }

  // 6. Record everything in the install manifest so it can be listed,
  //    verified and removed later.
  if (!dryRun) {
    try {
      const { contentHash, readManifest, writeManifest } = require("./installed");
      let manifest = readManifest({ cwd: baseRoot, global: false });
      for (const action of actions) {
        if (action.status !== "installed" || !action.absolute) continue;
        const item = {
          id: action.skillId || action.id,
          name: action.skillName || path.basename(action.id),
          kind: action.kind,
          agent: plan.agent,
          path: path.relative(baseRoot, action.absolute).split(path.sep).join("/"),
          content_hash: contentHash(action.absolute),
          source_repo: action.sourceRepo || "AkshatNaruka/aidentity",
          source_license: action.sourceLicense || "MIT",
          installed_at: new Date().toISOString(),
          via: `setup:${plan.role.slug}:${plan.profile.slug}`,
        };
        manifest = {
          ...manifest,
          items: manifest.items.filter(
            (entry) => !(entry.id === item.id && entry.agent === item.agent && entry.kind === item.kind)
          ).concat(item),
        };
      }
      writeManifest(manifest, { cwd: baseRoot, global: false });
    } catch (error) {
      // A manifest failure must not fail an otherwise successful install.
      actions.push({ kind: "manifest", id: "installed.json", status: "skipped", reason: error.message });
    }
  }

  return {
    role: plan.role.slug,
    profile: plan.profile.slug,
    agent: plan.agent,
    dry_run: dryRun,
    installed_count: actions.filter((a) => a.status === "installed" || a.status === "would-install").length,
    actions,
  };
}

module.exports = {
  rolesData,
  securityData,
  AGENT_TARGETS,
  findRole,
  getSecurityRecord,
  buildRolePlan,
  generateSetupPrompt,
  executeSetup,
};
