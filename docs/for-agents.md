# For agents

Give an agent this URL:

```
https://akshatnaruka.github.io/aidentity/llms.txt
```

It starts with the facts an agent needs and links every machine-readable file.

## Retrieval

| File | Use |
|---|---|
| `search.json` | Compact index: id, name, description, category, tags, license, status, install, content URL |
| `llms.txt` | One-line descriptions for every skill, key facts first |
| `llms-full.txt` | Metadata, install command and instruction URL for every skill |
| `registry.json` | Full registry, schema-backed |
| `catalog.json` | Every resource type: skill, tool, hook, command, agent, rule, template |
| `bundles.json` | Task sets of 5–15 skills |
| `agent.json` | Manifest with endpoints and usage rules |

Pattern: fetch `search.json` once, filter locally, then fetch `content_url` only for the shortlist.

## MCP server

```bash
node cli/mcp.js
```

Tools:

- `search_skills(query, limit)`
- `recommend(task, limit)`
- `get_skill(id)` — metadata plus the full `SKILL.md`
- `list_bundles()`
- `install_skill(id, platform, global, dry_run)` — dry-run unless `dry_run: false`

Client config is on <https://akshatnaruka.github.io/aidentity/for-agents/#mcp>.

## CLI

```bash
node cli/index.js recommend "audit my app for vulnerabilities"
node cli/index.js search "postgres migrations"
node cli/index.js add supabase/supabase-postgres-best-practices --dry-run
node scripts/install.js security-review --platform claude
```

## Rules

1. `content_url: null` means index-only. Link upstream; never claim it installs.
2. Skip `status` other than `stable` unless the user asks for it.
3. Quote the license before recommending in a commercial context.
4. Read the `SKILL.md` before acting on it. Descriptions are summaries.

## Store it for reference

- Clone the repo: `git clone https://github.com/AkshatNaruka/aidentity`
- Or keep `search.json` (~350 KB) and fetch instruction files on demand.
- `registry.json` is CC0; `ai.txt` states citation and attribution expectations.
