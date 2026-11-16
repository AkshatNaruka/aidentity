---
id: prompt/setup-journalist
name: Journalist Setup Prompt
description: Initial AI agent setup prompt for Journalist (Individual & Enterprise profiles) — installs verified skills, rules, subagents, commands, and security hooks.
category: setup
tags: setup, role, journalist, individual, enterprise
---

# Journalist — Initial Setup Prompts

> **Role**: Journalist (`journalist`)
> **Focus**: Reporting, data journalism, editorial workflow and source verification.
> **Categories**: `media`, `docs`, `research`
> **Security**: All 10 recommended skills are scanned and verified (`0` critical findings).

---

## Quick CLI Setup

```bash
# Individual setup (skills + rules + subagents + safety hooks)
npx aidentity setup journalist --profile individual

# Enterprise setup (adds security/supply-chain audit skills + full governance hooks)
npx aidentity setup journalist --profile enterprise

# Print the copy-paste prompt in terminal
npx aidentity setup journalist --profile individual --prompt
```

---

## Option A: Individual Setup Prompt

Copy and paste into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

```markdown
# Aidentity Setup Prompt — Journalist (Individual)

Set up my AI agent environment for the **Journalist** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup journalist --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Journalist (6)
Install with `npx aidentity add <id> --agent claude`:
  - `emmapbingham-agentic-newsroom/fish-for-leads` (MIT · security: verified · sha256:1046dc3840a2f15d) — Operates the everyday, cheap go-fish loop over a data-journalism newsroom's sourced SQLite corpus — runs one live screen, gates candidates before they cost editor attention (template collapse, actor test, novelty-lite), surfaces survivors as leads, builds derived tables on demand, and promotes leads into cases. Every state change lands in the actions journal with an actor and review state; agents act provisionally and the editor reviews a ranked queue afterward (acknowledge or overturn, signed). On invocation reads full posture (screens with yield, leads, dispositions, unreviewed actions). Hands off to track-investigation on promotion, and to sweep-for-screens when the live slate is exhausted. Use when running the newsroom, going fishing, surfacing or triaging leads, reviewing autonomous actions, promoting a lead, or building a derived table. Trigger phrases: run the newsroom, newsroom status, go fish, surface leads, triage leads, review actions, promote a lead, check posture.
  - `emmapbingham-agentic-newsroom/track-investigation` (MIT · security: verified · sha256:14832bc0b7455f3c) — Runs and tracks data-driven investigative-journalism cases across sessions over a SQLite corpus. Starts when a logged lead is promoted from the newsroom (fish-for-leads skill) — opens the case, runs drilldown, compiles evidence, verifies the finding (builder → skeptic → judge), and conducts a novelty scan. Defines durable on-disk case files (hypothesis, sourced evidence, running log), a layered data architecture that keeps the immutable source database, shared rebuildable derived tables, and case-local artifacts separate and reproducible. Built for the db/gain.db corpus but the discipline is general. Use when promoting a lead to a case, starting or resuming an investigation, building or refuting a case from data, managing investigation state across context windows, or verifying a finding. Trigger phrases: promote a lead, open a case, track an investigation, resume the investigation, build a case, verify a finding.
  - `emmapbingham-agentic-newsroom/ingest-to-sqlite` (MIT · security: verified · sha256:9063bb75430318ce) — Turns a messy structured dataset (JSON, JSONL, XML, CSV, or nested API dumps) into a normalized, queryable, auditable SQLite database. Encodes a verifiable-ingestion methodology — preserve the source's own IDs as keys, store money and numbers both raw and parsed, fold controlled vocabularies into reference tables, add FTS5 for free text, stamp every fact row with a source key or URL, make rebuilds source-scoped and idempotent, and validate by reconciling row counts and foreign keys against the raw source. Use when building a database or ETL pipeline from raw data files, designing a SQLite schema, normalizing nested data, or making query results traceable for journalism, research, or analytics. Includes a generic database verifier.
  - `emmapbingham-agentic-newsroom/sweep-for-screens` (MIT · security: verified · sha256:61425da4b39c9782) — Runs the rare, expensive fleet sweep that expands a data-journalism newsroom's fishing capability over a sourced SQLite corpus — designs new deterministic SQL screens and proposes the derived tables they need, without generating leads directly. Reads and writes screens/derived_tables/sweeps in newsroom.db; the fish-for-leads skill runs the screens and surfaces leads. Encodes the contrast taxonomy (six ways a lead can deviate from a baseline, crossed with the corpus's grains) that partitions idea space across a scout fleet, fleet run-economics (pilot-first, probe budgets, tier models by fleet size, hard token ceilings), and the beat-nomination discipline for using outside reporting to aim the corpus without letting it into evidence. Use when sweeping for new screen ideas, designing a screen, expanding fishing capability, proposing a derived table, or running a fleet sweep. Trigger phrases: sweep for leads, design new screens, expand the newsroom, run a sweep, propose a derived table.
  - `addyosmani/source-driven-development` (MIT · security: verified · sha256:64cb0b95b6633259) — Grounds every implementation decision in official documentation. Use when you want authoritative, source-cited code free from outdated patterns. Use when building with any framework or library where correctness matters.
  - `opensensenova-sensenova-skills/sn-da-non-spreadsheet-analysis/capability/pdf-analysis` (MIT · security: verified · sha256:869af7d4a303b0d1) — PDF 文档解析。自动区分文字型 PDF 与扫描型 PDF，覆盖：文本/表格提取、多页全量扫描、嵌入图表 caption、单位感知数值计算。

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
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
# Aidentity Setup Prompt — Journalist (Enterprise)

Set up my AI agent environment for the **Journalist** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup journalist --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Journalist (10)
Install with `npx aidentity add <id> --agent claude`:
  - `emmapbingham-agentic-newsroom/fish-for-leads` (MIT · security: verified · sha256:1046dc3840a2f15d) — Operates the everyday, cheap go-fish loop over a data-journalism newsroom's sourced SQLite corpus — runs one live screen, gates candidates before they cost editor attention (template collapse, actor test, novelty-lite), surfaces survivors as leads, builds derived tables on demand, and promotes leads into cases. Every state change lands in the actions journal with an actor and review state; agents act provisionally and the editor reviews a ranked queue afterward (acknowledge or overturn, signed). On invocation reads full posture (screens with yield, leads, dispositions, unreviewed actions). Hands off to track-investigation on promotion, and to sweep-for-screens when the live slate is exhausted. Use when running the newsroom, going fishing, surfacing or triaging leads, reviewing autonomous actions, promoting a lead, or building a derived table. Trigger phrases: run the newsroom, newsroom status, go fish, surface leads, triage leads, review actions, promote a lead, check posture.
  - `emmapbingham-agentic-newsroom/track-investigation` (MIT · security: verified · sha256:14832bc0b7455f3c) — Runs and tracks data-driven investigative-journalism cases across sessions over a SQLite corpus. Starts when a logged lead is promoted from the newsroom (fish-for-leads skill) — opens the case, runs drilldown, compiles evidence, verifies the finding (builder → skeptic → judge), and conducts a novelty scan. Defines durable on-disk case files (hypothesis, sourced evidence, running log), a layered data architecture that keeps the immutable source database, shared rebuildable derived tables, and case-local artifacts separate and reproducible. Built for the db/gain.db corpus but the discipline is general. Use when promoting a lead to a case, starting or resuming an investigation, building or refuting a case from data, managing investigation state across context windows, or verifying a finding. Trigger phrases: promote a lead, open a case, track an investigation, resume the investigation, build a case, verify a finding.
  - `emmapbingham-agentic-newsroom/ingest-to-sqlite` (MIT · security: verified · sha256:9063bb75430318ce) — Turns a messy structured dataset (JSON, JSONL, XML, CSV, or nested API dumps) into a normalized, queryable, auditable SQLite database. Encodes a verifiable-ingestion methodology — preserve the source's own IDs as keys, store money and numbers both raw and parsed, fold controlled vocabularies into reference tables, add FTS5 for free text, stamp every fact row with a source key or URL, make rebuilds source-scoped and idempotent, and validate by reconciling row counts and foreign keys against the raw source. Use when building a database or ETL pipeline from raw data files, designing a SQLite schema, normalizing nested data, or making query results traceable for journalism, research, or analytics. Includes a generic database verifier.
  - `emmapbingham-agentic-newsroom/sweep-for-screens` (MIT · security: verified · sha256:61425da4b39c9782) — Runs the rare, expensive fleet sweep that expands a data-journalism newsroom's fishing capability over a sourced SQLite corpus — designs new deterministic SQL screens and proposes the derived tables they need, without generating leads directly. Reads and writes screens/derived_tables/sweeps in newsroom.db; the fish-for-leads skill runs the screens and surfaces leads. Encodes the contrast taxonomy (six ways a lead can deviate from a baseline, crossed with the corpus's grains) that partitions idea space across a scout fleet, fleet run-economics (pilot-first, probe budgets, tier models by fleet size, hard token ceilings), and the beat-nomination discipline for using outside reporting to aim the corpus without letting it into evidence. Use when sweeping for new screen ideas, designing a screen, expanding fishing capability, proposing a derived table, or running a fleet sweep. Trigger phrases: sweep for leads, design new screens, expand the newsroom, run a sweep, propose a derived table.
  - `addyosmani/source-driven-development` (MIT · security: verified · sha256:64cb0b95b6633259) — Grounds every implementation decision in official documentation. Use when you want authoritative, source-cited code free from outdated patterns. Use when building with any framework or library where correctness matters.
  - `opensensenova-sensenova-skills/sn-da-non-spreadsheet-analysis/capability/pdf-analysis` (MIT · security: verified · sha256:869af7d4a303b0d1) — PDF 文档解析。自动区分文字型 PDF 与扫描型 PDF，覆盖：文本/表格提取、多页全量扫描、嵌入图表 caption、单位感知数值计算。
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819) — Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6) — Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e) — Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/researcher.md`
  - `agents/doc-writer.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
