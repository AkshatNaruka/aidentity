# Prompts

Curated and consolidated prompt templates for AI agents.

## Structure

```
prompts/
├── system/          # System prompts for different roles
├── routing/         # Model routing prompts
├── domain/          # Domain-specific prompts
│   ├── coding.md    # Code review, debugging, refactoring
│   ├── analysis.md  # Data, document, market analysis
│   ├── writing.md   # Documentation, emails, blog posts
│   ├── research.md  # Technology, trends, best practices
│   └── creative.md  # Content, storytelling, brainstorming
├── imported/        # Imported from external sources
│   └── fabric-patterns/    # 256 patterns from danielmiessler/fabric
```

## Usage

### Quick Start

```bash
# Use a coding prompt
cat prompts/domain/coding.md | grep -A 10 "Code Review"

# Use a Fabric pattern
cat prompts/imported/fabric-patterns/extract_wisdom/system.md
```

### For AI Agents

Copy the relevant prompt section to your agent configuration:

```markdown
# In your agent config
system_prompt: |
  {{PASTE FROM prompts/domain/coding.md}}
```

## Categories

### Domain Prompts

| File | Purpose |
|------|---------|
| `coding.md` | Code review, debugging, refactoring, testing |
| `analysis.md` | Data analysis, document review, risk assessment |
| `writing.md` | Documentation, emails, blog posts, guides |
| `research.md` | Technology research, trends, best practices |
| `creative.md` | Content creation, storytelling, brainstorming |

### Imported Prompts

| Source | Count | Focus |
|--------|-------|-------|
| f/prompts.chat | 160+ | Role-playing, creative, technical |
| danielmiessler/fabric | 256 | Analysis, writing, research patterns |

## Contributing

To add new prompts:

1. Choose the appropriate category
2. Follow the existing format
3. Include clear instructions
4. Add examples where helpful
5. Test with AI agents
6. Submit PR

## License

| Path | License | Origin |
|---|---|---|
| `domain/` | MIT | Original to this repository |
| `imported/fabric-patterns/` | MIT | [danielmiessler/fabric](https://github.com/danielmiessler/fabric) |

The Fabric patterns are redistributed under the MIT license; keep the upstream attribution if you copy them elsewhere.
