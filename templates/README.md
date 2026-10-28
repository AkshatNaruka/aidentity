# Project Templates

Pre-configured templates for common tech stacks with AI agent support.

## Available Templates

| Template | Stack | Features |
|----------|-------|----------|
| `nextjs/` | Next.js | App Router, TypeScript, Tailwind |
| `react/` | React | Vite, TypeScript, Tailwind |
| `vue/` | Vue.js | Vite, TypeScript, Tailwind |
| `nodejs/` | Node.js | Express, TypeScript |
| `python/` | Python | Poetry, pytest, ruff |
| `rust/` | Rust | Cargo, clippy, rustfmt |
| `go/` | Go | Go modules, golangci-lint |

## Usage

```bash
# Copy a template to your project
cp -r templates/nextjs/* /path/to/your-project/

# Or use as a starting point
npx create-next-app my-app --template templates/nextjs
```

## Each Template Includes

- `opencode.json` - OpenCode configuration
- `.opencode/` - Agent and prompt configurations
- Project-specific config files
- README with setup instructions

## Customization

1. Update project name and description
2. Modify agents in `.opencode/agents/`
3. Add prompts to `.opencode/prompts/`
4. Configure routing in `opencode.json`
5. Add MCP servers as needed

## Creating New Templates

To add a new template:

1. Create directory `templates/<stack-name>/`
2. Add project configuration files
3. Include `opencode.json` with routing config
4. Add `.opencode/` with agents and prompts
5. Create `README.md` with setup instructions
6. Submit PR

## License

MIT
