# Skills

This directory holds the skill content we are allowed to redistribute, mirrored from upstream repositories with their licenses preserved.

**The canonical index is [`../registry/skills.json`](../registry/skills.json).** Don't read this directory structure directly — read the registry.

| Source | Path | Skills | License |
|---|---|---:|---|
| Google | [`google-cloud/`](google-cloud/) | 127 | Apache-2.0 |
| Microsoft | [`microsoft-azure/`](microsoft-azure/) | 61 | MIT |
| Matt Pocock | [`mattpocock/`](mattpocock/) | 37 | MIT |
| Addy Osmani | [`addyosmani/`](addyosmani/) | 25 | MIT |
| Jesse Vincent | [`obra-superpowers/`](obra-superpowers/) | 14 | MIT |
| This repo | [`repo-scanner/`](repo-scanner/) | 1 | MIT |

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
