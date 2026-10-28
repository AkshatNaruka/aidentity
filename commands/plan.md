---
description: Produce an implementation plan before touching code
argument-hint: <task or feature>
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git log:*), Bash(ls:*)
---

Plan the following task: $ARGUMENTS

Do not edit files. Produce a plan that another agent could execute:

1. **Current state** — what exists today, with file paths and line references.
2. **Change** — the smallest set of edits that solves it. Name every file.
3. **Order** — steps in dependency order. Each step should be independently reviewable.
4. **Tests** — what proves each step works. Prefer one failing test before the fix.
5. **Risks** — what could break, what is ambiguous, what you would ask a human.
6. **Out of scope** — what you are deliberately not doing.

If the task is underspecified, list the questions first and stop. Do not invent requirements.
