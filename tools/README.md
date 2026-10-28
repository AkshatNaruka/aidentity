# Tools

MCP servers worth wiring into an agent, grouped by what they are for. Each entry has a
one-paragraph use case, an install command, and config for Claude Code, Cursor,
Codex, Gemini CLI and OpenCode.

This file is generated from [`registry/tools.json`](../registry/tools.json). Edit the JSON, not this page.

**12 tools · 8 categories**

> **Token cost is real.** Every MCP server you enable adds tool definitions to the
> model's context. Enable one or two per task, not the whole list. Prefer read-only
> scopes and project-scoped tokens.

## Categories

- [browser-automation](#browser-automation)
- [github](#github)
- [databases](#databases)
- [docs-search](#docs-search)
- [design](#design)
- [deploy](#deploy)
- [files](#files)
- [reasoning](#reasoning)

---

## browser-automation

### Playwright MCP

**Drive a real browser through accessibility snapshots instead of screenshots.**  
[microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) · Apache-2.0

Use when an agent must click through a flow, fill a form, verify a UI change, or scrape a page that needs JavaScript. Prefer it over screenshot-based tools: the agent gets a structured tree it can reason about, not pixels.

```bash
npx -y @playwright/mcp@latest
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add playwright-mcp -- npx -y @playwright/mcp@latest`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "playwright-mcp": {
      "command": "npx",
      "args": ["-y","@playwright/mcp@latest"]
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "playwright-mcp": {
      "command": "npx",
      "args": ["-y","@playwright/mcp@latest"]
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.playwright-mcp]
command = "npx"
args = ["-y","@playwright/mcp@latest"]
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "playwright-mcp": {
      "command": "npx",
      "args": ["-y","@playwright/mcp@latest"]
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "playwright-mcp": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@playwright/mcp@latest"
      ],
      "enabled": true
    }
  }
}
```

</details>

### Chrome DevTools MCP

**Inspect console, network, performance traces and DOM from a live Chrome session.**  
[ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) · Apache-2.0

Use for debugging a running app: console errors, failed requests, layout shifts, performance traces. Pair with Playwright MCP when you need both interaction and diagnostics.

```bash
npx -y chrome-devtools-mcp@latest
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add chrome-devtools-mcp -- npx -y chrome-devtools-mcp@latest`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "chrome-devtools-mcp": {
      "command": "npx",
      "args": ["-y","chrome-devtools-mcp@latest"]
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "chrome-devtools-mcp": {
      "command": "npx",
      "args": ["-y","chrome-devtools-mcp@latest"]
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.chrome-devtools-mcp]
command = "npx"
args = ["-y","chrome-devtools-mcp@latest"]
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "chrome-devtools-mcp": {
      "command": "npx",
      "args": ["-y","chrome-devtools-mcp@latest"]
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "chrome-devtools-mcp": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "chrome-devtools-mcp@latest"
      ],
      "enabled": true
    }
  }
}
```

</details>

## github

### GitHub MCP Server

**Read repositories, issues, pull requests and actions through the GitHub API.**  
[github/github-mcp-server](https://github.com/github/github-mcp-server) · MIT

Use when the task spans more than the local checkout: triaging issues, reviewing PRs, reading CI logs, or opening a PR. Needs a token with the minimum scopes for the repositories involved.

```bash
docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add github-mcp -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "github-mcp": {
      "command": "docker",
      "args": ["run","-i","--rm","-e","GITHUB_PERSONAL_ACCESS_TOKEN","ghcr.io/github/github-mcp-server"]
      ,"env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}" }
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "github-mcp": {
      "command": "docker",
      "args": ["run","-i","--rm","-e","GITHUB_PERSONAL_ACCESS_TOKEN","ghcr.io/github/github-mcp-server"]
      ,"env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}" }
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.github-mcp]
command = "docker"
args = ["run","-i","--rm","-e","GITHUB_PERSONAL_ACCESS_TOKEN","ghcr.io/github/github-mcp-server"]
env = { GITHUB_PERSONAL_ACCESS_TOKEN = "${GITHUB_PERSONAL_ACCESS_TOKEN}" }
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "github-mcp": {
      "command": "docker",
      "args": ["run","-i","--rm","-e","GITHUB_PERSONAL_ACCESS_TOKEN","ghcr.io/github/github-mcp-server"]
      ,"env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}" }
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "github-mcp": {
      "type": "local",
      "command": [
        "docker",
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "enabled": true,
      "environment": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "{env:GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

</details>

> Requires: `GITHUB_PERSONAL_ACCESS_TOKEN`. Use a scoped token.

## databases

### Postgres MCP Pro

**Inspect schemas, run read-only queries, and get index and health advice.**  
[crystaldba/postgres-mcp](https://github.com/crystaldba/postgres-mcp) · MIT

Use when the agent needs to understand a real database rather than guess at the schema: migrations, slow queries, index design, or data-shape checks. Point it at a read replica where possible.

```bash
npx -y @crystaldba/postgres-mcp --access-mode=restricted
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add postgres-mcp -- npx -y @crystaldba/postgres-mcp --access-mode=restricted`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "postgres-mcp": {
      "command": "npx",
      "args": ["-y","@crystaldba/postgres-mcp","--access-mode=restricted"]
      ,"env": { "DATABASE_URI": "${DATABASE_URI}" }
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "postgres-mcp": {
      "command": "npx",
      "args": ["-y","@crystaldba/postgres-mcp","--access-mode=restricted"]
      ,"env": { "DATABASE_URI": "${DATABASE_URI}" }
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.postgres-mcp]
command = "npx"
args = ["-y","@crystaldba/postgres-mcp","--access-mode=restricted"]
env = { DATABASE_URI = "${DATABASE_URI}" }
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "postgres-mcp": {
      "command": "npx",
      "args": ["-y","@crystaldba/postgres-mcp","--access-mode=restricted"]
      ,"env": { "DATABASE_URI": "${DATABASE_URI}" }
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "postgres-mcp": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@crystaldba/postgres-mcp",
        "--access-mode=restricted"
      ],
      "enabled": true,
      "environment": {
        "DATABASE_URI": "{env:DATABASE_URI}"
      }
    }
  }
}
```

</details>

> Requires: `DATABASE_URI`. Use a scoped token.

### Supabase MCP

**Manage Supabase projects: SQL, migrations, logs, storage and edge functions.**  
[supabase-community/supabase-mcp](https://github.com/supabase-community/supabase-mcp) · Apache-2.0

Use when the project is on Supabase and the task touches schema, auth, storage or edge functions. Scope the token to one project; do not hand it an organization-wide key.

```bash
npx -y @supabase/mcp-server-supabase@latest --project-ref=<ref>
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add supabase-mcp -- npx -y @supabase/mcp-server-supabase@latest --project-ref=<ref>`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "supabase-mcp": {
      "command": "npx",
      "args": ["-y","@supabase/mcp-server-supabase@latest","--project-ref=<ref>"]
      ,"env": { "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}" }
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase-mcp": {
      "command": "npx",
      "args": ["-y","@supabase/mcp-server-supabase@latest","--project-ref=<ref>"]
      ,"env": { "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}" }
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.supabase-mcp]
command = "npx"
args = ["-y","@supabase/mcp-server-supabase@latest","--project-ref=<ref>"]
env = { SUPABASE_ACCESS_TOKEN = "${SUPABASE_ACCESS_TOKEN}" }
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "supabase-mcp": {
      "command": "npx",
      "args": ["-y","@supabase/mcp-server-supabase@latest","--project-ref=<ref>"]
      ,"env": { "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}" }
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "supabase-mcp": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=<ref>"
      ],
      "enabled": true,
      "environment": {
        "SUPABASE_ACCESS_TOKEN": "{env:SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

</details>

> Requires: `SUPABASE_ACCESS_TOKEN`. Use a scoped token.

## docs-search

### Context7

**Fetch version-specific documentation for libraries instead of relying on model memory.**  
[upstash/context7](https://github.com/upstash/context7) · MIT

Use whenever an API may have changed since training: framework routers, SDK methods, config formats. It returns current docs and examples, which reduces hallucinated APIs.

```bash
npx -y @upstash/context7-mcp
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add context7 -- npx -y @upstash/context7-mcp`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y","@upstash/context7-mcp"]
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y","@upstash/context7-mcp"]
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y","@upstash/context7-mcp"]
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y","@upstash/context7-mcp"]
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "context7": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@upstash/context7-mcp"
      ],
      "enabled": true
    }
  }
}
```

</details>

### Exa MCP

**Semantic web search with full-page extraction.**  
[exa-labs/exa-mcp-server](https://github.com/exa-labs/exa-mcp-server) · MIT

Use for research that needs primary sources: release notes, benchmarks, competitor docs. Better than a keyword search when the query is conceptual.

```bash
npx -y exa-mcp-server
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add exa-mcp -- npx -y exa-mcp-server`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "exa-mcp": {
      "command": "npx",
      "args": ["-y","exa-mcp-server"]
      ,"env": { "EXA_API_KEY": "${EXA_API_KEY}" }
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "exa-mcp": {
      "command": "npx",
      "args": ["-y","exa-mcp-server"]
      ,"env": { "EXA_API_KEY": "${EXA_API_KEY}" }
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.exa-mcp]
command = "npx"
args = ["-y","exa-mcp-server"]
env = { EXA_API_KEY = "${EXA_API_KEY}" }
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "exa-mcp": {
      "command": "npx",
      "args": ["-y","exa-mcp-server"]
      ,"env": { "EXA_API_KEY": "${EXA_API_KEY}" }
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "exa-mcp": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "exa-mcp-server"
      ],
      "enabled": true,
      "environment": {
        "EXA_API_KEY": "{env:EXA_API_KEY}"
      }
    }
  }
}
```

</details>

> Requires: `EXA_API_KEY`. Use a scoped token.

## design

### Figma Context MCP

**Expose Figma file structure, components and styles to the agent.**  
[GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) · MIT

Use when implementing a design that exists in Figma. The agent gets node IDs, layout, tokens and text content instead of interpreting a screenshot.

```bash
npx -y figma-developer-mcp --figma-api-key=<key> --stdio
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add figma-mcp -- npx -y figma-developer-mcp --stdio`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "figma-mcp": {
      "command": "npx",
      "args": ["-y","figma-developer-mcp","--stdio"]
      ,"env": { "FIGMA_API_KEY": "${FIGMA_API_KEY}" }
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "figma-mcp": {
      "command": "npx",
      "args": ["-y","figma-developer-mcp","--stdio"]
      ,"env": { "FIGMA_API_KEY": "${FIGMA_API_KEY}" }
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.figma-mcp]
command = "npx"
args = ["-y","figma-developer-mcp","--stdio"]
env = { FIGMA_API_KEY = "${FIGMA_API_KEY}" }
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "figma-mcp": {
      "command": "npx",
      "args": ["-y","figma-developer-mcp","--stdio"]
      ,"env": { "FIGMA_API_KEY": "${FIGMA_API_KEY}" }
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "figma-mcp": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "figma-developer-mcp",
        "--stdio"
      ],
      "enabled": true,
      "environment": {
        "FIGMA_API_KEY": "{env:FIGMA_API_KEY}"
      }
    }
  }
}
```

</details>

> Requires: `FIGMA_API_KEY`. Use a scoped token.

## deploy

### Cloudflare MCP

**Inspect and operate Workers, KV, R2, D1 and DNS.**  
[cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) · Apache-2.0

Use for deploy-adjacent work on Cloudflare: checking a Worker, reading logs, inspecting bindings. Keep the token scoped to the account and environment you are actually changing.

```bash
npx -y @cloudflare/mcp-server-cloudflare
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add cloudflare-mcp -- npx -y @cloudflare/mcp-server-cloudflare`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "cloudflare-mcp": {
      "command": "npx",
      "args": ["-y","@cloudflare/mcp-server-cloudflare"]
      ,"env": { "CLOUDFLARE_API_TOKEN": "${CLOUDFLARE_API_TOKEN}", "CLOUDFLARE_ACCOUNT_ID": "${CLOUDFLARE_ACCOUNT_ID}" }
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "cloudflare-mcp": {
      "command": "npx",
      "args": ["-y","@cloudflare/mcp-server-cloudflare"]
      ,"env": { "CLOUDFLARE_API_TOKEN": "${CLOUDFLARE_API_TOKEN}", "CLOUDFLARE_ACCOUNT_ID": "${CLOUDFLARE_ACCOUNT_ID}" }
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.cloudflare-mcp]
command = "npx"
args = ["-y","@cloudflare/mcp-server-cloudflare"]
env = { CLOUDFLARE_API_TOKEN = "${CLOUDFLARE_API_TOKEN}", CLOUDFLARE_ACCOUNT_ID = "${CLOUDFLARE_ACCOUNT_ID}" }
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "cloudflare-mcp": {
      "command": "npx",
      "args": ["-y","@cloudflare/mcp-server-cloudflare"]
      ,"env": { "CLOUDFLARE_API_TOKEN": "${CLOUDFLARE_API_TOKEN}", "CLOUDFLARE_ACCOUNT_ID": "${CLOUDFLARE_ACCOUNT_ID}" }
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "cloudflare-mcp": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@cloudflare/mcp-server-cloudflare"
      ],
      "enabled": true,
      "environment": {
        "CLOUDFLARE_API_TOKEN": "{env:CLOUDFLARE_API_TOKEN}",
        "CLOUDFLARE_ACCOUNT_ID": "{env:CLOUDFLARE_ACCOUNT_ID}"
      }
    }
  }
}
```

</details>

> Requires: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Use a scoped token.

### Vercel MCP

**Read deployments, logs and project configuration from Vercel.**  
[vercel/mcp-adapter](https://github.com/vercel/mcp-adapter) · Apache-2.0

Use after a deploy fails or when the agent needs to confirm what is actually running. Read-only is usually enough; avoid granting deploy rights to an autonomous loop.

```bash
npx -y @vercel/mcp-adapter
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add vercel-mcp -- npx -y @vercel/mcp-adapter`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "vercel-mcp": {
      "command": "npx",
      "args": ["-y","@vercel/mcp-adapter"]
      ,"env": { "VERCEL_TOKEN": "${VERCEL_TOKEN}" }
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "vercel-mcp": {
      "command": "npx",
      "args": ["-y","@vercel/mcp-adapter"]
      ,"env": { "VERCEL_TOKEN": "${VERCEL_TOKEN}" }
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.vercel-mcp]
command = "npx"
args = ["-y","@vercel/mcp-adapter"]
env = { VERCEL_TOKEN = "${VERCEL_TOKEN}" }
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "vercel-mcp": {
      "command": "npx",
      "args": ["-y","@vercel/mcp-adapter"]
      ,"env": { "VERCEL_TOKEN": "${VERCEL_TOKEN}" }
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "vercel-mcp": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@vercel/mcp-adapter"
      ],
      "enabled": true,
      "environment": {
        "VERCEL_TOKEN": "{env:VERCEL_TOKEN}"
      }
    }
  }
}
```

</details>

> Requires: `VERCEL_TOKEN`. Use a scoped token.

## files

### Filesystem MCP

**Scoped read/write access to a directory tree.**  
[modelcontextprotocol/servers/tree/main/src/filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) · MIT

Use when the agent must work across a directory the host tool does not already expose, or when you want an explicit allowlist. Pass the narrowest directory that solves the task.

```bash
npx -y @modelcontextprotocol/server-filesystem <path>
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add filesystem-mcp -- npx -y @modelcontextprotocol/server-filesystem <path>`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "filesystem-mcp": {
      "command": "npx",
      "args": ["-y","@modelcontextprotocol/server-filesystem","<path>"]
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "filesystem-mcp": {
      "command": "npx",
      "args": ["-y","@modelcontextprotocol/server-filesystem","<path>"]
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.filesystem-mcp]
command = "npx"
args = ["-y","@modelcontextprotocol/server-filesystem","<path>"]
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "filesystem-mcp": {
      "command": "npx",
      "args": ["-y","@modelcontextprotocol/server-filesystem","<path>"]
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "filesystem-mcp": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "<path>"
      ],
      "enabled": true
    }
  }
}
```

</details>

## reasoning

### Sequential Thinking

**A scratchpad tool for multi-step reasoning with revision.**  
[modelcontextprotocol/servers/tree/main/src/sequentialthinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) · MIT

Use for planning or diagnosis where the agent would otherwise rush. It is not a substitute for reading the code; it is a place to keep the plan visible and revisable.

```bash
npx -y @modelcontextprotocol/server-sequential-thinking
```

<details><summary>Config for five clients</summary>

**Claude Code** — `claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking`, or `.mcp.json`:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y","@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y","@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**Codex** — `~/.codex/config.toml`:

```toml
[mcp_servers.sequential-thinking]
command = "npx"
args = ["-y","@modelcontextprotocol/server-sequential-thinking"]
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y","@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**OpenCode** — `opencode.json`:

```json
{
  "mcp": {
    "sequential-thinking": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ],
      "enabled": true
    }
  }
}
```

</details>

---

## Adding a tool

1. Confirm the server exists, is maintained, and has a license.
2. Add it to `registry/tools.json` with a real use case and a working install command.
3. Run `node scripts/build-tools-doc.js` and commit both files.
