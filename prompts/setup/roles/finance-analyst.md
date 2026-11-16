---
id: prompt/setup-finance-analyst
name: Finance analyst Setup Prompt
description: Initial AI agent setup prompt for Finance analyst (Individual & Enterprise profiles) — installs verified skills, rules, subagents, commands, and security hooks.
category: setup
tags: setup, role, finance-analyst, individual, enterprise
---

# Finance analyst — Initial Setup Prompts

> **Role**: Finance analyst (`finance-analyst`)
> **Focus**: Three-statement models, DCF, comps, LBO, budgets and Excel workflows.
> **Categories**: `finance`, `corporate`, `quant`
> **Security**: All 12 recommended skills are scanned and verified (`0` critical findings).

---

## Quick CLI Setup

```bash
# Individual setup (skills + rules + subagents + safety hooks)
npx aidentity setup finance-analyst --profile individual

# Enterprise setup (adds security/supply-chain audit skills + full governance hooks)
npx aidentity setup finance-analyst --profile enterprise

# Print the copy-paste prompt in terminal
npx aidentity setup finance-analyst --profile individual --prompt
```

---

## Option A: Individual Setup Prompt

Copy and paste into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

```markdown
# Aidentity Setup Prompt — Finance analyst (Individual)

Set up my AI agent environment for the **Finance analyst** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup finance-analyst --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Finance analyst (8)
Install with `npx aidentity add <id> --agent claude`:
  - `agentii-ai-agentii-investment-intelligence/3-statement` (Apache-2.0 · security: verified · sha256:448618ea36c1ee18) — 3-statement financial model, integrated IS BS CF, income statement projection, balance sheet forecast, cash flow statement, cross-statement balancing, financial model build, operating model, three statement model, integrated financial statements
  - `agentii-ai-agentii-investment-intelligence/dcf` (Apache-2.0 · security: verified · sha256:a475466e52b4ca7a) — DCF valuation model, discounted cash flow, intrinsic value, WACC calculation, terminal value, free cash flow projection, equity value per share, DCF sensitivity analysis, unlevered free cash flow, present value calculation, build a DCF
  - `agentii-ai-agentii-investment-intelligence/comps` (Apache-2.0 · security: verified · sha256:a0aa0797162ee917) — Comparable company analysis, trading comps, peer multiples, EV/EBITDA comparison, P/E benchmarking, comps table, relative valuation, industry multiples, precedent transactions, trading comparable analysis # Curated subset — provenance RECORDED 2026-09-21 (spec 058 T004/T005, FR-051). # # This value was NOT curated and reviewed. It reached the generated # `skill-registry.yaml` first, by a hand-edit of that file on 2026-09-20 (commit # `aea28b1`, "test and debug"), which put the repo red on Check 31 — the registry said # `[retrieval-scope]` while this file declared no `essentials_modes` at all. Spec 058 # then reconciled the divergence by declaring the registry's value here, which is the # declaration FR-051 asks for (the source of truth is this file; `sync-registry.sh` # regenerates the registry from it — `sync_registry.build_entries()` reads # `essentials_modes` straight from this frontmatter, so a hand-edit to the registry # cannot survive a check). # # What is still OPEN is the curation itself: nobody has judged whether # `retrieval-scope` is the right default for this skill. The kit's only documented # derivation, `essentials_modes = first <=3 modes` (scripts/mode_backfill.py), would # give `[preflight, triggers, defaults]` — this file's own document sections, not # analysis modes — which is why that derivation is not what was applied. Note the # asymmetry a reviewer should start from: `reverse-dcf` declares the SAME five modes # (`preflight, triggers, defaults, methodology, retrieval-scope`) and defaulted to # `[methodology]`, which is what `depth_to_modes`'s own fallback prefers where it # exists. Two skills, identical declared sets, different answers, no recorded reason. # Owner: whoever owns this skill's methodology.
  - `agentii-ai-agentii-investment-intelligence/lbo` (Apache-2.0 · security: verified · sha256:28fb8c5a129077cc) — LBO model, leveraged buyout, private equity acquisition, sources and uses, debt schedule, returns waterfall, sponsor IRR, MOIC calculation, PE exit analysis, LBO valuation
  - `agentii-ai-agentii-investment-intelligence/full-equity-research` (Apache-2.0 · security: verified · sha256:db7a20df03297b63) — The Auto 档 scenario — a soft-plan orchestrator for a complete fundamental equity research thesis: understand → financials → valuation → synthesize. The body is a soft plan (stages), not a rigid DAG; correctness is enforced by each referenced skill's own requires: preconditions, never by this plan's rigidity (Q2).
  - `agentii-ai-agentii-investment-intelligence/pitch-deck` (Apache-2.0 · security: verified · sha256:20028b89bfece505) — Investment pitch deck, investment committee presentation, buy-side pitch, sell-side pitch, investment thesis slides, executive summary presentation, financial presentation, board deck, investor presentation, strategy deck
  - `agentii-ai-agentii-investment-intelligence/risk` (Apache-2.0 · security: verified · sha256:75feef4562f8c35d) — Risk analysis, regulatory risk assessment, competitive risk, macro risk, technology risk, litigation risk, financial risk assessment, enterprise risk, operational risk, geopolitical risk exposure
  - `opensensenova-sensenova-skills/sn-da-excel-workflow` (MIT · security: verified · sha256:d90eee87576f4254) — Excel 数据分析多步编排器。覆盖：(1) 读取多 Sheet Excel 文件并统计行数，(2) 大文件检测（≥10k 行自动 Parquet 优化），(3) 数据清洗（缺失值、文本标准化、无效字符），(4) 条件筛选与分类提取，(5) 跨 Sheet 统计聚合，(6) 导出 Excel/CSV 并提供下载链接。覆盖从数据读取到报告生成全流程，按步骤编排 capability 子 skill。**遇到以下任一情况就主动使用本 skill，不要自行写几行 pandas 就回答**：①用户出现触发词：Excel 分析 / 表格分析 / 数据分析 / 数据清洗 / 数据统计 / 数据筛选 / 数据可视化 / 数据导出 / 汇总统计 / 透视表 / 分组统计 / 交叉分析 / 趋势分析 / 对比分析 / 异常值检测 / 去重 / 缺失值处理 / Excel 报告 / 生成报表 / analyze Excel / data analysis / data cleaning / pivot table；②用户上传或指定了 .xlsx / .xls / .csv 文件并要求分析、清洗、统计或可视化；③任务涉及多 Sheet 读取、条件筛选、分类汇总、图表生成中的任意一项；④用户要求导出带格式的 Excel 报告或下载链接。仅不用于：不涉及表格数据的纯文本处理、图片分析（使用 sn-da-image-caption）、单个公式计算的简单问答。

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - `rules/python/coding-style.md`

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/researcher.md`
  - `agents/planner.md`
  - `agents/reviewer.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
```

---

## Option B: Enterprise Setup Prompt

Copy and paste for team/organization standardization and strict security governance:

```markdown
# Aidentity Setup Prompt — Finance analyst (Enterprise)

Set up my AI agent environment for the **Finance analyst** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup finance-analyst --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Finance analyst (12)
Install with `npx aidentity add <id> --agent claude`:
  - `agentii-ai-agentii-investment-intelligence/3-statement` (Apache-2.0 · security: verified · sha256:448618ea36c1ee18) — 3-statement financial model, integrated IS BS CF, income statement projection, balance sheet forecast, cash flow statement, cross-statement balancing, financial model build, operating model, three statement model, integrated financial statements
  - `agentii-ai-agentii-investment-intelligence/dcf` (Apache-2.0 · security: verified · sha256:a475466e52b4ca7a) — DCF valuation model, discounted cash flow, intrinsic value, WACC calculation, terminal value, free cash flow projection, equity value per share, DCF sensitivity analysis, unlevered free cash flow, present value calculation, build a DCF
  - `agentii-ai-agentii-investment-intelligence/comps` (Apache-2.0 · security: verified · sha256:a0aa0797162ee917) — Comparable company analysis, trading comps, peer multiples, EV/EBITDA comparison, P/E benchmarking, comps table, relative valuation, industry multiples, precedent transactions, trading comparable analysis # Curated subset — provenance RECORDED 2026-09-21 (spec 058 T004/T005, FR-051). # # This value was NOT curated and reviewed. It reached the generated # `skill-registry.yaml` first, by a hand-edit of that file on 2026-09-20 (commit # `aea28b1`, "test and debug"), which put the repo red on Check 31 — the registry said # `[retrieval-scope]` while this file declared no `essentials_modes` at all. Spec 058 # then reconciled the divergence by declaring the registry's value here, which is the # declaration FR-051 asks for (the source of truth is this file; `sync-registry.sh` # regenerates the registry from it — `sync_registry.build_entries()` reads # `essentials_modes` straight from this frontmatter, so a hand-edit to the registry # cannot survive a check). # # What is still OPEN is the curation itself: nobody has judged whether # `retrieval-scope` is the right default for this skill. The kit's only documented # derivation, `essentials_modes = first <=3 modes` (scripts/mode_backfill.py), would # give `[preflight, triggers, defaults]` — this file's own document sections, not # analysis modes — which is why that derivation is not what was applied. Note the # asymmetry a reviewer should start from: `reverse-dcf` declares the SAME five modes # (`preflight, triggers, defaults, methodology, retrieval-scope`) and defaulted to # `[methodology]`, which is what `depth_to_modes`'s own fallback prefers where it # exists. Two skills, identical declared sets, different answers, no recorded reason. # Owner: whoever owns this skill's methodology.
  - `agentii-ai-agentii-investment-intelligence/lbo` (Apache-2.0 · security: verified · sha256:28fb8c5a129077cc) — LBO model, leveraged buyout, private equity acquisition, sources and uses, debt schedule, returns waterfall, sponsor IRR, MOIC calculation, PE exit analysis, LBO valuation
  - `agentii-ai-agentii-investment-intelligence/full-equity-research` (Apache-2.0 · security: verified · sha256:db7a20df03297b63) — The Auto 档 scenario — a soft-plan orchestrator for a complete fundamental equity research thesis: understand → financials → valuation → synthesize. The body is a soft plan (stages), not a rigid DAG; correctness is enforced by each referenced skill's own requires: preconditions, never by this plan's rigidity (Q2).
  - `agentii-ai-agentii-investment-intelligence/pitch-deck` (Apache-2.0 · security: verified · sha256:20028b89bfece505) — Investment pitch deck, investment committee presentation, buy-side pitch, sell-side pitch, investment thesis slides, executive summary presentation, financial presentation, board deck, investor presentation, strategy deck
  - `agentii-ai-agentii-investment-intelligence/risk` (Apache-2.0 · security: verified · sha256:75feef4562f8c35d) — Risk analysis, regulatory risk assessment, competitive risk, macro risk, technology risk, litigation risk, financial risk assessment, enterprise risk, operational risk, geopolitical risk exposure
  - `opensensenova-sensenova-skills/sn-da-excel-workflow` (MIT · security: verified · sha256:d90eee87576f4254) — Excel 数据分析多步编排器。覆盖：(1) 读取多 Sheet Excel 文件并统计行数，(2) 大文件检测（≥10k 行自动 Parquet 优化），(3) 数据清洗（缺失值、文本标准化、无效字符），(4) 条件筛选与分类提取，(5) 跨 Sheet 统计聚合，(6) 导出 Excel/CSV 并提供下载链接。覆盖从数据读取到报告生成全流程，按步骤编排 capability 子 skill。**遇到以下任一情况就主动使用本 skill，不要自行写几行 pandas 就回答**：①用户出现触发词：Excel 分析 / 表格分析 / 数据分析 / 数据清洗 / 数据统计 / 数据筛选 / 数据可视化 / 数据导出 / 汇总统计 / 透视表 / 分组统计 / 交叉分析 / 趋势分析 / 对比分析 / 异常值检测 / 去重 / 缺失值处理 / Excel 报告 / 生成报表 / analyze Excel / data analysis / data cleaning / pivot table；②用户上传或指定了 .xlsx / .xls / .csv 文件并要求分析、清洗、统计或可视化；③任务涉及多 Sheet 读取、条件筛选、分类汇总、图表生成中的任意一项；④用户要求导出带格式的 Excel 报告或下载链接。仅不用于：不涉及表格数据的纯文本处理、图片分析（使用 sn-da-image-caption）、单个公式计算的简单问答。
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
  - `agents/planner.md`
  - `agents/reviewer.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
