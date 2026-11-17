---
id: prompt/setup-quant-researcher
name: Quant researcher Setup Prompt
description: Initial AI agent setup prompt for Quant researcher (Individual & Enterprise profiles) — installs verified skills, rules, subagents, commands, and security hooks.
category: setup
tags: setup, role, quant-researcher, individual, enterprise
---

# Quant researcher — Initial Setup Prompts

> **Role**: Quant researcher (`quant-researcher`)
> **Focus**: Backtesting, signals, risk, position sizing, fixed income and execution.
> **Categories**: `quant`, `finance`, `testing`
> **Security**: All 16 recommended skills are scanned and verified (`0` critical findings).

---

## Quick CLI Setup

```bash
# Individual setup (skills + rules + subagents + safety hooks)
npx aidentity setup quant-researcher --profile individual

# Enterprise setup (adds security/supply-chain audit skills + full governance hooks)
npx aidentity setup quant-researcher --profile enterprise

# Print the copy-paste prompt in terminal
npx aidentity setup quant-researcher --profile individual --prompt
```

---

## Option A: Individual Setup Prompt

Copy and paste into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

```markdown
# Aidentity Setup Prompt — Quant researcher (Individual)

Set up my AI agent environment for the **Quant researcher** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup quant-researcher --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Quant researcher (12)
Install with `npx aidentity add <id> --agent claude`:
  - `agiprolabs-claude-trading-skills/backtrader` (MIT · security: verified · sha256:153184bb72ef59af) — Event-driven backtesting with bar-by-bar execution, complex order types, multiple analyzers, and custom indicators
  - `agiprolabs-claude-trading-skills/vectorbt` (MIT · security: verified · sha256:90094c311c30bc6a) — High-performance vectorized backtesting with parameter optimization, portfolio simulation, and rich performance metrics
  - `agiprolabs-claude-trading-skills/kelly-criterion` (MIT · security: verified · sha256:a2ee9938572a165e) — Kelly criterion optimal sizing with fractional variants, edge estimation, and practical application for crypto trading
  - `agiprolabs-claude-trading-skills/position-sizing` (MIT · security: verified · sha256:376cd48e0db8b316) — Trade sizing methods including fixed fractional, volatility-adjusted, Kelly criterion, and liquidity-constrained sizing
  - `agiprolabs-claude-trading-skills/risk-management` (MIT · security: verified · sha256:5bcf7a98e6626d98) — Portfolio-level risk controls, drawdown management, exposure limits, and circuit breakers for crypto trading
  - `agiprolabs-claude-trading-skills/regime-detection` (MIT · security: verified · sha256:4ca066735eadb11f) — Market regime identification using volatility clustering, trend detection, and statistical methods for adaptive trading
  - `agiprolabs-claude-trading-skills/fixed-income` (MIT · security: verified · sha256:9c142a83f4b0c53a) — [STUB] Bond pricing, yield curves, duration and convexity analysis, and DeFi lending rate modeling
  - `agiprolabs-claude-trading-skills/exit-strategies` (MIT · security: verified · sha256:1ae2ac266e57308e) — Systematic exit rules, stop-loss methods, take-profit strategies, and trailing stop implementations for crypto trading
  - `mattpocock/engineering/tdd` (MIT · security: verified · sha256:60c7cd4f212f8921) — Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
  - `obra-superpowers/systematic-debugging` (MIT · security: verified · sha256:1845e2e29a540bd8) — Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
  - `supabase/supabase-postgres-best-practices` (MIT · security: verified · sha256:35e9f904d60459a3) — Postgres best practices maintained by Supabase, for Postgres running anywhere. Load this skill BEFORE writing or changing anything that lives in a Postgres database: creating or altering tables and columns (including choosing column types), schema design, migrations and declarative schema files, RLS policies and the tests that verify them, indexes, triggers, database functions, queues and scheduled jobs (pg_cron, pgmq), vector/semantic search (pgvector), and restoring dumps (pg_restore) or importing data. Also load it when diagnosing slow queries, high CPU, timeouts, EXPLAIN plans, connection exhaustion, locking, bloat, or rows visible to the wrong user or tenant. This is not just a performance guide — schema, migration, security, and SQL authoring tasks need these rules too, even for a one-column change or a single query.
  - `google-cloud/cloud/bigquery-ai-ml` (Apache-2.0 · security: verified · sha256:9d9e5c8c6a7b0e00) — Leverages BigQuery's built-in machine learning and GenAI capabilities for advanced data analytics. Use when you need to write SQL queries that perform time-series forecasting, predict values, detect outliers or anomalies, find key drivers, perform semantic search or vector search, classify text, calculate similarity, summarize content, translate language, evaluate models, filter by semantic conditions, or leverage generative AI capabilities in BigQuery. Do not use for general BigQuery dataset, table, or job management requests.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - `rules/python/coding-style.md`

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/researcher.md`
  - `agents/debugger.md`
  - `agents/reviewer.md`
- Guardrail Hooks:
  - `hooks/block-dangerous.js`
  - `hooks/scan-secrets.js`
```

---

## Option B: Enterprise Setup Prompt

Copy and paste for team/organization standardization and strict security governance:

```markdown
# Aidentity Setup Prompt — Quant researcher (Enterprise)

Set up my AI agent environment for the **Quant researcher** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup quant-researcher --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Quant researcher (16)
Install with `npx aidentity add <id> --agent claude`:
  - `agiprolabs-claude-trading-skills/backtrader` (MIT · security: verified · sha256:153184bb72ef59af) — Event-driven backtesting with bar-by-bar execution, complex order types, multiple analyzers, and custom indicators
  - `agiprolabs-claude-trading-skills/vectorbt` (MIT · security: verified · sha256:90094c311c30bc6a) — High-performance vectorized backtesting with parameter optimization, portfolio simulation, and rich performance metrics
  - `agiprolabs-claude-trading-skills/kelly-criterion` (MIT · security: verified · sha256:a2ee9938572a165e) — Kelly criterion optimal sizing with fractional variants, edge estimation, and practical application for crypto trading
  - `agiprolabs-claude-trading-skills/position-sizing` (MIT · security: verified · sha256:376cd48e0db8b316) — Trade sizing methods including fixed fractional, volatility-adjusted, Kelly criterion, and liquidity-constrained sizing
  - `agiprolabs-claude-trading-skills/risk-management` (MIT · security: verified · sha256:5bcf7a98e6626d98) — Portfolio-level risk controls, drawdown management, exposure limits, and circuit breakers for crypto trading
  - `agiprolabs-claude-trading-skills/regime-detection` (MIT · security: verified · sha256:4ca066735eadb11f) — Market regime identification using volatility clustering, trend detection, and statistical methods for adaptive trading
  - `agiprolabs-claude-trading-skills/fixed-income` (MIT · security: verified · sha256:9c142a83f4b0c53a) — [STUB] Bond pricing, yield curves, duration and convexity analysis, and DeFi lending rate modeling
  - `agiprolabs-claude-trading-skills/exit-strategies` (MIT · security: verified · sha256:1ae2ac266e57308e) — Systematic exit rules, stop-loss methods, take-profit strategies, and trailing stop implementations for crypto trading
  - `mattpocock/engineering/tdd` (MIT · security: verified · sha256:60c7cd4f212f8921) — Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
  - `obra-superpowers/systematic-debugging` (MIT · security: verified · sha256:1845e2e29a540bd8) — Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
  - `supabase/supabase-postgres-best-practices` (MIT · security: verified · sha256:35e9f904d60459a3) — Postgres best practices maintained by Supabase, for Postgres running anywhere. Load this skill BEFORE writing or changing anything that lives in a Postgres database: creating or altering tables and columns (including choosing column types), schema design, migrations and declarative schema files, RLS policies and the tests that verify them, indexes, triggers, database functions, queues and scheduled jobs (pg_cron, pgmq), vector/semantic search (pgvector), and restoring dumps (pg_restore) or importing data. Also load it when diagnosing slow queries, high CPU, timeouts, EXPLAIN plans, connection exhaustion, locking, bloat, or rows visible to the wrong user or tenant. This is not just a performance guide — schema, migration, security, and SQL authoring tasks need these rules too, even for a one-column change or a single query.
  - `google-cloud/cloud/bigquery-ai-ml` (Apache-2.0 · security: verified · sha256:9d9e5c8c6a7b0e00) — Leverages BigQuery's built-in machine learning and GenAI capabilities for advanced data analytics. Use when you need to write SQL queries that perform time-series forecasting, predict values, detect outliers or anomalies, find key drivers, perform semantic search or vector search, classify text, calculate similarity, summarize content, translate language, evaluate models, filter by semantic conditions, or leverage generative AI capabilities in BigQuery. Do not use for general BigQuery dataset, table, or job management requests.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819) — Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6) — Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e) — Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - `rules/python/coding-style.md`

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/researcher.md`
  - `agents/debugger.md`
  - `agents/reviewer.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/block-dangerous.js`
  - `hooks/scan-secrets.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
