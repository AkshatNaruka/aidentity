---
type: Playbook
title: "HR / people ops AI Agent Setup Playbook (Individual & Enterprise)"
description: "Hiring, interviews, job descriptions, onboarding and policy. Verified skills, rules, subagents, and safety hooks for Claude Code, Cursor, Codex, and Gemini CLI."
resource: https://akshatnaruka.github.io/aidentity/playbooks/hr-people/
tags: [hr-people, people, docs, project-management, playbook, agent-setup]
timestamp: 2026-11-17
---

# HR / people ops AI Agent Setup Playbook (Individual & Enterprise)

**Definition:** The **HR / people ops AI Agent Playbook** configures any coding agent (Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or GitHub Copilot) for hiring, interviews, job descriptions, onboarding and policy. It installs 9 SHA-256 security-verified skills in the Individual profile and 13 skills plus 4 runtime guardrails in the Enterprise profile.

## Quick Commands

```bash
# Individual setup (9 verified skills)
npx aidentity setup hr-people --profile individual

# Enterprise setup (13 verified skills + supply-chain & security hooks)
npx aidentity setup hr-people --profile enterprise
```

## Individual vs. Enterprise Comparison

| Component | Individual Profile | Enterprise Profile |
|---|---|---|
| Verified Skills | 9 core skills | 13 skills (+4 security/audit skills) |
| Coding Rules | 0 rule files | 0 rule files |
| Subagents | 2 subagents | 3 subagents |
| Slash Commands | 1 commands | 2 commands |
| Safety Hooks | hooks/scan-secrets.js, hooks/block-dangerous.js | hooks/scan-secrets.js, hooks/block-dangerous.js, hooks/format-on-save.js, hooks/test-on-stop.js |

## Verified Skills Included

- **interview-me** (`addyosmani/interview-me`, MIT, SHA-256 ``): Extracts what the user actually wants instead of what they think they should want. Achieves this through one-question-at-a-time interview until ~95% confidence about the underlying intent. Use when an ask is underspecified ("build me X" without "for whom" or "why now"), when the user explicitly invokes ("interview me", "grill me", "are we sure?", "stress-test my thinking"), or when you catch yourself silently filling in ambiguous requirements before any plan, spec, or code exists.
- **documentation-and-adrs** (`addyosmani/documentation-and-adrs`, MIT, SHA-256 ``): Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
- **planning-and-task-breakdown** (`addyosmani/planning-and-task-breakdown`, MIT, SHA-256 ``): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
- **sm-capacity-planning** (`abrahamferga-scrum-skills/sm-capacity-planning`, MIT, SHA-256 ``): Calculates team capacity for the upcoming Sprint by accounting for team size, Sprint length, planned time off, ceremony overhead, and individual focus factors. Outputs total developer-days available and a recommended story point commitment range. Use when a Scrum Master or team says things like "plan our capacity", "how many points can we commit to", "capacity for next sprint", "how much can we take on", or "account for holidays in the sprint". Do not use for sprint planning facilitation — use sprint-planning for that. Do not use for velocity analysis — use sm-velocity-review for that.
- **audit-sprint-retrospective-ado** (`abrahamferga-scrum-skills/audit-sprint-retrospective-ado`, MIT, SHA-256 ``): Reads an Azure DevOps retrospective — from the ADO Retrospectives extension board, a wiki page, or retro-tagged work items — and produces a structured summary of what the team said, identifies patterns and recurring themes, audits whether action items are properly tracked as work items with owners, and generates concrete suggestions. Use when anyone says things like "summarize our retro", "audit the retrospective in ADO", "what were the action items from the retro", "review the team's retrospective board", "check our retro follow-up", or "did we capture everything from the retro". Don't use for facilitating a retrospective in real time, Jira projects, or general Scrum questions.
- **sn-ppt-standard** (`opensensenova-sensenova-skills/sn-ppt-standard`, MIT, SHA-256 ``): 仅在 `sn-ppt-entry` 与 `sn-ppt-story` 已准备绝对 `DECK_DIR` 和 `outline.md` 后使用；生成每页独立 HTML（1600×900）、渲染 PNG、逐页讲稿、`present.html`，并按 `static_postprocess` 选择生成由 Standard 自有 exporter 转换的 PPTX。**`present.html` 始终是必交付产物，缺失即技术故障，不得交付；`static_postprocess` 含 `pptx` 时 PPTX 同为必交付产物（缺一即技术故障），且只能由 Standard 自有 exporter 生成；仅当用户明确要求只要 HTML（`static_postprocess` 为 `[]`）时，PPTX 才可不交付。**
- **onboarding** (`marketingskills/onboarding`, MIT, SHA-256 ``): When the user wants to optimize post-signup onboarding, user activation, first-run experience, or time-to-value. Also use when the user mentions "onboarding flow," "activation rate," "user activation," "first-run experience," "empty states," "onboarding checklist," "aha moment," "new user experience," "users aren't activating," "nobody completes setup," "low activation rate," "users sign up but don't use the product," "time to value," or "first session experience." Use this whenever users are signing up but not sticking around. For signup/registration optimization, see signup. For ongoing email sequences, see emails.
- **emails** (`marketingskills/emails`, MIT, SHA-256 ``): When the user wants to create or optimize an email sequence, drip campaign, automated email flow, or lifecycle email program. Also use when the user mentions "email sequence," "drip campaign," "nurture sequence," "onboarding emails," "welcome sequence," "re-engagement emails," "email automation," "lifecycle emails," "trigger-based emails," "email funnel," "email workflow," "what emails should I send," "welcome series," or "email cadence." Use this for any multi-email automated flow. Emails avoid AI tells like 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and fake 'Re:' subject lines. For cold outreach and outbound sequences, see cold-email. For in-app onboarding, see onboarding.
- **copywriting** (`marketingskills/copywriting`, MIT, SHA-256 ``): When the user wants to write, rewrite, or improve marketing copy for any page, including homepage, landing pages, pricing pages, feature pages, about pages, or product pages. Also use when the user says "write copy for," "improve this copy," "rewrite this page," "marketing copy," "headline help," "CTA copy," "value proposition," "tagline," "hero section copy," "this copy is weak," "this sounds like AI," "AI slop," "make it sound human," or "help me describe my product." Drafts never use AI tells like "it's not X, it's Y" reveals, "no X, no Y, no Z" lists, or sentences that trail into extra comma clauses. For email copy, see emails. For popup copy, see popups. For editing existing copy, see copy-editing. For the offer underneath the copy (bonuses, guarantees, value framing), see offers. Claims must be supportable, and a declined claim names the evidence that would unlock it. Diagnoses the input first (blank brief, real voice, or point edit) and changes only what it calls for.
- **security-and-hardening** (`addyosmani/security-and-hardening`, MIT, SHA-256 ``): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
- **supply-chain-risk-auditor** (`trailofbits/supply-chain-risk-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
- **agentic-actions-auditor** (`trailofbits/agentic-actions-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
- **code-review-and-quality** (`addyosmani/code-review-and-quality`, MIT, SHA-256 ``): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## One-Shot Individual Setup Prompt

```markdown
# Aidentity Setup Prompt — HR / people ops (Individual)

Set up my AI agent environment for the **HR / people ops** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup hr-people --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for HR / people ops (9)
Install with `npx aidentity add <id> --agent claude`:
  - `addyosmani/interview-me` (MIT · security: verified · sha256:06000c72ba778515) — Extracts what the user actually wants instead of what they think they should want. Achieves this through one-question-at-a-time interview until ~95% confidence about the underlying intent. Use when an ask is underspecified ("build me X" without "for whom" or "why now"), when the user explicitly invokes ("interview me", "grill me", "are we sure?", "stress-test my thinking"), or when you catch yourself silently filling in ambiguous requirements before any plan, spec, or code exists.
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563) — Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69) — Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `abrahamferga-scrum-skills/sm-capacity-planning` (MIT · security: verified · sha256:7e859759b60d1fe2) — Calculates team capacity for the upcoming Sprint by accounting for team size, Sprint length, planned time off, ceremony overhead, and individual focus factors. Outputs total developer-days available and a recommended story point commitment range. Use when a Scrum Master or team says things like "plan our capacity", "how many points can we commit to", "capacity for next sprint", "how much can we take on", or "account for holidays in the sprint". Do not use for sprint planning facilitation — use sprint-planning for that. Do not use for velocity analysis — use sm-velocity-review for that.
  - `abrahamferga-scrum-skills/audit-sprint-retrospective-ado` (MIT · security: verified · sha256:ef6bf16d54099572) — Reads an Azure DevOps retrospective — from the ADO Retrospectives extension board, a wiki page, or retro-tagged work items — and produces a structured summary of what the team said, identifies patterns and recurring themes, audits whether action items are properly tracked as work items with owners, and generates concrete suggestions. Use when anyone says things like "summarize our retro", "audit the retrospective in ADO", "what were the action items from the retro", "review the team's retrospective board", "check our retro follow-up", or "did we capture everything from the retro". Don't use for facilitating a retrospective in real time, Jira projects, or general Scrum questions.
  - `opensensenova-sensenova-skills/sn-ppt-standard` (MIT · security: verified · sha256:7824f039dae5950c) — 仅在 `sn-ppt-entry` 与 `sn-ppt-story` 已准备绝对 `DECK_DIR` 和 `outline.md` 后使用；生成每页独立 HTML（1600×900）、渲染 PNG、逐页讲稿、`present.html`，并按 `static_postprocess` 选择生成由 Standard 自有 exporter 转换的 PPTX。**`present.html` 始终是必交付产物，缺失即技术故障，不得交付；`static_postprocess` 含 `pptx` 时 PPTX 同为必交付产物（缺一即技术故障），且只能由 Standard 自有 exporter 生成；仅当用户明确要求只要 HTML（`static_postprocess` 为 `[]`）时，PPTX 才可不交付。**
  - `marketingskills/onboarding` (MIT · security: verified · sha256:d1e68d547c89e4a5) — When the user wants to optimize post-signup onboarding, user activation, first-run experience, or time-to-value. Also use when the user mentions "onboarding flow," "activation rate," "user activation," "first-run experience," "empty states," "onboarding checklist," "aha moment," "new user experience," "users aren't activating," "nobody completes setup," "low activation rate," "users sign up but don't use the product," "time to value," or "first session experience." Use this whenever users are signing up but not sticking around. For signup/registration optimization, see signup. For ongoing email sequences, see emails.
  - `marketingskills/emails` (MIT · security: verified · sha256:461ca28897cb9857) — When the user wants to create or optimize an email sequence, drip campaign, automated email flow, or lifecycle email program. Also use when the user mentions "email sequence," "drip campaign," "nurture sequence," "onboarding emails," "welcome sequence," "re-engagement emails," "email automation," "lifecycle emails," "trigger-based emails," "email funnel," "email workflow," "what emails should I send," "welcome series," or "email cadence." Use this for any multi-email automated flow. Emails avoid AI tells like 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and fake 'Re:' subject lines. For cold outreach and outbound sequences, see cold-email. For in-app onboarding, see onboarding.
  - `marketingskills/copywriting` (MIT · security: verified · sha256:e88bd0fcfe4e32e0) — When the user wants to write, rewrite, or improve marketing copy for any page, including homepage, landing pages, pricing pages, feature pages, about pages, or product pages. Also use when the user says "write copy for," "improve this copy," "rewrite this page," "marketing copy," "headline help," "CTA copy," "value proposition," "tagline," "hero section copy," "this copy is weak," "this sounds like AI," "AI slop," "make it sound human," or "help me describe my product." Drafts never use AI tells like "it's not X, it's Y" reveals, "no X, no Y, no Z" lists, or sentences that trail into extra comma clauses. For email copy, see emails. For popup copy, see popups. For editing existing copy, see copy-editing. For the offer underneath the copy (bonuses, guarantees, value framing), see offers. Claims must be supportable, and a declined claim names the evidence that would unlock it. Diagnoses the input first (blank brief, real voice, or point edit) and changes only what it calls for.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/doc-writer.md`
  - `agents/planner.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
```

## One-Shot Enterprise Setup Prompt

```markdown
# Aidentity Setup Prompt — HR / people ops (Enterprise)

Set up my AI agent environment for the **HR / people ops** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup hr-people --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for HR / people ops (13)
Install with `npx aidentity add <id> --agent claude`:
  - `addyosmani/interview-me` (MIT · security: verified · sha256:06000c72ba778515) — Extracts what the user actually wants instead of what they think they should want. Achieves this through one-question-at-a-time interview until ~95% confidence about the underlying intent. Use when an ask is underspecified ("build me X" without "for whom" or "why now"), when the user explicitly invokes ("interview me", "grill me", "are we sure?", "stress-test my thinking"), or when you catch yourself silently filling in ambiguous requirements before any plan, spec, or code exists.
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563) — Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69) — Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `abrahamferga-scrum-skills/sm-capacity-planning` (MIT · security: verified · sha256:7e859759b60d1fe2) — Calculates team capacity for the upcoming Sprint by accounting for team size, Sprint length, planned time off, ceremony overhead, and individual focus factors. Outputs total developer-days available and a recommended story point commitment range. Use when a Scrum Master or team says things like "plan our capacity", "how many points can we commit to", "capacity for next sprint", "how much can we take on", or "account for holidays in the sprint". Do not use for sprint planning facilitation — use sprint-planning for that. Do not use for velocity analysis — use sm-velocity-review for that.
  - `abrahamferga-scrum-skills/audit-sprint-retrospective-ado` (MIT · security: verified · sha256:ef6bf16d54099572) — Reads an Azure DevOps retrospective — from the ADO Retrospectives extension board, a wiki page, or retro-tagged work items — and produces a structured summary of what the team said, identifies patterns and recurring themes, audits whether action items are properly tracked as work items with owners, and generates concrete suggestions. Use when anyone says things like "summarize our retro", "audit the retrospective in ADO", "what were the action items from the retro", "review the team's retrospective board", "check our retro follow-up", or "did we capture everything from the retro". Don't use for facilitating a retrospective in real time, Jira projects, or general Scrum questions.
  - `opensensenova-sensenova-skills/sn-ppt-standard` (MIT · security: verified · sha256:7824f039dae5950c) — 仅在 `sn-ppt-entry` 与 `sn-ppt-story` 已准备绝对 `DECK_DIR` 和 `outline.md` 后使用；生成每页独立 HTML（1600×900）、渲染 PNG、逐页讲稿、`present.html`，并按 `static_postprocess` 选择生成由 Standard 自有 exporter 转换的 PPTX。**`present.html` 始终是必交付产物，缺失即技术故障，不得交付；`static_postprocess` 含 `pptx` 时 PPTX 同为必交付产物（缺一即技术故障），且只能由 Standard 自有 exporter 生成；仅当用户明确要求只要 HTML（`static_postprocess` 为 `[]`）时，PPTX 才可不交付。**
  - `marketingskills/onboarding` (MIT · security: verified · sha256:d1e68d547c89e4a5) — When the user wants to optimize post-signup onboarding, user activation, first-run experience, or time-to-value. Also use when the user mentions "onboarding flow," "activation rate," "user activation," "first-run experience," "empty states," "onboarding checklist," "aha moment," "new user experience," "users aren't activating," "nobody completes setup," "low activation rate," "users sign up but don't use the product," "time to value," or "first session experience." Use this whenever users are signing up but not sticking around. For signup/registration optimization, see signup. For ongoing email sequences, see emails.
  - `marketingskills/emails` (MIT · security: verified · sha256:461ca28897cb9857) — When the user wants to create or optimize an email sequence, drip campaign, automated email flow, or lifecycle email program. Also use when the user mentions "email sequence," "drip campaign," "nurture sequence," "onboarding emails," "welcome sequence," "re-engagement emails," "email automation," "lifecycle emails," "trigger-based emails," "email funnel," "email workflow," "what emails should I send," "welcome series," or "email cadence." Use this for any multi-email automated flow. Emails avoid AI tells like 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and fake 'Re:' subject lines. For cold outreach and outbound sequences, see cold-email. For in-app onboarding, see onboarding.
  - `marketingskills/copywriting` (MIT · security: verified · sha256:e88bd0fcfe4e32e0) — When the user wants to write, rewrite, or improve marketing copy for any page, including homepage, landing pages, pricing pages, feature pages, about pages, or product pages. Also use when the user says "write copy for," "improve this copy," "rewrite this page," "marketing copy," "headline help," "CTA copy," "value proposition," "tagline," "hero section copy," "this copy is weak," "this sounds like AI," "AI slop," "make it sound human," or "help me describe my product." Drafts never use AI tells like "it's not X, it's Y" reveals, "no X, no Y, no Z" lists, or sentences that trail into extra comma clauses. For email copy, see emails. For popup copy, see popups. For editing existing copy, see copy-editing. For the offer underneath the copy (bonuses, guarantees, value framing), see offers. Claims must be supportable, and a declined claim names the evidence that would unlock it. Diagnoses the input first (blank brief, real voice, or point edit) and changes only what it calls for.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819) — Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6) — Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e) — Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/doc-writer.md`
  - `agents/planner.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
