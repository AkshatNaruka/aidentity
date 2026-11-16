---
type: Playbook
title: "Product designer AI Agent Setup Playbook (Individual & Enterprise)"
description: "UI direction, design systems, frontend implementation, accessibility. Verified skills, rules, subagents, and safety hooks for Claude Code, Cursor, Codex, and Gemini CLI."
resource: https://akshatnaruka.github.io/aidentity/playbooks/designer/
tags: [designer, design, frontend, motion, playbook, agent-setup]
timestamp: 2026-11-16
---

# Product designer AI Agent Setup Playbook (Individual & Enterprise)

**Definition:** The **Product designer AI Agent Playbook** configures any coding agent (Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or GitHub Copilot) for ui direction, design systems, frontend implementation, accessibility. It installs 8 SHA-256 security-verified skills in the Individual profile and 12 skills plus 4 runtime guardrails in the Enterprise profile.

## Quick Commands

```bash
# Individual setup (8 verified skills)
npx aidentity setup designer --profile individual

# Enterprise setup (12 verified skills + supply-chain & security hooks)
npx aidentity setup designer --profile enterprise
```

## Individual vs. Enterprise Comparison

| Component | Individual Profile | Enterprise Profile |
|---|---|---|
| Verified Skills | 8 core skills | 12 skills (+4 security/audit skills) |
| Coding Rules | 2 rule files | 2 rule files |
| Subagents | 2 subagents | 3 subagents |
| Slash Commands | 2 commands | 2 commands |
| Safety Hooks | hooks/format-on-save.js, hooks/scan-secrets.js, hooks/block-dangerous.js | hooks/format-on-save.js, hooks/scan-secrets.js, hooks/block-dangerous.js, hooks/test-on-stop.js |

## Verified Skills Included

- **ui-ux-pro-max** (`ui-ux-pro-max/ui-ux-pro-max`, MIT, SHA-256 ``): UI/UX design intelligence for web, mobile, and desktop. This skill should be used when designing, building, reviewing, or fixing interfaces, including pages, components, design systems, accessibility, interaction, responsive layout, typography, color, charts, and stack-specific UI implementation. Searchable local data: 79 searchable styles (50 active), 192 product palettes and reasoning profiles, 74 font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types, and 22 stacks.
- **design-system** (`ui-ux-pro-max/design-system`, MIT, SHA-256 ``): Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs, strategic slide creation. Use for design tokens, systematic design, brand-compliant presentations.
- **brand** (`ui-ux-pro-max/brand`, MIT, SHA-256 ``): Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.
- **tastemaker** (`tastemaker/tastemaker`, MIT, SHA-256 ``): Generate genuinely beautiful, on-brand UI instead of generic "AI slop" — use whenever the user asks to build, design, style, or improve a UI, landing page, dashboard, app screen, or component, whenever a PRD/spec needs a design pass before implementation, whenever the user pastes reference images/Pinterest/Dribbble links and wants the app to look like them, or whenever the user complains the AI-generated UI looks generic, boring, cookie-cutter, or "like every other AI app." Make sure to trigger this even if the user doesn't say "design" explicitly — phrases like "make this look good", "build the frontend for X", "this looks like every other SaaS site", or "match this vibe" all qualify. Also triggers on two verbs, "study"/"extract the look of" a reference screenshot or URL, and "audit"/"review"/"why does this look AI-generated" for critiquing existing UI.
- **ideagram** (`tastemaker/ideagram`, MIT, SHA-256 ``): Turn a concept, feature description, blog post, or pitch into a single beautiful, on-brand illustration by matching it to a real unDraw illustration in a local library and recoloring it to the brand accent — genuine illustrator quality, not an AI-drawn approximation. Use whenever the user asks to "make an illustration," "create a graphic," "visualize this concept," "explain this visually," wants something "unDraw-style" or "Storyset-style," needs a hero/feature/blog illustration, or says an idea needs a picture. Trigger even if they don't name a style — "make something to explain X" or "I need a graphic for this tweet" both qualify.
- **frontend-ui-engineering** (`addyosmani/frontend-ui-engineering`, MIT, SHA-256 ``): Builds production-quality, accessible, responsive user-facing UIs. Use when building or modifying interfaces and pages, creating components, implementing layouts, meeting WCAG accessibility requirements, managing state, or when the output needs to look and feel production-quality rather than AI-generated.
- **brainstorming** (`obra-superpowers/brainstorming`, MIT, SHA-256 ``): You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
- **remotion-motion-graphics** (`haidrrrry-claude-remotion-skill/remotion-motion-graphics`, MIT, SHA-256 ``): Create and edit professional motion graphics videos with Remotion (React-based video). Use this skill EVERY time the user wants to create a video, edit a video, animate something, build an intro/outro/logo animation, make a Reel/Short/promo/launch video, add text animations or captions to footage, composite images and B-roll into a video, or mentions Remotion, motion graphics, video rendering, or "make this video look better/less generic". Also trigger when editing an existing Remotion project or when the user complains their video looks basic, generic, or amateur — this skill contains the exact fixes. Always read this skill BEFORE writing any Remotion code.
- **security-and-hardening** (`addyosmani/security-and-hardening`, MIT, SHA-256 ``): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
- **supply-chain-risk-auditor** (`trailofbits/supply-chain-risk-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
- **agentic-actions-auditor** (`trailofbits/agentic-actions-auditor`, CC-BY-SA-4.0, SHA-256 ``): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
- **code-review-and-quality** (`addyosmani/code-review-and-quality`, MIT, SHA-256 ``): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## One-Shot Individual Setup Prompt

```markdown
# Aidentity Setup Prompt — Product designer (Individual)

Set up my AI agent environment for the **Product designer** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup designer --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Product designer (8)
Install with `npx aidentity add <id> --agent claude`:
  - `ui-ux-pro-max/ui-ux-pro-max` (MIT · security: verified · sha256:bdc40690131e52d2) — UI/UX design intelligence for web, mobile, and desktop. This skill should be used when designing, building, reviewing, or fixing interfaces, including pages, components, design systems, accessibility, interaction, responsive layout, typography, color, charts, and stack-specific UI implementation. Searchable local data: 79 searchable styles (50 active), 192 product palettes and reasoning profiles, 74 font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types, and 22 stacks.
  - `ui-ux-pro-max/design-system` (MIT · security: verified · sha256:3c2259222f877e39) — Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs, strategic slide creation. Use for design tokens, systematic design, brand-compliant presentations.
  - `ui-ux-pro-max/brand` (MIT · security: verified · sha256:b3c0d4b83696367f) — Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.
  - `tastemaker/tastemaker` (MIT · security: verified · sha256:94991c63279bf31b) — Generate genuinely beautiful, on-brand UI instead of generic "AI slop" — use whenever the user asks to build, design, style, or improve a UI, landing page, dashboard, app screen, or component, whenever a PRD/spec needs a design pass before implementation, whenever the user pastes reference images/Pinterest/Dribbble links and wants the app to look like them, or whenever the user complains the AI-generated UI looks generic, boring, cookie-cutter, or "like every other AI app." Make sure to trigger this even if the user doesn't say "design" explicitly — phrases like "make this look good", "build the frontend for X", "this looks like every other SaaS site", or "match this vibe" all qualify. Also triggers on two verbs, "study"/"extract the look of" a reference screenshot or URL, and "audit"/"review"/"why does this look AI-generated" for critiquing existing UI.
  - `tastemaker/ideagram` (MIT · security: verified · sha256:0eb0ce9a4540135a) — Turn a concept, feature description, blog post, or pitch into a single beautiful, on-brand illustration by matching it to a real unDraw illustration in a local library and recoloring it to the brand accent — genuine illustrator quality, not an AI-drawn approximation. Use whenever the user asks to "make an illustration," "create a graphic," "visualize this concept," "explain this visually," wants something "unDraw-style" or "Storyset-style," needs a hero/feature/blog illustration, or says an idea needs a picture. Trigger even if they don't name a style — "make something to explain X" or "I need a graphic for this tweet" both qualify.
  - `addyosmani/frontend-ui-engineering` (MIT · security: verified · sha256:a94fd0a2b703a790) — Builds production-quality, accessible, responsive user-facing UIs. Use when building or modifying interfaces and pages, creating components, implementing layouts, meeting WCAG accessibility requirements, managing state, or when the output needs to look and feel production-quality rather than AI-generated.
  - `obra-superpowers/brainstorming` (MIT · security: verified · sha256:c8478a1bcf6ea405) — You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
  - `haidrrrry-claude-remotion-skill/remotion-motion-graphics` (MIT · security: verified · sha256:9e4a86a61f3acc92) — Create and edit professional motion graphics videos with Remotion (React-based video). Use this skill EVERY time the user wants to create a video, edit a video, animate something, build an intro/outro/logo animation, make a Reel/Short/promo/launch video, add text animations or captions to footage, composite images and B-roll into a video, or mentions Remotion, motion graphics, video rendering, or "make this video look better/less generic". Also trigger when editing an existing Remotion project or when the user complains their video looks basic, generic, or amateur — this skill contains the exact fixes. Always read this skill BEFORE writing any Remotion code.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - `rules/typescript/coding-style.md`
  - `rules/react-native/coding-style.md`

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/designer.md`
  - `agents/planner.md`
- Guardrail Hooks:
  - `hooks/format-on-save.js`
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
```

## One-Shot Enterprise Setup Prompt

```markdown
# Aidentity Setup Prompt — Product designer (Enterprise)

Set up my AI agent environment for the **Product designer** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup designer --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Product designer (12)
Install with `npx aidentity add <id> --agent claude`:
  - `ui-ux-pro-max/ui-ux-pro-max` (MIT · security: verified · sha256:bdc40690131e52d2) — UI/UX design intelligence for web, mobile, and desktop. This skill should be used when designing, building, reviewing, or fixing interfaces, including pages, components, design systems, accessibility, interaction, responsive layout, typography, color, charts, and stack-specific UI implementation. Searchable local data: 79 searchable styles (50 active), 192 product palettes and reasoning profiles, 74 font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types, and 22 stacks.
  - `ui-ux-pro-max/design-system` (MIT · security: verified · sha256:3c2259222f877e39) — Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs, strategic slide creation. Use for design tokens, systematic design, brand-compliant presentations.
  - `ui-ux-pro-max/brand` (MIT · security: verified · sha256:b3c0d4b83696367f) — Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.
  - `tastemaker/tastemaker` (MIT · security: verified · sha256:94991c63279bf31b) — Generate genuinely beautiful, on-brand UI instead of generic "AI slop" — use whenever the user asks to build, design, style, or improve a UI, landing page, dashboard, app screen, or component, whenever a PRD/spec needs a design pass before implementation, whenever the user pastes reference images/Pinterest/Dribbble links and wants the app to look like them, or whenever the user complains the AI-generated UI looks generic, boring, cookie-cutter, or "like every other AI app." Make sure to trigger this even if the user doesn't say "design" explicitly — phrases like "make this look good", "build the frontend for X", "this looks like every other SaaS site", or "match this vibe" all qualify. Also triggers on two verbs, "study"/"extract the look of" a reference screenshot or URL, and "audit"/"review"/"why does this look AI-generated" for critiquing existing UI.
  - `tastemaker/ideagram` (MIT · security: verified · sha256:0eb0ce9a4540135a) — Turn a concept, feature description, blog post, or pitch into a single beautiful, on-brand illustration by matching it to a real unDraw illustration in a local library and recoloring it to the brand accent — genuine illustrator quality, not an AI-drawn approximation. Use whenever the user asks to "make an illustration," "create a graphic," "visualize this concept," "explain this visually," wants something "unDraw-style" or "Storyset-style," needs a hero/feature/blog illustration, or says an idea needs a picture. Trigger even if they don't name a style — "make something to explain X" or "I need a graphic for this tweet" both qualify.
  - `addyosmani/frontend-ui-engineering` (MIT · security: verified · sha256:a94fd0a2b703a790) — Builds production-quality, accessible, responsive user-facing UIs. Use when building or modifying interfaces and pages, creating components, implementing layouts, meeting WCAG accessibility requirements, managing state, or when the output needs to look and feel production-quality rather than AI-generated.
  - `obra-superpowers/brainstorming` (MIT · security: verified · sha256:c8478a1bcf6ea405) — You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
  - `haidrrrry-claude-remotion-skill/remotion-motion-graphics` (MIT · security: verified · sha256:9e4a86a61f3acc92) — Create and edit professional motion graphics videos with Remotion (React-based video). Use this skill EVERY time the user wants to create a video, edit a video, animate something, build an intro/outro/logo animation, make a Reel/Short/promo/launch video, add text animations or captions to footage, composite images and B-roll into a video, or mentions Remotion, motion graphics, video rendering, or "make this video look better/less generic". Also trigger when editing an existing Remotion project or when the user complains their video looks basic, generic, or amateur — this skill contains the exact fixes. Always read this skill BEFORE writing any Remotion code.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8) — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819) — Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6) — Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e) — Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - `rules/typescript/coding-style.md`
  - `rules/react-native/coding-style.md`

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/designer.md`
  - `agents/planner.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/format-on-save.js`
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
  - `hooks/test-on-stop.js`
```
