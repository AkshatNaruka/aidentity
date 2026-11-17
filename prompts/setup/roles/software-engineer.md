---
id: prompt/setup-software-engineer
name: Software engineer Setup Prompt
description: Initial AI agent setup prompt for Software engineer (Individual & Enterprise profiles) — installs verified skills, rules, subagents, commands, and security hooks.
category: setup
tags: setup, role, software-engineer, individual, enterprise
---

# Software engineer — Initial Setup Prompts

> **Role**: Software engineer (`software-engineer`)
> **Focus**: Day-to-day coding: planning, implementation, review, tests, debugging.
> **Categories**: `engineering`, `code-review`, `testing`, `debugging`, `git`
> **Security**: All 16 recommended skills are scanned and verified (`0` critical findings).

---

## Quick CLI Setup

```bash
# Individual setup (skills + rules + subagents + safety hooks)
npx aidentity setup software-engineer --profile individual

# Enterprise setup (adds security/supply-chain audit skills + full governance hooks)
npx aidentity setup software-engineer --profile enterprise

# Print the copy-paste prompt in terminal
npx aidentity setup software-engineer --profile individual --prompt
```

---

## Option A: Individual Setup Prompt

Copy and paste into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

```markdown
# Aidentity Setup Prompt: Software engineer (Individual)

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

## 3. Verified Skills for Software engineer (14)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/grill-with-docs` (MIT · security: verified · sha256:602d92b5da4e4645): A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
  - `mattpocock/engineering/tdd` (MIT · security: verified · sha256:60c7cd4f212f8921): Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
  - `mattpocock/engineering/code-review` (MIT · security: verified · sha256:3e9414356085c998): Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
  - `obra-superpowers/test-driven-development` (MIT · security: verified · sha256:329e52d226dfc448): Use when implementing any feature or bugfix, before writing implementation code
  - `obra-superpowers/systematic-debugging` (MIT · security: verified · sha256:1845e2e29a540bd8): Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
  - `obra-superpowers/verification-before-completion` (MIT · security: verified · sha256:222dd28ac0e62a0e): Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
  - `obra-superpowers/subagent-driven-development` (MIT · security: verified · sha256:270bca4225564236): Use when executing implementation plans with independent tasks in the current session
  - `obra-superpowers/using-git-worktrees` (MIT · security: verified · sha256:d8688be08a66b3f0): Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `addyosmani/debugging-and-error-recovery` (MIT · security: verified · sha256:d2350b0791fe4f70): Guides systematic root-cause debugging. Use when tests fail, builds break, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need a systematic approach to finding and fixing the root cause rather than guessing.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `addyosmani/git-workflow-and-versioning` (MIT · security: verified · sha256:7661dae37315dc34): Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, opening or reviewing a pull request (PR), pushing to a remote, or when you need to organize work across multiple parallel streams. Use when cutting a release, choosing a semantic version bump, tagging, or writing a changelog.
  - `mattpocock/engineering/to-spec` (MIT · security: verified · sha256:28c49f322cf90718): Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed.

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

---

## Option B: Enterprise Setup Prompt

Copy and paste for team/organization standardization and strict security governance:

```markdown
# Aidentity Setup Prompt: Software engineer (Enterprise)

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

## 3. Verified Skills for Software engineer (16)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/grill-with-docs` (MIT · security: verified · sha256:602d92b5da4e4645): A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
  - `mattpocock/engineering/tdd` (MIT · security: verified · sha256:60c7cd4f212f8921): Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
  - `mattpocock/engineering/code-review` (MIT · security: verified · sha256:3e9414356085c998): Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
  - `obra-superpowers/test-driven-development` (MIT · security: verified · sha256:329e52d226dfc448): Use when implementing any feature or bugfix, before writing implementation code
  - `obra-superpowers/systematic-debugging` (MIT · security: verified · sha256:1845e2e29a540bd8): Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
  - `obra-superpowers/verification-before-completion` (MIT · security: verified · sha256:222dd28ac0e62a0e): Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
  - `obra-superpowers/subagent-driven-development` (MIT · security: verified · sha256:270bca4225564236): Use when executing implementation plans with independent tasks in the current session
  - `obra-superpowers/using-git-worktrees` (MIT · security: verified · sha256:d8688be08a66b3f0): Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `addyosmani/debugging-and-error-recovery` (MIT · security: verified · sha256:d2350b0791fe4f70): Guides systematic root-cause debugging. Use when tests fail, builds break, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need a systematic approach to finding and fixing the root cause rather than guessing.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `addyosmani/git-workflow-and-versioning` (MIT · security: verified · sha256:7661dae37315dc34): Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, opening or reviewing a pull request (PR), pushing to a remote, or when you need to organize work across multiple parallel streams. Use when cutting a release, choosing a semantic version bump, tagging, or writing a changelog.
  - `mattpocock/engineering/to-spec` (MIT · security: verified · sha256:28c49f322cf90718): Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.

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
