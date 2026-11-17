---
id: prompt/setup-designer
name: Product designer Setup Prompt
description: Initial AI agent setup prompt for Product designer (Individual & Enterprise profiles) — installs verified skills, rules, subagents, commands, and security hooks.
category: setup
tags: setup, role, designer, individual, enterprise
---

# Product designer — Initial Setup Prompts

> **Role**: Product designer (`designer`)
> **Focus**: UI direction, design systems, frontend implementation, accessibility.
> **Categories**: `design`, `frontend`, `motion`
> **Security**: All 22 recommended skills are scanned and verified (`0` critical findings).

---

## Quick CLI Setup

```bash
# Individual setup (skills + rules + subagents + safety hooks)
npx aidentity setup designer --profile individual

# Enterprise setup (adds security/supply-chain audit skills + full governance hooks)
npx aidentity setup designer --profile enterprise

# Print the copy-paste prompt in terminal
npx aidentity setup designer --profile individual --prompt
```

---

## Option A: Individual Setup Prompt

Copy and paste into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

```markdown
# Aidentity Setup Prompt: Product designer (Individual)

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

## 3. Verified Skills for Product designer (18)
Install with `npx aidentity add <id> --agent claude`:
  - `google-labs-stitch/design-md` (Apache-2.0 · security: verified · sha256:e262e3de69891242): Analyze Stitch projects and synthesize a semantic design system into DESIGN.md files
  - `ui-ux-pro-max/ui-ux-pro-max` (MIT · security: verified · sha256:bdc40690131e52d2): UI/UX design intelligence for web, mobile, and desktop. This skill should be used when designing, building, reviewing, or fixing interfaces, including pages, components, design systems, accessibility, interaction, responsive layout, typography, color, charts, and stack-specific UI implementation. Searchable local data: 79 searchable styles (50 active), 192 product palettes and reasoning profiles, 74 font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types, and 22 stacks.
  - `ui-ux-pro-max/design-system` (MIT · security: verified · sha256:3c2259222f877e39): Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs, strategic slide creation. Use for design tokens, systematic design, brand-compliant presentations.
  - `ui-ux-pro-max/design` (MIT · security: verified · sha256:84d2d5d9b94a4271): Comprehensive design skill: brand identity, design tokens, UI styling, logo generation (55 styles, Gemini, Atlas Cloud, or MuAPI AI), corporate identity program (50 deliverables, CIP mockups), HTML presentations (Chart.js), banner design (22 styles, social/ads/web/print), icon design (15 styles, SVG, Gemini 3.1 Pro), social photos (HTML→screenshot, multi-platform). Actions: design logo, create CIP, generate mockups, build slides, design banner, generate icon, create social photos, social media images, brand identity, design system. Platforms: Facebook, Twitter, LinkedIn, YouTube, Instagram, Pinterest, TikTok, Threads, Google Ads.
  - `ui-ux-pro-max/brand` (MIT · security: verified · sha256:b3c0d4b83696367f): Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.
  - `ui-ux-pro-max/slides` (MIT · security: verified · sha256:ef68e14fab0602a6): Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
  - `ui-ux-pro-max/banner-design` (MIT · security: verified · sha256:65da5350479bd904): Design banners for social media, ads, website heroes, creative assets, and print. Multiple art direction options with optional generated or supplied visuals. Actions: design, create, generate banner. Platforms: Facebook, Twitter/X, LinkedIn, YouTube, Instagram, Google Display, website hero, print. Styles: minimalist, gradient, bold typography, photo-based, illustrated, geometric, retro, glassmorphism, 3D, neon, duotone, editorial, collage.
  - `google-labs-stitch/stitch-ui-design` (Apache-2.0 · security: verified · sha256:9209328b3546873c): Expert guidance for crafting effective prompts in Google Stitch, the AI-powered UI design tool by Google Labs. This skill helps create precise, actionable prompts that generate high-quality UI designs for web and mobile applications.
  - `designspells/design-spells` (MIT · security: verified · sha256:0c9bda10a9561181): Curated micro-interactions and design details that add "magic" and personality to websites and apps.
  - `vercel-labs/web-design-guidelines` (Apache-2.0 · security: verified · sha256:0950a2fa3b44c2a8): Review files for compliance with Web Interface Guidelines.
  - `shadcn/shadcn` (MIT · security: verified · sha256:e3b37e94d88bd897): Manages shadcn/ui components and projects, providing context, documentation, and usage patterns for building modern design systems.
  - `community-design/tailwind-design-system` (MIT · security: verified · sha256:161aaa3d0cd8d7fa): Build production-ready design systems with Tailwind CSS, including design tokens, component variants, responsive patterns, and accessibility.
  - `expo/expo-design-system` (MIT · security: verified · sha256:1d81b76c6b15f51f): Build and maintain a design system inside an Expo app - a reusable theme of design tokens (color, spacing, typography, radius, shadow, motion), reusable component structure with variant/size/state prop conventions, and rules for when to extract a repeated view into a shared component. Use when creating or organizing theme files and design tokens (theme.ts / theme/), extending an existing theme or styling library (NativeWind, Tamagui, Restyle, Unistyles) in its own idiom, standardizing styles so screens (including AI-generated ones) look consistent and polished, fixing an app that looks AI-generated or generic instead of native (the named native-slop tells), building an in-app component library, or auditing an app for design-system drift (hardcoded colors, spacing, fonts). For platform styling specifics (semantic colors, HIG rules, native controls) use expo-native-ui; for folder layout of a new app use expo-project-structure.
  - `tastemaker/tastemaker` (MIT · security: verified · sha256:94991c63279bf31b): Generate genuinely beautiful, on-brand UI instead of generic "AI slop", use whenever the user asks to build, design, style, or improve a UI, landing page, dashboard, app screen, or component, whenever a PRD/spec needs a design pass before implementation, whenever the user pastes reference images/Pinterest/Dribbble links and wants the app to look like them, or whenever the user complains the AI-generated UI looks generic, boring, cookie-cutter, or "like every other AI app." Make sure to trigger this even if the user doesn't say "design" explicitly, phrases like "make this look good", "build the frontend for X", "this looks like every other SaaS site", or "match this vibe" all qualify. Also triggers on two verbs, "study"/"extract the look of" a reference screenshot or URL, and "audit"/"review"/"why does this look AI-generated" for critiquing existing UI.
  - `tastemaker/ideagram` (MIT · security: verified · sha256:0eb0ce9a4540135a): Turn a concept, feature description, blog post, or pitch into a single beautiful, on-brand illustration by matching it to a real unDraw illustration in a local library and recoloring it to the brand accent, genuine illustrator quality, not an AI-drawn approximation. Use whenever the user asks to "make an illustration," "create a graphic," "visualize this concept," "explain this visually," wants something "unDraw-style" or "Storyset-style," needs a hero/feature/blog illustration, or says an idea needs a picture. Trigger even if they don't name a style, "make something to explain X" or "I need a graphic for this tweet" both qualify.
  - `addyosmani/frontend-ui-engineering` (MIT · security: verified · sha256:a94fd0a2b703a790): Builds production-quality, accessible, responsive user-facing UIs. Use when building or modifying interfaces and pages, creating components, implementing layouts, meeting WCAG accessibility requirements, managing state, or when the output needs to look and feel production-quality rather than AI-generated.
  - `obra-superpowers/brainstorming` (MIT · security: verified · sha256:c8478a1bcf6ea405): You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
  - `haidrrrry-claude-remotion-skill/remotion-motion-graphics` (MIT · security: verified · sha256:9e4a86a61f3acc92): Create and edit professional motion graphics videos with Remotion (React-based video). Use this skill EVERY time the user wants to create a video, edit a video, animate something, build an intro/outro/logo animation, make a Reel/Short/promo/launch video, add text animations or captions to footage, composite images and B-roll into a video, or mentions Remotion, motion graphics, video rendering, or "make this video look better/less generic". Also trigger when editing an existing Remotion project or when the user complains their video looks basic, generic, or amateur, this skill contains the exact fixes. Always read this skill BEFORE writing any Remotion code.

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

---

## Option B: Enterprise Setup Prompt

Copy and paste for team/organization standardization and strict security governance:

```markdown
# Aidentity Setup Prompt: Product designer (Enterprise)

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

## 3. Verified Skills for Product designer (22)
Install with `npx aidentity add <id> --agent claude`:
  - `google-labs-stitch/design-md` (Apache-2.0 · security: verified · sha256:e262e3de69891242): Analyze Stitch projects and synthesize a semantic design system into DESIGN.md files
  - `ui-ux-pro-max/ui-ux-pro-max` (MIT · security: verified · sha256:bdc40690131e52d2): UI/UX design intelligence for web, mobile, and desktop. This skill should be used when designing, building, reviewing, or fixing interfaces, including pages, components, design systems, accessibility, interaction, responsive layout, typography, color, charts, and stack-specific UI implementation. Searchable local data: 79 searchable styles (50 active), 192 product palettes and reasoning profiles, 74 font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types, and 22 stacks.
  - `ui-ux-pro-max/design-system` (MIT · security: verified · sha256:3c2259222f877e39): Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs, strategic slide creation. Use for design tokens, systematic design, brand-compliant presentations.
  - `ui-ux-pro-max/design` (MIT · security: verified · sha256:84d2d5d9b94a4271): Comprehensive design skill: brand identity, design tokens, UI styling, logo generation (55 styles, Gemini, Atlas Cloud, or MuAPI AI), corporate identity program (50 deliverables, CIP mockups), HTML presentations (Chart.js), banner design (22 styles, social/ads/web/print), icon design (15 styles, SVG, Gemini 3.1 Pro), social photos (HTML→screenshot, multi-platform). Actions: design logo, create CIP, generate mockups, build slides, design banner, generate icon, create social photos, social media images, brand identity, design system. Platforms: Facebook, Twitter, LinkedIn, YouTube, Instagram, Pinterest, TikTok, Threads, Google Ads.
  - `ui-ux-pro-max/brand` (MIT · security: verified · sha256:b3c0d4b83696367f): Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.
  - `ui-ux-pro-max/slides` (MIT · security: verified · sha256:ef68e14fab0602a6): Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
  - `ui-ux-pro-max/banner-design` (MIT · security: verified · sha256:65da5350479bd904): Design banners for social media, ads, website heroes, creative assets, and print. Multiple art direction options with optional generated or supplied visuals. Actions: design, create, generate banner. Platforms: Facebook, Twitter/X, LinkedIn, YouTube, Instagram, Google Display, website hero, print. Styles: minimalist, gradient, bold typography, photo-based, illustrated, geometric, retro, glassmorphism, 3D, neon, duotone, editorial, collage.
  - `google-labs-stitch/stitch-ui-design` (Apache-2.0 · security: verified · sha256:9209328b3546873c): Expert guidance for crafting effective prompts in Google Stitch, the AI-powered UI design tool by Google Labs. This skill helps create precise, actionable prompts that generate high-quality UI designs for web and mobile applications.
  - `designspells/design-spells` (MIT · security: verified · sha256:0c9bda10a9561181): Curated micro-interactions and design details that add "magic" and personality to websites and apps.
  - `vercel-labs/web-design-guidelines` (Apache-2.0 · security: verified · sha256:0950a2fa3b44c2a8): Review files for compliance with Web Interface Guidelines.
  - `shadcn/shadcn` (MIT · security: verified · sha256:e3b37e94d88bd897): Manages shadcn/ui components and projects, providing context, documentation, and usage patterns for building modern design systems.
  - `community-design/tailwind-design-system` (MIT · security: verified · sha256:161aaa3d0cd8d7fa): Build production-ready design systems with Tailwind CSS, including design tokens, component variants, responsive patterns, and accessibility.
  - `expo/expo-design-system` (MIT · security: verified · sha256:1d81b76c6b15f51f): Build and maintain a design system inside an Expo app - a reusable theme of design tokens (color, spacing, typography, radius, shadow, motion), reusable component structure with variant/size/state prop conventions, and rules for when to extract a repeated view into a shared component. Use when creating or organizing theme files and design tokens (theme.ts / theme/), extending an existing theme or styling library (NativeWind, Tamagui, Restyle, Unistyles) in its own idiom, standardizing styles so screens (including AI-generated ones) look consistent and polished, fixing an app that looks AI-generated or generic instead of native (the named native-slop tells), building an in-app component library, or auditing an app for design-system drift (hardcoded colors, spacing, fonts). For platform styling specifics (semantic colors, HIG rules, native controls) use expo-native-ui; for folder layout of a new app use expo-project-structure.
  - `tastemaker/tastemaker` (MIT · security: verified · sha256:94991c63279bf31b): Generate genuinely beautiful, on-brand UI instead of generic "AI slop", use whenever the user asks to build, design, style, or improve a UI, landing page, dashboard, app screen, or component, whenever a PRD/spec needs a design pass before implementation, whenever the user pastes reference images/Pinterest/Dribbble links and wants the app to look like them, or whenever the user complains the AI-generated UI looks generic, boring, cookie-cutter, or "like every other AI app." Make sure to trigger this even if the user doesn't say "design" explicitly, phrases like "make this look good", "build the frontend for X", "this looks like every other SaaS site", or "match this vibe" all qualify. Also triggers on two verbs, "study"/"extract the look of" a reference screenshot or URL, and "audit"/"review"/"why does this look AI-generated" for critiquing existing UI.
  - `tastemaker/ideagram` (MIT · security: verified · sha256:0eb0ce9a4540135a): Turn a concept, feature description, blog post, or pitch into a single beautiful, on-brand illustration by matching it to a real unDraw illustration in a local library and recoloring it to the brand accent, genuine illustrator quality, not an AI-drawn approximation. Use whenever the user asks to "make an illustration," "create a graphic," "visualize this concept," "explain this visually," wants something "unDraw-style" or "Storyset-style," needs a hero/feature/blog illustration, or says an idea needs a picture. Trigger even if they don't name a style, "make something to explain X" or "I need a graphic for this tweet" both qualify.
  - `addyosmani/frontend-ui-engineering` (MIT · security: verified · sha256:a94fd0a2b703a790): Builds production-quality, accessible, responsive user-facing UIs. Use when building or modifying interfaces and pages, creating components, implementing layouts, meeting WCAG accessibility requirements, managing state, or when the output needs to look and feel production-quality rather than AI-generated.
  - `obra-superpowers/brainstorming` (MIT · security: verified · sha256:c8478a1bcf6ea405): You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
  - `haidrrrry-claude-remotion-skill/remotion-motion-graphics` (MIT · security: verified · sha256:9e4a86a61f3acc92): Create and edit professional motion graphics videos with Remotion (React-based video). Use this skill EVERY time the user wants to create a video, edit a video, animate something, build an intro/outro/logo animation, make a Reel/Short/promo/launch video, add text animations or captions to footage, composite images and B-roll into a video, or mentions Remotion, motion graphics, video rendering, or "make this video look better/less generic". Also trigger when editing an existing Remotion project or when the user complains their video looks basic, generic, or amateur, this skill contains the exact fixes. Always read this skill BEFORE writing any Remotion code.
  - `addyosmani/security-and-hardening` (MIT · security: verified · sha256:c4e213e9374f82e8): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
  - `trailofbits/supply-chain-risk-auditor` (CC-BY-SA-4.0 · security: verified · sha256:e8c5f983bb6ba819): Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or archived upstreams, npm publisher concentration, and install-time script execution. Use when asked to audit dependencies, assess supply-chain or third-party package risk, or review a dependency tree before an engagement.
  - `trailofbits/agentic-actions-auditor` (CC-BY-SA-4.0 · security: verified · sha256:c21aed572e34d6c6): Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. Detects attack vectors where attacker-controlled input reaches AI agents running in CI/CD pipelines, including env var intermediary patterns, direct expression injection, dangerous sandbox configurations, and wildcard user allowlists. Use when reviewing workflow files that invoke AI coding agents, auditing CI/CD pipeline security for prompt injection risks, or evaluating agentic action configurations.
  - `addyosmani/code-review-and-quality` (MIT · security: verified · sha256:6475fb1665945e2e): Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.

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
