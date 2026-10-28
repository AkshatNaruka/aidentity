# Platform-Specific Resources

Resources organized by AI coding platform.

## Claude Code

### Official Resources
- **Claude Code**: https://github.com/anthropics/claude-code (132K+ stars)
- **Skills**: https://github.com/anthropics/skills
- **Plugins**: https://github.com/anthropics/claude-plugins-official (30K+ stars)
- **System Prompts**: https://github.com/Piebald-AI/claude-code-system-prompts (5.9K+ stars)
- **Documentation**: https://docs.claude.com/en/docs/claude-code

### Skills Path
- Project: `.claude/skills/`
- Global: `~/.claude/skills/`

### Awesome Lists
- hesreallyhim/awesome-claude-code (34K+)
- ComposioHQ/awesome-claude-skills (49K+)
- karanb192/awesome-claude-skills
- travisvn/awesome-claude-skills
- claw-army/awesome-claude-code

### Key Skills
- obra/superpowers (239K+) - Development workflows
- addyosmani/agent-skills (90K+) - Engineering best practices
- anthropics/skills - Official Anthropic skills

## OpenCode

### Official Resources
- **OpenCode**: https://github.com/anomalyco/opencode
- **SDKs**: opencode-sdk-js, opencode-sdk-go, opencode-sdk-python
- **Documentation**: https://opencode.ai/docs

### Skills Path
- Project: `.opencode/skills/`
- Global: `~/.config/opencode/skills/`

### Awesome Lists
- awesome-opencode/awesome-opencode
- weisser-dev/awesome-opencode (108 agents + 465 skills)
- backnotprop/awesome-opencode

### Key Features
- Plugins: Memory, browser, ensemble, hooks
- Agents: Agentic, deliberation, Gem Team, NERV
- MCP integration

## Codex (OpenAI)

### Official Resources
- **Codex**: https://github.com/openai/codex
- **Skills Docs**: https://developers.openai.com/codex/skills
- **MCP Guide**: https://developers.openai.com/codex/mcp

### Skills Path
- Project: `.codex/skills/`
- Global: `~/.codex/skills/`

### Awesome Lists
- OpenAI skills ecosystem
- Cross-platform skill lists

### Key Features
- Skills standard support
- MCP integration
- Agent capabilities

## Gemini CLI (Google)

### Official Resources
- **Gemini CLI**: https://github.com/google-gemini/gemini-cli (98K+ stars)
- **Skills**: https://github.com/google/skills (19K+ stars)
- **Documentation**: https://geminicli.com/docs/cli/skills/

### Skills Path
- Project: `.gemini/skills/`
- Global: `~/.gemini/skills/`

### Key Skills
- Google Cloud skills
- Android skills
- Dart/Flutter skills
- Firebase skills

## Cursor

### Official Resources
- **Cursor**: https://www.cursor.com
- **Documentation**: https://cursor.com/docs/context/skills

### Skills Path
- Project: `.cursor/skills/`
- Global: `~/.cursor/skills/`

### Features
- Skills support
- AI-powered editing
- Multi-file context

## GitHub Copilot

### Official Resources
- **Copilot**: https://github.com/features/copilot
- **Skills Docs**: https://docs.github.com/copilot/concepts/agents/about-agent-skills
- **VS Code Skills**: https://code.visualstudio.com/docs/copilot/customization/agent-skills

### Skills Path
- Project: `.github/skills/`
- Global: `~/.copilot/skills/`

### Awesome Lists
- StevenJV/awesome-copilot
- thebrierfox/awesome-copilot-agents
- github/awesome-copilot

### Key Features
- Agent Skills support
- Custom instructions
- MCP integration

## Windsurf

### Official Resources
- **Windsurf**: https://codeium.com/windsurf
- **Documentation**: https://docs.windsurf.com/windsurf/cascade/skills

### Skills Path
- Project: `.windsurf/skills/`
- Global: `~/.codeium/windsurf/skills/`

### Features
- Cascade AI
- Skills support
- Multi-file editing

## Antigravity (Google)

### Official Resources
- **Antigravity**: https://antigravity.google
- **Documentation**: https://antigravity.google/docs/skills

### Skills Path
- Project: `.agents/skills/`
- Global: `~/.gemini/antigravity/skills/`

### Features
- Skills standard support
- Google integration

## Cross-Platform Tools

### skills.sh (Vercel)
- **Link**: https://skills.sh
- **Stars**: 30K+
- **Description**: CLI for the open agent skills ecosystem
- **Supports**: 70+ agents
- **Install**: `npx skills add <owner/repo>`

### officialskills.sh (VoltAgent)
- **Link**: https://officialskills.sh
- **Description**: Official skills from leading dev teams
- **Use For**: Production-ready skills

### agentskill.sh
- **Link**: https://agentskill.sh
- **Description**: 44K+ skills with security scanning
- **Use For**: Large skill discovery

## Skill Installation Matrix

| Agent | Project Path | Global Path | CLI Install |
|-------|-------------|-------------|-------------|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | `npx skills add --agent claude-code` |
| OpenCode | `.opencode/skills/` | `~/.config/opencode/skills/` | `npx skills add --agent opencode` |
| Codex | `.codex/skills/` | `~/.codex/skills/` | `npx skills add --agent codex` |
| Gemini CLI | `.gemini/skills/` | `~/.gemini/skills/` | `npx skills add --agent gemini-cli` |
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` | `npx skills add --agent cursor` |
| Copilot | `.github/skills/` | `~/.copilot/skills/` | `npx skills add --agent github-copilot` |
| Windsurf | `.windsurf/skills/` | `~/.codeium/windsurf/skills/` | `npx skills add --agent windsurf` |
| Antigravity | `.agents/skills/` | `~/.gemini/antigravity/skills/` | `npx skills add --agent antigravity` |

## See Also

- [Skills](../skills/) - Skill collections across platforms
- [Agents](../agents/) - Agent frameworks
- [Tools](../tools/) - CLI tools
