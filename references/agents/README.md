# Agent Frameworks & Orchestration

Agent frameworks, orchestration patterns, subagents, and multi-agent systems.

## What Are AI Agents?

AI agents are autonomous systems that can plan, reason, use tools, and take actions to accomplish tasks. They combine LLMs with tools, memory, and orchestration to handle complex workflows.

## Top Repositories

### hesreallyhim/awesome-claude-code
- **Stars**: 34K+
- **Link**: https://github.com/hesreallyhim/awesome-claude-code
- **Description**: Hand-picked collection of skills, hooks, slash-commands, agents, plugins for Claude Code.
- **Categories**:
  - Skills
  - Agents & Subagents
  - Hooks
  - Plugins
  - Slash Commands
  - CLAUDE.md Files
- **Use For**: Claude Code ecosystem discovery

### awesome-opencode/awesome-opencode
- **Link**: https://github.com/awesome-opencode/awesome-opencode
- **Description**: Curated list of plugins, themes, agents, projects, and resources for OpenCode.
- **Official Repos**:
  - opencode (main agent)
  - opencode-sdk-js/go/python
- **Plugins**: Memory, browser, ensemble, hooks
- **Agents**: Agentic, Claude Subagents, deliberation, Gem Team, NERV
- **Use For**: OpenCode ecosystem

### weisser-dev/awesome-opencode
- **Link**: https://github.com/weisser-dev/awesome-opencode
- **Description**: 108 agents + 465 skills + 18 MCP servers for OpenCode.
- **Key Features**:
  - Agent definitions with permissions
  - Skill integration
  - Markdown agent format
- **Use For**: OpenCode agents and skills

### VoltAgent/awesome-claude-code-subagents
- **Stars**: 15K+
- **Link**: https://github.com/VoltAgent/awesome-claude-code-subagents
- **Description**: 100+ specialized Claude Code subagents.
- **Categories**:
  - Code Review
  - Debugging
  - Architecture
  - Security
  - Testing
  - Documentation
- **Use For**: Finding specialized subagents

### Ridgeio/awesome-ai-agents-2027
- **Link**: https://github.com/Ridgeio/awesome-ai-agents-2027
- **Description**: AI models, agent frameworks, tools, protocols for 2026.
- **Categories**:
  - Foundation Models
  - Multimodal AI
  - Agent Protocols (MCP, A2A)
  - Agent Frameworks
  - Memory
  - Tools
  - Security
  - RAG
  - Coding Agents
- **Use For**: Comprehensive AI agent landscape

### e2b-dev/awesome-ai-agents
- **Stars**: 27K+
- **Link**: https://github.com/e2b-dev/awesome-ai-agents
- **Description**: Open-source and closed-source AI agents.
- **Use For**: Agent discovery

### Shubhamsaboo/awesome-llm-apps
- **Stars**: 104K+
- **Link**: https://github.com/Shubhamsaboo/awesome-llm-apps
- **Description**: LLM-powered applications and multi-agent systems.
- **Use For**: LLM application patterns

## Agent Frameworks

### LangChain
- **Link**: https://github.com/langchain-ai/langchain
- **Stars**: 100K+
- **Description**: Framework for developing LLM-powered applications.
- **Features**: Chains, agents, memory, tools
- **Use For**: Building custom agents

### CrewAI
- **Link**: https://github.com/crewAIInc/crewAI
- **Stars**: 25K+
- **Description**: Framework for orchestrating role-playing AI agents.
- **Features**: Multi-agent collaboration, role-based agents
- **Use For**: Multi-agent orchestration

### AutoGen
- **Link**: https://github.com/microsoft/autogen
- **Stars**: 35K+
- **Description**: Framework for building multi-agent applications.
- **Features**: Conversation patterns, human-in-the-loop
- **Use For**: Multi-agent conversations

### OpenAI Agents SDK
- **Link**: https://github.com/openai/openai-agents-python
- **Description**: Production-ready agent framework with memory backends.
- **Features**: Handoffs, guardrails, tracing
- **Use For**: OpenAI agent development

### Google Agent Development Kit (ADK)
- **Link**: https://github.com/google/adk-python
- **Description**: Google's agent development framework.
- **Use For**: Google ecosystem agents

## Subagent Patterns

### Single Agent with Tools
```
User → Agent → [Tool 1, Tool 2, Tool 3] → Response
```

### Multi-Agent Orchestration
```
User → Orchestrator → Agent 1 (Research)
                    → Agent 2 (Code)
                    → Agent 3 (Review)
                    → Combined Response
```

### Hierarchical Agents
```
User → Manager Agent
        → Team Lead Agent 1
            → Worker Agent 1a
            → Worker Agent 1b
        → Team Lead Agent 2
            → Worker Agent 2a
```

### Peer-to-Peer Agents
```
Agent 1 ←→ Agent 2
  ↕           ↕
Agent 3 ←→ Agent 4
```

## Agent Skills Integration

Agents use skills for specialized capabilities:

```yaml
# In agent definition
skills:
  - test-driven-development
  - code-review
  - security-audit

# Agent automatically loads relevant skills based on task
```

## Agent Protocols

### MCP (Model Context Protocol)
- Standard for connecting agents to external tools
- Auth, transport, tool discovery
- Used by Claude Code, Codex, Cursor, etc.

### A2A (Agent-to-Agent)
- Protocol for agent communication
- Enables cross-agent collaboration
- Google-backed standard

## Tools for Agent Development

### Promptfoo
- **Link**: https://github.com/promptfoo/promptfoo
- **Description**: Testing prompts, models, and agent workflows.
- **Use For**: Agent evaluation

### LangSmith
- **Link**: https://www.langchain.com/langsmith
- **Description**: Observability and evaluation for LLM applications.
- **Use For**: Agent debugging and monitoring

## See Also

- [Skills](../skills/) - Agent skill definitions
- [Memory](../memory/) - Memory systems for agents
- [Tools](../tools/) - CLI tools for agents
- [Ecosystem](../ecosystem/) - Platform-specific agent resources
