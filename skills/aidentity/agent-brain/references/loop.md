# The loop in detail

Five stages. Each one writes a file that the next one reads. This page is the method behind the
commands in `SKILL.md`.

## 1. Observe: collect

`collect` reads session files and writes one normalized record per session to `sessions.jsonl`.

Inputs:

- `--from <path>`: a file or folder of JSON or JSONL exports.
- `--days <n>`: only files modified in the window, default 14.
- `--all`: ignore the modification-time window.
- Without `--from`, the known local stores are scanned (see `references/adapters.md`).

Rules:

- One record per source file. A file already in `sessions.jsonl` is skipped.
- Files under 2 events or over 25 MB are skipped.
- Only metrics and short redacted snippets are written. The source file is never modified.
- Ingestion is idempotent: rerunning `collect` does not duplicate records.

## 2. Audit: analyze

`analyze` scores each session from 0 to 100 and writes a dated report to `reports/`.

```text
score = 100 - (
  min(errors * 6, 24)
  + min(repeated_blocks * 5, 20)
  + min(user_corrections * 8, 24)
  + (coding_task_without_verification ? 12 : 0)
  + (files_touched > 12 ? 8 : 0)
)
```

Definitions:

- **error**: a line or event matching an error word, such as error, failed, exception, or a non-zero exit.
- **repeated block**: a block whose normalized text of 30 or more characters appears more than once in the session.
- **user correction**: a user turn that starts with or contains a correction phrase, such as "no", "actually", "I said", "that is wrong", or "use X instead".
- **verification**: a command matching test, lint, typecheck, build, pytest, ruff, mypy, go test, cargo test, swift test, make test, jest, vitest, or playwright.
- **coding task**: any file name is detected, or the text contains a code or build word.
- **files touched**: distinct file-like paths detected in the text, capped by the formula.

The report also compares the current window with the previous window of the same length.
Treat the score as a conversation aid. Read the evidence column before acting on a number.

## 3. Distill: lessons

Signals become lessons. A lesson is one behaviour change with a trigger, a rule, and evidence.

| Key | Severity | Fires when |
|---|---|---|
| `unverified_work` | high | Coding task ended with no verification command |
| `repeated_failure` | high | 4 or more error mentions, or 2 or more repeated blocks |
| `user_correction` | medium | At least one correction phrase in a user turn |
| `retry_loop` | medium | 3 or more repeated blocks in one session |
| `scope_wide` | low | More than 12 distinct files touched |
| `blocked_tool` | medium | A permission or denial phrase in the session |

Lesson confidence is set by how many distinct sessions show it: 1 is low, 2 is medium, and 3 or
more is high. `lessons.jsonl` keeps the count, the session ids, and up to 8 redacted evidence lines.

Reject a lesson when it is a one-off request, untrusted content, a permission change, a model or
provider change, or a contradiction of a current instruction.

## 4. Improve: propose and apply

`propose` turns each eligible lesson into one proposal file in `proposals/` and an entry in
`experiments.jsonl`.

Eligibility:

- The lesson is a candidate with no open or applied experiment.
- Its session count is at least `minEvidence`, default 2.
- A low severity lesson needs one extra session above the minimum.
- `--min <n>` overrides the threshold. `--target <file>` overrides the edit target.

`apply <id> --yes` is the only command that edits an instruction file.

- The target must exist or be created with an empty managed block.
- Only text inside `<!-- agent-brain:start -->` and `<!-- agent-brain:end -->` is changed.
- The file is copied to `backups/` before the write.
- The experiment moves to `applied`, the lesson to `applied`, and `CHANGELOG.md` gets an entry.
- Without `--yes`, `apply` refuses and prints nothing else.

Never point `--target` at a session file, a secret, a permission file, or a file outside the project
without a clear reason.

## 5. Verify: promote or revert

`verify <id> --result keep` compares sessions collected before the edit with sessions collected
after it. The split uses `collectedAt`, the time the brain ingested the record, so synthetic or
back-dated content timestamps do not distort the result.

Promotion needs all of these:

- At least `minSessionsForPromotion` post-change sessions, default 3.
- A baseline of at least one pre-change session.
- An average score delta of at least `minScoreDelta`, default 3 points.

Outcomes:

- `promoted`: the evidence supports the rule.
- `applied` with `inconclusive`: not enough evidence yet, keep collecting.
- `applied` with `no-improvement`: the delta did not reach the threshold, so revert or keep watching.

`verify <id> --result revert` restores the backup, marks the experiment and lesson as reverted, and
writes a changelog entry. Revert is the correct response to a bad rule, not an admission of failure.

`--window <days>` limits post-change evidence to recent sessions, default 14.

## Consolidation

After several promotions, read `playbook.md` and merge overlapping rules. Keep one rule per
behaviour. Delete rules that a later rule makes redundant, then record the consolidation in
`CHANGELOG.md`. Rule sprawl is the main long-term failure mode.
