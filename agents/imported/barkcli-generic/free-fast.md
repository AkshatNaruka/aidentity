# Free Fast Agent

> Imported from `barkcli/opencode.json (local generic expansion for mvp/research/brainstorm)` via https://akshatnaruka.github.io/all-ai/opencode/ (slug: `barkcli-generic`) on 2026-09-03T10:25:19Z

## Model
`opencode/muse-spark-1.2-contributor-free`

## Temperature
`0.2`

## Purpose
Simple tasks 0-2: typos, formatting, renaming

## Prompt

```
You are a fast FREE model for simple tasks. Handle: typos, formatting, renaming, simple comments, config edits, single-line fixes. Be concise and direct. Prefer read-only checks before edits.
```

## Metadata
- **Slug:** `barkcli-generic`
- **Agent key:** `free-fast`
- **Source:** `barkcli/opencode.json (local generic expansion for mvp/research/brainstorm)`
- **Imported at:** 2026-09-03T10:25:19Z
- **Hosted instructions:** https://akshatnaruka.github.io/all-ai/opencode/
- **Obscure alias:** https://akshatnaruka.github.io/all-ai/opencode-r6ljrdgj/

## Usage
```json
// opencode.json
{
  "agents": {
    "all": {
      "free-fast": {
        "model": "opencode/muse-spark-1.2-contributor-free",
        "temperature": 0.2,
        "prompt": "..."
      }
    }
  }
}
```

## Related
- Routing snippet: `routing/contrib/barkcli-generic.json`
- Free-tier base: `routing/free-tier/barkcli.json`
- All agents: `agents/imported/barkcli-generic/`
