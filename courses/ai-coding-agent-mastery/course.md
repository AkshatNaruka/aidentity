---
type: Course
title: "AI Coding Agent Mastery: Spec, TDD & Verification"
description: "Learn how to turn Claude Code, Cursor, Codex, and Gemini CLI into disciplined engineering partners using spec-driven development, red-green-refactor TDD, git worktrees, and automated code review."
level: "Intermediate to Advanced"
audience: "Software engineers, tech leads, and staff architects"
resource: https://akshatnaruka.github.io/aidentity/courses/ai-coding-agent-mastery/
timestamp: 2026-11-16
---

# AI Coding Agent Mastery: Spec, TDD & Verification

Learn how to turn Claude Code, Cursor, Codex, and Gemini CLI into disciplined engineering partners using spec-driven development, red-green-refactor TDD, git worktrees, and automated code review.

**Level:** Intermediate to Advanced · **Target Audience:** Software engineers, tech leads, and staff architects · **Skills Included:** 9

## 1. Quick Setup Command

```bash
npx aidentity setup software-engineer --profile individual
```

## 2. Learning Outcomes

- Turn ambiguous feature requests into verifiable technical specifications before writing code.
- Enforce strict red-green-refactor TDD loops so agents verify every change against real tests.
- Run parallel agent workstreams safely using isolated git worktrees and review gates.

## 3. Curriculum Modules & Verified Skills

### Module 1: Spec-Driven Development & Grilling

- **grill-with-docs** (`mattpocock/engineering/grill-with-docs`, undefined): A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
- **to-spec** (`mattpocock/engineering/to-spec`, undefined): Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed.
- **planning-and-task-breakdown** (`addyosmani/planning-and-task-breakdown`, undefined): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.

### Module 2: Test-Driven Agent Workflows

- **tdd** (`mattpocock/engineering/tdd`, undefined): Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
- **systematic-debugging** (`obra-superpowers/systematic-debugging`, undefined): Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
- **debugging-and-error-recovery** (`addyosmani/debugging-and-error-recovery`, undefined): Guides systematic root-cause debugging. Use when tests fail, builds break, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need a systematic approach to finding and fixing the root cause rather than guessing.

### Module 3: Architecture, Worktrees & Code Review

- **using-git-worktrees** (`obra-superpowers/using-git-worktrees`, undefined): Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback
- **code-review** (`mattpocock/engineering/code-review`, undefined): Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
- **security-and-hardening** (`addyosmani/security-and-hardening`, undefined): Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.

## 4. Matching Role Playbook

Read the full role blueprint at: https://akshatnaruka.github.io/aidentity/playbooks/software-engineer/
