---
type: Playbook
title: "Teacher AI Agent Setup Playbook (Individual & Enterprise)"
description: "Explaining, curriculum, exercises, feedback and course material. Verified skills, rules, subagents, and safety hooks for Claude Code, Cursor, Codex, and Gemini CLI."
resource: https://akshatnaruka.github.io/aidentity/playbooks/teacher/
tags: [teacher, education, docs, playbook, agent-setup]
timestamp: 2026-11-23
---

# Teacher AI Agent Setup Playbook (Individual & Enterprise)

**Definition:** The **Teacher AI Agent Playbook** configures any coding agent (Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or GitHub Copilot) for explaining, curriculum, exercises, feedback and course material. It installs 9 SHA-256 security-verified skills in the Individual profile and 13 skills plus 4 runtime guardrails in the Enterprise profile.

## Quick Commands

```bash
# Individual setup (9 verified skills)
npx aidentity setup teacher --profile individual

# Enterprise setup (13 verified skills + supply-chain & security hooks)
npx aidentity setup teacher --profile enterprise
```

## Individual vs. Enterprise Comparison

| Component | Individual Profile | Enterprise Profile |
|---|---|---|
| Verified Skills | 9 core skills | 13 skills (+4 security/audit skills) |
| Coding Rules | 0 rule files | 0 rule files |
| Subagents | 3 subagents | 4 subagents |
| Slash Commands | 1 commands | 2 commands |
| Safety Hooks | hooks/scan-secrets.js, hooks/block-dangerous.js | hooks/scan-secrets.js, hooks/block-dangerous.js, hooks/format-on-save.js, hooks/test-on-stop.js |

## Verified Skills Included

- **teach** (`mattpocock/productivity/teach`, MIT, SHA-256 ``): Teach the user a new skill or concept, within this workspace.
- **scaffold-exercises** (`mattpocock/misc/scaffold-exercises`, MIT, SHA-256 ``): Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. Use when user wants to scaffold exercises, create exercise stubs, or set up a new course section.
- **documentation-and-adrs** (`addyosmani/documentation-and-adrs`, MIT, SHA-256 ``): Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
- **planning-and-task-breakdown** (`addyosmani/planning-and-task-breakdown`, MIT, SHA-256 ``): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
- **sn-ppt-standard** (`opensensenova-sensenova-skills/sn-ppt-standard`, MIT, SHA-256 ``): 仅在 `sn-ppt-entry` 与 `sn-ppt-story` 已准备绝对 `DECK_DIR` 和 `outline.md` 后使用；生成每页独立 HTML（1600×900）、渲染 PNG、逐页讲稿、`present.html`，并按 `static_postprocess` 选择生成由 Standard 自有 exporter 转换的 PPTX。**`present.html` 始终是必交付产物，缺失即技术故障，不得交付；`static_postprocess` 含 `pptx` 时 PPTX 同为必交付产物（缺一即技术故障），且只能由 Standard 自有 exporter 生成；仅当用户明确要求只要 HTML（`static_postprocess` 为 `[]`）时，PPTX 才可不交付。**
- **pdf-analysis** (`opensensenova-sensenova-skills/sn-da-non-spreadsheet-analysis/capability/pdf-analysis`, MIT, SHA-256 ``): PDF 文档解析。自动区分文字型 PDF 与扫描型 PDF，覆盖：文本/表格提取、多页全量扫描、嵌入图表 caption、单位感知数值计算。
- **slides** (`ui-ux-pro-max/slides`, MIT, SHA-256 ``): Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
- **brainstorming** (`obra-superpowers/brainstorming`, MIT, SHA-256 ``): You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
- **copy-editing** (`marketingskills/copy-editing`, MIT, SHA-256 ``): When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content. Also use when the user mentions 'edit this copy,' 'review my copy,' 'copy feedback,' 'proofread,' 'polish this,' 'make this better,' 'copy sweep,' 'tighten this up,' 'this reads awkwardly,' 'clean up this text,' 'too wordy,' 'sharpen the messaging,' 'refresh this content,' 'update this page,' 'this content is outdated,' or 'content audit,' 'this sounds like AI,' 'AI slop,' 'de-slop this,' or 'make it sound human.' Use this when the user already has copy and wants it improved or refreshed rather than rewritten from scratch. Every edit removes AI tells such as 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and sentences that trail into extra comma clauses. A request to fix one line gets a point edit that changes only that line. For writing new copy, see copywriting.
- **security-and-hardening** (`addyosmani/security-and-hardening`, MIT, SHA-256 ``): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
- **supply-chain-risk-auditor** (`trailofbits/supply-chain-risk-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
- **agentic-actions-auditor** (`trailofbits/agentic-actions-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
- **code-review-and-quality** (`addyosmani/code-review-and-quality`, MIT, SHA-256 ``): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## One-Shot Individual Setup Prompt

```markdown
# Aidentity Setup Prompt: Teacher (Individual)

Set up my AI agent environment for the **Teacher** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup teacher --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Teacher (9)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/productivity/teach` (MIT · security: verified · sha256:f9b00801b02b5059): Teach the user a new skill or concept, within this workspace.
  - `mattpocock/misc/scaffold-exercises` (MIT · security: verified · sha256:3b683503d79be221): Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. Use when user wants to scaffold exercises, create exercise stubs, or set up a new course section.
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563): Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `opensensenova-sensenova-skills/sn-ppt-standard` (MIT · security: verified · sha256:7824f039dae5950c): 仅在 `sn-ppt-entry` 与 `sn-ppt-story` 已准备绝对 `DECK_DIR` 和 `outline.md` 后使用；生成每页独立 HTML（1600×900）、渲染 PNG、逐页讲稿、`present.html`，并按 `static_postprocess` 选择生成由 Standard 自有 exporter 转换的 PPTX。**`present.html` 始终是必交付产物，缺失即技术故障，不得交付；`static_postprocess` 含 `pptx` 时 PPTX 同为必交付产物（缺一即技术故障），且只能由 Standard 自有 exporter 生成；仅当用户明确要求只要 HTML（`static_postprocess` 为 `[]`）时，PPTX 才可不交付。**
  - `opensensenova-sensenova-skills/sn-da-non-spreadsheet-analysis/capability/pdf-analysis` (MIT · security: verified · sha256:869af7d4a303b0d1): PDF 文档解析。自动区分文字型 PDF 与扫描型 PDF，覆盖：文本/表格提取、多页全量扫描、嵌入图表 caption、单位感知数值计算。
  - `ui-ux-pro-max/slides` (MIT · security: verified · sha256:ef68e14fab0602a6): Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
  - `obra-superpowers/brainstorming` (MIT · security: verified · sha256:c8478a1bcf6ea405): You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
  - `marketingskills/copy-editing` (MIT · security: verified · sha256:83387887149f333d): When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content. Also use when the user mentions 'edit this copy,' 'review my copy,' 'copy feedback,' 'proofread,' 'polish this,' 'make this better,' 'copy sweep,' 'tighten this up,' 'this reads awkwardly,' 'clean up this text,' 'too wordy,' 'sharpen the messaging,' 'refresh this content,' 'update this page,' 'this content is outdated,' or 'content audit,' 'this sounds like AI,' 'AI slop,' 'de-slop this,' or 'make it sound human.' Use this when the user already has copy and wants it improved or refreshed rather than rewritten from scratch. Every edit removes AI tells such as 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and sentences that trail into extra comma clauses. A request to fix one line gets a point edit that changes only that line. For writing new copy, see copywriting.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/doc-writer.md`
  - `agents/planner.md`
  - `agents/researcher.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
```

## One-Shot Enterprise Setup Prompt

```markdown
# Aidentity Setup Prompt: Teacher (Enterprise)

Set up my AI agent environment for the **Teacher** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup teacher --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Teacher (13)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/productivity/teach` (MIT · security: verified · sha256:f9b00801b02b5059): Teach the user a new skill or concept, within this workspace.
  - `mattpocock/misc/scaffold-exercises` (MIT · security: verified · sha256:3b683503d79be221): Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. Use when user wants to scaffold exercises, create exercise stubs, or set up a new course section.
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563): Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `opensensenova-sensenova-skills/sn-ppt-standard` (MIT · security: verified · sha256:7824f039dae5950c): 仅在 `sn-ppt-entry` 与 `sn-ppt-story` 已准备绝对 `DECK_DIR` 和 `outline.md` 后使用；生成每页独立 HTML（1600×900）、渲染 PNG、逐页讲稿、`present.html`，并按 `static_postprocess` 选择生成由 Standard 自有 exporter 转换的 PPTX。**`present.html` 始终是必交付产物，缺失即技术故障，不得交付；`static_postprocess` 含 `pptx` 时 PPTX 同为必交付产物（缺一即技术故障），且只能由 Standard 自有 exporter 生成；仅当用户明确要求只要 HTML（`static_postprocess` 为 `[]`）时，PPTX 才可不交付。**
  - `opensensenova-sensenova-skills/sn-da-non-spreadsheet-analysis/capability/pdf-analysis` (MIT · security: verified · sha256:869af7d4a303b0d1): PDF 文档解析。自动区分文字型 PDF 与扫描型 PDF，覆盖：文本/表格提取、多页全量扫描、嵌入图表 caption、单位感知数值计算。
  - `ui-ux-pro-max/slides` (MIT · security: verified · sha256:ef68e14fab0602a6): Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
  - `obra-superpowers/brainstorming` (MIT · security: verified · sha256:c8478a1bcf6ea405): You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
  - `marketingskills/copy-editing` (MIT · security: verified · sha256:83387887149f333d): When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content. Also use when the user mentions 'edit this copy,' 'review my copy,' 'copy feedback,' 'proofread,' 'polish this,' 'make this better,' 'copy sweep,' 'tighten this up,' 'this reads awkwardly,' 'clean up this text,' 'too wordy,' 'sharpen the messaging,' 'refresh this content,' 'update this page,' 'this content is outdated,' or 'content audit,' 'this sounds like AI,' 'AI slop,' 'de-slop this,' or 'make it sound human.' Use this when the user already has copy and wants it improved or refreshed rather than rewritten from scratch. Every edit removes AI tells such as 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and sentences that trail into extra comma clauses. A request to fix one line gets a point edit that changes only that line. For writing new copy, see copywriting.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/doc-writer.md`
  - `agents/planner.md`
  - `agents/researcher.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
