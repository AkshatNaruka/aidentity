# CLAUDE.md

Read [AGENTS.md](AGENTS.md) first. It is the source of truth for what this repo is, the rules for adding skills, and the commands. This file only adds notes for working on the site and tooling.

## Layout

- `skills/<source-key>/…/SKILL.md`: redistributable skill content, with the upstream `LICENSE` at the source root.
- `registry/`: generated JSON (`skills.json`, `catalog.json`, `security.json`) plus hand-maintained `sources.json` and `pointers/`.
- `site/build.js`: zero-dependency static site generator (all pages). Output: `site/dist/` (git-ignored).
- `site/assets/app.js`, `site/assets/style.css`: progressive enhancement only. Every page must work without JS.
- `cli/`: `aidentity` CLI and the stdio MCP server.
- `scripts/`: registry, security, license and site gates.

## Before claiming done

```bash
npm run validate      # registry, security scan, licenses, skills, catalog
npm run check:site    # build the site, then check links, ids, h1, meta, sitemap
```

## Conventions

- Generated files (`registry/skills.json`, `registry/catalog.json`, `THIRD_PARTY_NOTICES.md`, `prompts/setup/**`) are never hand-edited. Rebuild them.
- Generated output must be byte-identical on Windows and Linux: write POSIX paths and keep `generated_at` stable (see `scripts/lib/stable-json.js`).
- Pages are served from `/aidentity/` on GitHub Pages. Use relative links (`up(depth)` in `site/build.js`). Only `404.html` uses `${BASE}`-absolute links, because it is served at arbitrary paths.
- No Git LFS: `.gitattributes` keeps everything as plain git objects so clones stay fast.
