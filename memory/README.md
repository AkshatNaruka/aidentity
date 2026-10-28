# Memory

Memory is a file, not a database, until it has to be one. Start with a document the agent reads and updates.

| Path | What it is |
|---|---|
| [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md) | Minimal template: decisions, constraints, open questions |
| [`patterns/`](patterns/) | Integration patterns: Mem0, retrieval, usage |
| [`skills/`](skills/) | 10 memory skills (remember, search, forget, triage, dream) |
| [`MEM0-README.md`](MEM0-README.md) | Upstream Mem0 README, kept for reference. **Not agent instructions.** |

## Start here

```bash
cp memory/PROJECT_MEMORY.md ./PROJECT_MEMORY.md
```

Then add one line to your agent config:

```markdown
Before planning, read PROJECT_MEMORY.md. After a decision is made, update it.
```

## Rules

1. **One file, one purpose.** Decisions in `PROJECT_MEMORY.md`; architecture in ADRs; task state in the issue tracker.
2. **Write the why, not the what.** The code already says what.
3. **Date every entry.** Undated memory becomes folklore.
4. **Delete aggressively.** A memory file that only grows is a liability.
5. **Never store secrets or customer data.**

## When you outgrow the file

Move to [`patterns/mem0-integration.md`](patterns/mem0-integration.md) or a vector store only when retrieval across thousands of items is the actual problem. Most projects never get there.
