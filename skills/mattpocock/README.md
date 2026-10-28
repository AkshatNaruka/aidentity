# mattpocock/skills

**Stars**: 242K+ | **Source**: https://github.com/mattpocock/skills

Skills for real engineers. Production-grade engineering workflow skills focused on fundamentals, not vibe coding.

## What Was Imported

37 SKILL.md files across 4 categories:
- **Engineering** (21 skills): TDD, code review, debugging, architecture, wayfinding
- **Productivity** (10 skills): Grill-me, handoff, wait-what, teach
- **In-Progress** (6 skills): Experimental skills
- **Misc** (4 skills): Pre-commit, git guardrails, scaffolding

## Key Skills

### Engineering
- `/grill-me` - Relentless interview about plans/designs before building
- `/grill-with-docs` - Grilling + builds domain model, CONTEXT.md, and ADRs
- `/tdd` - Test-driven development with red-green-refactor loop
- `/diagnosing-bugs` - Disciplined diagnosis loop for hard bugs
- `/code-review` - Two-axis review: Standards + Spec (parallel sub-agents)
- `/to-spec` - Turn conversation into spec and publish to issue tracker
- `/to-tickets` - Break plans into tracer-bullet tickets
- `/implement` - Build work from spec/tickets driving TDD
- `/improve-codebase-architecture` - Scan codebase for deepening opportunities
- `/wayfinder` - Plan huge work as shared map of decision tickets

### Productivity
- `/grill-me` - Get relentlessly interviewed about a plan or design
- `/handoff` - Compact conversation for another agent to continue
- `/wait-what` - Re-pitches messages when they don't land
- `/teach` - Teach user a new skill or concept

## Philosophy

1. Fix misalignment with grilling sessions
2. Shared language (CONTEXT.md) reduces verbosity
3. Red-green-refactor for feedback loops
4. Care about code design to prevent ball-of-mud

## Installation

```bash
# Via Claude Code plugin (managed, auto-updates)
claude plugins install mattpocock-skills

# Or via skills CLI (editable files)
npx skills@latest add mattpocock/skills
```

## License

MIT
