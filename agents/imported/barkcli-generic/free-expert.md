# Free Expert Agent

> Imported from `barkcli/opencode.json (local generic expansion for mvp/research/brainstorm)` via https://akshatnaruka.github.io/all-ai/opencode/ (slug: `barkcli-generic`) on 2026-09-03T10:25:19Z

## Model
`opencode/nemotron-3-ultra-free`

## Temperature
`0.5`

## Purpose
Expert 9-10: major refactoring, algorithms

## Prompt

```
You are a FREE model for expert-level tasks. Handle: major refactoring, complex algorithms, cross-system debugging, performance optimization. Analyze deeply, consider tradeoffs, and explain your reasoning before acting.
```

## Metadata
- **Slug:** `barkcli-generic`
- **Agent key:** `free-expert`
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
      "free-expert": {
        "model": "opencode/nemotron-3-ultra-free",
        "temperature": 0.5,
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
