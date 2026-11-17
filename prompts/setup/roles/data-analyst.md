---
id: prompt/setup-data-analyst
name: Data analyst Setup Prompt
description: Initial AI agent setup prompt for Data analyst (Individual & Enterprise profiles) — installs verified skills, rules, subagents, commands, and security hooks.
category: setup
tags: setup, role, data-analyst, individual, enterprise
---

# Data analyst — Initial Setup Prompts

> **Role**: Data analyst (`data-analyst`)
> **Focus**: Excel, SQL, cleaning, dashboards, statistics and reporting.
> **Categories**: `corporate`, `database`, `analytics`
> **Security**: All 16 recommended skills are scanned and verified (`0` critical findings).

---

## Quick CLI Setup

```bash
# Individual setup (skills + rules + subagents + safety hooks)
npx aidentity setup data-analyst --profile individual

# Enterprise setup (adds security/supply-chain audit skills + full governance hooks)
npx aidentity setup data-analyst --profile enterprise

# Print the copy-paste prompt in terminal
npx aidentity setup data-analyst --profile individual --prompt
```

---

## Option A: Individual Setup Prompt

Copy and paste into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

```markdown
# Aidentity Setup Prompt: Data analyst (Individual)

Set up my AI agent environment for the **Data analyst** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup data-analyst --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Data analyst (12)
Install with `npx aidentity add <id> --agent claude`:
  - `supabase/supabase-postgres-best-practices` (MIT · security: verified · sha256:35e9f904d60459a3): Postgres best practices maintained by Supabase, for Postgres running anywhere. Load this skill BEFORE writing or changing anything that lives in a Postgres database: creating or altering tables and columns (including choosing column types), schema design, migrations and declarative schema files, RLS policies and the tests that verify them, indexes, triggers, database functions, queues and scheduled jobs (pg_cron, pgmq), vector/semantic search (pgvector), and restoring dumps (pg_restore) or importing data. Also load it when diagnosing slow queries, high CPU, timeouts, EXPLAIN plans, connection exhaustion, locking, bloat, or rows visible to the wrong user or tenant. This is not just a performance guide, schema, migration, security, and SQL authoring tasks need these rules too, even for a one-column change or a single query.
  - `google-cloud/cloud/bigquery-ai-ml` (Apache-2.0 · security: verified · sha256:9d9e5c8c6a7b0e00): Leverages BigQuery's built-in machine learning and GenAI capabilities for advanced data analytics. Use when you need to write SQL queries that perform time-series forecasting, predict values, detect outliers or anomalies, find key drivers, perform semantic search or vector search, classify text, calculate similarity, summarize content, translate language, evaluate models, filter by semantic conditions, or leverage generative AI capabilities in BigQuery. Do not use for general BigQuery dataset, table, or job management requests.
  - `google-cloud/cloud/bigquery-basics` (Apache-2.0 · security: verified · sha256:e959e2985913a329): Manages datasets, tables, and jobs in BigQuery. Use when you need to interact with BigQuery, run SQL queries, manage BigQuery resources (datasets, tables, views), or perform basic data ingestion and analysis.
  - `google-cloud/cloud/bigquery-bigframes` (Apache-2.0 · security: verified · sha256:82652ebb94aebdc1): Generates Python code using BigQuery DataFrames (BigFrames), the pandas/scikit-learn-style API over BigQuery. Use when writing BigFrames code or doing pandas-style dataframe/ML work against BigQuery (e.g. in a notebook). Don't use for SQL-first workflows or the google-cloud-bigquery client library, use bigquery-basics.
  - `opensensenova-sensenova-skills/sn-da-excel-workflow` (MIT · security: verified · sha256:d90eee87576f4254): Excel 数据分析多步编排器。覆盖：(1) 读取多 Sheet Excel 文件并统计行数，(2) 大文件检测（≥10k 行自动 Parquet 优化），(3) 数据清洗（缺失值、文本标准化、无效字符），(4) 条件筛选与分类提取，(5) 跨 Sheet 统计聚合，(6) 导出 Excel/CSV 并提供下载链接。覆盖从数据读取到报告生成全流程，按步骤编排 capability 子 skill。**遇到以下任一情况就主动使用本 skill，不要自行写几行 pandas 就回答**：①用户出现触发词：Excel 分析 / 表格分析 / 数据分析 / 数据清洗 / 数据统计 / 数据筛选 / 数据可视化 / 数据导出 / 汇总统计 / 透视表 / 分组统计 / 交叉分析 / 趋势分析 / 对比分析 / 异常值检测 / 去重 / 缺失值处理 / Excel 报告 / 生成报表 / analyze Excel / data analysis / data cleaning / pivot table；②用户上传或指定了 .xlsx / .xls / .csv 文件并要求分析、清洗、统计或可视化；③任务涉及多 Sheet 读取、条件筛选、分类汇总、图表生成中的任意一项；④用户要求导出带格式的 Excel 报告或下载链接。仅不用于：不涉及表格数据的纯文本处理、图片分析（使用 sn-da-image-caption）、单个公式计算的简单问答。
  - `opensensenova-sensenova-skills/sn-da-excel-workflow/capability/excel-data-cleaning/outlier-detection` (MIT · security: verified · sha256:7a11b84f6dfa74cb): 执行全面的异常值检测与数据质量评估，利用 IQR 方法识别异常值并结合偏度、峰度分析数据分布特征，适用于非正态分布数据的预处理阶段。
  - `opensensenova-sensenova-skills/sn-da-non-spreadsheet-analysis/capability/pdf-analysis` (MIT · security: verified · sha256:869af7d4a303b0d1): PDF 文档解析。自动区分文字型 PDF 与扫描型 PDF，覆盖：文本/表格提取、多页全量扫描、嵌入图表 caption、单位感知数值计算。
  - `opensensenova-sensenova-skills/sn-ppt-standard` (MIT · security: verified · sha256:7824f039dae5950c): 仅在 `sn-ppt-entry` 与 `sn-ppt-story` 已准备绝对 `DECK_DIR` 和 `outline.md` 后使用；生成每页独立 HTML（1600×900）、渲染 PNG、逐页讲稿、`present.html`，并按 `static_postprocess` 选择生成由 Standard 自有 exporter 转换的 PPTX。**`present.html` 始终是必交付产物，缺失即技术故障，不得交付；`static_postprocess` 含 `pptx` 时 PPTX 同为必交付产物（缺一即技术故障），且只能由 Standard 自有 exporter 生成；仅当用户明确要求只要 HTML（`static_postprocess` 为 `[]`）时，PPTX 才可不交付。**
  - `marketingskills/analytics` (MIT · security: verified · sha256:ad9066bedf1f2410): When the user wants to set up, improve, or audit analytics tracking and measurement. Also use when the user mentions "set up tracking," "GA4," "Google Analytics," "event tracking," "UTM parameters," "tag manager," "GTM," "analytics implementation," "tracking plan," "how do I measure this," "Mixpanel," "Segment," "are my events firing," or "analytics isn't working." Use this whenever someone asks how to know if something is working or wants to measure marketing results. For getting conversions into ad platforms (pixels, conversion tags, CAPI, server-side) and verifying they arrived, see conversion-tracking. For choosing attribution models, comparing multi-touch/MMM/incrementality, or reconciling conflicting numbers across tools, see attribution. For A/B test measurement, see ab-testing. Rate metrics divide matching closed windows, never full-period spend by partial-period results.
  - `marketingskills/ab-testing` (MIT · security: verified · sha256:aacf9ccafdacba12): When the user wants to plan, design, or implement an A/B test or experiment, or build a growth experimentation program. Also use when the user mentions "A/B test," "split test," "experiment," "test this change," "variant copy," "multivariate test," "hypothesis," "should I test this," "which version is better," "test two versions," "statistical significance," "how long should I run this test," "growth experiments," "experiment velocity," "experiment backlog," "ICE score," "experimentation program," or "experiment playbook." Use this whenever someone is comparing two approaches and wants to measure which performs better, or when they want to build a systematic experimentation practice. For tracking implementation, see analytics. For page-level conversion optimization, see cro.
  - `addyosmani/context-engineering` (MIT · security: verified · sha256:85869b4b94cae3ab): Optimizes agent context setup. Use when starting a new session, when agent output quality degrades, when switching between tasks, or when you need to configure rules files and context for a project.
  - `mattpocock/engineering/research` (MIT · security: verified · sha256:28c32e6718b66d7c): Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - `rules/python/coding-style.md`

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/researcher.md`
  - `agents/planner.md`
  - `agents/doc-writer.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
```

---

## Option B: Enterprise Setup Prompt

Copy and paste for team/organization standardization and strict security governance:

```markdown
# Aidentity Setup Prompt: Data analyst (Enterprise)

Set up my AI agent environment for the **Data analyst** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup data-analyst --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Data analyst (16)
Install with `npx aidentity add <id> --agent claude`:
  - `supabase/supabase-postgres-best-practices` (MIT · security: verified · sha256:35e9f904d60459a3): Postgres best practices maintained by Supabase, for Postgres running anywhere. Load this skill BEFORE writing or changing anything that lives in a Postgres database: creating or altering tables and columns (including choosing column types), schema design, migrations and declarative schema files, RLS policies and the tests that verify them, indexes, triggers, database functions, queues and scheduled jobs (pg_cron, pgmq), vector/semantic search (pgvector), and restoring dumps (pg_restore) or importing data. Also load it when diagnosing slow queries, high CPU, timeouts, EXPLAIN plans, connection exhaustion, locking, bloat, or rows visible to the wrong user or tenant. This is not just a performance guide, schema, migration, security, and SQL authoring tasks need these rules too, even for a one-column change or a single query.
  - `google-cloud/cloud/bigquery-ai-ml` (Apache-2.0 · security: verified · sha256:9d9e5c8c6a7b0e00): Leverages BigQuery's built-in machine learning and GenAI capabilities for advanced data analytics. Use when you need to write SQL queries that perform time-series forecasting, predict values, detect outliers or anomalies, find key drivers, perform semantic search or vector search, classify text, calculate similarity, summarize content, translate language, evaluate models, filter by semantic conditions, or leverage generative AI capabilities in BigQuery. Do not use for general BigQuery dataset, table, or job management requests.
  - `google-cloud/cloud/bigquery-basics` (Apache-2.0 · security: verified · sha256:e959e2985913a329): Manages datasets, tables, and jobs in BigQuery. Use when you need to interact with BigQuery, run SQL queries, manage BigQuery resources (datasets, tables, views), or perform basic data ingestion and analysis.
  - `google-cloud/cloud/bigquery-bigframes` (Apache-2.0 · security: verified · sha256:82652ebb94aebdc1): Generates Python code using BigQuery DataFrames (BigFrames), the pandas/scikit-learn-style API over BigQuery. Use when writing BigFrames code or doing pandas-style dataframe/ML work against BigQuery (e.g. in a notebook). Don't use for SQL-first workflows or the google-cloud-bigquery client library, use bigquery-basics.
  - `opensensenova-sensenova-skills/sn-da-excel-workflow` (MIT · security: verified · sha256:d90eee87576f4254): Excel 数据分析多步编排器。覆盖：(1) 读取多 Sheet Excel 文件并统计行数，(2) 大文件检测（≥10k 行自动 Parquet 优化），(3) 数据清洗（缺失值、文本标准化、无效字符），(4) 条件筛选与分类提取，(5) 跨 Sheet 统计聚合，(6) 导出 Excel/CSV 并提供下载链接。覆盖从数据读取到报告生成全流程，按步骤编排 capability 子 skill。**遇到以下任一情况就主动使用本 skill，不要自行写几行 pandas 就回答**：①用户出现触发词：Excel 分析 / 表格分析 / 数据分析 / 数据清洗 / 数据统计 / 数据筛选 / 数据可视化 / 数据导出 / 汇总统计 / 透视表 / 分组统计 / 交叉分析 / 趋势分析 / 对比分析 / 异常值检测 / 去重 / 缺失值处理 / Excel 报告 / 生成报表 / analyze Excel / data analysis / data cleaning / pivot table；②用户上传或指定了 .xlsx / .xls / .csv 文件并要求分析、清洗、统计或可视化；③任务涉及多 Sheet 读取、条件筛选、分类汇总、图表生成中的任意一项；④用户要求导出带格式的 Excel 报告或下载链接。仅不用于：不涉及表格数据的纯文本处理、图片分析（使用 sn-da-image-caption）、单个公式计算的简单问答。
  - `opensensenova-sensenova-skills/sn-da-excel-workflow/capability/excel-data-cleaning/outlier-detection` (MIT · security: verified · sha256:7a11b84f6dfa74cb): 执行全面的异常值检测与数据质量评估，利用 IQR 方法识别异常值并结合偏度、峰度分析数据分布特征，适用于非正态分布数据的预处理阶段。
  - `opensensenova-sensenova-skills/sn-da-non-spreadsheet-analysis/capability/pdf-analysis` (MIT · security: verified · sha256:869af7d4a303b0d1): PDF 文档解析。自动区分文字型 PDF 与扫描型 PDF，覆盖：文本/表格提取、多页全量扫描、嵌入图表 caption、单位感知数值计算。
  - `opensensenova-sensenova-skills/sn-ppt-standard` (MIT · security: verified · sha256:7824f039dae5950c): 仅在 `sn-ppt-entry` 与 `sn-ppt-story` 已准备绝对 `DECK_DIR` 和 `outline.md` 后使用；生成每页独立 HTML（1600×900）、渲染 PNG、逐页讲稿、`present.html`，并按 `static_postprocess` 选择生成由 Standard 自有 exporter 转换的 PPTX。**`present.html` 始终是必交付产物，缺失即技术故障，不得交付；`static_postprocess` 含 `pptx` 时 PPTX 同为必交付产物（缺一即技术故障），且只能由 Standard 自有 exporter 生成；仅当用户明确要求只要 HTML（`static_postprocess` 为 `[]`）时，PPTX 才可不交付。**
  - `marketingskills/analytics` (MIT · security: verified · sha256:ad9066bedf1f2410): When the user wants to set up, improve, or audit analytics tracking and measurement. Also use when the user mentions "set up tracking," "GA4," "Google Analytics," "event tracking," "UTM parameters," "tag manager," "GTM," "analytics implementation," "tracking plan," "how do I measure this," "Mixpanel," "Segment," "are my events firing," or "analytics isn't working." Use this whenever someone asks how to know if something is working or wants to measure marketing results. For getting conversions into ad platforms (pixels, conversion tags, CAPI, server-side) and verifying they arrived, see conversion-tracking. For choosing attribution models, comparing multi-touch/MMM/incrementality, or reconciling conflicting numbers across tools, see attribution. For A/B test measurement, see ab-testing. Rate metrics divide matching closed windows, never full-period spend by partial-period results.
  - `marketingskills/ab-testing` (MIT · security: verified · sha256:aacf9ccafdacba12): When the user wants to plan, design, or implement an A/B test or experiment, or build a growth experimentation program. Also use when the user mentions "A/B test," "split test," "experiment," "test this change," "variant copy," "multivariate test," "hypothesis," "should I test this," "which version is better," "test two versions," "statistical significance," "how long should I run this test," "growth experiments," "experiment velocity," "experiment backlog," "ICE score," "experimentation program," or "experiment playbook." Use this whenever someone is comparing two approaches and wants to measure which performs better, or when they want to build a systematic experimentation practice. For tracking implementation, see analytics. For page-level conversion optimization, see cro.
  - `addyosmani/context-engineering` (MIT · security: verified · sha256:85869b4b94cae3ab): Optimizes agent context setup. Use when starting a new session, when agent output quality degrades, when switching between tasks, or when you need to configure rules files and context for a project.
  - `mattpocock/engineering/research` (MIT · security: verified · sha256:28c32e6718b66d7c): Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - `rules/python/coding-style.md`

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/researcher.md`
  - `agents/planner.md`
  - `agents/doc-writer.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
