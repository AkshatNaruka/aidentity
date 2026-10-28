# Project memory

> Copy this file to the project root. Keep it short. Update it when a decision is made, not on a schedule.

## What this is

- One paragraph: what the product does, who uses it, what "done" means.
- Link to the issue tracker, the architecture doc, and the deploy runbook.

## Decisions

Reverse-chronological. Each entry: date, decision, why, what it rules out.

| Date | Decision | Why | Rules out |
|---|---|---|---|
| 2026-01-01 | Example: Postgres for the primary store | Relational data, strong constraints | Document stores for core records |

## Constraints

- Runtime, language versions, hosting, budget, compliance.
- Things that must not change without a migration plan.

## Conventions

- Naming, error shape, test layout, commit style.
- Link to `AGENTS.md` instead of repeating it.

## Open questions

- Question, owner, what would answer it.
- Remove the line when it is answered; move the answer to Decisions.

## Known traps

- Non-obvious behaviours, flaky tests, vendor limits, past incidents.
- One line each, with a link to the issue or commit.
