# Community OpenCode Contributions

> Filtered `opencode.json` agent snippets contributed via the hosted import system.

- **Hosted instructions (agent):** `https://raw.githubusercontent.com/AkshatNaruka/all-ai/main/opencode/INSTRUCTIONS.md`
- **Human guide:** [`docs/opencode.md`](../../docs/opencode.md)
- **Placement spec:** `opencode/manifest.json`

## How to Contribute Your opencode.json Agents

In **any project** with a custom `opencode.json` or `.opencode/agents/*.md`, paste into opencode:

```
Fetch https://raw.githubusercontent.com/AkshatNaruka/all-ai/main/opencode/INSTRUCTIONS.md and follow it.
Import my ./opencode.json agents into all-ai with slug "my-agents".
```

The agent will:

1. Extract `agents.all.*` entries.
2. Create `agents/imported/<slug>/*.md` (human-readable agent defs).
3. Preserve filtered JSON here as `routing/contrib/<slug>.json`.
4. Open a PR `import/<slug>-<date>` for review.

## Format

Each file here is a **filtered** `opencode.json` preserving only the contributed agents:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agents": {
    "all": {
      "my-agent": {
        "model": "opencode/mimo-v2.5-free",
        "temperature": 0.3,
        "prompt": "..."
      }
    }
  },
  "_contrib": {
    "slug": "my-agent",
    "source": "./opencode.json",
    "imported_at": "2026-09-03T00:00:00Z"
  }
}
```

Secrets are redacted (`[REDACTED]`).

## Existing Contributions

| Slug | Source | File | Agents |
|---|---|---|---|
| `example` | `routing/free-tier/barkcli.json` shape (demo) | [`example.json`](example.json) | `example-fast`, `example-reviewer` |
| *(your slug here)* | *(your repo/path)* | `routing/contrib/<slug>.json` | — |

> No contributions yet — be the first! Import via the instruction URL above.

## Validating a Snippet

```bash
jq . routing/contrib/<slug>.json
# Check agents.all is an object
jq -e '.agents.all | type == "object"' routing/contrib/<slug>.json
```

## Related

- Free-tier base: `routing/free-tier/barkcli.json`
- Agent defs: `agents/free-models/`
- Setup: `docs/setup.md`
- Full placement table: `opencode/INSTRUCTIONS.md`
