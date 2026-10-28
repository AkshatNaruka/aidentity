# Free Model Routing System

## Overview
Intelligent routing that assigns tasks to FREE models based on complexity. Never uses paid models.

## Model Hierarchy (Simple → Expert)

| Complexity | Model ID | Use Case |
|------------|----------|----------|
| SIMPLE (0-2) | `opencode/muse-spark-1.2-contributor-free` | Typos, formatting, renaming, comments |
| MODERATE (3-5) | `opencode/nemotron-3.5-lightning-free` | Refactor, simple features, bug fixes, tests |
| COMPLEX (6-8) | `opencode/mimo-v2.5-free` | New components, multi-file features, architecture |
| EXPERT (9-10) | `opencode/nemotron-3-ultra-free` | Major refactoring, complex algorithms, deep debugging |

## Additional Free Models
- `opencode/ling-3.0-flash-fin-free` — Financial domain tasks
- `opencode/hy3-free` — Hybrid reasoning tasks
- `opencode/big-pickle` — Large context tasks (if free tier available)

## How It Works

### 1. Task Analysis
The router agent analyzes:
- Scope of changes (lines/files)
- Technical complexity
- Domain expertise required
- Risk level

### 2. Routing Decision
```
Complexity: X/10
Reason: [one sentence]
ROUTE: <model-id>
```

### 3. Execution
- Default: ONE model call
- Escalate: Only on failure
- Subagent depth: 1 (Router → Worker)

## Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| free-router | mimo-v2.5-free | Analyze and route tasks |
| free-fast | muse-spark-1.2-contributor-free | Simple tasks |
| free-implementer | nemotron-3.5-lightning-free | Moderate tasks |
| free-complex | mimo-v2.5-free | Complex tasks |
| free-expert | nemotron-3-ultra-free | Expert tasks |
| free-reviewer | mimo-v2.5-free | Code review |
| free-tester | nemotron-3.5-lightning-free | Write tests |

## Configuration
See `opencode.json` for full agent definitions.

## Usage
```
# Simple task (auto-routes to Muse Spark)
"Fix the typo in README.md"

# Moderate task (auto-routes to Lightning)
"Refactor the authentication function"

# Complex task (auto-routes to MiMo)
"Add user profile management with CRUD operations"

# Expert task (auto-routes to Nemotron Ultra)
"Optimize the database query performance across the entire system"
```

## Monitoring
Check routing decisions in OpenCode logs to verify correct model selection.

## Cost
$0.00 — All models are FREE tier.
