---
description: Review a diff for correctness, standards and risk
argument-hint: [ref or branch, default HEAD]
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git show:*)
---

Review the changes since `$ARGUMENTS` (default: the merge-base with the default branch).

Do not edit files. Review in two passes and report them separately:

**Pass 1 — Spec.** Does the change do what it claims? Look for missing cases, silent scope changes, and tests that assert the implementation rather than the behaviour.

**Pass 2 — Standards.** Does it match this repository's conventions? Check naming, error handling, module boundaries, and whether the diff duplicates something that already exists.

For every finding, give:

- severity: `blocker` / `should-fix` / `nit`
- file and line
- what is wrong
- the smallest fix

End with one of: **approve**, **approve with comments**, **request changes**. Do not pad the review with praise.
