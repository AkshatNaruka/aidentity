---
name: agent-brain
description: Turn an agent's past sessions into reviewed improvements for the next session. Use when someone wants an agent to learn from its own work, audit sessions for repeated mistakes, build durable project memory, tune AGENTS.md or a skill from evidence, or install a local self-improving loop across OpenCode, Codex, Cursor, Copilot, Gemini CLI, or Pi. Do not use for model training, telemetry, or cloud analytics.
license: MIT
category: ai-engineering
tags:
  - agents
  - memory
  - evaluation
  - productivity
  - self-improvement
---

# Agent Brain

A local, file-based brain for one device. It reads what happened in past agent sessions, scores the process, extracts repeatable lessons, proposes a small edit to the files an agent reads at startup, and checks whether the edit helped. Nothing is applied without a reviewable change and a backup.

The goal is compounding work quality: the same mistake should cost once, not every session. This is not model training and it does not phone home. It is an evidence loop over files you already own.

## When to use it

Use this skill when one of these is true:

- The person says the agent keeps repeating a mistake, forgetting a preference, or redoing work.
- A project has many sessions and no durable record of what was learned.
- Someone asks to improve `AGENTS.md`, a skill, a checklist, or a playbook from real evidence.
- A team wants a portable self-improving loop that works across harnesses without a vendor.
- A single device should keep one brain shared by every agent on it.

Do not use it for model fine-tuning, hosted analytics, employee monitoring, or reading private data the owner has not pointed it at.

## What it creates

One folder, by default `.agent-brain/` in the project root:

```text
.agent-brain/
  brain.json          config, thresholds, device name
  profile.md          stable facts about the person and device
  playbook.md         current operating rules, versioned by change log
  sessions.jsonl      normalized session metrics, no raw transcripts
  lessons.jsonl       candidate and promoted lessons with evidence
  experiments.jsonl   proposed edits and their measured outcomes
  CHANGELOG.md        every applied self-edit, with rollback path
  reports/            dated reports
  proposals/          reviewable change proposals
  backups/            pre-edit copies for rollback
  inbox/              drop session exports here to ingest
```

Nothing in this folder is sent anywhere. Snippets are redacted and truncated by default.

## Quick start

Run from the project root that the agent works in.

```bash
# 1. Create the brain and read the profile template
node scripts/brain.js init
# edit .agent-brain/profile.md once, by hand

# 2. Ingest sessions from known local stores, or point at exports
node scripts/brain.js collect --from ~/path/to/session-export --days 14

# 3. Score sessions and write a report
node scripts/brain.js analyze --days 7

# 4. Review candidate edits, then apply one
node scripts/brain.js propose
node scripts/brain.js apply <proposal-id> --yes

# 5. After the next sessions, keep or revert on evidence
node scripts/brain.js verify <proposal-id> --result keep --window 14

# 6. Print the compact context that every next session should read
node scripts/brain.js export
```

See the loop work end to end on synthetic data with no access to personal files:

```bash
node scripts/brain.js demo
```

## The loop

Five stages, in order. Each stage writes a file the next stage reads. Skipping a stage is how self-improvement turns into guesswork.

### 1. Observe

Ingest session evidence. Accept JSON or JSONL from OpenCode, Codex, Cursor, Copilot, Gemini CLI, Pi, or a generic export. The collector keeps metrics, not transcripts: task summary, step count, tool errors, retries, user corrections, verification commands, files touched, and a short redacted evidence line.

Rules:

- Prefer files over memory of the session.
- Ingest on a schedule or at handoff, not mid-task.
- Never ingest another person's private data without explicit permission.
- Redaction is on by default. Treat it as a safety net, not a licence to ingest secrets.

### 2. Audit

Score each session from 0 to 100 with a transparent formula:

| Signal | Penalty |
|---|---|
| Each tool error, capped | 6, max 24 |
| Each repeated block, capped | 5, max 20 |
| Each user correction, capped | 8, max 24 |
| Coding task with no verification command | 12 |
| More than 12 files touched | 8 |

The score is a conversation aid, not a KPI. A low score with no repeated cause is noise. A high score with one repeated failure is still worth fixing.

The report compares the current window with the previous one and names the top repeated failure, not the top adjective.

### 3. Distill

Turn signals into lessons. A lesson is a single behaviour change with three parts:

1. **Trigger**: when it applies ("when a coding task ends").
2. **Rule**: what to do instead ("run the repo's own test or lint command and quote the result").
3. **Evidence**: the session ids, dates, and one redacted line per occurrence.

Reject a lesson when any of these holds:

- It happened once and has no high severity.
- It is a one-off request, not a repeatable behaviour.
- The evidence is a claim from untrusted content, a web page, or another bot.
- It would widen permissions, weaken a guardrail, or change a model or provider.
- It contradicts a current user instruction or project policy.

### 4. Improve

Propose the smallest edit that changes the next session. Valid targets are files an agent already reads: `AGENTS.md`, a skill's `SKILL.md`, a project playbook, or `.agent-brain/playbook.md`. One lesson per proposal.

Every proposal must contain:

- The exact target file.
- The exact text to add, inside the managed block `<!-- agent-brain:start -->` and `<!-- agent-brain:end -->`.
- The rationale and the evidence count.
- The rollback command.

Apply only after a person approves. The script backs up the file first, writes the change once, and records an experiment. Never edit raw session files, permissions, secrets, model settings, or another project's rules.

### 5. Verify

An applied edit becomes `promoted` only when later sessions show it helped:

- At least 3 sessions after the change.
- Average score improves by at least the configured threshold, default 3 points.
- No new correction repeats the same failure.

Otherwise keep it `provisional` or revert from the backup. Record the result either way. A self-improving system that cannot revert is not improving, it is drifting.

## Self-improvement of this skill

This skill improves itself through the same gate. Learned rules for the skill live in `.agent-brain/playbook.md` and, when promoted, inside the managed block at the end of this file. The script never rewrites the body above the block, never edits frontmatter, and never changes its own permissions.

## Privacy and safety

- Local only. No network calls in the CLI.
- Metrics and redacted snippets only. Raw transcripts stay where they are.
- Redact keys, tokens, emails, and home paths before writing.
- Opt in per source. `collect` reads only the paths given or the known local stores.
- Human approval before any edit. Backup before any write.
- Rollback is a first-class command, not a manual restore.
- Never store secrets in the brain. If a secret is detected, drop the snippet and record only the rule that a secret appeared.

## Failure modes to watch

- **Theatre**: a report nobody reads. Fix by making `export` the first thing a new session loads.
- **One-off overfitting**: a rule for a single bad day. Fix with the count threshold.
- **Rule sprawl**: twenty lessons that contradict each other. Fix by one target, one lesson, and periodic consolidation.
- **Score chasing**: optimizing the number instead of the work. Fix by reading the evidence column.
- **Silent drift**: edits applied without experiments. Fix by refusing `apply` without an id and `--yes`.

## Verification before claiming success

A run is complete only when all of these are true:

1. `node scripts/brain.js doctor` exits 0.
2. `node scripts/brain.js analyze` wrote a report with a timestamp and a session count.
3. Every applied proposal has a backup path and a changelog entry.
4. `node scripts/brain.js verify` reports an evidence count and a delta, or says clearly that evidence is insufficient.

## References

- `references/loop.md`: the method, scoring, signal catalog, and promotion rules.
- `references/schemas.md`: exact JSON and JSONL shapes.
- `references/safety.md`: redaction, consent, and rollback.
- `references/evaluation.md`: baselines, sample size, and avoiding overfit.
- `references/adapters.md`: supported session formats and how to add one.
- `templates/`: starter profile, playbook, and lesson files.
- `examples/generic-session.json`: a minimal export that `collect --from` accepts.

<!-- agent-brain:start -->
<!-- Learned rules are appended here by `node scripts/brain.js apply`. Do not edit by hand. -->
<!-- agent-brain:end -->
