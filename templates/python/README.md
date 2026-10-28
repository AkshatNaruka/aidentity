# Python Template

Pre-configured template for Python projects with AI agent support.

## Files Included

- `opencode.json` - OpenCode configuration
- `.opencode/` - Agent and prompt configurations
- `requirements.txt` - Dependencies
- `pyproject.toml` - Project configuration

## Setup

```bash
# Copy template to your project
cp -r templates/python/* /path/to/your-project/

# Create virtual environment
cd /path/to/your-project/
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Features

- Poetry/setuptools configuration
- Type hints support
- Testing setup (pytest)
- Linting configuration (ruff)
- AI agent integration

## Customization

1. Update `pyproject.toml` with your project name
2. Modify `.opencode/agents/` for custom agents
3. Add prompts to `.opencode/prompts/`
4. Configure routing in `opencode.json`

## License

MIT
