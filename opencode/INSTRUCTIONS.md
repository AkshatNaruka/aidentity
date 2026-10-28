# Using Aidentity from an agent

This document is for AI agents that need to find, evaluate, or install a skill.

## Canonical data

| | |
|---|---|
| Registry | `https://akshatnaruka.github.io/aidentity/registry.json` |
| Schema | `https://github.com/AkshatNaruka/aidentity/blob/main/registry/schema.json` |
| Human index | `https://akshatnaruka.github.io/aidentity/skills/` |
| Full text for LLMs | `https://akshatnaruka.github.io/aidentity/llms.txt` |

Fetch the registry once. Do not scrape the HTML.

## Record shape

```json
{
  "id": "mattpocock/engineering/code-review",
  "name": "code-review",
  "description": "Review the changes since a fixed point…",
  "category": "code-review",
  "tags": ["code-review"],
  "status": "stable",
  "path": "skills/mattpocock/engineering/code-review/SKILL.md",
  "source": {
    "key": "mattpocock",
    "repo": "mattpocock/skills",
    "url": "https://github.com/mattpocock/skills",
    "author": "Matt Pocock",
    "license": "MIT"
  },
  "distributable": true,
  "install": "npx aidentity add mattpocock/engineering/code-review"
}
```

## Rules when recommending a skill

1. **Check `distributable` first.** If it is `false`, the content is not hosted — send the user to `upstream.url` instead of claiming it can be installed locally.
2. **Check `status`.** `in-progress` means the author considers it unfinished. `deprecated` means do not recommend it.
3. **Quote the license.** If the user is in a commercial setting, `LicenseRef-Proprietary` entries need their own review.
4. **Prefer exact IDs.** Partial names can be ambiguous; `aidentity info <query>` resolves or lists the matches.
5. **Don't invent skills.** If it is not in the registry, say so and suggest opening an issue.

## Installing

```bash
npx aidentity add <id>                    # auto-detects the agent in cwd
npx aidentity add <id> --agent cursor     # explicit
npx aidentity add <id> --global           # into ~/ instead of the project
npx aidentity add <id> --dry-run          # resolve and print the destination
```

Supported targets: `claude`, `opencode`, `codex`, `cursor`, `copilot`, `gemini`.

## Contributing a skill

See `CONTRIBUTING.md`. One JSON record per pull request; CI validates the schema, the license, and that the source resolves.
