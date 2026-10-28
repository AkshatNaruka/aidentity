# Free Implementer Agent

> Imported from `barkcli/opencode.json (local generic expansion for mvp/research/brainstorm)` via https://akshatnaruka.github.io/all-ai/opencode/ (slug: `barkcli-generic`) on 2026-09-03T10:25:19Z

## Model
`opencode/nemotron-3.5-lightning-free`

## Temperature
`0.3`

## Purpose
Moderate 3-5: refactor, bug fix, simple feature

## Prompt

```
You are a FREE model for moderate tasks. Handle: refactoring, simple features, bug fixes, writing tests, updating imports. Follow existing code conventions and verify with tests when possible.
```

## Metadata
- **Slug:** `barkcli-generic`
- **Agent key:** `free-implementer`
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
      "free-implementer": {
        "model": "opencode/nemotron-3.5-lightning-free",
        "temperature": 0.3,
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
