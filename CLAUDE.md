# All AI

Self-dependent repository of AI agent resources: skills, prompts, agents, memory systems, and tools.

## Repository Structure

```
all-ai/
├── skills/                  # Importable SKILL.md files
│   ├── mattpocock/         # Engineering workflow skills
│   ├── obra-superpowers/   # Development best practices
│   ├── addyosmani/         # Production-grade skills
│   ├── anthropic-official/ # Official document/creative skills
│   ├── google-cloud/       # Google Cloud skills
│   ├── microsoft-azure/    # Azure/Foundry skills
│   ├── archify/            # Architecture diagrams
│   └── repo-scanner/       # Auto-discovery skill
├── prompts/                 # Consolidated prompt templates
│   ├── system/             # System prompts
│   ├── routing/            # Model routing prompts
│   ├── domain/             # Domain-specific prompts
│   └── imported/           # Imported prompts by category
├── agents/                  # Agent definitions (.md)
│   ├── free-models/        # Free model agents
│   └── imported/           # Imported agent definitions
├── memory/                  # Memory systems
│   ├── skills/             # Memory-related skills
│   ├── patterns/           # Architecture patterns
│   └── configs/            # Configuration examples
├── references/              # Documentation & sources
├── templates/               # Project templates
├── routing/                 # Model routing configs
├── supabase-mcp/           # Supabase MCP configs
├── scripts/                 # Automation scripts
│   └── scan-repos.js       # GitHub scanner
├── .github/workflows/       # GitHub Actions
│   └── weekly-scan.yml     # Automated weekly scan
└── docs/                    # Documentation
```

## Working with This Repo

### Importing Content

When importing from external repos:
1. Create folder: `skills/<source-name>/`
2. Add `README.md` with source attribution
3. Copy SKILL.md files maintaining structure
4. For large files (>1MB), ensure Git LFS tracking

### Creating Skills

Follow the SKILL.md standard:
```markdown
---
name: skill-name
description: What the skill does. Use when [trigger condition].
---

# Skill Name

## When to Use
- [Trigger 1]
- [Trigger 2]

## Steps
1. [Step 1]
2. [Step 2]

## Examples
[Input/Output examples]
```

### Auto-Discovery

Use the repo-scanner skill or run:
```bash
node scripts/scan-repos.js
```

Results go to `scan-results/` directory. Create PR for review.

## Key Commands

| Command | Description |
|---------|-------------|
| `/scan` | Run full GitHub scan for new resources |
| `/import <repo>` | Import specific GitHub repository |
| `/update-check` | Check for updates to imported content |
| `/list-skills` | List all available skills |

## Quality Standards

- Minimum 1000 stars for new repos
- Active maintenance (updated within 6 months)
- Clear documentation
- Compatible with SKILL.md standard
- Source attribution required

## Git LFS

Large files tracked via Git LFS:
- `*.html` - Interactive diagrams, demos
- `*.png` - Exports, share cards
- `*.svg` - Vector diagrams
- `*.webm` - Video exports
- `*.zip` - Skill bundles
