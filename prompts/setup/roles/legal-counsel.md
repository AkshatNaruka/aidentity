---
id: prompt/setup-legal-counsel
name: Legal counsel Setup Prompt
description: Initial AI agent setup prompt for Legal counsel (Individual & Enterprise profiles) — installs verified skills, rules, subagents, commands, and security hooks.
category: setup
tags: setup, role, legal-counsel, individual, enterprise
---

# Legal counsel — Initial Setup Prompts

> **Role**: Legal counsel (`legal-counsel`)
> **Focus**: Contract review, plain-language legal writing, compliance and policy.
> **Categories**: `legal`, `docs`
> **Security**: All 11 recommended skills are scanned and verified (`0` critical findings).

---

## Quick CLI Setup

```bash
# Individual setup (skills + rules + subagents + safety hooks)
npx aidentity setup legal-counsel --profile individual

# Enterprise setup (adds security/supply-chain audit skills + full governance hooks)
npx aidentity setup legal-counsel --profile enterprise

# Print the copy-paste prompt in terminal
npx aidentity setup legal-counsel --profile individual --prompt
```

---

## Option A: Individual Setup Prompt

Copy and paste into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

```markdown
# Aidentity Setup Prompt — Legal counsel (Individual)

Set up my AI agent environment for the **Legal counsel** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup legal-counsel --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Legal counsel (9)
Install with `npx aidentity add <id> --agent claude`:
  - `addyosmani/constraint-driven-development` (MIT · security: verified · sha256:79425345e914dc3d) — Establishes a project's quality bar as a written contract and stops agents quietly lowering it. Interviews the user on which dimensions matter, supplies sane default thresholds when they have no number in mind, records everything in CONSTRAINTS.md, and watches the diff for a weakened bar — new @ts-ignore or eslint-disable suppressions, skipped or deleted tests, assertions stripped out, unimplemented stubs, thresholds edited down. Use when no quality bar is written down, when the user says "set up constraints" or "define our standards", when an agent keeps silencing checks or skipping tests to get to green, when you need a coverage or performance threshold and don't know what number to pick, or when an agent writes more code than anyone will read.
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563) — Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `addyosmani/source-driven-development` (MIT · security: verified · sha256:64cb0b95b6633259) — Grounds every implementation decision in official documentation. Use when you want authoritative, source-cited code free from outdated patterns. Use when building with any framework or library where correctness matters.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `addyosmani/spec-driven-development` (MIT · security: verified · sha256:9871cd4ac234f0ea) — Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819) — Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/audit-context-building` (CC-BY-SA-4.0 · security: verified · sha256:fc2ac9aa807865ac) — Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when starting an audit, threat model, or architecture review on unfamiliar code, and before any vulnerability-hunting pass.
  - `opensensenova-sensenova-skills/sn-da-non-spreadsheet-analysis/capability/pdf-analysis` (MIT · security: verified · sha256:869af7d4a303b0d1) — PDF 文档解析。自动区分文字型 PDF 与扫描型 PDF，覆盖：文本/表格提取、多页全量扫描、嵌入图表 caption、单位感知数值计算。
  - `marketingskills/copy-editing` (MIT · security: verified · sha256:83387887149f333d) — When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content. Also use when the user mentions 'edit this copy,' 'review my copy,' 'copy feedback,' 'proofread,' 'polish this,' 'make this better,' 'copy sweep,' 'tighten this up,' 'this reads awkwardly,' 'clean up this text,' 'too wordy,' 'sharpen the messaging,' 'refresh this content,' 'update this page,' 'this content is outdated,' or 'content audit,' 'this sounds like AI,' 'AI slop,' 'de-slop this,' or 'make it sound human.' Use this when the user already has copy and wants it improved or refreshed rather than rewritten from scratch. Every edit removes AI tells such as 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and sentences that trail into extra comma clauses. A request to fix one line gets a point edit that changes only that line. For writing new copy, see copywriting.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/reviewer.md`
  - `agents/doc-writer.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
```

---

## Option B: Enterprise Setup Prompt

Copy and paste for team/organization standardization and strict security governance:

```markdown
# Aidentity Setup Prompt — Legal counsel (Enterprise)

Set up my AI agent environment for the **Legal counsel** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup legal-counsel --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Legal counsel (11)
Install with `npx aidentity add <id> --agent claude`:
  - `addyosmani/constraint-driven-development` (MIT · security: verified · sha256:79425345e914dc3d) — Establishes a project's quality bar as a written contract and stops agents quietly lowering it. Interviews the user on which dimensions matter, supplies sane default thresholds when they have no number in mind, records everything in CONSTRAINTS.md, and watches the diff for a weakened bar — new @ts-ignore or eslint-disable suppressions, skipped or deleted tests, assertions stripped out, unimplemented stubs, thresholds edited down. Use when no quality bar is written down, when the user says "set up constraints" or "define our standards", when an agent keeps silencing checks or skipping tests to get to green, when you need a coverage or performance threshold and don't know what number to pick, or when an agent writes more code than anyone will read.
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563) — Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `addyosmani/source-driven-development` (MIT · security: verified · sha256:64cb0b95b6633259) — Grounds every implementation decision in official documentation. Use when you want authoritative, source-cited code free from outdated patterns. Use when building with any framework or library where correctness matters.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `addyosmani/spec-driven-development` (MIT · security: verified · sha256:9871cd4ac234f0ea) — Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819) — Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/audit-context-building` (CC-BY-SA-4.0 · security: verified · sha256:fc2ac9aa807865ac) — Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when starting an audit, threat model, or architecture review on unfamiliar code, and before any vulnerability-hunting pass.
  - `opensensenova-sensenova-skills/sn-da-non-spreadsheet-analysis/capability/pdf-analysis` (MIT · security: verified · sha256:869af7d4a303b0d1) — PDF 文档解析。自动区分文字型 PDF 与扫描型 PDF，覆盖：文本/表格提取、多页全量扫描、嵌入图表 caption、单位感知数值计算。
  - `marketingskills/copy-editing` (MIT · security: verified · sha256:83387887149f333d) — When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content. Also use when the user mentions 'edit this copy,' 'review my copy,' 'copy feedback,' 'proofread,' 'polish this,' 'make this better,' 'copy sweep,' 'tighten this up,' 'this reads awkwardly,' 'clean up this text,' 'too wordy,' 'sharpen the messaging,' 'refresh this content,' 'update this page,' 'this content is outdated,' or 'content audit,' 'this sounds like AI,' 'AI slop,' 'de-slop this,' or 'make it sound human.' Use this when the user already has copy and wants it improved or refreshed rather than rewritten from scratch. Every edit removes AI tells such as 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and sentences that trail into extra comma clauses. A request to fix one line gets a point edit that changes only that line. For writing new copy, see copywriting.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6) — Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e) — Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/reviewer.md`
  - `agents/doc-writer.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
