# Session adapters

The collector is format tolerant. It walks JSON and JSONL, finds message-like nodes, and normalizes
each to `{ role, text, ts }`. A new harness usually needs no code, only a pointer to its export.

## Where sessions are found by default

`collect` without `--from` scans these paths when they exist:

| Agent | Path |
|---|---|
| Codex | `~/.codex/sessions` |
| OpenCode | `~/.local/share/opencode/storage` and `~/.local/share/opencode/project` |
| Cursor | `~/.cursor/projects` |
| Any | `.agent-brain/inbox/` |

Drop an export into `.agent-brain/inbox/` when a tool keeps sessions somewhere else or when the
store is not readable.

## Accepted shapes

A file is JSON if it ends in `.json` and JSONL if it ends in `.jsonl`. Other extensions are parsed as
JSON.

Message-like objects are recognized by any of these:

- A `role`, `sender`, `type`, `kind` field naming user, human, assistant, agent, model, tool,
  function, or system.
- A node of type `message`, `text`, `output`, or `result`.

Text is read from the first of `text`, `content` (string or array), `message`, `output`, or `summary`.
Nested containers named `messages`, `parts`, `payload`, `data`, `item`, `message`, `response`,
`content`, `entries`, `events`, `items`, `info`, `body`, `request`, or `result` are walked
recursively, up to depth 8.

Timestamps are read from `timestamp`, `ts`, `created_at`, or `time`. A missing timestamp falls back
to the file birth time or modification time.

## Minimal generic export

```json
[
  { "role": "user", "content": "Fix the failing rounding test.", "timestamp": "2026-11-20T09:00:00Z" },
  { "role": "assistant", "content": "I will read the test, then run pnpm test.", "timestamp": "2026-11-20T09:00:05Z" },
  { "role": "tool", "content": "$ pnpm test\nAll tests passed (14).", "timestamp": "2026-11-20T09:00:40Z" },
  { "role": "assistant", "content": "Rounding uses integer cents. Tests pass.", "timestamp": "2026-11-20T09:00:45Z" }
]
```

The same content works as one object per line in a `.jsonl` file.

## Adding a harness

1. Find where the tool writes sessions. Prefer its own export command over its live database.
2. Export one session to JSON or JSONL.
3. Run `node scripts/brain.js collect --from <path> --days 30`.
4. Run `node scripts/brain.js analyze --all` and check the report shows a sensible task line, agent,
   score, and verification column.
5. If the task line is empty or the role mix is wrong, reshape the export with `jq` into the minimal
   shape above. Do not patch the script for one vendor unless the shape is common.

## Privacy per adapter

Codex and Cursor stores can include full transcripts, terminal output, and file contents. The
collector stores metrics and one short redacted line per signal, but it still reads the full file
locally. Ingest only your own stores, and never commit the brain folder to a public repository when
it may contain project paths or names.

## Troubleshooting

- **No records collected**: check the file is valid JSON or JSONL, has at least 2 events, and was
  modified inside `--days` (use `--all`).
- **Everything skipped as duplicate**: the session id already exists. Delete its line from
  `sessions.jsonl` only if you intend to replace it.
- **Wrong agent label**: the label comes from the path when a known root matches, otherwise from
  file names and text. Use `--from` with a folder named after the tool.
- **Empty task line**: the first user message was not detected. Flatten the export into the minimal
  shape.
