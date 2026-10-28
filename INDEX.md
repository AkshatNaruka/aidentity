# Index

Start from the task, not the folder tree.

| I want to… | Use |
|---|---|
| **Install a sensible default set** | `node scripts/install.js starter-10 --platform claude` — 10 skills, see [bundles/](bundles/) |
| **Build a web app** | [`web-app`](bundles/bundles.json) bundle: UI direction, frontend, API, Postgres, CRO, CI, launch |
| **Build a mobile app** | [`mobile-app`](bundles/bundles.json) bundle: Expo Router, native UI, animation, EAS releases |
| **Write content / SEO / launch copy** | [`content-creator`](bundles/bundles.json) bundle: copywriting, editing, SEO, social, video, email, ads |
| **Audit security before shipping** | [`security-review`](bundles/bundles.json) bundle: audit context, supply chain, agentic actions, second opinion |
| **Work with data or AI** | [`data-ai`](bundles/bundles.json) bundle: Postgres, BigQuery AI, context engineering, evals, observability |
| **Set up CI / deploy / cloud** | [`devops`](bundles/bundles.json) bundle: CI, shipping, observability, Cloud Run, GKE |
| **Work on GCP or Azure specifically** | [`cloud`](bundles/bundles.json) megapack (optional, 11 skills) |
| **Plan before coding** | `/plan` command · `agents/planner.md` · [`grill-with-docs`](skills/mattpocock/engineering/grill-with-docs/SKILL.md) |
| **Review a diff** | `/review` command · `agents/reviewer.md` · [`code-review`](skills/mattpocock/engineering/code-review/SKILL.md) |
| **Debug a hard bug** | `agents/debugger.md` · [`systematic-debugging`](skills/obra-superpowers/systematic-debugging/SKILL.md) · [`diagnosing-bugs`](skills/mattpocock/engineering/diagnosing-bugs/SKILL.md) |
| **Harden a codebase** | [`security-and-hardening`](skills/addyosmani/security-and-hardening/SKILL.md) · [`trailofbits`](skills/trailofbits/) |
| **Design a screen that doesn't look generic** | [`ui-ux-pro-max`](skills/ui-ux-pro-max/ui-ux-pro-max/SKILL.md) · [`tastemaker`](skills/tastemaker/tastemaker/SKILL.md) · `agents/designer.md` |
| **Save tokens / shorten output** | [`caveman`](skills/caveman/caveman/SKILL.md) · [`caveman-compress`](skills/caveman/caveman-compress/SKILL.md) |
| **Connect an MCP server** | [tools/README.md](tools/README.md) — 12 servers, config for 5 clients |
| **Stop the agent doing something destructive** | [hooks/](hooks/) — dangerous commands, secrets, format, test-on-stop |
| **Ship a change** | `/ship` command · [`shipping-and-launch`](skills/addyosmani/shipping-and-launch/SKILL.md) |
| **Import a new source** | `/import` command · [CONTRIBUTING.md](CONTRIBUTING.md) |
| **Find a skill by name** | `node cli/index.js search "query"` · [registry/catalog.json](registry/catalog.json) |

## By resource type

| Type | Path | Count |
|---|---|---:|
| Skills | [`skills/`](skills/) | 395 (19 pointer-only) |
| Tools | [tools/README.md](tools/README.md) | 12 |
| Hooks | [hooks/](hooks/) | 4 + settings example |
| Commands | [`commands/`](commands/) | 5 |
| Agents | [`agents/`](agents/) | 7 scoped subagents |
| Bundles | [bundles/](bundles/) | 8 |
| Prompts | [`prompts/`](prompts/) | 256 Fabric patterns + 5 domain files |
| Templates | [`templates/`](templates/) | 6 stacks |
| Memory | [`memory/`](memory/) | Patterns + 10 skills |

The machine-readable version of this page is [`registry/catalog.json`](registry/catalog.json).
