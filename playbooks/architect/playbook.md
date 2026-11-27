---
type: Playbook
title: "Software architect AI Agent Setup Playbook (Individual & Enterprise)"
description: "System design, interfaces, diagrams, trade-offs and technical direction. Verified skills, rules, subagents, and safety hooks for Claude Code, Cursor, Codex, and Gemini CLI."
resource: https://akshatnaruka.github.io/aidentity/playbooks/architect/
tags: [architect, architecture, design, api, docs, playbook, agent-setup]
timestamp: 2026-11-27
---

# Software architect AI Agent Setup Playbook (Individual & Enterprise)

**Definition:** The **Software architect AI Agent Playbook** configures any coding agent (Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or GitHub Copilot) for system design, interfaces, diagrams, trade-offs and technical direction. It installs 13 SHA-256 security-verified skills in the Individual profile and 15 skills plus 4 runtime guardrails in the Enterprise profile.

## Quick Commands

```bash
# Individual setup (13 verified skills)
npx aidentity setup architect --profile individual

# Enterprise setup (15 verified skills + supply-chain & security hooks)
npx aidentity setup architect --profile enterprise
```

## Individual vs. Enterprise Comparison

| Component | Individual Profile | Enterprise Profile |
|---|---|---|
| Verified Skills | 13 core skills | 15 skills (+4 security/audit skills) |
| Coding Rules | 2 rule files | 2 rule files |
| Subagents | 3 subagents | 3 subagents |
| Slash Commands | 2 commands | 2 commands |
| Safety Hooks | hooks/block-dangerous.js, hooks/scan-secrets.js | hooks/block-dangerous.js, hooks/scan-secrets.js, hooks/format-on-save.js, hooks/test-on-stop.js |

## Verified Skills Included

- **improve-codebase-architecture** (`mattpocock/engineering/improve-codebase-architecture`, MIT, SHA-256 ``): Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **codebase-design** (`mattpocock/engineering/codebase-design`, MIT, SHA-256 ``): Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
- **api-and-interface-design** (`addyosmani/api-and-interface-design`, MIT, SHA-256 ``): Guides stable API and interface design. Use when designing APIs, module boundaries, or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules, or establishing boundaries between frontend and backend.
- **documentation-and-adrs** (`addyosmani/documentation-and-adrs`, MIT, SHA-256 ``): Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
- **spec-driven-development** (`addyosmani/spec-driven-development`, MIT, SHA-256 ``): Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
- **security-and-hardening** (`addyosmani/security-and-hardening`, MIT, SHA-256 ``): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
- **performance-optimization** (`addyosmani/performance-optimization`, MIT, SHA-256 ``): Optimizes application performance across frontend, backend, queries, and databases. Use when performance requirements exist, when you suspect performance regressions, when Core Web Vitals or load times need improvement, when N+1 query patterns need fixing, or when profiling reveals bottlenecks.
- **backend-patterns** (`everything-claude-code/backend-patterns`, MIT, SHA-256 ``): Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes. Use when building or reviewing Node.js, Express, or Next.js API routes and their data access.
- **drawio-skill** (`agents365-ai-drawio-skill/drawio-skill`, MIT, SHA-256 ``): Create and edit draw.io/diagrams.net diagrams as editable `.drawio` files. Covers architecture, UML/ERD/sequence, BPMN, network, and swimlane views authored from a description or converted from code, IaC, SQL, and API schemas, plus sync, query, test, review, export, and publish of existing diagrams. Use when the user asks for draw.io/diagrams.net or an editable diagram; prefer Mermaid/PlantUML when diagrams-as-code is enough.
- **audit-context-building** (`trailofbits/audit-context-building`, CC-BY-SA-4.0, SHA-256 ``): Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when starting an audit, threat model, or architecture review on unfamiliar code, and before any vulnerability-hunting pass.
- **supply-chain-risk-auditor** (`trailofbits/supply-chain-risk-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
- **supabase-postgres-best-practices** (`supabase/supabase-postgres-best-practices`, MIT, SHA-256 ``): Postgres best practices maintained by Supabase, for Postgres running anywhere. Load this skill BEFORE writing or changing anything that lives in a Postgres database: creating or altering tables and columns (including choosing column types), schema design, migrations and declarative schema files, RLS policies and the tests that verify them, indexes, triggers, database functions, queues and scheduled jobs (pg_cron, pgmq), vector/semantic search (pgvector), and restoring dumps (pg_restore) or importing data. Also load it when diagnosing slow queries, high CPU, timeouts, EXPLAIN plans, connection exhaustion, locking, bloat, or rows visible to the wrong user or tenant. This is not just a performance guide — schema, migration, security, and SQL authoring tasks need these rules too, even for a one-column change or a single query.
- **site-architecture** (`marketingskills/site-architecture`, MIT, SHA-256 ``): When the user wants to plan, map, or restructure their website's page hierarchy, navigation, URL structure, or internal linking. Also use when the user mentions "sitemap," "site map," "visual sitemap," "site structure," "page hierarchy," "information architecture," "IA," "navigation design," "URL structure," "breadcrumbs," "internal linking strategy," "website planning," "what pages do I need," "how should I organize my site," "site navigation," "which website builder should I use," "migrate my website," or "add a blog to my existing site." Use this whenever someone is planning what pages a website should have, how they connect, and where to build them. NOT for XML sitemaps (that's technical SEO — see seo-audit). For SEO audits, see seo-audit. For structured data, see schema.
- **agentic-actions-auditor** (`trailofbits/agentic-actions-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
- **code-review-and-quality** (`addyosmani/code-review-and-quality`, MIT, SHA-256 ``): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## One-Shot Individual Setup Prompt

```markdown
# Aidentity Setup Prompt: Software architect (Individual)

Set up my AI agent environment for the **Software architect** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup architect --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Software architect (13)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/improve-codebase-architecture` (MIT · security: verified · sha256:9f2a98a49ee48e50): Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
  - `mattpocock/engineering/codebase-design` (MIT · security: verified · sha256:95f777036790186f): Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
  - `addyosmani/api-and-interface-design` (MIT · security: verified · sha256:2b84ee195da1148f): Guides stable API and interface design. Use when designing APIs, module boundaries, or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules, or establishing boundaries between frontend and backend.
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563): Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `addyosmani/spec-driven-development` (MIT · security: verified · sha256:9871cd4ac234f0ea): Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `addyosmani/performance-optimization` (MIT · security: verified · sha256:92ac7ecd2e902e59): Optimizes application performance across frontend, backend, queries, and databases. Use when performance requirements exist, when you suspect performance regressions, when Core Web Vitals or load times need improvement, when N+1 query patterns need fixing, or when profiling reveals bottlenecks.
  - `everything-claude-code/backend-patterns` (MIT · security: verified · sha256:33b79eeae4aa6369): Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes. Use when building or reviewing Node.js, Express, or Next.js API routes and their data access.
  - `agents365-ai-drawio-skill/drawio-skill` (MIT · security: verified · sha256:11f0f20c71237527): Create and edit draw.io/diagrams.net diagrams as editable `.drawio` files. Covers architecture, UML/ERD/sequence, BPMN, network, and swimlane views authored from a description or converted from code, IaC, SQL, and API schemas, plus sync, query, test, review, export, and publish of existing diagrams. Use when the user asks for draw.io/diagrams.net or an editable diagram; prefer Mermaid/PlantUML when diagrams-as-code is enough.
  - `trailofbits/audit-context-building` (CC-BY-SA-4.0 · security: verified · sha256:fc2ac9aa807865ac): Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when starting an audit, threat model, or architecture review on unfamiliar code, and before any vulnerability-hunting pass.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `supabase/supabase-postgres-best-practices` (MIT · security: verified · sha256:35e9f904d60459a3): Postgres best practices maintained by Supabase, for Postgres running anywhere. Load this skill BEFORE writing or changing anything that lives in a Postgres database: creating or altering tables and columns (including choosing column types), schema design, migrations and declarative schema files, RLS policies and the tests that verify them, indexes, triggers, database functions, queues and scheduled jobs (pg_cron, pgmq), vector/semantic search (pgvector), and restoring dumps (pg_restore) or importing data. Also load it when diagnosing slow queries, high CPU, timeouts, EXPLAIN plans, connection exhaustion, locking, bloat, or rows visible to the wrong user or tenant. This is not just a performance guide, schema, migration, security, and SQL authoring tasks need these rules too, even for a one-column change or a single query.
  - `marketingskills/site-architecture` (MIT · security: verified · sha256:744ca2d2db4453b3): When the user wants to plan, map, or restructure their website's page hierarchy, navigation, URL structure, or internal linking. Also use when the user mentions "sitemap," "site map," "visual sitemap," "site structure," "page hierarchy," "information architecture," "IA," "navigation design," "URL structure," "breadcrumbs," "internal linking strategy," "website planning," "what pages do I need," "how should I organize my site," "site navigation," "which website builder should I use," "migrate my website," or "add a blog to my existing site." Use this whenever someone is planning what pages a website should have, how they connect, and where to build them. NOT for XML sitemaps (that's technical SEO, see seo-audit). For SEO audits, see seo-audit. For structured data, see schema.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - `rules/typescript/coding-style.md`
  - `rules/golang/coding-style.md`

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/planner.md`
  - `agents/reviewer.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/block-dangerous.js`
  - `hooks/scan-secrets.js`
```

## One-Shot Enterprise Setup Prompt

```markdown
# Aidentity Setup Prompt: Software architect (Enterprise)

Set up my AI agent environment for the **Software architect** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup architect --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Software architect (15)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/improve-codebase-architecture` (MIT · security: verified · sha256:9f2a98a49ee48e50): Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
  - `mattpocock/engineering/codebase-design` (MIT · security: verified · sha256:95f777036790186f): Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
  - `addyosmani/api-and-interface-design` (MIT · security: verified · sha256:2b84ee195da1148f): Guides stable API and interface design. Use when designing APIs, module boundaries, or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules, or establishing boundaries between frontend and backend.
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563): Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `addyosmani/spec-driven-development` (MIT · security: verified · sha256:9871cd4ac234f0ea): Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `addyosmani/performance-optimization` (MIT · security: verified · sha256:92ac7ecd2e902e59): Optimizes application performance across frontend, backend, queries, and databases. Use when performance requirements exist, when you suspect performance regressions, when Core Web Vitals or load times need improvement, when N+1 query patterns need fixing, or when profiling reveals bottlenecks.
  - `everything-claude-code/backend-patterns` (MIT · security: verified · sha256:33b79eeae4aa6369): Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes. Use when building or reviewing Node.js, Express, or Next.js API routes and their data access.
  - `agents365-ai-drawio-skill/drawio-skill` (MIT · security: verified · sha256:11f0f20c71237527): Create and edit draw.io/diagrams.net diagrams as editable `.drawio` files. Covers architecture, UML/ERD/sequence, BPMN, network, and swimlane views authored from a description or converted from code, IaC, SQL, and API schemas, plus sync, query, test, review, export, and publish of existing diagrams. Use when the user asks for draw.io/diagrams.net or an editable diagram; prefer Mermaid/PlantUML when diagrams-as-code is enough.
  - `trailofbits/audit-context-building` (CC-BY-SA-4.0 · security: verified · sha256:fc2ac9aa807865ac): Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when starting an audit, threat model, or architecture review on unfamiliar code, and before any vulnerability-hunting pass.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `supabase/supabase-postgres-best-practices` (MIT · security: verified · sha256:35e9f904d60459a3): Postgres best practices maintained by Supabase, for Postgres running anywhere. Load this skill BEFORE writing or changing anything that lives in a Postgres database: creating or altering tables and columns (including choosing column types), schema design, migrations and declarative schema files, RLS policies and the tests that verify them, indexes, triggers, database functions, queues and scheduled jobs (pg_cron, pgmq), vector/semantic search (pgvector), and restoring dumps (pg_restore) or importing data. Also load it when diagnosing slow queries, high CPU, timeouts, EXPLAIN plans, connection exhaustion, locking, bloat, or rows visible to the wrong user or tenant. This is not just a performance guide, schema, migration, security, and SQL authoring tasks need these rules too, even for a one-column change or a single query.
  - `marketingskills/site-architecture` (MIT · security: verified · sha256:744ca2d2db4453b3): When the user wants to plan, map, or restructure their website's page hierarchy, navigation, URL structure, or internal linking. Also use when the user mentions "sitemap," "site map," "visual sitemap," "site structure," "page hierarchy," "information architecture," "IA," "navigation design," "URL structure," "breadcrumbs," "internal linking strategy," "website planning," "what pages do I need," "how should I organize my site," "site navigation," "which website builder should I use," "migrate my website," or "add a blog to my existing site." Use this whenever someone is planning what pages a website should have, how they connect, and where to build them. NOT for XML sitemaps (that's technical SEO, see seo-audit). For SEO audits, see seo-audit. For structured data, see schema.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - `rules/typescript/coding-style.md`
  - `rules/golang/coding-style.md`

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/planner.md`
  - `agents/reviewer.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/block-dangerous.js`
  - `hooks/scan-secrets.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```

## Guided Learning Track: Enterprise AI Agent Security, Auditing & Supply-Chain Governance

Secure autonomous coding agents in enterprise repositories. Learn how to audit SKILL.md files for hidden Unicode and prompt injection, audit GitHub Actions, and enforce runtime pre-tool hooks.

**Level:** Advanced · **Target Audience:** Security engineers, CISOs, platform teams, and enterprise architects

### Learning Outcomes
- Scan agent skills and prompts across 7 static security gates with deterministic SHA-256 digests.
- Audit CI/CD workflows, GitHub Actions, and third-party dependencies for supply-chain and agentic risks.
- Deploy mandatory pre-tool command blockers, secret scanners, and custom Semgrep rules.

### Curriculum Modules & Verified Skills
#### Module 1: Threat Modeling & Audit Context Building
- **audit-context-building** (`trailofbits/audit-context-building`, undefined): Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when starting an audit, threat model, or architecture review on unfamiliar code, and before any vulnerability-hunting pass.
- **code-maturity-assessor** (`trailofbits/code-maturity-assessor`, undefined): Systematic code maturity assessment using Trail of Bits' 9-category framework. Analyzes codebase for arithmetic safety, auditing practices, access controls, complexity, decentralization, documentation, MEV risks, low-level code, and testing, then produces a scorecard with evidence-based ratings and a priority-ordered roadmap. Use when assessing or scoring the maturity of a smart contract or blockchain codebase, producing a maturity scorecard or evaluation, or judging how mature, well-tested, or well-documented such a project is against a rubric.
- **security-and-hardening** (`addyosmani/security-and-hardening`, undefined): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.

#### Module 2: Supply-Chain & Agentic Actions Auditing
- **supply-chain-risk-auditor** (`trailofbits/supply-chain-risk-auditor`, undefined): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
- **agentic-actions-auditor** (`trailofbits/agentic-actions-auditor`, undefined): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
- **second-opinion** (`trailofbits/second-opinion`, undefined): Gets independent code reviews from Codex or Antigravity for uncommitted changes, branch diffs, and commits. Use when the user requests an external review, a second opinion on code, a codex review, a gemini review, an antigravity review, or /second-opinion.

#### Module 3: Custom Detection Rules & Quality Gates
- **semgrep-rule-creator** (`trailofbits/semgrep-rule-creator`, undefined): Creates custom Semgrep rules for detecting security vulnerabilities, bug patterns, and code patterns. Use when writing Semgrep rules or building custom static analysis detections.
- **code-review-and-quality** (`addyosmani/code-review-and-quality`, undefined): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.
