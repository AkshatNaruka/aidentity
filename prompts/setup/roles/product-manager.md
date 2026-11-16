---
id: prompt/setup-product-manager
name: Product manager Setup Prompt
description: Initial AI agent setup prompt for Product manager (Individual & Enterprise profiles) — installs verified skills, rules, subagents, commands, and security hooks.
category: setup
tags: setup, role, product-manager, individual, enterprise
---

# Product manager — Initial Setup Prompts

> **Role**: Product manager (`product-manager`)
> **Focus**: Specs, discovery, prioritisation, stakeholder updates, sprint planning.
> **Categories**: `planning`, `project-management`, `research`, `docs`
> **Security**: All 12 recommended skills are scanned and verified (`0` critical findings).

---

## Quick CLI Setup

```bash
# Individual setup (skills + rules + subagents + safety hooks)
npx aidentity setup product-manager --profile individual

# Enterprise setup (adds security/supply-chain audit skills + full governance hooks)
npx aidentity setup product-manager --profile enterprise

# Print the copy-paste prompt in terminal
npx aidentity setup product-manager --profile individual --prompt
```

---

## Option A: Individual Setup Prompt

Copy and paste into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

```markdown
# Aidentity Setup Prompt — Product manager (Individual)

Set up my AI agent environment for the **Product manager** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup product-manager --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Product manager (8)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/to-spec` (MIT · security: verified · sha256:28c49f322cf90718) — Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed.
  - `mattpocock/engineering/grill-with-docs` (MIT · security: verified · sha256:602d92b5da4e4645) — A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69) — Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `addyosmani/spec-driven-development` (MIT · security: verified · sha256:9871cd4ac234f0ea) — Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
  - `abrahamferga-scrum-skills/po-create-user-story` (MIT · security: verified · sha256:4e18b94180d49efb) — Writes a high-quality user story from a plain-English prompt. Drafts immediately, refines through conversation, validates against INVEST, and creates the story in the connected PM tool after confirmation. Use when a Product Owner or Product Manager says things like "I need a story for…", "write a user story about…", "add to the backlog…", "create a PBI for…", "create a ticket for…", or describes a feature, user need, or problem to capture. Don't use for technical tasks with no user value framing, bug reports, spike investigations, or general Scrum questions. Don't use when the request is clearly for an epic or a full feature breakdown — write the single most valuable story and offer to split the rest.
  - `abrahamferga-scrum-skills/po-split-story` (MIT · security: verified · sha256:f6d8aabdfe44d2c1) — Applies proven story splitting patterns to break an oversized user story or epic into sprint-sized, independently deliverable stories. Use when a Product Owner or developer says things like "this story is too big", "we need to split this", "this will not fit in a sprint", "break this epic down", "help me slice this story", or when a story fails the Small criterion in INVEST. Do not use for writing new stories from scratch — use po-create-user-story instead. Do not use for sprint planning or backlog prioritization.
  - `abrahamferga-scrum-skills/po-release-notes` (MIT · security: verified · sha256:439b29720ba83e04) — Generates audience-appropriate release notes from completed Sprint work items — translating technical changes into plain-language user outcomes for stakeholders, customers, or internal teams. Use when a Product Owner says things like "write release notes", "what shipped this Sprint", "generate a changelog", "what did we deliver", "draft the release email", or "summarise what we released". Do not use for sprint review facilitation — use sprint-review for that. Do not use for velocity analysis.
  - `abrahamferga-scrum-skills/audit-backlog-ado` (MIT · security: verified · sha256:d6fa357020cc762b) — Audits the Azure DevOps product backlog for hygiene, story quality, and refinement readiness — identifying items that are too large, missing acceptance criteria, stale, unestimated, or out of priority order. Use when a Scrum Master or Product Owner says things like "audit the backlog", "is the backlog healthy", "review the backlog before refinement", "clean up the backlog", "check backlog hygiene", or "prepare the backlog for planning". Do not use for individual story audits — use audit-user-story for that. Do not use for sprint planning or velocity review.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/planner.md`
  - `agents/researcher.md`
  - `agents/doc-writer.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
```

---

## Option B: Enterprise Setup Prompt

Copy and paste for team/organization standardization and strict security governance:

```markdown
# Aidentity Setup Prompt — Product manager (Enterprise)

Set up my AI agent environment for the **Product manager** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup product-manager --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Product manager (12)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/to-spec` (MIT · security: verified · sha256:28c49f322cf90718) — Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed.
  - `mattpocock/engineering/grill-with-docs` (MIT · security: verified · sha256:602d92b5da4e4645) — A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69) — Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `addyosmani/spec-driven-development` (MIT · security: verified · sha256:9871cd4ac234f0ea) — Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
  - `abrahamferga-scrum-skills/po-create-user-story` (MIT · security: verified · sha256:4e18b94180d49efb) — Writes a high-quality user story from a plain-English prompt. Drafts immediately, refines through conversation, validates against INVEST, and creates the story in the connected PM tool after confirmation. Use when a Product Owner or Product Manager says things like "I need a story for…", "write a user story about…", "add to the backlog…", "create a PBI for…", "create a ticket for…", or describes a feature, user need, or problem to capture. Don't use for technical tasks with no user value framing, bug reports, spike investigations, or general Scrum questions. Don't use when the request is clearly for an epic or a full feature breakdown — write the single most valuable story and offer to split the rest.
  - `abrahamferga-scrum-skills/po-split-story` (MIT · security: verified · sha256:f6d8aabdfe44d2c1) — Applies proven story splitting patterns to break an oversized user story or epic into sprint-sized, independently deliverable stories. Use when a Product Owner or developer says things like "this story is too big", "we need to split this", "this will not fit in a sprint", "break this epic down", "help me slice this story", or when a story fails the Small criterion in INVEST. Do not use for writing new stories from scratch — use po-create-user-story instead. Do not use for sprint planning or backlog prioritization.
  - `abrahamferga-scrum-skills/po-release-notes` (MIT · security: verified · sha256:439b29720ba83e04) — Generates audience-appropriate release notes from completed Sprint work items — translating technical changes into plain-language user outcomes for stakeholders, customers, or internal teams. Use when a Product Owner says things like "write release notes", "what shipped this Sprint", "generate a changelog", "what did we deliver", "draft the release email", or "summarise what we released". Do not use for sprint review facilitation — use sprint-review for that. Do not use for velocity analysis.
  - `abrahamferga-scrum-skills/audit-backlog-ado` (MIT · security: verified · sha256:d6fa357020cc762b) — Audits the Azure DevOps product backlog for hygiene, story quality, and refinement readiness — identifying items that are too large, missing acceptance criteria, stale, unestimated, or out of priority order. Use when a Scrum Master or Product Owner says things like "audit the backlog", "is the backlog healthy", "review the backlog before refinement", "clean up the backlog", "check backlog hygiene", or "prepare the backlog for planning". Do not use for individual story audits — use audit-user-story for that. Do not use for sprint planning or velocity review.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819) — Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6) — Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e) — Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/planner.md`
  - `agents/researcher.md`
  - `agents/doc-writer.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
