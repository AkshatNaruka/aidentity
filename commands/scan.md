---
description: Scan the working tree for security and quality problems
argument-hint: [path, default .]
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*)
---

Scan `$ARGUMENTS` (default: the repository root). Read-only — do not modify files.

Check, in this order:

1. **Secrets** — committed keys, tokens, `.env` files, credentials in tests or fixtures.
2. **Injection** — shell interpolation, SQL string building, `eval`, unsanitised HTML.
3. **Auth** — missing checks, client-side-only authorisation, permissive CORS.
4. **Dependencies** — unpinned versions, known-vulnerable packages, install scripts.
5. **Data** — logs containing PII, unbounded queries, missing pagination.
6. **Agent surface** — prompts or tool definitions that can be steered by untrusted content.

Report a table: `severity | file:line | issue | fix`. If a category is clean, say so in one line. Do not invent findings to fill the table.
