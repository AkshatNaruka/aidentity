# Memory Systems & Research

Memory systems, frameworks, and research for AI agents. Memory enables agents to accumulate knowledge, maintain context across sessions, and reason over past interactions.

## Why Memory Matters

- **Personalize** responses over time
- **Accumulate knowledge** from past tasks
- **Reason about change** - understand how facts have evolved
- **Coordinate** multi-agent systems with shared working memory
- **Scale** beyond context window limitations

## Memory Types

| Type | Description | Example |
|------|-------------|---------|
| **Episodic** | Records of past events and interactions | "Last Tuesday, user asked about React hooks" |
| **Semantic** | General facts and knowledge | "User prefers TypeScript over JavaScript" |
| **Procedural** | How to perform tasks | "User's workflow: plan → implement → test → review" |
| **Working** | Active context window | Current conversation state |
| **Archival** | Long-term storage requiring search | Historical code changes, decisions |

## Top Repositories

### aviskaar/awesome-agentic-memory
- **Link**: https://github.com/aviskaar/awesome-agentic-memory
- **Description**: Most comprehensive curated list of memory systems, plugins, frameworks, databases, and research.
- **Categories**:
  - Memory Frameworks & Libraries
  - MCP Memory Servers
  - Agent Frameworks with Memory
  - Coding Agent Memory Tools
  - Vector Databases
  - Knowledge Graphs
  - RAG Frameworks
  - Industry Verticals
- **Use For**: Comprehensive memory system discovery

### tfatykhov/awesome-agent-memory
- **Stars**: 602+
- **Link**: https://github.com/tfatykhov/awesome-agent-memory
- **Description**: Research papers on memory systems for LLM-based agents.
- **Categories**:
  - Surveys & Taxonomies
  - Memory Architectures
  - Memory Admission & Gating
  - Retrieval & Recall
  - Forgetting & Consolidation
  - RL-Based Memory Policy
  - Context Management
  - Evaluation & Benchmarks
- **Key Papers**:
  - "Memory in the Age of AI Agents" (47 authors, Dec 2025)
  - "Externalization in LLM Agents" (Apr 2026)
  - "Experience Compression Spectrum" (Apr 2026)
- **Use For**: Academic research, understanding memory architectures

### Shichun-Liu/Agent-Memory-Paper-List
- **Link**: https://github.com/Shichun-Liu/Agent-Memory-Paper-List
- **Description**: Accompanies the "Memory in the Age of AI Agents" survey.
- **Use For**: Comprehensive paper list

### TeleAI-UAGI/Awesome-Agent-Memory
- **Stars**: 596
- **Link**: https://github.com/TeleAI-UAGI/Awesome-Agent-Memory
- **Description**: Systems + benchmarks + papers for LLM and MLLM memory.
- **Use For**: Multimodal memory coverage

### TsinghuaC3I/Awesome-Memory-for-Agents
- **Link**: https://github.com/TsinghuaC3I/Awesome-Memory-for-Agents
- **Description**: Curated papers on agent memory from Tsinghua.
- **Use For**: Academic research

### DEEP-PolyU/Awesome-GraphMemory
- **Link**: https://github.com/DEEP-PolyU/Awesome-GraphMemory
- **Description**: Graph-based memory specific research.
- **Use For**: Knowledge graph memory

### letta-ai/awesome-letta
- **Link**: https://github.com/letta-ai/awesome-letta
- **Description**: Letta/MemGPT ecosystem resources.
- **Use For**: MemGPT-based memory systems

## Production Memory Systems

### Mem0
- **Link**: https://github.com/mem0ai/mem0
- **Description**: Scalable memory-centric architecture with dynamic extraction, consolidation, and retrieval.
- **Features**:
  - 26% improvement over OpenAI memory
  - 91% lower latency
  - 90%+ token savings
  - Graph-based variant for relational structures
- **Use For**: Production memory implementation

### A-MEM (Agentic Memory)
- **Paper**: https://arxiv.org/abs/2502.12110
- **Link**: https://github.com/agiresearch/A-mem
- **Description**: Zettelkasten-inspired dynamic memory organization.
- **Features**:
  - Interconnected "memory notes"
  - Content, metadata, and explicit links
  - Agent autonomously decides when to create, update, or link
- **Use For**: Dynamic memory organization

### MAGMA (Multi-Graph Agentic Memory Architecture)
- **Paper**: https://arxiv.org/abs/2601.03236
- **Description**: Multi-graph architecture separating memory concerns into distinct graph structures.
- **Use For**: Complex memory management

### Memora
- **Paper**: https://arxiv.org/abs/2602.03315
- **Description**: Proves RAG and KG memory are special cases of unified framework.
- **Features**:
  - Primary abstractions index concrete memory values
  - "Cue anchors" expand retrieval beyond semantic similarity
  - SOTA on LoCoMo AND LongMemEval
- **Use For**: Unified memory framework

### PlugMem
- **Paper**: https://arxiv.org/abs/2603.03296
- **Description**: Task-agnostic plugin memory module from Microsoft Research.
- **Features**:
  - Propositional (facts) + Prescriptive (skills) knowledge
  - Knowledge-centric memory graph
  - Highest information density per context token
- **Use For**: Task-agnostic memory

### AdaMem
- **Paper**: https://arxiv.org/abs/2603.16496
- **Description**: Adaptive user-centric memory with working, episodic, persona, and graph memories.
- **Innovation**: Question-conditioned retrieval planning
- **Use For**: Personalized memory

### CraniMem
- **Paper**: https://arxiv.org/abs/2603.15642
- **Link**: https://github.com/PearlMody05/Cranimem
- **Description**: Neurocognitively motivated gated & bounded memory.
- **Features**:
  - Dual-store: bounded FIFO episodic buffer + knowledge graph
  - Goal-conditioned gating
  - Utility tagging (Importance + Surprise + Emotion)
- **Use For**: Cognitive-inspired memory

## Memory for Coding Agents

### claude-mem
- **Link**: https://github.com/thedotmack/claude-mem
- **Description**: Compresses and persists agent memory across sessions.

### claude-memory-skill
- **Link**: https://github.com/hanfang/claude-memory-skill
- **Description**: Minimal, low-friction hierarchical memory system with background agents.

### claude-memory-kit
- **Link**: https://github.com/awrshift/claude-memory-kit
- **Description**: Persistent memory with hooks, wiki, and daily synthesis.

### opencode-supermemory
- **Link**: https://github.com/supermemoryai/opencode-supermemory
- **Description**: Supermemory plugin; `/supermemory-init` to memorize codebase conventions.

### opencode-mem
- **Link**: https://github.com/tickernelz/opencode-mem
- **Description**: Local vector DB (SQLite); project memories + user profile learning.

### Tree Ring Memory
- **Link**: https://github.com/TerminallyLazy/Tree-Ring-Memory
- **Description**: Local-first memory framework with lifecycle-aware recall, evidence-backed promotion, forgetting.

## Vector Databases for Memory

| Database | Stars | Link | Use Case |
|----------|-------|------|----------|
| Chroma | 18K+ | https://github.com/chroma-core/chroma | Embedding database |
| Weaviate | 12K+ | https://github.com/weaviate/weaviate | Hybrid search + GraphQL |
| Qdrant | 22K+ | https://github.com/qdrant/qdrant | Vector similarity search |
| Pinecone | - | https://www.pinecone.io | Managed vector DB |
| Milvus | 31K+ | https://github.com/milvus-io/milvus | Open-source vector DB |

## Evaluation Benchmarks

| Benchmark | Description |
|-----------|-------------|
| **LongMemEval** | 500-question evaluation for long-term memory |
| **MemoryAgentBench** | Incremental multi-turn interaction |
| **LoCoMo** | Long conversation memory |
| **AgentBench** | Comprehensive agent evaluation |
| **WebArena** | Web-based agent tasks |

## Memory Architecture Patterns

### Hierarchical Memory
```
Working Memory (Context Window)
    ↓
Short-term Memory (Session)
    ↓
Long-term Memory (Persistent)
    ↓
Archival Memory (Searchable)
```

### Zettelkasten-Inspired
```
Memory Notes
    ↓
Content + Metadata + Links
    ↓
Agent creates, updates, or links autonomously
```

### Graph-Based
```
Entities → Relationships → Knowledge Graph
    ↓
Multi-hop retrieval
    ↓
Subgraph extraction
```

## See Also

- [Skills](../skills/) - Procedural memory as skills
- [Agents](../agents/) - Multi-agent memory coordination
- [Prompts](../prompts/) - Context engineering patterns
