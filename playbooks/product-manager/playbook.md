---
type: Playbook
title: "Product manager AI Agent Setup Playbook (Individual & Enterprise)"
description: "Specs, discovery, prioritisation, stakeholder updates, sprint planning. Verified skills, rules, subagents, and safety hooks for Claude Code, Cursor, Codex, and Gemini CLI."
resource: https://akshatnaruka.github.io/aidentity/playbooks/product-manager/
tags: [product-manager, planning, project-management, research, docs, playbook, agent-setup]
timestamp: 2026-11-27
---

# Product manager AI Agent Setup Playbook (Individual & Enterprise)

**Definition:** The **Product manager AI Agent Playbook** configures any coding agent (Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or GitHub Copilot) for specs, discovery, prioritisation, stakeholder updates, sprint planning. It installs 13 SHA-256 security-verified skills in the Individual profile and 17 skills plus 4 runtime guardrails in the Enterprise profile.

## Quick Commands

```bash
# Individual setup (13 verified skills)
npx aidentity setup product-manager --profile individual

# Enterprise setup (17 verified skills + supply-chain & security hooks)
npx aidentity setup product-manager --profile enterprise
```

## Individual vs. Enterprise Comparison

| Component | Individual Profile | Enterprise Profile |
|---|---|---|
| Verified Skills | 13 core skills | 17 skills (+4 security/audit skills) |
| Coding Rules | 0 rule files | 0 rule files |
| Subagents | 3 subagents | 4 subagents |
| Slash Commands | 1 commands | 2 commands |
| Safety Hooks | hooks/scan-secrets.js, hooks/block-dangerous.js | hooks/scan-secrets.js, hooks/block-dangerous.js, hooks/format-on-save.js, hooks/test-on-stop.js |

## Verified Skills Included

- **to-spec** (`mattpocock/engineering/to-spec`, MIT, SHA-256 ``): Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed.
- **grill-with-docs** (`mattpocock/engineering/grill-with-docs`, MIT, SHA-256 ``): A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
- **planning-and-task-breakdown** (`addyosmani/planning-and-task-breakdown`, MIT, SHA-256 ``): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
- **spec-driven-development** (`addyosmani/spec-driven-development`, MIT, SHA-256 ``): Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
- **brainstorming** (`obra-superpowers/brainstorming`, MIT, SHA-256 ``): You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
- **po-create-user-story** (`abrahamferga-scrum-skills/po-create-user-story`, MIT, SHA-256 ``): Writes a high-quality user story from a plain-English prompt. Drafts immediately, refines through conversation, validates against INVEST, and creates the story in the connected PM tool after confirmation. Use when a Product Owner or Product Manager says things like "I need a story for…", "write a user story about…", "add to the backlog…", "create a PBI for…", "create a ticket for…", or describes a feature, user need, or problem to capture. Don't use for technical tasks with no user value framing, bug reports, spike investigations, or general Scrum questions. Don't use when the request is clearly for an epic or a full feature breakdown — write the single most valuable story and offer to split the rest.
- **po-split-story** (`abrahamferga-scrum-skills/po-split-story`, MIT, SHA-256 ``): Applies proven story splitting patterns to break an oversized user story or epic into sprint-sized, independently deliverable stories. Use when a Product Owner or developer says things like "this story is too big", "we need to split this", "this will not fit in a sprint", "break this epic down", "help me slice this story", or when a story fails the Small criterion in INVEST. Do not use for writing new stories from scratch — use po-create-user-story instead. Do not use for sprint planning or backlog prioritization.
- **po-release-notes** (`abrahamferga-scrum-skills/po-release-notes`, MIT, SHA-256 ``): Generates audience-appropriate release notes from completed Sprint work items — translating technical changes into plain-language user outcomes for stakeholders, customers, or internal teams. Use when a Product Owner says things like "write release notes", "what shipped this Sprint", "generate a changelog", "what did we deliver", "draft the release email", or "summarise what we released". Do not use for sprint review facilitation — use sprint-review for that. Do not use for velocity analysis.
- **audit-backlog-ado** (`abrahamferga-scrum-skills/audit-backlog-ado`, MIT, SHA-256 ``): Audits the Azure DevOps product backlog for hygiene, story quality, and refinement readiness — identifying items that are too large, missing acceptance criteria, stale, unestimated, or out of priority order. Use when a Scrum Master or Product Owner says things like "audit the backlog", "is the backlog healthy", "review the backlog before refinement", "clean up the backlog", "check backlog hygiene", or "prepare the backlog for planning". Do not use for individual story audits — use audit-user-story for that. Do not use for sprint planning or velocity review.
- **stakeholder-update** (`abrahamferga-scrum-skills/stakeholder-update`, MIT, SHA-256 ``): Drafts a clear, concise stakeholder update — translating Sprint progress, risks, and delivery forecasts into business language that non-technical stakeholders can act on. Use when a Product Owner or Scrum Master says things like "write a stakeholder update", "draft a status update", "send an update to the business", "prepare a progress report", "what do I tell the steering committee", "draft the weekly update", or "communicate sprint progress". Do not use for Sprint Review facilitation — use sprint-review for that. Do not use for release notes — use po-release-notes for that.
- **sprint-review** (`abrahamferga-scrum-skills/sprint-review`, MIT, SHA-256 ``): Facilitates the Sprint Review by presenting the increment, inspecting progress toward the Product Goal, and capturing Product Backlog adaptations. Use when anyone says things like "sprint review", "demo prep", "what did we complete this sprint", "review the increment", "what's the Product Backlog looking like after this sprint", or "stakeholder demo". Don't use for the Retrospective, Daily Scrum, Sprint Planning, or general questions about how Sprint Reviews work. Don't use when the team just wants a status report.
- **customer-research** (`marketingskills/customer-research`, MIT, SHA-256 ``): When the user wants to conduct, analyze, or synthesize customer research. Use when the user mentions "customer research," "ICP research," "talk to customers," "analyze transcripts," "customer interviews," "survey analysis," "support ticket analysis," "voice of customer," "VOC," "build personas," "customer personas," "jobs to be done," "JTBD," "what do customers say," "what are customers struggling with," "Reddit mining," "G2 reviews," "review mining," "digital watering holes," "community research," "forum research," "competitor reviews," "customer sentiment," "PMF survey," "product/market fit survey," "customer interview questions," "interview outreach," "Sales Safari," or "find out why customers churn/convert/buy." Use for analyzing existing research assets, mining online sources, AND running primary research (interviews and surveys). For writing copy informed by research, see copywriting. For acting on research to improve pages, see cro.
- **analytics** (`marketingskills/analytics`, MIT, SHA-256 ``): When the user wants to set up, improve, or audit analytics tracking and measurement. Also use when the user mentions "set up tracking," "GA4," "Google Analytics," "event tracking," "UTM parameters," "tag manager," "GTM," "analytics implementation," "tracking plan," "how do I measure this," "Mixpanel," "Segment," "are my events firing," or "analytics isn't working." Use this whenever someone asks how to know if something is working or wants to measure marketing results. For getting conversions into ad platforms (pixels, conversion tags, CAPI, server-side) and verifying they arrived, see conversion-tracking. For choosing attribution models, comparing multi-touch/MMM/incrementality, or reconciling conflicting numbers across tools, see attribution. For A/B test measurement, see ab-testing. Rate metrics divide matching closed windows — never full-period spend by partial-period results.
- **security-and-hardening** (`addyosmani/security-and-hardening`, MIT, SHA-256 ``): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
- **supply-chain-risk-auditor** (`trailofbits/supply-chain-risk-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
- **agentic-actions-auditor** (`trailofbits/agentic-actions-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
- **code-review-and-quality** (`addyosmani/code-review-and-quality`, MIT, SHA-256 ``): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## One-Shot Individual Setup Prompt

```markdown
# Aidentity Setup Prompt: Product manager (Individual)

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

## 3. Verified Skills for Product manager (13)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/to-spec` (MIT · security: verified · sha256:28c49f322cf90718): Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed.
  - `mattpocock/engineering/grill-with-docs` (MIT · security: verified · sha256:602d92b5da4e4645): A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `addyosmani/spec-driven-development` (MIT · security: verified · sha256:9871cd4ac234f0ea): Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
  - `obra-superpowers/brainstorming` (MIT · security: verified · sha256:c8478a1bcf6ea405): You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
  - `abrahamferga-scrum-skills/po-create-user-story` (MIT · security: verified · sha256:4e18b94180d49efb): Writes a high-quality user story from a plain-English prompt. Drafts immediately, refines through conversation, validates against INVEST, and creates the story in the connected PM tool after confirmation. Use when a Product Owner or Product Manager says things like "I need a story for…", "write a user story about…", "add to the backlog…", "create a PBI for…", "create a ticket for…", or describes a feature, user need, or problem to capture. Don't use for technical tasks with no user value framing, bug reports, spike investigations, or general Scrum questions. Don't use when the request is clearly for an epic or a full feature breakdown, write the single most valuable story and offer to split the rest.
  - `abrahamferga-scrum-skills/po-split-story` (MIT · security: verified · sha256:f6d8aabdfe44d2c1): Applies proven story splitting patterns to break an oversized user story or epic into sprint-sized, independently deliverable stories. Use when a Product Owner or developer says things like "this story is too big", "we need to split this", "this will not fit in a sprint", "break this epic down", "help me slice this story", or when a story fails the Small criterion in INVEST. Do not use for writing new stories from scratch, use po-create-user-story instead. Do not use for sprint planning or backlog prioritization.
  - `abrahamferga-scrum-skills/po-release-notes` (MIT · security: verified · sha256:439b29720ba83e04): Generates audience-appropriate release notes from completed Sprint work items, translating technical changes into plain-language user outcomes for stakeholders, customers, or internal teams. Use when a Product Owner says things like "write release notes", "what shipped this Sprint", "generate a changelog", "what did we deliver", "draft the release email", or "summarise what we released". Do not use for sprint review facilitation, use sprint-review for that. Do not use for velocity analysis.
  - `abrahamferga-scrum-skills/audit-backlog-ado` (MIT · security: verified · sha256:d6fa357020cc762b): Audits the Azure DevOps product backlog for hygiene, story quality, and refinement readiness, identifying items that are too large, missing acceptance criteria, stale, unestimated, or out of priority order. Use when a Scrum Master or Product Owner says things like "audit the backlog", "is the backlog healthy", "review the backlog before refinement", "clean up the backlog", "check backlog hygiene", or "prepare the backlog for planning". Do not use for individual story audits, use audit-user-story for that. Do not use for sprint planning or velocity review.
  - `abrahamferga-scrum-skills/stakeholder-update` (MIT · security: verified · sha256:5d2f52571ee7e7d4): Drafts a clear, concise stakeholder update, translating Sprint progress, risks, and delivery forecasts into business language that non-technical stakeholders can act on. Use when a Product Owner or Scrum Master says things like "write a stakeholder update", "draft a status update", "send an update to the business", "prepare a progress report", "what do I tell the steering committee", "draft the weekly update", or "communicate sprint progress". Do not use for Sprint Review facilitation, use sprint-review for that. Do not use for release notes, use po-release-notes for that.
  - `abrahamferga-scrum-skills/sprint-review` (MIT · security: verified · sha256:9f47f8ed22946232): Facilitates the Sprint Review by presenting the increment, inspecting progress toward the Product Goal, and capturing Product Backlog adaptations. Use when anyone says things like "sprint review", "demo prep", "what did we complete this sprint", "review the increment", "what's the Product Backlog looking like after this sprint", or "stakeholder demo". Don't use for the Retrospective, Daily Scrum, Sprint Planning, or general questions about how Sprint Reviews work. Don't use when the team just wants a status report.
  - `marketingskills/customer-research` (MIT · security: verified · sha256:c01405dbee822ce6): When the user wants to conduct, analyze, or synthesize customer research. Use when the user mentions "customer research," "ICP research," "talk to customers," "analyze transcripts," "customer interviews," "survey analysis," "support ticket analysis," "voice of customer," "VOC," "build personas," "customer personas," "jobs to be done," "JTBD," "what do customers say," "what are customers struggling with," "Reddit mining," "G2 reviews," "review mining," "digital watering holes," "community research," "forum research," "competitor reviews," "customer sentiment," "PMF survey," "product/market fit survey," "customer interview questions," "interview outreach," "Sales Safari," or "find out why customers churn/convert/buy." Use for analyzing existing research assets, mining online sources, AND running primary research (interviews and surveys). For writing copy informed by research, see copywriting. For acting on research to improve pages, see cro.
  - `marketingskills/analytics` (MIT · security: verified · sha256:ad9066bedf1f2410): When the user wants to set up, improve, or audit analytics tracking and measurement. Also use when the user mentions "set up tracking," "GA4," "Google Analytics," "event tracking," "UTM parameters," "tag manager," "GTM," "analytics implementation," "tracking plan," "how do I measure this," "Mixpanel," "Segment," "are my events firing," or "analytics isn't working." Use this whenever someone asks how to know if something is working or wants to measure marketing results. For getting conversions into ad platforms (pixels, conversion tags, CAPI, server-side) and verifying they arrived, see conversion-tracking. For choosing attribution models, comparing multi-touch/MMM/incrementality, or reconciling conflicting numbers across tools, see attribution. For A/B test measurement, see ab-testing. Rate metrics divide matching closed windows, never full-period spend by partial-period results.

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

## One-Shot Enterprise Setup Prompt

```markdown
# Aidentity Setup Prompt: Product manager (Enterprise)

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

## 3. Verified Skills for Product manager (17)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/to-spec` (MIT · security: verified · sha256:28c49f322cf90718): Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed.
  - `mattpocock/engineering/grill-with-docs` (MIT · security: verified · sha256:602d92b5da4e4645): A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
  - `addyosmani/planning-and-task-breakdown` (MIT · security: verified · sha256:3835b64c36ca6d69): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
  - `addyosmani/spec-driven-development` (MIT · security: verified · sha256:9871cd4ac234f0ea): Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
  - `obra-superpowers/brainstorming` (MIT · security: verified · sha256:c8478a1bcf6ea405): You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
  - `abrahamferga-scrum-skills/po-create-user-story` (MIT · security: verified · sha256:4e18b94180d49efb): Writes a high-quality user story from a plain-English prompt. Drafts immediately, refines through conversation, validates against INVEST, and creates the story in the connected PM tool after confirmation. Use when a Product Owner or Product Manager says things like "I need a story for…", "write a user story about…", "add to the backlog…", "create a PBI for…", "create a ticket for…", or describes a feature, user need, or problem to capture. Don't use for technical tasks with no user value framing, bug reports, spike investigations, or general Scrum questions. Don't use when the request is clearly for an epic or a full feature breakdown, write the single most valuable story and offer to split the rest.
  - `abrahamferga-scrum-skills/po-split-story` (MIT · security: verified · sha256:f6d8aabdfe44d2c1): Applies proven story splitting patterns to break an oversized user story or epic into sprint-sized, independently deliverable stories. Use when a Product Owner or developer says things like "this story is too big", "we need to split this", "this will not fit in a sprint", "break this epic down", "help me slice this story", or when a story fails the Small criterion in INVEST. Do not use for writing new stories from scratch, use po-create-user-story instead. Do not use for sprint planning or backlog prioritization.
  - `abrahamferga-scrum-skills/po-release-notes` (MIT · security: verified · sha256:439b29720ba83e04): Generates audience-appropriate release notes from completed Sprint work items, translating technical changes into plain-language user outcomes for stakeholders, customers, or internal teams. Use when a Product Owner says things like "write release notes", "what shipped this Sprint", "generate a changelog", "what did we deliver", "draft the release email", or "summarise what we released". Do not use for sprint review facilitation, use sprint-review for that. Do not use for velocity analysis.
  - `abrahamferga-scrum-skills/audit-backlog-ado` (MIT · security: verified · sha256:d6fa357020cc762b): Audits the Azure DevOps product backlog for hygiene, story quality, and refinement readiness, identifying items that are too large, missing acceptance criteria, stale, unestimated, or out of priority order. Use when a Scrum Master or Product Owner says things like "audit the backlog", "is the backlog healthy", "review the backlog before refinement", "clean up the backlog", "check backlog hygiene", or "prepare the backlog for planning". Do not use for individual story audits, use audit-user-story for that. Do not use for sprint planning or velocity review.
  - `abrahamferga-scrum-skills/stakeholder-update` (MIT · security: verified · sha256:5d2f52571ee7e7d4): Drafts a clear, concise stakeholder update, translating Sprint progress, risks, and delivery forecasts into business language that non-technical stakeholders can act on. Use when a Product Owner or Scrum Master says things like "write a stakeholder update", "draft a status update", "send an update to the business", "prepare a progress report", "what do I tell the steering committee", "draft the weekly update", or "communicate sprint progress". Do not use for Sprint Review facilitation, use sprint-review for that. Do not use for release notes, use po-release-notes for that.
  - `abrahamferga-scrum-skills/sprint-review` (MIT · security: verified · sha256:9f47f8ed22946232): Facilitates the Sprint Review by presenting the increment, inspecting progress toward the Product Goal, and capturing Product Backlog adaptations. Use when anyone says things like "sprint review", "demo prep", "what did we complete this sprint", "review the increment", "what's the Product Backlog looking like after this sprint", or "stakeholder demo". Don't use for the Retrospective, Daily Scrum, Sprint Planning, or general questions about how Sprint Reviews work. Don't use when the team just wants a status report.
  - `marketingskills/customer-research` (MIT · security: verified · sha256:c01405dbee822ce6): When the user wants to conduct, analyze, or synthesize customer research. Use when the user mentions "customer research," "ICP research," "talk to customers," "analyze transcripts," "customer interviews," "survey analysis," "support ticket analysis," "voice of customer," "VOC," "build personas," "customer personas," "jobs to be done," "JTBD," "what do customers say," "what are customers struggling with," "Reddit mining," "G2 reviews," "review mining," "digital watering holes," "community research," "forum research," "competitor reviews," "customer sentiment," "PMF survey," "product/market fit survey," "customer interview questions," "interview outreach," "Sales Safari," or "find out why customers churn/convert/buy." Use for analyzing existing research assets, mining online sources, AND running primary research (interviews and surveys). For writing copy informed by research, see copywriting. For acting on research to improve pages, see cro.
  - `marketingskills/analytics` (MIT · security: verified · sha256:ad9066bedf1f2410): When the user wants to set up, improve, or audit analytics tracking and measurement. Also use when the user mentions "set up tracking," "GA4," "Google Analytics," "event tracking," "UTM parameters," "tag manager," "GTM," "analytics implementation," "tracking plan," "how do I measure this," "Mixpanel," "Segment," "are my events firing," or "analytics isn't working." Use this whenever someone asks how to know if something is working or wants to measure marketing results. For getting conversions into ad platforms (pixels, conversion tags, CAPI, server-side) and verifying they arrived, see conversion-tracking. For choosing attribution models, comparing multi-touch/MMM/incrementality, or reconciling conflicting numbers across tools, see attribution. For A/B test measurement, see ab-testing. Rate metrics divide matching closed windows, never full-period spend by partial-period results.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

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

## Guided Learning Track: AI-Native Product Management, Spec Writing & Sprint Delivery

Run discovery, write unambiguous PRDs and user stories, slice backlogs, plan sprint capacity, and generate release notes using verified product and agile skills.

**Level:** All Levels · **Target Audience:** Product managers, product owners, scrum masters, and engineering managers

### Learning Outcomes
- Draft structured specs and user stories with clear acceptance criteria.
- Audit sprint capacity, Jira/ADO backlogs, and retrospectives with data-backed workflows.
- Coordinate engineering handoffs and automated release notes.

### Curriculum Modules & Verified Skills
#### Module 1: Discovery & Specification Writing
- **to-spec** (`mattpocock/engineering/to-spec`, undefined): Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed.
- **spec-driven-development** (`addyosmani/spec-driven-development`, undefined): Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
- **planning-and-task-breakdown** (`addyosmani/planning-and-task-breakdown`, undefined): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.

#### Module 2: User Stories & Backlog Architecture
- **po-create-user-story** (`abrahamferga-scrum-skills/po-create-user-story`, undefined): Writes a high-quality user story from a plain-English prompt. Drafts immediately, refines through conversation, validates against INVEST, and creates the story in the connected PM tool after confirmation. Use when a Product Owner or Product Manager says things like "I need a story for…", "write a user story about…", "add to the backlog…", "create a PBI for…", "create a ticket for…", or describes a feature, user need, or problem to capture. Don't use for technical tasks with no user value framing, bug reports, spike investigations, or general Scrum questions. Don't use when the request is clearly for an epic or a full feature breakdown, write the single most valuable story and offer to split the rest.
- **po-split-story** (`abrahamferga-scrum-skills/po-split-story`, undefined): Applies proven story splitting patterns to break an oversized user story or epic into sprint-sized, independently deliverable stories. Use when a Product Owner or developer says things like "this story is too big", "we need to split this", "this will not fit in a sprint", "break this epic down", "help me slice this story", or when a story fails the Small criterion in INVEST. Do not use for writing new stories from scratch, use po-create-user-story instead. Do not use for sprint planning or backlog prioritization.
- **audit-backlog-ado** (`abrahamferga-scrum-skills/audit-backlog-ado`, undefined): Audits the Azure DevOps product backlog for hygiene, story quality, and refinement readiness, identifying items that are too large, missing acceptance criteria, stale, unestimated, or out of priority order. Use when a Scrum Master or Product Owner says things like "audit the backlog", "is the backlog healthy", "review the backlog before refinement", "clean up the backlog", "check backlog hygiene", or "prepare the backlog for planning". Do not use for individual story audits, use audit-user-story for that. Do not use for sprint planning or velocity review.

#### Module 3: Sprint Capacity, Delivery & Release Notes
- **sm-capacity-planning** (`abrahamferga-scrum-skills/sm-capacity-planning`, undefined): Calculates team capacity for the upcoming Sprint by accounting for team size, Sprint length, planned time off, ceremony overhead, and individual focus factors. Outputs total developer-days available and a recommended story point commitment range. Use when a Scrum Master or team says things like "plan our capacity", "how many points can we commit to", "capacity for next sprint", "how much can we take on", or "account for holidays in the sprint". Do not use for sprint planning facilitation, use sprint-planning for that. Do not use for velocity analysis, use sm-velocity-review for that.
- **audit-sprint-jira** (`abrahamferga-scrum-skills/audit-sprint-jira`, undefined): Audits a completed or in-progress Jira sprint against Scrum and Jira best practices, checks Sprint Goal presence, issue hygiene, workflow transitions, field completeness, story point coverage, and sub-task consistency. Surfaces findings with severity levels and offers to add comments to specific issues or export a summary report. Use when anyone says things like "audit our sprint in Jira", "review the Jira sprint", "check our Jira sprint health", "are our issues following best practices", or "sprint health check in Jira". Don't use for Azure DevOps, use audit-sprint-ado instead. Don't use for Sprint Planning, Daily Scrum, or Retrospective. Requires a Jira MCP connection.
- **po-release-notes** (`abrahamferga-scrum-skills/po-release-notes`, undefined): Generates audience-appropriate release notes from completed Sprint work items, translating technical changes into plain-language user outcomes for stakeholders, customers, or internal teams. Use when a Product Owner says things like "write release notes", "what shipped this Sprint", "generate a changelog", "what did we deliver", "draft the release email", or "summarise what we released". Do not use for sprint review facilitation, use sprint-review for that. Do not use for velocity analysis.
