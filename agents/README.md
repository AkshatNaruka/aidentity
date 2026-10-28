# Agents

## Free Models (Core)

| Agent | Model | Purpose |
|---|---|---|
| `free-router` | `opencode/mimo-v2.5-free` | Analyze + route tasks to best FREE model |
| `free-fast` | `opencode/muse-spark-1.2-contributor-free` | Typos, formatting, simple edits (0-2) |
| `free-implementer` | `opencode/nemotron-3.5-lightning-free` | Refactor, bug fix, simple feature (3-5) |
| `free-complex` | `opencode/mimo-v2.5-free` | Multi-file features (6-8) |
| `free-expert` | `opencode/nemotron-3-ultra-free` | Major refactoring, algorithms (9-10) |
| `free-reviewer` | `opencode/mimo-v2.5-free` | Code review |
| `free-tester` | `opencode/nemotron-3.5-lightning-free` | Test writing |
| `free-planner` | `...` | Planning |
| `free-designer` | `...` | Design |
| `free-researcher` | `...` | Research |
| `free-writer` | `...` | Writing |

Source: `agents/free-models/`

## Imported / Community

Imported via hosted instructions land here:

- `agents/imported/<slug>/` — individual agent `*.md` files extracted from contributor `opencode.json`
- Raw snippet preserved at `routing/contrib/<slug>.json`

**To contribute your own agents** from any project:

```
Fetch https://raw.githubusercontent.com/AkshatNaruka/all-ai/main/opencode/INSTRUCTIONS.md and follow it.
Import my ./opencode.json agents into all-ai with slug "my-agents".
```

See `opencode/INSTRUCTIONS.md` (canonical) + `docs/opencode.md` (human) + `routing/contrib/README.md`.

## Base Routing Config

- `routing/free-tier/barkcli.json` — canonical opencode.json example used by imports.

## Adding a New Agent Manually (without import flow)

1. Create `agents/free-models/<name>.md` or `agents/imported/<slug>/<name>.md`
2. Define `## Model` + `## Prompt` similar to `agents/free-models/free-router.md`
3. Reference in `routing/free-tier/barkcli.json` or `routing/contrib/<slug>.json`

Keep `version` / attribution in header if imported.

