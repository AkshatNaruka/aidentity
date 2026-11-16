---
type: Playbook
title: "Software engineer AI Agent Setup Playbook (Individual & Enterprise)"
description: "Day-to-day coding: planning, implementation, review, tests, debugging. Verified skills, rules, subagents, and safety hooks for Claude Code, Cursor, Codex, and Gemini CLI."
resource: https://akshatnaruka.github.io/aidentity/playbooks/software-engineer/
tags: [software-engineer, engineering, code-review, testing, debugging, git, playbook, agent-setup]
timestamp: 2026-11-16
---

# Software engineer AI Agent Setup Playbook (Individual & Enterprise)

**Definition:** The **Software engineer AI Agent Playbook** configures any coding agent (Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or GitHub Copilot) for day-to-day coding: planning, implementation, review, tests, debugging. It installs 8 SHA-256 security-verified skills in the Individual profile and 11 skills plus 4 runtime guardrails in the Enterprise profile.

## Quick Commands

```bash
# Individual setup (8 verified skills)
npx aidentity setup software-engineer --profile individual

# Enterprise setup (11 verified skills + supply-chain & security hooks)
npx aidentity setup software-engineer --profile enterprise
```

## Individual vs. Enterprise Comparison

| Component | Individual Profile | Enterprise Profile |
|---|---|---|
| Verified Skills | 8 core skills | 11 skills (+4 security/audit skills) |
| Coding Rules | 3 rule files | 3 rule files |
| Subagents | 3 subagents | 4 subagents |
| Slash Commands | 3 commands | 3 commands |
| Safety Hooks | hooks/block-dangerous.js, hooks/scan-secrets.js, hooks/format-on-save.js | hooks/block-dangerous.js, hooks/scan-secrets.js, hooks/format-on-save.js, hooks/test-on-stop.js |

## Verified Skills Included

- **grill-with-docs** (`mattpocock/engineering/grill-with-docs`, MIT, SHA-256 ``): A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
- **tdd** (`mattpocock/engineering/tdd`, MIT, SHA-256 ``): Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
- **code-review** (`mattpocock/engineering/code-review`, MIT, SHA-256 ``): Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
- **planning-and-task-breakdown** (`addyosmani/planning-and-task-breakdown`, MIT, SHA-256 ``): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
- **debugging-and-error-recovery** (`addyosmani/debugging-and-error-recovery`, MIT, SHA-256 ``): Guides systematic root-cause debugging. Use when tests fail, builds break, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need a systematic approach to finding and fixing the root cause rather than guessing.
- **security-and-hardening** (`addyosmani/security-and-hardening`, MIT, SHA-256 ``): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
- **systematic-debugging** (`obra-superpowers/systematic-debugging`, MIT, SHA-256 ``): Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
- **using-git-worktrees** (`obra-superpowers/using-git-worktrees`, MIT, SHA-256 ``): Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback
- **supply-chain-risk-auditor** (`trailofbits/supply-chain-risk-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
- **agentic-actions-auditor** (`trailofbits/agentic-actions-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
- **code-review-and-quality** (`addyosmani/code-review-and-quality`, MIT, SHA-256 ``): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## One-Shot Individual Setup Prompt

```markdown
# Aidentity Setup Prompt — Software engineer (Individual)

Set up my AI agent environment for the **Software engineer** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup software-engineer --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Software engineer (8)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/grill-with-docs` (MIT · security: verified · sha256:602d92b5da4e4645) — A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
  - `mattpocock/engineering/tdd` (MIT · security: verified · sha256:60c7cd4f212f8921) — Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
  - `mattpocock/engineering/code-review` (MIT · security: verified · sha256:3e9414356085c998) — Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69) — Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `addyosmani/debugging-and-error-recovery` (MIT · security: verified · sha256:d2350b0791fe4f70) — Guides systematic root-cause debugging. Use when tests fail, builds break, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need a systematic approach to finding and fixing the root cause rather than guessing.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `obra-superpowers/systematic-debugging` (MIT · security: verified · sha256:1845e2e29a540bd8) — Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
  - `obra-superpowers/using-git-worktrees` (MIT · security: verified · sha256:d8688be08a66b3f0) — Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - `rules/typescript/coding-style.md`
  - `rules/python/coding-style.md`
  - `rules/golang/coding-style.md`

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/planner.md`
  - `agents/debugger.md`
  - `agents/reviewer.md`
- Guardrail Hooks:
  - `hooks/block-dangerous.js`
  - `hooks/scan-secrets.js`
  - `hooks/format-on-save.js`
```

## One-Shot Enterprise Setup Prompt

```markdown
# Aidentity Setup Prompt — Software engineer (Enterprise)

Set up my AI agent environment for the **Software engineer** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup software-engineer --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Software engineer (11)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/grill-with-docs` (MIT · security: verified · sha256:602d92b5da4e4645) — A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
  - `mattpocock/engineering/tdd` (MIT · security: verified · sha256:60c7cd4f212f8921) — Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
  - `mattpocock/engineering/code-review` (MIT · security: verified · sha256:3e9414356085c998) — Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69) — Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `addyosmani/debugging-and-error-recovery` (MIT · security: verified · sha256:d2350b0791fe4f70) — Guides systematic root-cause debugging. Use when tests fail, builds break, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need a systematic approach to finding and fixing the root cause rather than guessing.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `obra-superpowers/systematic-debugging` (MIT · security: verified · sha256:1845e2e29a540bd8) — Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
  - `obra-superpowers/using-git-worktrees` (MIT · security: verified · sha256:d8688be08a66b3f0) — Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819) — Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6) — Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e) — Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - `rules/typescript/coding-style.md`
  - `rules/python/coding-style.md`
  - `rules/golang/coding-style.md`

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/planner.md`
  - `agents/debugger.md`
  - `agents/reviewer.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/block-dangerous.js`
  - `hooks/scan-secrets.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
