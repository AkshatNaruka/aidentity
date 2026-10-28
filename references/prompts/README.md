# Prompt Libraries & Collections

Curated prompt libraries, templates, and marketplaces for AI agents.

## Top Repositories

### f/prompts.chat
- **Stars**: 164K+
- **Link**: https://github.com/f/prompts.chat
- **Description**: The largest curated collection of ChatGPT prompts. Community-driven, categorized by use case.
- **Key Features**:
  - 1000+ categorized prompts
  - Categories: Writing, Coding, Business, Education, Marketing
  - Community contributions
  - Regular updates
- **Use For**: Finding prompt patterns, inspiration for specific tasks

### danielmiessler/Fabric
- **Stars**: 43K+
- **Link**: https://github.com/danielmiessler/Fabric
- **Description**: Framework for augmenting humans using AI. Pattern-based approach to prompt engineering.
- **Key Features**:
  - Pattern library for common AI tasks
  - `fab` CLI tool
  - Focus on security and analysis
  - Chain-of-thought patterns
- **Use For**: Security analysis, research, structured AI workflows

### langgptai/awesome-claude-prompts
- **Link**: https://github.com/langgptai/awesome-claude-prompts
- **Description**: Claude-specific prompt collection with 2026 updates including skills and CLAUDE.md guidance.
- **Key Features**:
  - Claude-optimized prompts
  - Skills integration guides
  - CLAUDE.md best practices
- **Use For**: Claude-specific prompt engineering

### anthropics/skills
- **Link**: https://github.com/anthropics/skills
- **Description**: Official Anthropic skills repository with prompt patterns and SKILL.md examples.
- **Key Features**:
  - Official prompt patterns from Anthropic
  - Document skills (docx, pdf, pptx, xlsx)
  - Creative skills (art, design, music)
  - Technical skills (testing, MCP)
- **Use For**: Understanding Anthropic's recommended prompt patterns

### openai/openai-cookbook
- **Link**: https://developers.openai.com/cookbook
- **Description**: Practical examples for OpenAI API use cases including tool use, structured outputs, and evaluation.
- **Key Features**:
  - Working code examples
  - Prompt engineering guides
  - Evaluation patterns
  - Multi-modal examples
- **Use For**: OpenAI-specific prompt patterns and API usage

### sharmapuneet1510/awesome-prompts
- **Link**: https://github.com/sharmapuneet1510/awesome-prompts
- **Description**: Enterprise-grade AI agents + reusable skills system (v3.1).
- **Key Features**:
  - 5 role-based AI agents
  - 24 reusable skills
  - 31 callable functions
  - Multi-tech support (Java, Python, React, TypeScript)
- **Use For**: Enterprise prompt engineering, multi-agent orchestration

## Prompt Marketplaces

| Platform | Prompts | Link |
|----------|---------|------|
| PromptBase | 310K+ | https://promptbase.com |
| AIPRM | 4K+ | https://aiprm.com |
| FlowGPT | Community | https://flowgpt.com |
| PromptHero | Images | https://prompthero.com |
| skills.sh | 885K+ installs | https://skills.sh |

## Key Patterns

### Chain-of-Thought
```
Think step by step.
1. First, identify...
2. Then, consider...
3. Finally, conclude...
```

### Role-Based
```
You are a [ROLE] with expertise in [DOMAIN].
When given [TASK], you should...
```

### Few-Shot
```
Here are examples:
Input: [X] -> Output: [Y]
Input: [A] -> Output: [B]
Now process: [NEW_INPUT]
```

### XML Structured (Anthropic)
```
<instructions>
  [Task description]
</instructions>

<context>
  [Background info]
</context>

<examples>
  [Few-shot examples]
</examples>
```

## See Also

- [Skills](../skills/) - SKILL.md format for agent capabilities
- [Memory](../memory/) - Memory systems for context persistence
- [Agents](../agents/) - Agent orchestration patterns
