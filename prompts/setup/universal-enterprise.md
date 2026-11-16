---
id: prompt/setup-enterprise
name: Universal Enterprise Setup Prompt
description: One-shot enterprise onboarding prompt with mandatory SHA-256 skill security verification, supply-chain audit skills, secret/command guardrails, and team governance rules.
category: setup
tags: setup, onboarding, enterprise, security, governance, role
---

# Universal Enterprise Setup Prompt

Copy and paste this prompt into your organization's coding agent or include it in your team onboarding guide:

```markdown
Set up this workspace with Aidentity (Enterprise Governance Profile).

1. Read https://akshatnaruka.github.io/aidentity/roles.json and https://akshatnaruka.github.io/aidentity/security.json (or local roles/roles.json and registry/security.json).
2. Identify the role for this user or repository (e.g. software-engineer, architect, engineering-manager, product-manager, data-analyst, security-review).
3. Run the enterprise setup command:
   npx aidentity setup <role-slug> --profile enterprise
4. Enforce Enterprise Security & Compliance Gate:
   - Reject any skill where verified !== true, risk_level !== "safe", status !== "stable", or distributable !== true.
   - Verify license compliance: allow MIT, Apache-2.0, BSD, CC0; flag CC-BY-SA-4.0 for share-alike review; never install LicenseRef-Proprietary entries.
   - Ensure enterprise security skills are installed:
     * addyosmani/security-and-hardening
     * trailofbits/supply-chain-risk-auditor
     * trailofbits/agentic-actions-auditor
     * addyosmani/code-review-and-quality
   - Enable all 4 lifecycle guardrail hooks:
     * hooks/block-dangerous.js (blocks destructive shell commands)
     * hooks/scan-secrets.js (blocks hardcoded API keys, tokens, and private keys)
     * hooks/format-on-save.js (enforces code formatting on edit)
     * hooks/test-on-stop.js (requires tests to pass before completion)
   - Install the scoped security-auditor and reviewer subagents (agents/security-auditor.md, agents/reviewer.md).
```
