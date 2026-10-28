# Imported Agents — barkcli-generic

> **Source:** `barkcli/opencode.json (local generic expansion for mvp/research/brainstorm)`  
> **Hosted instructions:** https://akshatnaruka.github.io/all-ai/opencode/ (alias: https://akshatnaruka.github.io/all-ai/opencode-r6ljrdgj/)  
> **Slug:** `barkcli-generic`  
> **Imported at:** 2026-09-03T10:25:19Z  
> **Origin project:** `barkcli` (git-like Kanban board tool) — `barkcli/opencode.json` generic expansion for MVP/research/brainstorm  

## Overview
Generic, FREE-model-only agent set for end-to-end product workflow: routing → explore/research → brainstorm → plan → mvp/builder → review/critique → docs/tester.

Keeps original 7 FREE agents and adds 9 generic workflow agents (`mvp`, `research`, `brainstorm`, `explore`, `plan`, `docs`, `builder`, `product`, `critique`).

## Agents in this import (16 total)

| Agent | Model | Temp | Purpose |
|-------|-------|------|---------|
| `free-router` | `opencode/mimo-v2.5-free` | `0.3` | Routes tasks to best FREE model by complexity (0-10) |
| `free-fast` | `opencode/muse-spark-1.2-contributor-free` | `0.2` | Simple tasks 0-2: typos, formatting, renaming |
| `free-implementer` | `opencode/nemotron-3.5-lightning-free` | `0.3` | Moderate 3-5: refactor, bug fix, simple feature |
| `free-complex` | `opencode/mimo-v2.5-free` | `0.4` | Complex 6-8: multi-file features, components |
| `free-expert` | `opencode/nemotron-3-ultra-free` | `0.5` | Expert 9-10: major refactoring, algorithms |
| `free-reviewer` | `opencode/mimo-v2.5-free` | `0.2` | Code review for bugs/security/performance |
| `free-tester` | `opencode/nemotron-3.5-lightning-free` | `0.3` | Test writing: unit/integration/edge cases |
| `mvp` | `opencode/mimo-v2.5-free` | `0.4` | MVP builder — slices to must-have, scaffolds lean prototype |
| `research` | `opencode/nemotron-3-ultra-free` | `0.3` | Deep research — codebase exploration, comparison tables, recommendations |
| `brainstorm` | `opencode/mimo-v2.5-free` | `0.8` | Brainstorming — divergent ideation (5-10 directions → top 3) |
| `explore` | `opencode/muse-spark-1.2-contributor-free` | `0.2` | Codebase explorer — read-only mapping, file:line summary |
| `plan` | `opencode/mimo-v2.5-free` | `0.3` | Planning — goal → phased tasks → file changes → risks |
| `docs` | `opencode/nemotron-3.5-lightning-free` | `0.3` | Documentation writer — READMEs, API refs, guides |
| `builder` | `opencode/mimo-v2.5-free` | `0.4` | Generic builder — scaffolds any component/service/CLI |
| `product` | `opencode/nemotron-3-ultra-free` | `0.4` | Product thinker — persona/JTBD/spec/metrics |
| `critique` | `opencode/mimo-v2.5-free` | `0.3` | Critique & refinement — gap analysis with concrete fixes |

## Placement per table

| Content | Destination |
|---------|-------------|
| `opencode.json` agents | `agents/imported/barkcli-generic/*.md` + `routing/contrib/barkcli-generic.json` |
| Raw filtered JSON | `routing/contrib/barkcli-generic.json` |

## How this was imported

```bash
# 1. Expanded barkcli/opencode.json to 16 agents (generic MVP/research/brainstorm set)
# 2. Verified PIN: SHA256(21242627) == 0ed62352e50e418bcf8e3effa941173f34270bc69aa5536baf35685f4d74c5de
# 3. Ran agent workflow per opencode/INSTRUCTIONS.md v1.0.3
git clone --depth 1 https://github.com/AkshatNaruka/all-ai.git /tmp/all-ai-import
git checkout -b import/barkcli-generic-20260903
# cp + generate per-agent MDs → agents/imported/barkcli-generic/
# filtered JSON → routing/contrib/barkcli-generic.json
jq . routing/contrib/barkcli-generic.json
git commit -m "Import: barkcli-generic — opencode.json agents from barkcli"
gh pr create --title "Import: barkcli-generic" --body "Imported via https://akshatnaruka.github.io/all-ai/opencode/ ..."
```

## Verification

```bash
jq . routing/contrib/barkcli-generic.json
jq -e '.agents.all | type == "object"' routing/contrib/barkcli-generic.json
ls agents/imported/barkcli-generic/
```

## Attribution
- Imported from local file `barkcli/opencode.json` (expanded generic version, 16 agents)
- Original FREE tier: `routing/free-tier/barkcli.json` (7 agents) — this import extends it with MVP/research/brainstorm workflow
- Import requested via hosted Pages URL https://akshatnaruka.github.io/all-ai/opencode/
- Date: 2026-09-03T10:25:19Z
