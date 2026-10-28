# Agent Skills Collections

The best repositories for agent skills following the SKILL.md open standard. Skills teach AI agents how to perform specific tasks in a repeatable way.

## What Are Agent Skills?

Agent Skills are reusable instruction packages that teach an AI agent when and how to complete a task. Each skill is a folder containing a `SKILL.md` file with YAML frontmatter (name, description) and Markdown instructions, optionally bundled with scripts, references, and assets.

**Supported by**: Claude Code, Codex, Gemini CLI, Cursor, GitHub Copilot, OpenCode, Windsurf, and 70+ more agents.

## Official Skill Standards

### agentskills.io
- **Link**: https://agentskills.io
- **Description**: The open Agent Skills specification
- **Format**: SKILL.md with YAML frontmatter

### skills.sh
- **Link**: https://skills.sh
- **Stars**: 30K+
- **Description**: CLI for the open agent skills ecosystem
- **Install**: `npx skills add <owner/repo>`
- **Supports**: 70+ agents

### officialskills.sh
- **Link**: https://officialskills.sh
- **Description**: Official skills from leading development teams

## Top Collections

### mattpocock/skills
- **Stars**: 242K+
- **Link**: https://github.com/mattpocock/skills
- **Description**: Skills for real engineers. Production-grade engineering workflow skills focused on fundamentals, not vibe coding.
- **Key Features**:
  - 17+ skills covering engineering and productivity
  - Based on decades of engineering experience
  - Small, composable, model-agnostic
  - Available as Claude Code plugin or via skills.sh
- **Key Skills**:
  - `/grill-me` - Relentless interview about plans/designs before building
  - `/grill-with-docs` - Grilling + builds domain model, CONTEXT.md, and ADRs
  - `/tdd` - Test-driven development with red-green-refactor loop
  - `/diagnosing-bugs` - Disciplined diagnosis loop for hard bugs
  - `/code-review` - Two-axis review: Standards + Spec (parallel sub-agents)
  - `/to-spec` - Turn conversation into spec and publish to issue tracker
  - `/to-tickets` - Break plans into tracer-bullet tickets
  - `/implement` - Build work from spec/tickets driving TDD
  - `/improve-codebase-architecture` - Scan codebase for deepening opportunities
  - `/wayfinder` - Plan huge work as shared map of decision tickets
  - `/handoff` - Compact conversation for another agent to continue
  - `/wait-what` - Re-pitches messages when they don't land
- **Philosophy**:
  - Fix misalignment with grilling sessions
  - Shared language (CONTEXT.md) reduces verbosity
  - Red-green-refactor for feedback loops
  - Care about code design to prevent ball-of-mud
- **Install**:
  ```bash
  # Claude Code plugin (managed, auto-updates)
  claude plugins install mattpocock-skills

  # Or via skills CLI (editable files)
  npx skills@latest add mattpocock/skills
  ```
- **Use For**: Engineering workflow discipline, TDD, code review, architecture

### tt-a1i/archify
- **Stars**: 36K+
- **Link**: https://github.com/tt-a1i/archify
- **Description**: Agent skill for beautiful, verifiable architecture, workflow, sequence, data-flow, and lifecycle diagrams. Self-contained HTML with motion and crisp export.
- **Key Features**:
  - 5 diagram types: Architecture, Workflow, Sequence, Data Flow, Lifecycle
  - 4 visual presets: Signal Flow, Blueprint, Classic, and more
  - Dark/light themes with built-in brand marks
  - Architecture Delta: compare Before/Delta/After snapshots
  - Typed JSON IR → deterministic HTML/SVG rendering
  - Atomic validation before delivery
  - Interactive: search, route tracing, role comparison, guided stories
  - Exports: HTML, PNG, SVG, WebM, 1200x630 share cards
- **Diagram Types**:
  | Type | Best For |
  |------|----------|
  | Architecture | Components, services, storage, boundaries |
  | Workflow | CI/CD, approvals, tool calls, runbooks |
  | Sequence | API calls, cache fallback, auth, async traces |
  | Data Flow | Pipelines, lineage, PII, consumers |
  | Lifecycle | States, retries, waits, terminal outcomes |
- **Install**:
  ```bash
  npx skills add tt-a1i/archify -g
  ```
- **Use For**: System diagrams, architecture visualization, technical documentation

### VoltAgent/awesome-agent-skills
- **Stars**: 33K+
- **Link**: https://github.com/VoltAgent/awesome-agent-skills
- **Description**: 1000+ official agent skills from dev teams and community. Hand-picked, not AI-generated.
- **Key Features**:
  - Official skills from: Anthropic, Google Labs, Vercel, Stripe, Cloudflare, Netlify, Trail of Bits, Sentry, Expo, Hugging Face, Figma
  - Cross-platform compatible
  - Quality-focused (not bulk-generated)
- **Categories**: Development, Security, Testing, Design, DevOps, Marketing, Data
- **Use For**: Finding production-ready skills from known teams

### obra/superpowers
- **Stars**: 239K+
- **Link**: https://github.com/obra/superpowers
- **Description**: Core skills library for Claude Code with 20+ battle-tested skills.
- **Key Skills**:
  - `test-driven-development` - RED-GREEN-REFACTOR workflow
  - `systematic-debugging` - 4-phase root cause analysis
  - `using-git-worktrees` - Parallel feature development
  - `requesting-code-review` - Pre-review preparation
  - `subagent-driven-development` - Multi-agent workflows
- **Use For**: Development workflow skills

### addyosmani/agent-skills
- **Stars**: 90K+
- **Link**: https://github.com/addyosmani/agent-skills
- **Description**: 25 production-grade engineering skills for AI coding agents.
- **Key Skills**:
  - `incremental-implementation` - Thin vertical slices
  - `test-driven-development` - Test pyramid (80/15/5)
  - `context-engineering` - Right info at right time
  - `frontend-ui-engineering` - Component architecture, WCAG 2.1 AA
  - `code-review-and-quality` - Five-axis review
  - `security-and-hardening` - OWASP Top 10 prevention
- **Use For**: Engineering best practices, quality gates

### anthropics/skills
- **Link**: https://github.com/anthropics/skills
- **Description**: Official Anthropic skills repository.
- **Key Skills**:
  - Document skills: docx, pdf, pptx, xlsx
  - Creative: algorithmic-art, canvas-design
  - Technical: mcp-builder, webapp-testing, frontend-design
  - Meta: skill-creator
- **Use For**: Official Anthropic patterns, document processing

### google/skills
- **Stars**: 19K+
- **Link**: https://github.com/google/skills
- **Description**: Agent Skills for Google products and technologies.
- **Categories**:
  - Google Cloud (GKE, AI/ML, Storage, Networking)
  - Developer tools (gcloud CLI, Cloud Build)
  - Analytics (BigQuery, Google Analytics)
- **Use For**: Google Cloud development

### microsoft/skills
- **Stars**: 3K+
- **Link**: https://github.com/microsoft/agent-skills
- **Description**: 174 skills for Azure SDK and Microsoft AI Foundry.
- **Languages**: Python, .NET, TypeScript, Java, Rust
- **Key Skills**:
  - `cloud-solution-architect` - Azure architecture
  - `mcp-builder` - MCP server creation
  - `skill-creator` - Create new skills
- **Use For**: Azure/Microsoft development

### vercel-labs/skills
- **Stars**: 30K+
- **Link**: https://github.com/vercel-labs/skills
- **Description**: The CLI for the open agent skills ecosystem.
- **Commands**:
  - `npx skills add <repo>` - Install skills
  - `npx skills list` - List installed
  - `npx skills find [query]` - Search
  - `npx skills init [name]` - Create new
- **Use For**: Installing and managing skills

## Curated Lists

### ComposioHQ/awesome-claude-skills
- **Stars**: 49K+
- **Link**: https://github.com/ComposioHQ/awesome-claude-skills
- **Description**: 30 curated skills + 832 SaaS automation templates.
- **Use For**: SaaS integrations, automation

### travisvn/awesome-claude-skills
- **Link**: https://github.com/travisvn/awesome-claude-skills
- **Description**: Curated list of Claude Skills, resources, and tools.
- **Categories**: Collections, Creating Skills, Official Resources
- **Use For**: Discovering Claude-specific skills

### karanb192/awesome-claude-skills
- **Link**: https://github.com/karanb192/awesome-claude-skills
- **Description**: 50+ verified skills for Claude Code and Claude.ai.
- **Categories**: Testing, Debugging, Workflow, Development, Documents, Meta
- **Use For**: Verified, tested skills

### seb1n/awesome-ai-agent-skills
- **Link**: https://github.com/seb1n/awesome-ai-agent-skills
- **Description**: 103 ready-to-use skills across 18 categories.
- **Categories**: Agent Engineering, Code & Development, Context Engineering, Security, Data, DevOps, Design, Marketing, Sales
- **Use For**: Comprehensive skill coverage

## Specialized Skills

### Security
- **Trail of Bits** - https://github.com/trailofbits/skills
  - Static analysis with CodeQL/Semgrep
  - Vulnerability detection
  - Code auditing

### Testing
- **LambdaTest/agent-skills** - https://github.com/LambdaTest/agent-skills
  - Production-grade test automation

### Context Engineering
- **muratcankoylan/Agent-Skills-for-Context-Engineering**
  - Context fundamentals
  - Prompt engineering
  - Multi-agent orchestration
  - Tool design
  - Evaluation

### Memory
- **hanfang/claude-memory-skill** - Hierarchical memory system
- **awrshift/claude-memory-kit** - Persistent memory with hooks
- **thedotmack/claude-mem** - Cross-session memory

## SKILL.md Template

```markdown
---
name: skill-name
description: What the skill does. Use when the user provides these inputs or requests this workflow.
---

# Skill Name

Instructions, workflows, and examples for the agent.

## When to Use
- [Trigger condition 1]
- [Trigger condition 2]

## Steps
1. [Step 1]
2. [Step 2]

## Examples
[Input/Output examples]

## References
[Additional resources]
```

## Installation

```bash
# Install via skills CLI
npx skills add <owner/repo>

# Install specific skill
npx skills add <owner/repo> --skill <skill-name>

# Install to specific agent
npx skills add <owner/repo> --agent claude-code

# Manual installation
# Copy SKILL.md folder to:
# Claude Code: .claude/skills/
# Codex: .codex/skills/
# Cursor: .cursor/skills/
# OpenCode: .opencode/skills/
```

## See Also

- [Prompts](../prompts/) - Prompt patterns and templates
- [Memory](../memory/) - Memory systems for context persistence
- [Agents](../agents/) - Agent orchestration patterns
- [Ecosystem](../ecosystem/) - Platform-specific resources
