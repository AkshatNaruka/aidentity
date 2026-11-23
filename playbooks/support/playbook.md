---
type: Playbook
title: "Customer support AI Agent Setup Playbook (Individual & Enterprise)"
description: "Tickets, escalation, help-centre content and customer research. Verified skills, rules, subagents, and safety hooks for Claude Code, Cursor, Codex, and Gemini CLI."
resource: https://akshatnaruka.github.io/aidentity/playbooks/support/
tags: [support, support, docs, research, playbook, agent-setup]
timestamp: 2026-11-23
---

# Customer support AI Agent Setup Playbook (Individual & Enterprise)

**Definition:** The **Customer support AI Agent Playbook** configures any coding agent (Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or GitHub Copilot) for tickets, escalation, help-centre content and customer research. It installs 10 SHA-256 security-verified skills in the Individual profile and 14 skills plus 4 runtime guardrails in the Enterprise profile.

## Quick Commands

```bash
# Individual setup (10 verified skills)
npx aidentity setup support --profile individual

# Enterprise setup (14 verified skills + supply-chain & security hooks)
npx aidentity setup support --profile enterprise
```

## Individual vs. Enterprise Comparison

| Component | Individual Profile | Enterprise Profile |
|---|---|---|
| Verified Skills | 10 core skills | 14 skills (+4 security/audit skills) |
| Coding Rules | 0 rule files | 0 rule files |
| Subagents | 3 subagents | 4 subagents |
| Slash Commands | 1 commands | 2 commands |
| Safety Hooks | hooks/scan-secrets.js, hooks/block-dangerous.js | hooks/scan-secrets.js, hooks/block-dangerous.js, hooks/format-on-save.js, hooks/test-on-stop.js |

## Verified Skills Included

- **documentation-and-adrs** (`addyosmani/documentation-and-adrs`, MIT, SHA-256 ``): Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
- **debugging-and-error-recovery** (`addyosmani/debugging-and-error-recovery`, MIT, SHA-256 ``): Guides systematic root-cause debugging. Use when tests fail, builds break, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need a systematic approach to finding and fixing the root cause rather than guessing.
- **teach** (`mattpocock/productivity/teach`, MIT, SHA-256 ``): Teach the user a new skill or concept, within this workspace.
- **systematic-debugging** (`obra-superpowers/systematic-debugging`, MIT, SHA-256 ``): Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
- **sm-impediment-log** (`abrahamferga-scrum-skills/sm-impediment-log`, MIT, SHA-256 ``): Helps a Scrum Master capture, track, and resolve impediments raised during Daily Scrums or Sprint events — logging them as ADO work items, assigning owners, setting target resolution dates, and surfacing overdue or recurring blockers. Use when a Scrum Master says things like "log an impediment", "track this blocker", "what are our open impediments", "any blockers from standup", "review our impediment backlog", "this needs escalating", or "what's blocking the team". Do not use for sprint planning, retrospectives, or general task tracking.
- **customer-research** (`marketingskills/customer-research`, MIT, SHA-256 ``): When the user wants to conduct, analyze, or synthesize customer research. Use when the user mentions "customer research," "ICP research," "talk to customers," "analyze transcripts," "customer interviews," "survey analysis," "support ticket analysis," "voice of customer," "VOC," "build personas," "customer personas," "jobs to be done," "JTBD," "what do customers say," "what are customers struggling with," "Reddit mining," "G2 reviews," "review mining," "digital watering holes," "community research," "forum research," "competitor reviews," "customer sentiment," "PMF survey," "product/market fit survey," "customer interview questions," "interview outreach," "Sales Safari," or "find out why customers churn/convert/buy." Use for analyzing existing research assets, mining online sources, AND running primary research (interviews and surveys). For writing copy informed by research, see copywriting. For acting on research to improve pages, see cro.
- **churn-prevention** (`marketingskills/churn-prevention`, MIT, SHA-256 ``): When the user wants to reduce churn, build cancellation flows, set up save offers, recover failed payments, or implement retention strategies. Also use when the user mentions 'churn,' 'cancel flow,' 'offboarding,' 'save offer,' 'dunning,' 'failed payment recovery,' 'win-back,' 'retention,' 'exit survey,' 'pause subscription,' 'involuntary churn,' 'people keep canceling,' 'churn rate is too high,' 'how do I keep users,' or 'customers are leaving.' Use this whenever someone is losing subscribers or wants to build systems to prevent it. For post-cancel win-back email sequences, see emails. For in-app upgrade paywalls, see paywalls.
- **onboarding** (`marketingskills/onboarding`, MIT, SHA-256 ``): When the user wants to optimize post-signup onboarding, user activation, first-run experience, or time-to-value. Also use when the user mentions "onboarding flow," "activation rate," "user activation," "first-run experience," "empty states," "onboarding checklist," "aha moment," "new user experience," "users aren't activating," "nobody completes setup," "low activation rate," "users sign up but don't use the product," "time to value," or "first session experience." Use this whenever users are signing up but not sticking around. For signup/registration optimization, see signup. For ongoing email sequences, see emails.
- **emails** (`marketingskills/emails`, MIT, SHA-256 ``): When the user wants to create or optimize an email sequence, drip campaign, automated email flow, or lifecycle email program. Also use when the user mentions "email sequence," "drip campaign," "nurture sequence," "onboarding emails," "welcome sequence," "re-engagement emails," "email automation," "lifecycle emails," "trigger-based emails," "email funnel," "email workflow," "what emails should I send," "welcome series," or "email cadence." Use this for any multi-email automated flow. Emails avoid AI tells like 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and fake 'Re:' subject lines. For cold outreach and outbound sequences, see cold-email. For in-app onboarding, see onboarding.
- **copy-editing** (`marketingskills/copy-editing`, MIT, SHA-256 ``): When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content. Also use when the user mentions 'edit this copy,' 'review my copy,' 'copy feedback,' 'proofread,' 'polish this,' 'make this better,' 'copy sweep,' 'tighten this up,' 'this reads awkwardly,' 'clean up this text,' 'too wordy,' 'sharpen the messaging,' 'refresh this content,' 'update this page,' 'this content is outdated,' or 'content audit,' 'this sounds like AI,' 'AI slop,' 'de-slop this,' or 'make it sound human.' Use this when the user already has copy and wants it improved or refreshed rather than rewritten from scratch. Every edit removes AI tells such as 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and sentences that trail into extra comma clauses. A request to fix one line gets a point edit that changes only that line. For writing new copy, see copywriting.
- **security-and-hardening** (`addyosmani/security-and-hardening`, MIT, SHA-256 ``): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
- **supply-chain-risk-auditor** (`trailofbits/supply-chain-risk-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
- **agentic-actions-auditor** (`trailofbits/agentic-actions-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
- **code-review-and-quality** (`addyosmani/code-review-and-quality`, MIT, SHA-256 ``): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## One-Shot Individual Setup Prompt

```markdown
# Aidentity Setup Prompt: Customer support (Individual)

Set up my AI agent environment for the **Customer support** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup support --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Customer support (10)
Install with `npx aidentity add <id> --agent claude`:
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563): Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `addyosmani/debugging-and-error-recovery` (MIT · security: verified · sha256:d2350b0791fe4f70): Guides systematic root-cause debugging. Use when tests fail, builds break, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need a systematic approach to finding and fixing the root cause rather than guessing.
  - `mattpocock/productivity/teach` (MIT · security: verified · sha256:f9b00801b02b5059): Teach the user a new skill or concept, within this workspace.
  - `obra-superpowers/systematic-debugging` (MIT · security: verified · sha256:1845e2e29a540bd8): Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
  - `abrahamferga-scrum-skills/sm-impediment-log` (MIT · security: verified · sha256:b66d631d29590e5f): Helps a Scrum Master capture, track, and resolve impediments raised during Daily Scrums or Sprint events, logging them as ADO work items, assigning owners, setting target resolution dates, and surfacing overdue or recurring blockers. Use when a Scrum Master says things like "log an impediment", "track this blocker", "what are our open impediments", "any blockers from standup", "review our impediment backlog", "this needs escalating", or "what's blocking the team". Do not use for sprint planning, retrospectives, or general task tracking.
  - `marketingskills/customer-research` (MIT · security: verified · sha256:c01405dbee822ce6): When the user wants to conduct, analyze, or synthesize customer research. Use when the user mentions "customer research," "ICP research," "talk to customers," "analyze transcripts," "customer interviews," "survey analysis," "support ticket analysis," "voice of customer," "VOC," "build personas," "customer personas," "jobs to be done," "JTBD," "what do customers say," "what are customers struggling with," "Reddit mining," "G2 reviews," "review mining," "digital watering holes," "community research," "forum research," "competitor reviews," "customer sentiment," "PMF survey," "product/market fit survey," "customer interview questions," "interview outreach," "Sales Safari," or "find out why customers churn/convert/buy." Use for analyzing existing research assets, mining online sources, AND running primary research (interviews and surveys). For writing copy informed by research, see copywriting. For acting on research to improve pages, see cro.
  - `marketingskills/churn-prevention` (MIT · security: verified · sha256:e216546777115a45): When the user wants to reduce churn, build cancellation flows, set up save offers, recover failed payments, or implement retention strategies. Also use when the user mentions 'churn,' 'cancel flow,' 'offboarding,' 'save offer,' 'dunning,' 'failed payment recovery,' 'win-back,' 'retention,' 'exit survey,' 'pause subscription,' 'involuntary churn,' 'people keep canceling,' 'churn rate is too high,' 'how do I keep users,' or 'customers are leaving.' Use this whenever someone is losing subscribers or wants to build systems to prevent it. For post-cancel win-back email sequences, see emails. For in-app upgrade paywalls, see paywalls.
  - `marketingskills/onboarding` (MIT · security: verified · sha256:d1e68d547c89e4a5): When the user wants to optimize post-signup onboarding, user activation, first-run experience, or time-to-value. Also use when the user mentions "onboarding flow," "activation rate," "user activation," "first-run experience," "empty states," "onboarding checklist," "aha moment," "new user experience," "users aren't activating," "nobody completes setup," "low activation rate," "users sign up but don't use the product," "time to value," or "first session experience." Use this whenever users are signing up but not sticking around. For signup/registration optimization, see signup. For ongoing email sequences, see emails.
  - `marketingskills/emails` (MIT · security: verified · sha256:461ca28897cb9857): When the user wants to create or optimize an email sequence, drip campaign, automated email flow, or lifecycle email program. Also use when the user mentions "email sequence," "drip campaign," "nurture sequence," "onboarding emails," "welcome sequence," "re-engagement emails," "email automation," "lifecycle emails," "trigger-based emails," "email funnel," "email workflow," "what emails should I send," "welcome series," or "email cadence." Use this for any multi-email automated flow. Emails avoid AI tells like 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and fake 'Re:' subject lines. For cold outreach and outbound sequences, see cold-email. For in-app onboarding, see onboarding.
  - `marketingskills/copy-editing` (MIT · security: verified · sha256:83387887149f333d): When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content. Also use when the user mentions 'edit this copy,' 'review my copy,' 'copy feedback,' 'proofread,' 'polish this,' 'make this better,' 'copy sweep,' 'tighten this up,' 'this reads awkwardly,' 'clean up this text,' 'too wordy,' 'sharpen the messaging,' 'refresh this content,' 'update this page,' 'this content is outdated,' or 'content audit,' 'this sounds like AI,' 'AI slop,' 'de-slop this,' or 'make it sound human.' Use this when the user already has copy and wants it improved or refreshed rather than rewritten from scratch. Every edit removes AI tells such as 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and sentences that trail into extra comma clauses. A request to fix one line gets a point edit that changes only that line. For writing new copy, see copywriting.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/doc-writer.md`
  - `agents/debugger.md`
  - `agents/researcher.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
```

## One-Shot Enterprise Setup Prompt

```markdown
# Aidentity Setup Prompt: Customer support (Enterprise)

Set up my AI agent environment for the **Customer support** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup support --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Customer support (14)
Install with `npx aidentity add <id> --agent claude`:
  - `addyosmani/documentation-and-adrs` (MIT · security: verified · sha256:d28719e2becc8563): Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
  - `addyosmani/debugging-and-error-recovery` (MIT · security: verified · sha256:d2350b0791fe4f70): Guides systematic root-cause debugging. Use when tests fail, builds break, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need a systematic approach to finding and fixing the root cause rather than guessing.
  - `mattpocock/productivity/teach` (MIT · security: verified · sha256:f9b00801b02b5059): Teach the user a new skill or concept, within this workspace.
  - `obra-superpowers/systematic-debugging` (MIT · security: verified · sha256:1845e2e29a540bd8): Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
  - `abrahamferga-scrum-skills/sm-impediment-log` (MIT · security: verified · sha256:b66d631d29590e5f): Helps a Scrum Master capture, track, and resolve impediments raised during Daily Scrums or Sprint events, logging them as ADO work items, assigning owners, setting target resolution dates, and surfacing overdue or recurring blockers. Use when a Scrum Master says things like "log an impediment", "track this blocker", "what are our open impediments", "any blockers from standup", "review our impediment backlog", "this needs escalating", or "what's blocking the team". Do not use for sprint planning, retrospectives, or general task tracking.
  - `marketingskills/customer-research` (MIT · security: verified · sha256:c01405dbee822ce6): When the user wants to conduct, analyze, or synthesize customer research. Use when the user mentions "customer research," "ICP research," "talk to customers," "analyze transcripts," "customer interviews," "survey analysis," "support ticket analysis," "voice of customer," "VOC," "build personas," "customer personas," "jobs to be done," "JTBD," "what do customers say," "what are customers struggling with," "Reddit mining," "G2 reviews," "review mining," "digital watering holes," "community research," "forum research," "competitor reviews," "customer sentiment," "PMF survey," "product/market fit survey," "customer interview questions," "interview outreach," "Sales Safari," or "find out why customers churn/convert/buy." Use for analyzing existing research assets, mining online sources, AND running primary research (interviews and surveys). For writing copy informed by research, see copywriting. For acting on research to improve pages, see cro.
  - `marketingskills/churn-prevention` (MIT · security: verified · sha256:e216546777115a45): When the user wants to reduce churn, build cancellation flows, set up save offers, recover failed payments, or implement retention strategies. Also use when the user mentions 'churn,' 'cancel flow,' 'offboarding,' 'save offer,' 'dunning,' 'failed payment recovery,' 'win-back,' 'retention,' 'exit survey,' 'pause subscription,' 'involuntary churn,' 'people keep canceling,' 'churn rate is too high,' 'how do I keep users,' or 'customers are leaving.' Use this whenever someone is losing subscribers or wants to build systems to prevent it. For post-cancel win-back email sequences, see emails. For in-app upgrade paywalls, see paywalls.
  - `marketingskills/onboarding` (MIT · security: verified · sha256:d1e68d547c89e4a5): When the user wants to optimize post-signup onboarding, user activation, first-run experience, or time-to-value. Also use when the user mentions "onboarding flow," "activation rate," "user activation," "first-run experience," "empty states," "onboarding checklist," "aha moment," "new user experience," "users aren't activating," "nobody completes setup," "low activation rate," "users sign up but don't use the product," "time to value," or "first session experience." Use this whenever users are signing up but not sticking around. For signup/registration optimization, see signup. For ongoing email sequences, see emails.
  - `marketingskills/emails` (MIT · security: verified · sha256:461ca28897cb9857): When the user wants to create or optimize an email sequence, drip campaign, automated email flow, or lifecycle email program. Also use when the user mentions "email sequence," "drip campaign," "nurture sequence," "onboarding emails," "welcome sequence," "re-engagement emails," "email automation," "lifecycle emails," "trigger-based emails," "email funnel," "email workflow," "what emails should I send," "welcome series," or "email cadence." Use this for any multi-email automated flow. Emails avoid AI tells like 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and fake 'Re:' subject lines. For cold outreach and outbound sequences, see cold-email. For in-app onboarding, see onboarding.
  - `marketingskills/copy-editing` (MIT · security: verified · sha256:83387887149f333d): When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content. Also use when the user mentions 'edit this copy,' 'review my copy,' 'copy feedback,' 'proofread,' 'polish this,' 'make this better,' 'copy sweep,' 'tighten this up,' 'this reads awkwardly,' 'clean up this text,' 'too wordy,' 'sharpen the messaging,' 'refresh this content,' 'update this page,' 'this content is outdated,' or 'content audit,' 'this sounds like AI,' 'AI slop,' 'de-slop this,' or 'make it sound human.' Use this when the user already has copy and wants it improved or refreshed rather than rewritten from scratch. Every edit removes AI tells such as 'it's not X, it's Y' reveals, 'no X, no Y, no Z' lists, and sentences that trail into extra comma clauses. A request to fix one line gets a point edit that changes only that line. For writing new copy, see copywriting.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/doc-writer.md`
  - `agents/debugger.md`
  - `agents/researcher.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
