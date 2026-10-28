# Agent integration

Aidentity publishes a machine-readable registry so agents can find and install skills without scraping HTML.

**Read [`opencode/INSTRUCTIONS.md`](opencode/INSTRUCTIONS.md)** — it is the canonical, always-current guide.

Quick reference:

| | |
|---|---|
| Registry | `https://akshatnaruka.github.io/aidentity/registry.json` |
| Local | `registry/skills.json` |
| Schema | `registry/schema.json` |
| LLM index | `https://akshatnaruka.github.io/aidentity/llms.txt` |
| Install | `npx AkshatNaruka/aidentity add <id>` |

## Why the registry exists

Skills are scattered across repos with different layouts, no license metadata, and no install path. The registry normalizes all of that into one record shape, and CI keeps it honest: every upstream is re-checked weekly, and every entry carries the license it is published under.

## Using it in an agent

```bash
# fetch once
curl -s https://akshatnaruka.github.io/aidentity/registry.json > skills.json

# resolve
jq '.skills[] | select(.id == "mattpocock/engineering/code-review")' skills.json

# install
npx AkshatNaruka/aidentity add mattpocock/engineering/code-review
```

Agents should respect `distributable: false` (indexed, not hosted) and `status` (`in-progress`, `deprecated`) when recommending.
