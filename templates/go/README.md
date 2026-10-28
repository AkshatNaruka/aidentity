# Go Template

Pre-configured template for Go projects with AI agent support.

## Files Included

- `opencode.json` - OpenCode configuration
- `.opencode/` - Agent and prompt configurations
- `go.mod` - Dependencies

## Setup

```bash
# Copy template to your project
cp -r templates/go/* /path/to/your-project/

# Build project
cd /path/to/your-project/
go build ./...
```

## Features

- Go modules configuration
- golangci-lint setup
- Testing setup
- AI agent integration

## Customization

1. Update `go.mod` with your module name
2. Modify `.opencode/agents/` for custom agents
3. Add prompts to `.opencode/prompts/`
4. Configure routing in `opencode.json`

## License

MIT
