# Model Routing System

## Overview

Intelligent routing that assigns tasks to models based on complexity. Supports both free and paid tiers.

## Free Tier Models

| Complexity | Model ID | Agent |
|------------|----------|-------|
| 0-2 SIMPLE | `opencode/muse-spark-1.2-contributor-free` | free-fast |
| 3-5 MODERATE | `opencode/nemotron-3.5-lightning-free` | free-implementer |
| 6-8 COMPLEX | `opencode/mimo-v2.5-free` | free-complex |
| 9-10 EXPERT | `opencode/nemotron-3-ultra-free` | free-expert |

## Routing Logic

### 1. Task Analysis
The router agent analyzes:
- Scope of changes (lines/files)
- Technical complexity
- Domain expertise required
- Risk level

### 2. Complexity Assessment
- **SIMPLE (0-2)**: Typos, formatting, renaming, single-line changes
- **MODERATE (3-5)**: Refactor function, simple feature, bug fix, write test
- **COMPLEX (6-8)**: New component, multi-file feature, architectural changes
- **EXPERT (9-10)**: Major refactoring, complex algorithms, cross-system debugging

### 3. Model Selection
Router outputs:
```
Complexity: X/10
Reason: [one sentence]
ROUTE: <model-id>
```

## Configuration

### Basic Config

```json
{
  "agents": {
    "primary": "free-router",
    "all": {
      "free-router": {
        "model": "opencode/mimo-v2.5-free",
        "prompt": "You are a FREE model routing agent..."
      }
    }
  }
}
```

### Full Config

See `free-tier/barkcli.json` for complete example.

## Customization

### Adding a New Model

1. Find model ID in OpenCode's model list
2. Add agent definition in `agents/`
3. Update routing logic in router prompt
4. Add to `opencode.json`

### Changing Thresholds

Edit the router prompt to adjust complexity thresholds:

```
- SIMPLE (0-2): [your definition]
- MODERATE (3-5): [your definition]
- COMPLEX (6-8): [your definition]
- EXPERT (9-10): [your definition]
```

## Monitoring

### Check Routing Decisions

```bash
# View OpenCode logs
opencode logs

# Look for routing decisions
grep "ROUTE:" ~/.local/share/opencode/logs/*.log
```

### Verify Model Usage

Check which models are being used in your session.

## Cost Analysis

### Free Tier
- **Muse Spark 1.2 Free**: $0.00
- **Nemotron 3.5 Lightning Free**: $0.00
- **MiMo V2.5 Free**: $0.00
- **Nemotron 3 Ultra Free**: $0.00
- **Total**: $0.00 per task

### Paid Tier (if needed)
- Costs vary by provider
- Use only when free models insufficient

## Best Practices

1. **Default to Free**: Always try free models first
2. **One Call**: Don't over-orchestrate
3. **Escalate Only on Failure**: If a model fails, then escalate
4. **Monitor**: Check routing decisions regularly
5. **Test Prompts**: Only use prompts that work

## Troubleshooting

### Router Not Working
- Check `agents.primary` is set
- Verify router model exists
- Check OpenCode logs

### Wrong Model Selected
- Review router prompt
- Adjust complexity thresholds
- Test with sample tasks

### Model Not Available
- Verify model ID is correct
- Check you have access
- Try alternative model
