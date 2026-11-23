# File and record shapes

All files live under the brain folder, default `.agent-brain/`. JSON Lines files hold one JSON
object per line and end with a newline.

## brain.json

```json
{
  "version": 1,
  "device": "Akshats-MacBook-Pro.local",
  "project": "all-ai",
  "createdAt": "2026-11-22T10:00:00.000Z",
  "thresholds": {
    "minEvidence": 2,
    "minSessionsForPromotion": 3,
    "minScoreDelta": 3
  },
  "capture": {
    "storeSnippets": true,
    "maxSnippet": 200
  }
}
```

`init` writes this file once and keeps an existing copy. Every threshold is optional and falls back
to the default above.

## sessions.jsonl

```json
{
  "id": "ses_1a2b3c4d5e6f",
  "file": "session-2026-11-20.json",
  "agent": "opencode",
  "startedAt": "2026-11-20T09:12:00.000Z",
  "endedAt": "2026-11-20T09:40:00.000Z",
  "collectedAt": "2026-11-20T10:00:00.000Z",
  "task": "Fix the failing price rounding test in checkout.ts.",
  "metrics": {
    "score": 94,
    "steps": 12,
    "errors": 1,
    "duplicates": 0,
    "corrections": 0,
    "verifies": 2,
    "files": 2,
    "looksLikeCode": true
  },
  "signals": [
    {
      "key": "unverified_work",
      "severity": "high",
      "evidence": "Fix the failing price rounding test: no verification command"
    }
  ]
}
```

`id` is a hash of the file name, size, task, and event count. It is stable for the same input and
lets `collect` skip records it already has. `collectedAt` is when the brain ingested the record and
is the timestamp `verify` uses to split before and after an edit.

## lessons.jsonl

```json
{
  "id": "lsn_0f1e2d3c4b5a",
  "key": "unverified_work",
  "statement": "When a coding task looks done, run the repository's own verification command and quote the result before claiming completion.",
  "target": "AGENTS.md",
  "severity": "high",
  "count": 3,
  "sessions": ["ses_1a2b3c4d5e6f", "ses_2b3c4d5e6f70", "ses_3c4d5e6f7081"],
  "evidence": [
    { "date": "2026-11-20", "text": "Update invoice layout: no verification command" }
  ],
  "status": "candidate",
  "confidence": "high",
  "firstSeen": "2026-11-18T12:00:00.000Z",
  "lastSeen": "2026-11-20T09:40:00.000Z"
}
```

`status` is one of `candidate`, `applied`, `promoted`, or `reverted`.

## experiments.jsonl

```json
{
  "id": "exp_9f8e7d6c5b4a",
  "lessonId": "lsn_0f1e2d3c4b5a",
  "lessonKey": "unverified_work",
  "statement": "When a coding task looks done, run the repository's own verification command and quote the result before claiming completion.",
  "target": ".agent-brain/playbook.md",
  "targetPath": "/project/.agent-brain/playbook.md",
  "rule": "- When a coding task looks done, run the verification command and quote the result.",
  "rationale": "3 sessions show unverified_work.",
  "evidence": [
    { "date": "2026-11-20", "text": "Update invoice layout: no verification command" }
  ],
  "status": "open",
  "createdAt": "2026-11-22T10:00:00.000Z",
  "appliedAt": null,
  "backup": null,
  "result": null
}
```

After `apply` and `verify`, extra fields are added: `appliedAt`, `backup`, `verifiedAt`,
`afterSessions`, and `delta`. `status` moves through `open`, `applied`, `promoted`, or `reverted`.
`result` records the verification outcome, such as `kept`, `inconclusive`, `no-improvement`, or
`reverted`.

## Proposal markdown

`proposals/<id>.md` is written for a person to review. It contains:

- The target file.
- The exact markdown to add, inside the managed block.
- Why the change is proposed and the evidence lines.
- The apply command and the revert command.

Editing the proposal text does not change what `apply` writes. To change the rule, edit the lesson
or the experiment record, or apply a corrected proposal.

## Managed block

Instruction files carry exactly one managed block:

```markdown
<!-- agent-brain:start -->
- Learned rule one.
- Learned rule two.
<!-- agent-brain:end -->
```

`apply` inserts or rewrites only the text between the markers. Everything above and below the block
is preserved byte for byte. A file without a block gets one appended under a `## Learned rules`
heading.
