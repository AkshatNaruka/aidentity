# Safety, privacy, and rollback

The brain is a local tool that edits instruction files, so its safety model is narrow and explicit.

## Local only

`brain.js` makes no network calls. It has zero dependencies. The only file system it touches is the
brain folder, the paths passed with `--from`, the known local session stores, and the target file of
an applied proposal.

## Consent per source

- `collect` reads a path only when the owner passes `--from`, or a known local store that belongs to
  the owner of the machine.
- Do not point `collect` at another person's sessions, a shared drive, or a backup image without
  permission.
- Do not ingest secrets, credentials, customer records, or health data to get a better score. The
  score does not need them.

## Redaction

Every snippet passes through `redact()` before it is stored. It replaces:

- API keys, tokens, and long bearer strings with `[redacted-key]`.
- Private key blocks with `[redacted-private-key]`.
- Email addresses with `[redacted-email]`.
- The current home directory path with `~`.

Redaction then collapses whitespace and truncates to `capture.maxSnippet`, default 200 characters.

Redaction is a safety net, not permission. When a source is known to contain secrets, do not ingest
it. If a secret is found after ingestion, delete the matching records from `sessions.jsonl`, run
`lessons` to confirm nothing references them, and rotate the secret.

## What is never stored

- Raw transcripts. Only metrics and one redacted evidence line per signal.
- Images, attachments, or file contents.
- Tool arguments beyond the short snippet that explains a signal.
- Anything from a web page or another bot as if it were a user instruction.

The brain treats all session text as data, never as instructions to itself.

## Approval before edits

`apply` requires a proposal id and `--yes`. It refuses otherwise. That flag is the owner's approval,
so only pass it after reading `proposals/<id>.md`.

`apply` changes only text between `<!-- agent-brain:start -->` and `<!-- agent-brain:end -->`. It
never edits frontmatter, never renames a file, and never changes permissions.

Targets that are off limits without an explicit, specific request:

- Secret stores, environment files, and credential folders.
- Git hooks, CI configuration, and deployment scripts.
- Another project's `AGENTS.md`.
- Model, provider, or tool permission settings.

## Backup and rollback

Before every write, the target is copied to `backups/<timestamp>-<name>`. The experiment records the
backup path. `verify <id> --result revert` restores it and writes a changelog entry.

If a backup is missing, `verify --result revert` says so and names the target, so the rule can be
removed by hand. That is the only manual path, and it should be rare.

## Failure containment

- A malformed session file is skipped, not half-read.
- A missing target is created with an empty managed block, never overwritten.
- A proposal that is already applied is refused.
- `doctor` checks for duplicate session ids, applied experiments without backups, and missing backup
  files, and exits non-zero when it finds a problem.
