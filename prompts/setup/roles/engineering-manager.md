---
id: prompt/setup-engineering-manager
name: Engineering manager Setup Prompt
description: Initial AI agent setup prompt for Engineering manager (Individual & Enterprise profiles) — installs verified skills, rules, subagents, commands, and security hooks.
category: setup
tags: setup, role, engineering-manager, individual, enterprise
---

# Engineering manager — Initial Setup Prompts

> **Role**: Engineering manager (`engineering-manager`)
> **Focus**: Sprint delivery, capacity, retrospectives, hiring and people ops.
> **Categories**: `project-management`, `people`, `planning`, `engineering`
> **Security**: All 16 recommended skills are scanned and verified (`0` critical findings).

---

## Quick CLI Setup

```bash
# Individual setup (skills + rules + subagents + safety hooks)
npx aidentity setup engineering-manager --profile individual

# Enterprise setup (adds security/supply-chain audit skills + full governance hooks)
npx aidentity setup engineering-manager --profile enterprise

# Print the copy-paste prompt in terminal
npx aidentity setup engineering-manager --profile individual --prompt
```

---

## Option A: Individual Setup Prompt

Copy and paste into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

```markdown
# Aidentity Setup Prompt — Engineering manager (Individual)

Set up my AI agent environment for the **Engineering manager** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup engineering-manager --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Engineering manager (13)
Install with `npx aidentity add <id> --agent claude`:
  - `abrahamferga-scrum-skills/sm-capacity-planning` (MIT · security: verified · sha256:7e859759b60d1fe2) — Calculates team capacity for the upcoming Sprint by accounting for team size, Sprint length, planned time off, ceremony overhead, and individual focus factors. Outputs total developer-days available and a recommended story point commitment range. Use when a Scrum Master or team says things like "plan our capacity", "how many points can we commit to", "capacity for next sprint", "how much can we take on", or "account for holidays in the sprint". Do not use for sprint planning facilitation — use sprint-planning for that. Do not use for velocity analysis — use sm-velocity-review for that.
  - `abrahamferga-scrum-skills/sprint-planning` (MIT · security: verified · sha256:11659e952e844603) — Facilitates Sprint Planning by helping the Scrum Team craft a Sprint Goal, select Product Backlog items, and build an initial Sprint Backlog. Use when anyone says things like "let's plan the sprint", "sprint planning", "what should we work on this sprint", "help us pick stories for the sprint", or "we need a sprint goal". Don't use for backlog refinement, story writing, Daily Scrum, Sprint Review, or Retrospective. Don't use when the team is asking general questions about how Sprint Planning works.
  - `abrahamferga-scrum-skills/audit-sprint-jira` (MIT · security: verified · sha256:8b4780fb92f003a7) — Audits a completed or in-progress Jira sprint against Scrum and Jira best practices — checks Sprint Goal presence, issue hygiene, workflow transitions, field completeness, story point coverage, and sub-task consistency. Surfaces findings with severity levels and offers to add comments to specific issues or export a summary report. Use when anyone says things like "audit our sprint in Jira", "review the Jira sprint", "check our Jira sprint health", "are our issues following best practices", or "sprint health check in Jira". Don't use for Azure DevOps — use audit-sprint-ado instead. Don't use for Sprint Planning, Daily Scrum, or Retrospective. Requires a Jira MCP connection.
  - `abrahamferga-scrum-skills/audit-sprint-retrospective-ado` (MIT · security: verified · sha256:ef6bf16d54099572) — Reads an Azure DevOps retrospective — from the ADO Retrospectives extension board, a wiki page, or retro-tagged work items — and produces a structured summary of what the team said, identifies patterns and recurring themes, audits whether action items are properly tracked as work items with owners, and generates concrete suggestions. Use when anyone says things like "summarize our retro", "audit the retrospective in ADO", "what were the action items from the retro", "review the team's retrospective board", "check our retro follow-up", or "did we capture everything from the retro". Don't use for facilitating a retrospective in real time, Jira projects, or general Scrum questions.
  - `abrahamferga-scrum-skills/dev-lead` (MIT · security: verified · sha256:571716271f72330c) — Acts as a technical lead pairing with a developer on a user story — reads the story, explores the codebase to understand the tech stack and existing patterns, then produces a concrete file-by-file implementation plan with specific guidance on what to change, where, and why. Use when a developer says things like "how do I implement this story", "where do I start on this PBI", "help me break down this technically", "which files do I need to change", "walk me through this story", "I need to implement #1234", or "help me plan this feature". Do not use for code review of completed work, story writing, sprint planning, or general architecture questions not tied to a specific story.
  - `abrahamferga-scrum-skills/sm-impediment-log` (MIT · security: verified · sha256:b66d631d29590e5f) — Helps a Scrum Master capture, track, and resolve impediments raised during Daily Scrums or Sprint events — logging them as ADO work items, assigning owners, setting target resolution dates, and surfacing overdue or recurring blockers. Use when a Scrum Master says things like "log an impediment", "track this blocker", "what are our open impediments", "any blockers from standup", "review our impediment backlog", "this needs escalating", or "what's blocking the team". Do not use for sprint planning, retrospectives, or general task tracking.
  - `abrahamferga-scrum-skills/sm-velocity-review` (MIT · security: verified · sha256:5cfde235e28234d6) — Analyses the team's Sprint velocity over recent Sprints to identify trends, variability, and planning implications — producing a velocity chart summary, average, and guidance for the next Sprint commitment. Use when a Scrum Master or team says things like "review our velocity", "what is our velocity", "how consistent are we", "velocity trend", "are we getting faster or slower", "how many points should we commit to", or "check our historical velocity". Do not use for capacity planning — use sm-capacity-planning for that. Do not use for individual sprint audits.
  - `abrahamferga-scrum-skills/stakeholder-update` (MIT · security: verified · sha256:5d2f52571ee7e7d4) — Drafts a clear, concise stakeholder update — translating Sprint progress, risks, and delivery forecasts into business language that non-technical stakeholders can act on. Use when a Product Owner or Scrum Master says things like "write a stakeholder update", "draft a status update", "send an update to the business", "prepare a progress report", "what do I tell the steering committee", "draft the weekly update", or "communicate sprint progress". Do not use for Sprint Review facilitation — use sprint-review for that. Do not use for release notes — use po-release-notes for that.
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69) — Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `addyosmani/shipping-and-launch` (MIT · security: verified · sha256:6d9bf3500ac308a3) — Prepares production launches. Use when preparing to deploy to production. Use when you need a pre-launch checklist, when setting up monitoring, when planning a staged rollout, or when you need a rollback strategy.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e) — Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.
  - `addyosmani/interview-me` (MIT · security: verified · sha256:06000c72ba778515) — Extracts what the user actually wants instead of what they think they should want. Achieves this through one-question-at-a-time interview until ~95% confidence about the underlying intent. Use when an ask is underspecified ("build me X" without "for whom" or "why now"), when the user explicitly invokes ("interview me", "grill me", "are we sure?", "stress-test my thinking"), or when you catch yourself silently filling in ambiguous requirements before any plan, spec, or code exists.
  - `addyosmani/ci-cd-and-automation` (MIT · security: verified · sha256:ae47b352c48fa746) — Automates CI/CD pipeline setup. Use when setting up or modifying build and deployment pipelines. Use when you need to automate quality gates, configure test runners in CI, or establish deployment strategies.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/planner.md`
  - `agents/reviewer.md`
  - `agents/doc-writer.md`
- Guardrail Hooks:
  - `hooks/block-dangerous.js`
  - `hooks/scan-secrets.js`
```

---

## Option B: Enterprise Setup Prompt

Copy and paste for team/organization standardization and strict security governance:

```markdown
# Aidentity Setup Prompt — Engineering manager (Enterprise)

Set up my AI agent environment for the **Engineering manager** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup engineering-manager --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Engineering manager (16)
Install with `npx aidentity add <id> --agent claude`:
  - `abrahamferga-scrum-skills/sm-capacity-planning` (MIT · security: verified · sha256:7e859759b60d1fe2) — Calculates team capacity for the upcoming Sprint by accounting for team size, Sprint length, planned time off, ceremony overhead, and individual focus factors. Outputs total developer-days available and a recommended story point commitment range. Use when a Scrum Master or team says things like "plan our capacity", "how many points can we commit to", "capacity for next sprint", "how much can we take on", or "account for holidays in the sprint". Do not use for sprint planning facilitation — use sprint-planning for that. Do not use for velocity analysis — use sm-velocity-review for that.
  - `abrahamferga-scrum-skills/sprint-planning` (MIT · security: verified · sha256:11659e952e844603) — Facilitates Sprint Planning by helping the Scrum Team craft a Sprint Goal, select Product Backlog items, and build an initial Sprint Backlog. Use when anyone says things like "let's plan the sprint", "sprint planning", "what should we work on this sprint", "help us pick stories for the sprint", or "we need a sprint goal". Don't use for backlog refinement, story writing, Daily Scrum, Sprint Review, or Retrospective. Don't use when the team is asking general questions about how Sprint Planning works.
  - `abrahamferga-scrum-skills/audit-sprint-jira` (MIT · security: verified · sha256:8b4780fb92f003a7) — Audits a completed or in-progress Jira sprint against Scrum and Jira best practices — checks Sprint Goal presence, issue hygiene, workflow transitions, field completeness, story point coverage, and sub-task consistency. Surfaces findings with severity levels and offers to add comments to specific issues or export a summary report. Use when anyone says things like "audit our sprint in Jira", "review the Jira sprint", "check our Jira sprint health", "are our issues following best practices", or "sprint health check in Jira". Don't use for Azure DevOps — use audit-sprint-ado instead. Don't use for Sprint Planning, Daily Scrum, or Retrospective. Requires a Jira MCP connection.
  - `abrahamferga-scrum-skills/audit-sprint-retrospective-ado` (MIT · security: verified · sha256:ef6bf16d54099572) — Reads an Azure DevOps retrospective — from the ADO Retrospectives extension board, a wiki page, or retro-tagged work items — and produces a structured summary of what the team said, identifies patterns and recurring themes, audits whether action items are properly tracked as work items with owners, and generates concrete suggestions. Use when anyone says things like "summarize our retro", "audit the retrospective in ADO", "what were the action items from the retro", "review the team's retrospective board", "check our retro follow-up", or "did we capture everything from the retro". Don't use for facilitating a retrospective in real time, Jira projects, or general Scrum questions.
  - `abrahamferga-scrum-skills/dev-lead` (MIT · security: verified · sha256:571716271f72330c) — Acts as a technical lead pairing with a developer on a user story — reads the story, explores the codebase to understand the tech stack and existing patterns, then produces a concrete file-by-file implementation plan with specific guidance on what to change, where, and why. Use when a developer says things like "how do I implement this story", "where do I start on this PBI", "help me break down this technically", "which files do I need to change", "walk me through this story", "I need to implement #1234", or "help me plan this feature". Do not use for code review of completed work, story writing, sprint planning, or general architecture questions not tied to a specific story.
  - `abrahamferga-scrum-skills/sm-impediment-log` (MIT · security: verified · sha256:b66d631d29590e5f) — Helps a Scrum Master capture, track, and resolve impediments raised during Daily Scrums or Sprint events — logging them as ADO work items, assigning owners, setting target resolution dates, and surfacing overdue or recurring blockers. Use when a Scrum Master says things like "log an impediment", "track this blocker", "what are our open impediments", "any blockers from standup", "review our impediment backlog", "this needs escalating", or "what's blocking the team". Do not use for sprint planning, retrospectives, or general task tracking.
  - `abrahamferga-scrum-skills/sm-velocity-review` (MIT · security: verified · sha256:5cfde235e28234d6) — Analyses the team's Sprint velocity over recent Sprints to identify trends, variability, and planning implications — producing a velocity chart summary, average, and guidance for the next Sprint commitment. Use when a Scrum Master or team says things like "review our velocity", "what is our velocity", "how consistent are we", "velocity trend", "are we getting faster or slower", "how many points should we commit to", or "check our historical velocity". Do not use for capacity planning — use sm-capacity-planning for that. Do not use for individual sprint audits.
  - `abrahamferga-scrum-skills/stakeholder-update` (MIT · security: verified · sha256:5d2f52571ee7e7d4) — Drafts a clear, concise stakeholder update — translating Sprint progress, risks, and delivery forecasts into business language that non-technical stakeholders can act on. Use when a Product Owner or Scrum Master says things like "write a stakeholder update", "draft a status update", "send an update to the business", "prepare a progress report", "what do I tell the steering committee", "draft the weekly update", or "communicate sprint progress". Do not use for Sprint Review facilitation — use sprint-review for that. Do not use for release notes — use po-release-notes for that.
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69) — Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `addyosmani/shipping-and-launch` (MIT · security: verified · sha256:6d9bf3500ac308a3) — Prepares production launches. Use when preparing to deploy to production. Use when you need a pre-launch checklist, when setting up monitoring, when planning a staged rollout, or when you need a rollback strategy.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e) — Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.
  - `addyosmani/interview-me` (MIT · security: verified · sha256:06000c72ba778515) — Extracts what the user actually wants instead of what they think they should want. Achieves this through one-question-at-a-time interview until ~95% confidence about the underlying intent. Use when an ask is underspecified ("build me X" without "for whom" or "why now"), when the user explicitly invokes ("interview me", "grill me", "are we sure?", "stress-test my thinking"), or when you catch yourself silently filling in ambiguous requirements before any plan, spec, or code exists.
  - `addyosmani/ci-cd-and-automation` (MIT · security: verified · sha256:ae47b352c48fa746) — Automates CI/CD pipeline setup. Use when setting up or modifying build and deployment pipelines. Use when you need to automate quality gates, configure test runners in CI, or establish deployment strategies.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819) — Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6) — Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/planner.md`
  - `agents/reviewer.md`
  - `agents/doc-writer.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/block-dangerous.js`
  - `hooks/scan-secrets.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
