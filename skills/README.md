# Skills

This directory holds the skill content we are allowed to redistribute, mirrored from upstream repositories with their licenses preserved.

**The canonical index is [`../registry/skills.json`](../registry/skills.json).** Don't read this directory structure directly — read the registry.

| Source | Path | Skills | License |
|---|---|---:|---|
| Google LLC | [`google-cloud/`](google-cloud/) | 127 | Apache-2.0 |
| Microsoft Corporation | [`microsoft-azure/`](microsoft-azure/) | 61 | MIT |
| OpenSenseNova | [`opensensenova-sensenova-skills/`](opensensenova-sensenova-skills/) | 59 | MIT |
| Corey Haines | [`marketingskills/`](marketingskills/) | 52 | MIT |
| Matt Pocock | [`mattpocock/`](mattpocock/) | 37 | MIT |
| Addy Osmani | [`addyosmani/`](addyosmani/) | 25 | MIT |
| Expo (650 Industries) | [`expo/`](expo/) | 23 | MIT |
| abrahamFerga | [`abrahamferga-scrum-skills/`](abrahamferga-scrum-skills/) | 17 | MIT |
| Jesse Vincent | [`obra-superpowers/`](obra-superpowers/) | 14 | MIT |
| agentii-ai | [`agentii-ai-agentii-investment-intelligence/`](agentii-ai-agentii-investment-intelligence/) | 12 | Apache-2.0 |
| agiprolabs | [`agiprolabs-claude-trading-skills/`](agiprolabs-claude-trading-skills/) | 12 | MIT |
| jtydhr88 | [`jtydhr88-lyric-writing-skills/`](jtydhr88-lyric-writing-skills/) | 12 | MIT |
| jtydhr88 | [`jtydhr88-screenwriting-skills/`](jtydhr88-screenwriting-skills/) | 12 | MIT |
| Affaan Mustafa | [`everything-claude-code/`](everything-claude-code/) | 10 | MIT |
| Julius Brussee | [`caveman/`](caveman/) | 8 | Apache-2.0 |
| Trail of Bits | [`trailofbits/`](trailofbits/) | 7 | CC-BY-SA-4.0 |
| Next Level Builder | [`ui-ux-pro-max/`](ui-ux-pro-max/) | 6 | MIT |
| emmapbingham | [`emmapbingham-agentic-newsroom/`](emmapbingham-agentic-newsroom/) | 4 | MIT |
| lukedj78 | [`lukedj78-dev-flow/`](lukedj78-dev-flow/) | 2 | MIT |
| Supabase | [`supabase/`](supabase/) | 2 | MIT |
| codeswithroh | [`tastemaker/`](tastemaker/) | 2 | MIT |
| Agents365-ai | [`agents365-ai-drawio-skill/`](agents365-ai-drawio-skill/) | 1 | MIT |
| haidrrrry | [`haidrrrry-claude-remotion-skill/`](haidrrrry-claude-remotion-skill/) | 1 | MIT |
| Aidentity contributors | [`repo-scanner/`](repo-scanner/) | 1 | MIT |

Not here: 19 skills from [`anthropics/skills`](https://github.com/anthropics/skills) are indexed in the registry with `distributable: false`. Their upstream license does not permit redistribution, so the registry links to the source instead of hosting a copy.

## Layout

Each skill is a directory containing at minimum a `SKILL.md` with YAML frontmatter:

```markdown
---
name: code-review
description: What it does and when to use it.
---

# Instructions the agent follows
```

Additional files (references, scripts, assets) live alongside `SKILL.md` and are installed with it.

## Installing

```bash
npx aidentity add <id>
```

## Adding

See [`../CONTRIBUTING.md`](../CONTRIBUTING.md). The short version: confirm the license, place the directory under `skills/<source>/`, keep the upstream `LICENSE` at `skills/<source>/LICENSE`, then run:

```bash
node scripts/build-registry.js
node scripts/check-licenses.js
```

## License

Each subdirectory is governed by its upstream license, preserved next to the content. The registry metadata is CC0.
