#!/usr/bin/env node

/**
 * Generate prompts/setup/** from roles/roles.json and registry/security.json.
 *
 * Emits:
 *   - prompts/setup/README.md
 *   - prompts/setup/universal-individual.md
 *   - prompts/setup/universal-enterprise.md
 *   - prompts/setup/roles/<role-slug>.md (20 role setup prompts with Individual & Enterprise profiles)
 *
 * Usage:
 *   node scripts/build-setup-prompts.js
 *   node scripts/build-setup-prompts.js --check
 */

const fs = require("fs");
const path = require("path");
const { rolesData, buildRolePlan, generateSetupPrompt } = require("../cli/lib/setup");

const ROOT = path.join(__dirname, "..");
const SETUP_DIR = path.join(ROOT, "prompts", "setup");
const ROLES_OUT_DIR = path.join(SETUP_DIR, "roles");

function buildUniversalIndividual() {
  return `---
id: prompt/setup-individual
name: Universal Individual Setup Prompt
description: One-shot prompt to interview an individual user, detect their role and stack, verify skill security, and install skills, rules, subagents, and hooks.
category: setup
tags: setup, onboarding, individual, role, security
---

# Universal Individual Setup Prompt

Copy and paste this prompt into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

\`\`\`markdown
Set up my AI agent environment using Aidentity (Individual Profile).

1. Read https://akshatnaruka.github.io/aidentity/llms.txt and https://akshatnaruka.github.io/aidentity/roles.json (or local roles/roles.json).
2. Ask me:
   - What is my primary role or job? (e.g. Software Engineer, Architect, Product Manager, Designer, Marketer, Finance Analyst, Quant, Data Analyst, Legal, Sales, Support, Teacher, HR, Creator, Filmmaker, Music Producer, Journalist)
   - What tech stack or tools am I using in this workspace?
3. If you have shell access, run:
   npx aidentity setup <role-slug> --profile individual
4. If installing manually or recommending additional task skills:
   - Fetch https://akshatnaruka.github.io/aidentity/security.json (or local registry/security.json).
   - Verify every skill has verified: true, risk_level: "safe", status: "stable", and distributable: true.
   - Tell me the upstream author, SPDX license, and SHA-256 verification status before installing.
   - Install approved skills with: npx aidentity add <id>
   - Configure language rules (rules/) and baseline safety hooks (hooks/block-dangerous.js, hooks/scan-secrets.js).
\`\`\`
`;
}

function buildUniversalEnterprise() {
  return `---
id: prompt/setup-enterprise
name: Universal Enterprise Setup Prompt
description: One-shot enterprise onboarding prompt with mandatory SHA-256 skill security verification, supply-chain audit skills, secret/command guardrails, and team governance rules.
category: setup
tags: setup, onboarding, enterprise, security, governance, role
---

# Universal Enterprise Setup Prompt

Copy and paste this prompt into your organization's coding agent or include it in your team onboarding guide:

\`\`\`markdown
Set up this workspace with Aidentity (Enterprise Governance Profile).

1. Read https://akshatnaruka.github.io/aidentity/roles.json and https://akshatnaruka.github.io/aidentity/security.json (or local roles/roles.json and registry/security.json).
2. Identify the role for this user or repository (e.g. software-engineer, architect, engineering-manager, product-manager, data-analyst, security-review).
3. Run the enterprise setup command:
   npx aidentity setup <role-slug> --profile enterprise
4. Enforce Enterprise Security & Compliance Gate:
   - Reject any skill where verified !== true, risk_level !== "safe", status !== "stable", or distributable !== true.
   - Verify license compliance: allow MIT, Apache-2.0, BSD, CC0; flag CC-BY-SA-4.0 for share-alike review; never install LicenseRef-Proprietary entries.
   - Ensure enterprise security skills are installed:
     * addyosmani/security-and-hardening
     * trailofbits/supply-chain-risk-auditor
     * trailofbits/agentic-actions-auditor
     * addyosmani/code-review-and-quality
   - Enable all 4 lifecycle guardrail hooks:
     * hooks/block-dangerous.js (blocks destructive shell commands)
     * hooks/scan-secrets.js (blocks hardcoded API keys, tokens, and private keys)
     * hooks/format-on-save.js (enforces code formatting on edit)
     * hooks/test-on-stop.js (requires tests to pass before completion)
   - Install the scoped security-auditor and reviewer subagents (agents/security-auditor.md, agents/reviewer.md).
\`\`\`
`;
}

function buildRoleMarkdown(role) {
  const indPlan = buildRolePlan({ role: role.slug, profile: "individual", agent: "claude" });
  const entPlan = buildRolePlan({ role: role.slug, profile: "enterprise", agent: "claude" });

  return `---
id: prompt/setup-${role.slug}
name: ${role.name} Setup Prompt
description: Initial AI agent setup prompt for ${role.name} (Individual & Enterprise profiles) — installs verified skills, rules, subagents, commands, and security hooks.
category: setup
tags: setup, role, ${role.slug}, individual, enterprise
---

# ${role.name} — Initial Setup Prompts

> **Role**: ${role.name} (\`${role.slug}\`)
> **Focus**: ${role.description}
> **Categories**: ${role.categories.map((c) => `\`${c}\``).join(", ")}
> **Security**: All ${entPlan.skills.length} recommended skills are scanned and verified (\`0\` critical findings).

---

## Quick CLI Setup

\`\`\`bash
# Individual setup (skills + rules + subagents + safety hooks)
npx aidentity setup ${role.slug} --profile individual

# Enterprise setup (adds security/supply-chain audit skills + full governance hooks)
npx aidentity setup ${role.slug} --profile enterprise

# Print the copy-paste prompt in terminal
npx aidentity setup ${role.slug} --profile individual --prompt
\`\`\`

---

## Option A: Individual Setup Prompt

Copy and paste into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

\`\`\`markdown
${generateSetupPrompt(indPlan)}
\`\`\`

---

## Option B: Enterprise Setup Prompt

Copy and paste for team/organization standardization and strict security governance:

\`\`\`markdown
${generateSetupPrompt(entPlan)}
\`\`\`
`;
}

function buildReadme() {
  const rows = rolesData.roles
    .map((role) => {
      const ind = buildRolePlan({ role: role.slug, profile: "individual" });
      const ent = buildRolePlan({ role: role.slug, profile: "enterprise" });
      return `| **[${role.name}](roles/${role.slug}.md)** | \`npx aidentity setup ${role.slug}\` | ${ind.skills.length} skills · ${ind.rules.length} rules · ${ind.agents.length} agents | ${ent.skills.length} skills · ${ent.hooks.length} hooks |`;
    })
    .join("\n");

  return `# Role & Enterprise Setup Prompts

One-command and one-prompt initial setups for **Individuals** and **Enterprises** across all 20 roles.
Every skill included in a role setup is verified by \`scripts/scan-skills-security.js\` (\`registry/security.json\`) for zero hidden Unicode, zero leaked credentials, zero destructive commands, and zero prompt-injection payloads.

## Universal Onboarding Prompts

- **[Universal Individual Setup Prompt](universal-individual.md)** — interactive prompt that interviews you about your role and stack, then configures verified skills, rules, and safety hooks.
- **[Universal Enterprise Setup Prompt](universal-enterprise.md)** — strict governance prompt for engineering teams and enterprises with SHA-256 verification, SPDX license checks, supply-chain auditing, and all 4 lifecycle guardrail hooks.

## CLI Usage

\`\`\`bash
# List all 20 role setups
npx aidentity setup --list

# Set up your current workspace for a role (auto-detects agent or pass --agent)
npx aidentity setup software-engineer --profile individual --agent claude

# Enterprise setup for an architect
npx aidentity setup architect --profile enterprise --agent cursor

# Output a copy-paste setup prompt for any role + custom requirement
npx aidentity setup software-engineer --profile enterprise --task "Next.js + Supabase SaaS" --prompt

# Run the full security audit across all 526 skills
npx aidentity audit
\`\`\`

## Role Setup Catalog (20 Roles)

| Role | CLI Command | Individual Profile | Enterprise Profile |
|---|---|---|---|
${rows}
`;
}

function generateAll() {
  const files = new Map();
  files.set(path.join(SETUP_DIR, "README.md"), buildReadme());
  files.set(path.join(SETUP_DIR, "universal-individual.md"), buildUniversalIndividual());
  files.set(path.join(SETUP_DIR, "universal-enterprise.md"), buildUniversalEnterprise());

  for (const role of rolesData.roles) {
    files.set(path.join(ROLES_OUT_DIR, `${role.slug}.md`), buildRoleMarkdown(role));
  }
  return files;
}

if (require.main === module) {
  const files = generateAll();

  if (process.argv.includes("--check")) {
    for (const [filePath, content] of files.entries()) {
      const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
      if (current !== content) {
        console.error(`${path.relative(ROOT, filePath)} is stale. Run: node scripts/build-setup-prompts.js`);
        process.exit(1);
      }
    }
    console.log(`Setup prompts are up to date (${files.size} files).`);
    process.exit(0);
  }

  fs.mkdirSync(ROLES_OUT_DIR, { recursive: true });
  for (const [filePath, content] of files.entries()) {
    fs.writeFileSync(filePath, content);
  }
  console.log(`Wrote ${files.size} setup prompt files to ${path.relative(ROOT, SETUP_DIR)}/`);
}
