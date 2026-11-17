---
id: prompt/setup-filmmaker
name: Filmmaker Setup Prompt
description: Initial AI agent setup prompt for Filmmaker (Individual & Enterprise profiles) — installs verified skills, rules, subagents, commands, and security hooks.
category: setup
tags: setup, role, filmmaker, individual, enterprise
---

# Filmmaker — Initial Setup Prompts

> **Role**: Filmmaker (`filmmaker`)
> **Focus**: Screenwriting, story structure, shot planning, editing and delivery.
> **Categories**: `film`, `video`, `motion`
> **Security**: All 15 recommended skills are scanned and verified (`0` critical findings).

---

## Quick CLI Setup

```bash
# Individual setup (skills + rules + subagents + safety hooks)
npx aidentity setup filmmaker --profile individual

# Enterprise setup (adds security/supply-chain audit skills + full governance hooks)
npx aidentity setup filmmaker --profile enterprise

# Print the copy-paste prompt in terminal
npx aidentity setup filmmaker --profile individual --prompt
```

---

## Option A: Individual Setup Prompt

Copy and paste into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or Copilot:

```markdown
# Aidentity Setup Prompt: Filmmaker (Individual)

Set up my AI agent environment for the **Filmmaker** role using the **Individual** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup filmmaker --profile individual --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.

## 3. Verified Skills for Filmmaker (11)
Install with `npx aidentity add <id> --agent claude`:
  - `jtydhr88-screenwriting-skills/sw-story-structure` (MIT · security: verified · sha256:0656256bf248648b): Story structure for screenplays and stage plays (故事结构), merged from Syd Field's paradigm and plot points, Blake Snyder's Save the Cat beat sheet and board, Robert McKee's Story (event/scene/sequence/act, inciting incident, progressive complications, crisis-climax-resolution, subplots, story triangle), Julian Hoxter's nine-beat model, Neill Hicks' three acts as attraction/anticipation/satisfaction, and Lu Jun's Chinese short-play structure (凤头猪肚豹尾, 起承转合, eight openings, eight endings, 入戏要快/脉络要清/高潮要高/转变要顺/变化要多). Use when outlining a script, placing plot points and midpoint, fixing a saggy second act, designing an opening or ending, diagnosing "nothing happens", choosing between linear and non-linear designs, or converting a premise into beats and cards.
  - `jtydhr88-screenwriting-skills/sw-writers-room` (MIT · security: verified · sha256:5b2c52a9ca4c2cc9): How episodic television actually gets made by a group (编剧室与制作现实), merged from Goldberg & Rabkin (pitch as audition, leave-behind, cracking the story, beat sheet, notes discipline, production rewrites), Pamela Douglas (John Wells's room, staff-from-hell mistakes, the seven-rung ladder, step deal, the 14-day draft), Neil Landau's showrunner interviews (Lindelof, Mazzara, Katims, Bays), Evan Smith on sitcom staffing and roundtables, Richard Blum (dated), Kam Miller, and first-hand accounts by David Chase, Jesse Armstrong, Lucy Prebble, Aaron Sorkin, Julian Fellowes and Phoebe Waller-Bridge. Use when joining or running a writers' room, breaking an episode with a group, writing a leave-behind, beat sheet or outline on deadline, pitching episode ideas to an existing series, writing a spec episode, taking or giving notes, rewriting because of money, actors or locations, choosing between a staffed room and a single-author process, or asking 什么是 showrunner／编剧室怎么运作／怎么接 note.
  - `jtydhr88-screenwriting-skills/sw-genre-anatomy` (MIT · security: verified · sha256:dcc67c8147937214): Genre anatomy from John Truby's The Anatomy of Genres (类型解剖 / 类型节拍 / 混合类型 / 超越类型), genres as beat systems with a life philosophy underneath; three rules (hit every beat of your genre, mix three or four genres, transcend the primary genre), the ladder and families of twelve genres (Horror 恐怖, Action 动作, Myth 神话, Memoir and Coming-of-Age 回忆录与成长, Science Fiction 科幻, Crime 犯罪, Comedy 喜剧, Western 西部, Gangster 黑帮, Fantasy 奇幻, Detective and Thriller 侦探与惊悚, Love 爱情), each with its hero/opponent/world/plot-shape template, beat list, hard rules with failure conditions, subgenres and transcendent paths, plus a genre-mixing worksheet and a diagnostic. Kept beside sw-truby-anatomy and the Field/Snyder page maps. Use when choosing or confirming a script's genre, when a genre story feels generic or misses the beats its audience expects, when mixing genres, when a horror lacks pressure, an action lacks plot, a love story lacks opposition or a detective story lacks reveals.
  - `jtydhr88-screenwriting-skills/sw-workflow` (MIT · security: verified · sha256:a5534c5676c3bae1): Project orchestrator for the screenwriting skill set (剧本项目主线调度 / 状态存档 / story bible), a meta-skill that adds no new craft knowledge but routes a screenplay or stage-play project through stages (premise → structure → character → scenes → draft → revision → submission) and a TV / streaming series project (电视剧 / 剧集 / pilot / 一季) through a separate series stage table (engine → character network & season arc → documents/bible → pilot structure → break story & outline → draft → submission), names which sw-* skill to invoke at each stage, defines each stage's deliverable and advisory exit check, and keeps all project state in a story-bible.md file so work can resume across sessions. Use when starting a new script project, resuming one ("continue my screenplay", "where were we"), when the user asks "what should I do next" on a script, when converting a vague idea into a full development pipeline, or when the other sw-* skills are firing individually and the overall process needs sequencing.
  - `jtydhr88-screenwriting-skills/sw-format-adaptation` (MIT · security: verified · sha256:31fd6abcce37f7f1): Screenplay format, page craft, the writing process and adaptation (剧本格式/写作流程/改编), merged from Wendy Henson (spec format rules), Richard Walter (page craft, revision), Neill Hicks (selling vs shooting script, draft chain), Syd Field (master shot, card method, adaptation as original work), Robert McKee (step outline → treatment → screenplay), Julian Hoxter (format elements, adaptation four questions), Diamond & Weissman (one-page nine-step) and Eric Bork, plus an exact typographic grid, element conventions (V.O./O.S., MORE/CONT'D, dual dialogue), a machine-writable output contract (Fountain, with forced markers for Chinese), and Asian industry formats (Chinese 场号制 影视剧本格式, Japanese 柱・ト書き・セリフ / 決定稿). Use when formatting a spec script, choosing the output file format, deciding what goes in action lines, planning drafts and outlines, cutting pages, adapting a novel, play or true story, writing a Chinese TV/film or Japanese-style script page, or preparing a submission-ready draft.
  - `jtydhr88-screenwriting-skills/chekhov-dramaturgy` (MIT · security: verified · sha256:abf1a4d98dbd6da6): Writing plays and screenplays in the Chekhovian mode (契诃夫戏剧法), distilled from the complete plays (没有父亲的人/普拉东诺夫, 伊凡诺夫, 林妖→万尼亚舅舅, 海鸥, 三姊妹, 樱桃园, nine one-acts) plus Chekhov's own letters, Stanislavsky's and Nemirovich-Danchenko's rehearsal notes and 焦菊隐/童道明 criticism. Covers the four-act mood-based structure without central climax, off-stage events, "correct answer stated in Act 1 and refused", the announced event that never happens, three-layer endings (hope monologue + nihilist line + household action), no-villain conflict with environment, every character's object and catchphrase, one-way love chains, half-step-off dialogue, philosophy cut by thirst, the shortest words for the deepest pain, stage-direction and sound discipline, and how Chekhov revised The Wood Demon into Uncle Vanya. Use when the user wants an ensemble drama, a "nothing happens" play, subtext-heavy dialogue, a family estate / provincial story, an anti-climactic structure, or asks how to "Chekhov-ize" a script.
  - `ui-ux-pro-max/slides` (MIT · security: verified · sha256:ef68e14fab0602a6): Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
  - `obra-superpowers/brainstorming` (MIT · security: verified · sha256:c8478a1bcf6ea405): You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
  - `marketingskills/video` (MIT · security: verified · sha256:0f142bfc4087ff85): When the user wants to create, generate, or produce video content using AI tools or programmatic frameworks. Also use when the user mentions 'video production,' 'AI video,' 'Remotion,' 'Hyperframes,' 'HeyGen,' 'Synthesia,' 'Veo,' 'Sora,' 'Runway,' 'Kling,' 'Seedance,' 'Hailuo,' 'MiniMax,' 'Pika,' 'Hunyuan,' 'Wan,' 'video generation,' 'AI avatar,' 'talking head video,' 'programmatic video,' 'video template,' 'explainer video,' 'product demo video,' 'record a product demo,' 'feature demo video,' 'in-app demo,' 'video pipeline,' 'copy this edit,' 'match this video style,' 'reverse-engineer this video,' 'edit like this reference,' or 'make me a video.' Use this for video creation, generation, and production workflows. For video content strategy and what to post, see social. For paid video ad creative, see ad-creative.
  - `marketingskills/image` (MIT · security: verified · sha256:a133744dbc1ea07f): When the user wants to create, generate, edit, or optimize images for marketing, blog heroes, social graphics, product mockups, profile banners, listing visuals, or brand assets. Also use when the user mentions 'AI image generation,' 'generate an image,' 'create a graphic,' 'product mockup,' 'hero image,' 'social media graphic,' 'banner image,' 'cover photo,' 'profile banner,' 'listing screenshot,' 'Flux,' 'Flux Kontext,' 'Midjourney,' 'DALL-E,' 'GPT Image,' 'ChatGPT Images,' 'Ideogram,' 'Gemini image,' 'Nano Banana,' 'Recraft,' 'Stable Diffusion,' 'Canva,' 'Figma,' 'image optimization,' 'compress images,' 'WebP,' or 'OG image.' Use this for general-purpose marketing image creation and optimization. For paid ad image creative and platform-specific ad specs, see ad-creative. For video production, see video.
  - `haidrrrry-claude-remotion-skill/remotion-motion-graphics` (MIT · security: verified · sha256:9e4a86a61f3acc92): Create and edit professional motion graphics videos with Remotion (React-based video). Use this skill EVERY time the user wants to create a video, edit a video, animate something, build an intro/outro/logo animation, make a Reel/Short/promo/launch video, add text animations or captions to footage, composite images and B-roll into a video, or mentions Remotion, motion graphics, video rendering, or "make this video look better/less generic". Also trigger when editing an existing Remotion project or when the user complains their video looks basic, generic, or amateur, this skill contains the exact fixes. Always read this skill BEFORE writing any Remotion code.

## 4. Coding & Workflow Rules
Copy into your agent's rules directory or `AGENTS.md`:
  - None required for this role (use project conventions)

## 5. Scoped Subagents & Slash Commands
- Subagents:
  - `agents/doc-writer.md`
  - `agents/planner.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
```

---

## Option B: Enterprise Setup Prompt

Copy and paste for team/organization standardization and strict security governance:

```markdown
# Aidentity Setup Prompt: Filmmaker (Enterprise)

Set up my AI agent environment for the **Filmmaker** role using the **Enterprise** profile.

## 1. One-Command Automated Setup (Preferred)
If you have shell access in this workspace, run:
```bash
npx aidentity setup filmmaker --profile enterprise --agent claude
```

## 2. Security & Provenance Gate (Mandatory)
Before installing or loading any skill, rule, or hook:
1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.
2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.
3. State the upstream author, SPDX license, and SHA-256 verification status before installing.
4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping.

## 3. Verified Skills for Filmmaker (15)
Install with `npx aidentity add <id> --agent claude`:
  - `jtydhr88-screenwriting-skills/sw-story-structure` (MIT · security: verified · sha256:0656256bf248648b): Story structure for screenplays and stage plays (故事结构), merged from Syd Field's paradigm and plot points, Blake Snyder's Save the Cat beat sheet and board, Robert McKee's Story (event/scene/sequence/act, inciting incident, progressive complications, crisis-climax-resolution, subplots, story triangle), Julian Hoxter's nine-beat model, Neill Hicks' three acts as attraction/anticipation/satisfaction, and Lu Jun's Chinese short-play structure (凤头猪肚豹尾, 起承转合, eight openings, eight endings, 入戏要快/脉络要清/高潮要高/转变要顺/变化要多). Use when outlining a script, placing plot points and midpoint, fixing a saggy second act, designing an opening or ending, diagnosing "nothing happens", choosing between linear and non-linear designs, or converting a premise into beats and cards.
  - `jtydhr88-screenwriting-skills/sw-writers-room` (MIT · security: verified · sha256:5b2c52a9ca4c2cc9): How episodic television actually gets made by a group (编剧室与制作现实), merged from Goldberg & Rabkin (pitch as audition, leave-behind, cracking the story, beat sheet, notes discipline, production rewrites), Pamela Douglas (John Wells's room, staff-from-hell mistakes, the seven-rung ladder, step deal, the 14-day draft), Neil Landau's showrunner interviews (Lindelof, Mazzara, Katims, Bays), Evan Smith on sitcom staffing and roundtables, Richard Blum (dated), Kam Miller, and first-hand accounts by David Chase, Jesse Armstrong, Lucy Prebble, Aaron Sorkin, Julian Fellowes and Phoebe Waller-Bridge. Use when joining or running a writers' room, breaking an episode with a group, writing a leave-behind, beat sheet or outline on deadline, pitching episode ideas to an existing series, writing a spec episode, taking or giving notes, rewriting because of money, actors or locations, choosing between a staffed room and a single-author process, or asking 什么是 showrunner／编剧室怎么运作／怎么接 note.
  - `jtydhr88-screenwriting-skills/sw-genre-anatomy` (MIT · security: verified · sha256:dcc67c8147937214): Genre anatomy from John Truby's The Anatomy of Genres (类型解剖 / 类型节拍 / 混合类型 / 超越类型), genres as beat systems with a life philosophy underneath; three rules (hit every beat of your genre, mix three or four genres, transcend the primary genre), the ladder and families of twelve genres (Horror 恐怖, Action 动作, Myth 神话, Memoir and Coming-of-Age 回忆录与成长, Science Fiction 科幻, Crime 犯罪, Comedy 喜剧, Western 西部, Gangster 黑帮, Fantasy 奇幻, Detective and Thriller 侦探与惊悚, Love 爱情), each with its hero/opponent/world/plot-shape template, beat list, hard rules with failure conditions, subgenres and transcendent paths, plus a genre-mixing worksheet and a diagnostic. Kept beside sw-truby-anatomy and the Field/Snyder page maps. Use when choosing or confirming a script's genre, when a genre story feels generic or misses the beats its audience expects, when mixing genres, when a horror lacks pressure, an action lacks plot, a love story lacks opposition or a detective story lacks reveals.
  - `jtydhr88-screenwriting-skills/sw-workflow` (MIT · security: verified · sha256:a5534c5676c3bae1): Project orchestrator for the screenwriting skill set (剧本项目主线调度 / 状态存档 / story bible), a meta-skill that adds no new craft knowledge but routes a screenplay or stage-play project through stages (premise → structure → character → scenes → draft → revision → submission) and a TV / streaming series project (电视剧 / 剧集 / pilot / 一季) through a separate series stage table (engine → character network & season arc → documents/bible → pilot structure → break story & outline → draft → submission), names which sw-* skill to invoke at each stage, defines each stage's deliverable and advisory exit check, and keeps all project state in a story-bible.md file so work can resume across sessions. Use when starting a new script project, resuming one ("continue my screenplay", "where were we"), when the user asks "what should I do next" on a script, when converting a vague idea into a full development pipeline, or when the other sw-* skills are firing individually and the overall process needs sequencing.
  - `jtydhr88-screenwriting-skills/sw-format-adaptation` (MIT · security: verified · sha256:31fd6abcce37f7f1): Screenplay format, page craft, the writing process and adaptation (剧本格式/写作流程/改编), merged from Wendy Henson (spec format rules), Richard Walter (page craft, revision), Neill Hicks (selling vs shooting script, draft chain), Syd Field (master shot, card method, adaptation as original work), Robert McKee (step outline → treatment → screenplay), Julian Hoxter (format elements, adaptation four questions), Diamond & Weissman (one-page nine-step) and Eric Bork, plus an exact typographic grid, element conventions (V.O./O.S., MORE/CONT'D, dual dialogue), a machine-writable output contract (Fountain, with forced markers for Chinese), and Asian industry formats (Chinese 场号制 影视剧本格式, Japanese 柱・ト書き・セリフ / 決定稿). Use when formatting a spec script, choosing the output file format, deciding what goes in action lines, planning drafts and outlines, cutting pages, adapting a novel, play or true story, writing a Chinese TV/film or Japanese-style script page, or preparing a submission-ready draft.
  - `jtydhr88-screenwriting-skills/chekhov-dramaturgy` (MIT · security: verified · sha256:abf1a4d98dbd6da6): Writing plays and screenplays in the Chekhovian mode (契诃夫戏剧法), distilled from the complete plays (没有父亲的人/普拉东诺夫, 伊凡诺夫, 林妖→万尼亚舅舅, 海鸥, 三姊妹, 樱桃园, nine one-acts) plus Chekhov's own letters, Stanislavsky's and Nemirovich-Danchenko's rehearsal notes and 焦菊隐/童道明 criticism. Covers the four-act mood-based structure without central climax, off-stage events, "correct answer stated in Act 1 and refused", the announced event that never happens, three-layer endings (hope monologue + nihilist line + household action), no-villain conflict with environment, every character's object and catchphrase, one-way love chains, half-step-off dialogue, philosophy cut by thirst, the shortest words for the deepest pain, stage-direction and sound discipline, and how Chekhov revised The Wood Demon into Uncle Vanya. Use when the user wants an ensemble drama, a "nothing happens" play, subtext-heavy dialogue, a family estate / provincial story, an anti-climactic structure, or asks how to "Chekhov-ize" a script.
  - `ui-ux-pro-max/slides` (MIT · security: verified · sha256:ef68e14fab0602a6): Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
  - `obra-superpowers/brainstorming` (MIT · security: verified · sha256:c8478a1bcf6ea405): You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
  - `marketingskills/video` (MIT · security: verified · sha256:0f142bfc4087ff85): When the user wants to create, generate, or produce video content using AI tools or programmatic frameworks. Also use when the user mentions 'video production,' 'AI video,' 'Remotion,' 'Hyperframes,' 'HeyGen,' 'Synthesia,' 'Veo,' 'Sora,' 'Runway,' 'Kling,' 'Seedance,' 'Hailuo,' 'MiniMax,' 'Pika,' 'Hunyuan,' 'Wan,' 'video generation,' 'AI avatar,' 'talking head video,' 'programmatic video,' 'video template,' 'explainer video,' 'product demo video,' 'record a product demo,' 'feature demo video,' 'in-app demo,' 'video pipeline,' 'copy this edit,' 'match this video style,' 'reverse-engineer this video,' 'edit like this reference,' or 'make me a video.' Use this for video creation, generation, and production workflows. For video content strategy and what to post, see social. For paid video ad creative, see ad-creative.
  - `marketingskills/image` (MIT · security: verified · sha256:a133744dbc1ea07f): When the user wants to create, generate, edit, or optimize images for marketing, blog heroes, social graphics, product mockups, profile banners, listing visuals, or brand assets. Also use when the user mentions 'AI image generation,' 'generate an image,' 'create a graphic,' 'product mockup,' 'hero image,' 'social media graphic,' 'banner image,' 'cover photo,' 'profile banner,' 'listing screenshot,' 'Flux,' 'Flux Kontext,' 'Midjourney,' 'DALL-E,' 'GPT Image,' 'ChatGPT Images,' 'Ideogram,' 'Gemini image,' 'Nano Banana,' 'Recraft,' 'Stable Diffusion,' 'Canva,' 'Figma,' 'image optimization,' 'compress images,' 'WebP,' or 'OG image.' Use this for general-purpose marketing image creation and optimization. For paid ad image creative and platform-specific ad specs, see ad-creative. For video production, see video.
  - `haidrrrry-claude-remotion-skill/remotion-motion-graphics` (MIT · security: verified · sha256:9e4a86a61f3acc92): Create and edit professional motion graphics videos with Remotion (React-based video). Use this skill EVERY time the user wants to create a video, edit a video, animate something, build an intro/outro/logo animation, make a Reel/Short/promo/launch video, add text animations or captions to footage, composite images and B-roll into a video, or mentions Remotion, motion graphics, video rendering, or "make this video look better/less generic". Also trigger when editing an existing Remotion project or when the user complains their video looks basic, generic, or amateur, this skill contains the exact fixes. Always read this skill BEFORE writing any Remotion code.
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
  - `agents/planner.md`
  - `agents/security-auditor.md`
- Guardrail Hooks:
  - `hooks/scan-secrets.js`
  - `hooks/block-dangerous.js`
  - `hooks/format-on-save.js`
  - `hooks/test-on-stop.js`
```
