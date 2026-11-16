---
type: Playbook
title: "Quant researcher AI Agent Setup Playbook (Individual & Enterprise)"
description: "Backtesting, signals, risk, position sizing, fixed income and execution. Verified skills, rules, subagents, and safety hooks for Claude Code, Cursor, Codex, and Gemini CLI."
resource: https://akshatnaruka.github.io/aidentity/playbooks/quant-researcher/
tags: [quant-researcher, quant, finance, testing, playbook, agent-setup]
timestamp: 2026-11-16
---

# Quant researcher AI Agent Setup Playbook (Individual & Enterprise)

**Definition:** The **Quant researcher AI Agent Playbook** configures any coding agent (Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or GitHub Copilot) for backtesting, signals, risk, position sizing, fixed income and execution. It installs 8 SHA-256 security-verified skills in the Individual profile and 12 skills plus 4 runtime guardrails in the Enterprise profile.

## Quick Commands

```bash
# Individual setup (8 verified skills)
npx aidentity setup quant-researcher --profile individual

# Enterprise setup (12 verified skills + supply-chain & security hooks)
npx aidentity setup quant-researcher --profile enterprise
```

## Individual vs. Enterprise Comparison

| Component | Individual Profile | Enterprise Profile |
|---|---|---|
| Verified Skills | 8 core skills | 12 skills (+4 security/audit skills) |
| Coding Rules | 1 rule files | 1 rule files |
| Subagents | 3 subagents | 4 subagents |
| Slash Commands | 2 commands | 2 commands |
| Safety Hooks | hooks/block-dangerous.js, hooks/scan-secrets.js | hooks/block-dangerous.js, hooks/scan-secrets.js, hooks/format-on-save.js, hooks/test-on-stop.js |

## Verified Skills Included

- **backtrader** (`agiprolabs-claude-trading-skills/backtrader`, MIT, SHA-256 ``): Event-driven backtesting with bar-by-bar execution, complex order types, multiple analyzers, and custom indicators
- **vectorbt** (`agiprolabs-claude-trading-skills/vectorbt`, MIT, SHA-256 ``): High-performance vectorized backtesting with parameter optimization, portfolio simulation, and rich performance metrics
- **kelly-criterion** (`agiprolabs-claude-trading-skills/kelly-criterion`, MIT, SHA-256 ``): Kelly criterion optimal sizing with fractional variants, edge estimation, and practical application for crypto trading
- **position-sizing** (`agiprolabs-claude-trading-skills/position-sizing`, MIT, SHA-256 ``): Trade sizing methods including fixed fractional, volatility-adjusted, Kelly criterion, and liquidity-constrained sizing
- **risk-management** (`agiprolabs-claude-trading-skills/risk-management`, MIT, SHA-256 ``): Portfolio-level risk controls, drawdown management, exposure limits, and circuit breakers for crypto trading
- **regime-detection** (`agiprolabs-claude-trading-skills/regime-detection`, MIT, SHA-256 ``): Market regime identification using volatility clustering, trend detection, and statistical methods for adaptive trading
- **fixed-income** (`agiprolabs-claude-trading-skills/fixed-income`, MIT, SHA-256 ``): [STUB] Bond pricing, yield curves, duration and convexity analysis, and DeFi lending rate modeling
- **tdd** (`mattpocock/engineering/tdd`, MIT, SHA-256 ``): Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
- **security-and-hardening** (`addyosmani/security-and-hardening`, MIT, SHA-256 ``): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
- **supply-chain-risk-auditor** (`trailofbits/supply-chain-risk-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
- **agentic-actions-auditor** (`trailofbits/agentic-actions-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
- **code-review-and-quality** (`addyosmani/code-review-and-quality`, MIT, SHA-256 ``): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## One-Shot Individual Setup Prompt

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

## 3. Verified Skills for Quant researcher (8)
Install with `npx aidentity add <id> --agent claude`:
  - `agiprolabs-claude-trading-skills/backtrader` (MIT · security: verified · sha256:153184bb72ef59af) — Event-driven backtesting with bar-by-bar execution, complex order types, multiple analyzers, and custom indicators
  - `agiprolabs-claude-trading-skills/vectorbt` (MIT · security: verified · sha256:90094c311c30bc6a) — High-performance vectorized backtesting with parameter optimization, portfolio simulation, and rich performance metrics
  - `agiprolabs-claude-trading-skills/kelly-criterion` (MIT · security: verified · sha256:a2ee9938572a165e) — Kelly criterion optimal sizing with fractional variants, edge estimation, and practical application for crypto trading
  - `agiprolabs-claude-trading-skills/position-sizing` (MIT · security: verified · sha256:376cd48e0db8b316) — Trade sizing methods including fixed fractional, volatility-adjusted, Kelly criterion, and liquidity-constrained sizing
  - `agiprolabs-claude-trading-skills/risk-management` (MIT · security: verified · sha256:5bcf7a98e6626d98) — Portfolio-level risk controls, drawdown management, exposure limits, and circuit breakers for crypto trading
  - `agiprolabs-claude-trading-skills/regime-detection` (MIT · security: verified · sha256:4ca066735eadb11f) — Market regime identification using volatility clustering, trend detection, and statistical methods for adaptive trading
  - `agiprolabs-claude-trading-skills/fixed-income` (MIT · security: verified · sha256:9c142a83f4b0c53a) — [STUB] Bond pricing, yield curves, duration and convexity analysis, and DeFi lending rate modeling
  - `mattpocock/engineering/tdd` (MIT · security: verified · sha256:60c7cd4f212f8921) — Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.

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

## One-Shot Enterprise Setup Prompt

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

## 3. Verified Skills for Quant researcher (12)
Install with `npx aidentity add <id> --agent claude`:
  - `agiprolabs-claude-trading-skills/backtrader` (MIT · security: verified · sha256:153184bb72ef59af) — Event-driven backtesting with bar-by-bar execution, complex order types, multiple analyzers, and custom indicators
  - `agiprolabs-claude-trading-skills/vectorbt` (MIT · security: verified · sha256:90094c311c30bc6a) — High-performance vectorized backtesting with parameter optimization, portfolio simulation, and rich performance metrics
  - `agiprolabs-claude-trading-skills/kelly-criterion` (MIT · security: verified · sha256:a2ee9938572a165e) — Kelly criterion optimal sizing with fractional variants, edge estimation, and practical application for crypto trading
  - `agiprolabs-claude-trading-skills/position-sizing` (MIT · security: verified · sha256:376cd48e0db8b316) — Trade sizing methods including fixed fractional, volatility-adjusted, Kelly criterion, and liquidity-constrained sizing
  - `agiprolabs-claude-trading-skills/risk-management` (MIT · security: verified · sha256:5bcf7a98e6626d98) — Portfolio-level risk controls, drawdown management, exposure limits, and circuit breakers for crypto trading
  - `agiprolabs-claude-trading-skills/regime-detection` (MIT · security: verified · sha256:4ca066735eadb11f) — Market regime identification using volatility clustering, trend detection, and statistical methods for adaptive trading
  - `agiprolabs-claude-trading-skills/fixed-income` (MIT · security: verified · sha256:9c142a83f4b0c53a) — [STUB] Bond pricing, yield curves, duration and convexity analysis, and DeFi lending rate modeling
  - `mattpocock/engineering/tdd` (MIT · security: verified · sha256:60c7cd4f212f8921) — Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
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
