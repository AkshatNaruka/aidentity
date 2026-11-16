---
type: Playbook
title: "Software architect AI Agent Setup Playbook (Individual & Enterprise)"
description: "System design, interfaces, diagrams, trade-offs and technical direction. Verified skills, rules, subagents, and safety hooks for Claude Code, Cursor, Codex, and Gemini CLI."
resource: https://akshatnaruka.github.io/aidentity/playbooks/architect/
tags: [architect, architecture, design, api, docs, playbook, agent-setup]
timestamp: 2026-11-16
---

# Software architect AI Agent Setup Playbook (Individual & Enterprise)

**Definition:** The **Software architect AI Agent Playbook** configures any coding agent (Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or GitHub Copilot) for system design, interfaces, diagrams, trade-offs and technical direction. It installs 8 SHA-256 security-verified skills in the Individual profile and 11 skills plus 4 runtime guardrails in the Enterprise profile.

## Quick Commands

```bash
# Individual setup (8 verified skills)
npx aidentity setup architect --profile individual

# Enterprise setup (11 verified skills + supply-chain & security hooks)
npx aidentity setup architect --profile enterprise
```

## Individual vs. Enterprise Comparison

| Component | Individual Profile | Enterprise Profile |
|---|---|---|
| Verified Skills | 8 core skills | 11 skills (+4 security/audit skills) |
| Coding Rules | 2 rule files | 2 rule files |
| Subagents | 3 subagents | 3 subagents |
| Slash Commands | 2 commands | 2 commands |
| Safety Hooks | hooks/block-dangerous.js, hooks/scan-secrets.js | hooks/block-dangerous.js, hooks/scan-secrets.js, hooks/format-on-save.js, hooks/test-on-stop.js |

## Verified Skills Included

- **improve-codebase-architecture** (`mattpocock/engineering/improve-codebase-architecture`, MIT, SHA-256 ``): Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **codebase-design** (`mattpocock/engineering/codebase-design`, MIT, SHA-256 ``): Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
- **api-and-interface-design** (`addyosmani/api-and-interface-design`, MIT, SHA-256 ``): Guides stable API and interface design. Use when designing APIs, module boundaries, or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules, or establishing boundaries between frontend and backend.
- **documentation-and-adrs** (`addyosmani/documentation-and-adrs`, MIT, SHA-256 ``): Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
- **backend-patterns** (`everything-claude-code/backend-patterns`, MIT, SHA-256 ``): Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes. Use when building or reviewing Node.js, Express, or Next.js API routes and their data access.
- **drawio-skill** (`agents365-ai-drawio-skill/drawio-skill`, MIT, SHA-256 ``): Create and edit draw.io/diagrams.net diagrams as editable `.drawio` files. Covers architecture, UML/ERD/sequence, BPMN, network, and swimlane views authored from a description or converted from code, IaC, SQL, and API schemas, plus sync, query, test, review, export, and publish of existing diagrams. Use when the user asks for draw.io/diagrams.net or an editable diagram; prefer Mermaid/PlantUML when diagrams-as-code is enough.
- **security-and-hardening** (`addyosmani/security-and-hardening`, MIT, SHA-256 ``): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
- **audit-context-building** (`trailofbits/audit-context-building`, CC-BY-SA-4.0, SHA-256 ``): Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when starting an audit, threat model, or architecture review on unfamiliar code, and before any vulnerability-hunting pass.
- **supply-chain-risk-auditor** (`trailofbits/supply-chain-risk-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
- **agentic-actions-auditor** (`trailofbits/agentic-actions-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
- **code-review-and-quality** (`addyosmani/code-review-and-quality`, MIT, SHA-256 ``): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## One-Shot Individual Setup Prompt

```markdown
# Aidentity Setup Prompt — Software architect (Individual)

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

## 3. Verified Skills for Software architect (8)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/improve-codebase-architecture` (MIT · security: verified · sha256:9f2a98a49ee48e50) — Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
  - `mattpocock/engineering/codebase-design` (MIT · security: verified · sha256:95f777036790186f) — Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
  - `addyosmani/api-and-interface-design` (MIT · security: verified · sha256:2b84ee195da1148f) — Guides stable API and interface design. Use when designing APIs, module boundaries, or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules, or establishing boundaries between frontend and backend.
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563) — Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `everything-claude-code/backend-patterns` (MIT · security: verified · sha256:33b79eeae4aa6369) — Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes. Use when building or reviewing Node.js, Express, or Next.js API routes and their data access.
  - `agents365-ai-drawio-skill/drawio-skill` (MIT · security: verified · sha256:11f0f20c71237527) — Create and edit draw.io/diagrams.net diagrams as editable `.drawio` files. Covers architecture, UML/ERD/sequence, BPMN, network, and swimlane views authored from a description or converted from code, IaC, SQL, and API schemas, plus sync, query, test, review, export, and publish of existing diagrams. Use when the user asks for draw.io/diagrams.net or an editable diagram; prefer Mermaid/PlantUML when diagrams-as-code is enough.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/audit-context-building` (CC-BY-SA-4.0 · security: verified · sha256:fc2ac9aa807865ac) — Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when starting an audit, threat model, or architecture review on unfamiliar code, and before any vulnerability-hunting pass.

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
# Aidentity Setup Prompt — Software architect (Enterprise)

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

## 3. Verified Skills for Software architect (11)
Install with `npx aidentity add <id> --agent claude`:
  - `mattpocock/engineering/improve-codebase-architecture` (MIT · security: verified · sha256:9f2a98a49ee48e50) — Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
  - `mattpocock/engineering/codebase-design` (MIT · security: verified · sha256:95f777036790186f) — Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
  - `addyosmani/api-and-interface-design` (MIT · security: verified · sha256:2b84ee195da1148f) — Guides stable API and interface design. Use when designing APIs, module boundaries, or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules, or establishing boundaries between frontend and backend.
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563) — Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `everything-claude-code/backend-patterns` (MIT · security: verified · sha256:33b79eeae4aa6369) — Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes. Use when building or reviewing Node.js, Express, or Next.js API routes and their data access.
  - `agents365-ai-drawio-skill/drawio-skill` (MIT · security: verified · sha256:11f0f20c71237527) — Create and edit draw.io/diagrams.net diagrams as editable `.drawio` files. Covers architecture, UML/ERD/sequence, BPMN, network, and swimlane views authored from a description or converted from code, IaC, SQL, and API schemas, plus sync, query, test, review, export, and publish of existing diagrams. Use when the user asks for draw.io/diagrams.net or an editable diagram; prefer Mermaid/PlantUML when diagrams-as-code is enough.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/audit-context-building` (CC-BY-SA-4.0 · security: verified · sha256:fc2ac9aa807865ac) — Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when starting an audit, threat model, or architecture review on unfamiliar code, and before any vulnerability-hunting pass.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819) — Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6) — Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e) — Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

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
