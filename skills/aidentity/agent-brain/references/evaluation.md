# Evaluation: baselines, sample size, overfitting

The score exists to compare sessions, not to grade a person or an agent. This page explains how to
read it and when not to trust it.

## What the score measures

Process, not outcome. A session can produce correct work and still score low because it skipped
verification, retried three times, or touched twenty files. A session can score high and still be
wrong if the work was trivial.

Read three things together:

1. The score.
2. The signal that fired.
3. The evidence line.

If the evidence line is vague, the lesson is not ready.

## Baseline

`analyze` compares the current window with the previous window of the same length. Use the same
`--days` when comparing across weeks, or the baseline shifts.

For a stable baseline:

- Collect at least 5 sessions per window.
- Keep the same agent mix in both windows.
- Do not change the scoring formula between windows without noting it.

## Sample size for promotion

Default: 3 post-change sessions and 1 baseline session. That is enough to catch a regression, not
enough to prove a small gain.

Raise `minSessionsForPromotion` for high-impact edits, such as a rule that changes how the agent
starts every task. A professional default is 5 to 10 sessions.

Lower it only for a single-owner device where sessions are expensive and the rule is narrow.

## Overfitting

The common failure is a rule that fits one bad day. Defences:

- Require at least 2 sessions before a proposal, and 3 for a low severity lesson.
- Prefer rules that name a trigger and a concrete action.
- Reject rules that quote one user sentence with no pattern across sessions.
- Consolidate rules after each promotion instead of adding a new one every week.
- Revert when the delta is negative or flat after enough evidence.

## Noise

- A single session with many errors can dominate a small window.
- Tool error counts include harmless probe failures, so read the evidence.
- Corrections are detected by phrase, so a polite "no, that is fine" can count. Spot check.
- Duplicate detection uses text, so copy-pasted boilerplate can look like a retry loop.

## Reporting honestly

A verification run is complete when it prints an evidence count and either a delta or a clear
statement that evidence is insufficient. Do not describe an applied rule as proven before that.

Use these words consistently:

- **candidate**: observed, not applied.
- **applied**: in the playbook, not yet measured.
- **promoted**: measured improvement above the threshold.
- **reverted**: removed because it did not help or caused harm.

## Demo as a fixture

`node scripts/brain.js demo` runs the whole loop in a temporary folder with synthetic sessions. Use
it to check that a change to the script still collects, analyzes, proposes, applies, verifies, and
exports. It does not read personal files.
