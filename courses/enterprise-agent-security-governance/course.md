---
type: Course
title: "Enterprise AI Agent Security, Auditing & Supply-Chain Governance"
description: "Secure autonomous coding agents in enterprise repositories. Learn how to audit SKILL.md files for hidden Unicode and prompt injection, audit GitHub Actions, and enforce runtime pre-tool hooks."
level: "Advanced"
audience: "Security engineers, CISOs, platform teams, and enterprise architects"
resource: https://akshatnaruka.github.io/aidentity/courses/enterprise-agent-security-governance/
timestamp: 2026-11-16
---

# Enterprise AI Agent Security, Auditing & Supply-Chain Governance

Secure autonomous coding agents in enterprise repositories. Learn how to audit SKILL.md files for hidden Unicode and prompt injection, audit GitHub Actions, and enforce runtime pre-tool hooks.

**Level:** Advanced · **Target Audience:** Security engineers, CISOs, platform teams, and enterprise architects · **Skills Included:** 8

## 1. Quick Setup Command

```bash
npx aidentity setup architect --profile individual
```

## 2. Learning Outcomes

- Scan agent skills and prompts across 7 static security gates with deterministic SHA-256 digests.
- Audit CI/CD workflows, GitHub Actions, and third-party dependencies for supply-chain and agentic risks.
- Deploy mandatory pre-tool command blockers, secret scanners, and custom Semgrep rules.

## 3. Curriculum Modules & Verified Skills

### Module 1: Threat Modeling & Audit Context Building

- **audit-context-building** (`trailofbits/audit-context-building`, undefined): Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when starting an audit, threat model, or architecture review on unfamiliar code, and before any vulnerability-hunting pass.
- **code-maturity-assessor** (`trailofbits/code-maturity-assessor`, undefined): Systematic code maturity assessment using Trail of Bits' 9-category framework. Analyzes codebase for arithmetic safety, auditing practices, access controls, complexity, decentralization, documentation, MEV risks, low-level code, and testing, then produces a scorecard with evidence-based ratings and a priority-ordered roadmap. Use when assessing or scoring the maturity of a smart contract or blockchain codebase, producing a maturity scorecard or evaluation, or judging how mature, well-tested, or well-documented such a project is against a rubric.
- **security-and-hardening** (`addyosmani/security-and-hardening`, undefined): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.

### Module 2: Supply-Chain & Agentic Actions Auditing

- **supply-chain-risk-auditor** (`trailofbits/supply-chain-risk-auditor`, undefined): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
- **agentic-actions-auditor** (`trailofbits/agentic-actions-auditor`, undefined): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
- **second-opinion** (`trailofbits/second-opinion`, undefined): Gets independent code reviews from Codex or Antigravity for uncommitted changes, branch diffs, and commits. Use when the user requests an external review, a second opinion on code, a codex review, a gemini review, an antigravity review, or /second-opinion.

### Module 3: Custom Detection Rules & Quality Gates

- **semgrep-rule-creator** (`trailofbits/semgrep-rule-creator`, undefined): Creates custom Semgrep rules for detecting security vulnerabilities, bug patterns, and code patterns. Use when writing Semgrep rules or building custom static analysis detections.
- **code-review-and-quality** (`addyosmani/code-review-and-quality`, undefined): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Matching Role Playbook

Read the full role blueprint at: https://akshatnaruka.github.io/aidentity/playbooks/architect/
