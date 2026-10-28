# Bundles

Small, task-based install sets. A bundle is 5–15 skills — enough to be useful, small enough not to flood the model's context.

| Bundle | Skills | Use when |
|---|---:|---|
| [`starter-10`](bundles.json) | 10 | You want a sensible default across any codebase |
| [`web-app`](bundles.json) | 10 | Building and shipping a web product |
| [`mobile-app`](bundles.json) | 9 | Expo / React Native app |
| [`content-creator`](bundles.json) | 10 | Copy, SEO, social, video, email, launch |
| [`security-review`](bundles.json) | 8 | Auditing before release |
| [`data-ai`](bundles.json) | 5 | Postgres, analytics, context engineering, evals |
| [`devops`](bundles.json) | 6 | CI, deploy, cloud runtime, supply chain |

## Install

```bash
node scripts/install.js starter-10 --platform claude
node scripts/install.js web-app --platform cursor
node scripts/install.js security-review --platform codex --dry-run
node scripts/install.js --list
```

Platforms: `claude`, `cursor`, `codex`, `gemini`, `opencode`, `copilot`.

Installs into `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`, `.gemini/skills/`, `.opencode/skills/` or `.github/skills/` in the current project. Add `--global` to install under your home directory instead.

Pointer-only skills (proprietary upstream, e.g. Anthropic's document skills) are skipped with a message and a link to the source.

## Rules

- 5–15 skills per bundle. More than that is a reading list, not an install set.
- Every id must exist in `registry/skills.json`; `scripts/validate.js` enforces it.
- Bundles are editorial. Adding a skill to one is a design decision, not a data change.

The source of truth is [`bundles.json`](bundles.json).
