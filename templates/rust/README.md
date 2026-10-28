# Rust Template

Pre-configured template for Rust projects with AI agent support.

## Files Included

- `opencode.json` - OpenCode configuration
- `.opencode/` - Agent and prompt configurations
- `Cargo.toml` - Dependencies

## Setup

```bash
# Copy template to your project
cp -r templates/rust/* /path/to/your-project/

# Build project
cd /path/to/your-project/
cargo build
```

## Features

- Cargo configuration
- Clippy linting
- Rustfmt formatting
- Testing setup
- AI agent integration

## Customization

1. Update `Cargo.toml` with your project name
2. Modify `.opencode/agents/` for custom agents
3. Add prompts to `.opencode/prompts/`
4. Configure routing in `opencode.json`

## License

MIT
