# Local Setup Guide

## Prerequisites

1. **OpenCode CLI** - Install from [opencode.ai](https://opencode.ai)
2. **Node.js** - v18+ for MCP servers
3. **Rust** - For Rust projects (optional)
4. **Supabase CLI** - For database work (optional)

## Quick Setup

### 1. Clone This Repo

```bash
git clone https://github.com/AkshatNaruka/all-ai.git
cd all-ai
```

### 2. Copy Configs to Your Project

```bash
# For a new project
cp routing/free-tier/barkcli.json /path/to/your-project/opencode.json
cp -r agents/free-models/ /path/to/your-project/.opencode/agents/

# Or use a template
cp -r templates/nextjs/ /path/to/your-project/
```

### 3. Customize

Edit `opencode.json` to match your project's needs.

## Global Config

Location: `~/.config/opencode/opencode.json`

```json
{
  "mcp": {
    "supabase": {
      "type": "local",
      "command": ["npx", "-y", "@supabase/mcp-server@latest", "--access-token", "<token>"]
    }
  }
}
```

## Project Config

Location: `./opencode.json` (in project root)

See `routing/free-tier/barkcli.json` for an example.

## Agent Structure

```
.opencode/
├── agents/
│   ├── free-router.md      # Routes tasks to appropriate model
│   ├── free-fast.md        # Simple tasks (0-2 complexity)
│   ├── free-implementer.md # Moderate tasks (3-5)
│   ├── free-complex.md     # Complex tasks (6-8)
│   ├── free-expert.md      # Expert tasks (9-10)
│   ├── free-reviewer.md    # Code review
│   └── free-tester.md      # Write tests
└── FREE-MODEL-ROUTING.md   # Routing documentation
```

## Model Selection

| Complexity | Model | Use Case |
|------------|-------|----------|
| 0-2 | Muse Spark 1.2 Free | Typos, formatting |
| 3-5 | Nemotron 3.5 Lightning Free | Refactor, simple features |
| 6-8 | MiMo V2.5 Free | New components, multi-file |
| 9-10 | Nemotron 3 Ultra Free | Major refactoring, algorithms |

## Import Your Work Back to All-AI

Your project created something useful (custom `opencode.json` agents, a `SKILL.md`, a prompt)? Contribute it back in one line — point any opencode agent at the hosted instructions:

```
Fetch https://raw.githubusercontent.com/AkshatNaruka/all-ai/main/opencode/INSTRUCTIONS.md and follow it.
Import my ./opencode.json agents into all-ai with slug "my-agents".
```

More examples in [`docs/opencode.md`](opencode.md) and the canonical `opencode/INSTRUCTIONS.md` (`https://raw.githubusercontent.com/AkshatNaruka/all-ai/main/opencode/INSTRUCTIONS.md`).

## Best Practices

1. **Start Simple**: Let the router choose the model
2. **One Call Default**: Don't over-orchestrate
3. **Escalate Only on Failure**: If a model fails, then escalate
4. **Monitor Logs**: Check routing decisions in OpenCode logs
5. **Keep Prompts Tested**: Only use prompts that work

## Troubleshooting

### Model Not Found
- Check model ID in `opencode.json`
- Verify model exists in OpenCode's model list
- Ensure you have access to the model

### Routing Not Working
- Check agent definitions in `.opencode/agents/`
- Verify `agents.primary` is set correctly
- Check OpenCode logs for errors

### MCP Server Issues
- Ensure MCP server is running
- Check API keys are valid
- Verify network connectivity
