---
id: prompt/setup-individual
name: Universal Individual Setup Prompt
description: One-shot prompt to interview an individual user, detect their role and stack, verify skill security, and install skills, rules, subagents, and hooks.
category: setup
tags: setup, onboarding, individual, role, security
---

# Universal Individual Setup Prompt

Copy and paste this prompt into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

```markdown
Set up my AI agent environment using Aidentity (Individual Profile).

1. Read https://akshatnaruka.github.io/aidentity/llms.txt and https://akshatnaruka.github.io/aidentity/roles.json (or local roles/roles.json).
2. Ask me:
   - What is my primary role or job? (e.g. Software Engineer, Architect, Product Manager, Designer, Marketer, Finance Analyst, Quant, Data Analyst, Legal, Sales, Support, Teacher, HR, Creator, Filmmaker, Music Producer, Journalist)
   - What tech stack or tools am I using in this workspace?
3. If you have shell access, run:
   npx aidentity setup <role-slug> --profile individual
4. If installing manually or recommending additional task skills:
   - Fetch https://akshatnaruka.github.io/aidentity/security.json (or local registry/security.json).
   - Verify every skill has verified: true, risk_level: "safe", status: "stable", and distributable: true.
   - Tell me the upstream author, SPDX license, and SHA-256 verification status before installing.
   - Install approved skills with: npx aidentity add <id>
   - Configure language rules (rules/) and baseline safety hooks (hooks/block-dangerous.js, hooks/scan-secrets.js).
```
