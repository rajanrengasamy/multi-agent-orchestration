# MAO Version 2: Multi-Model Orchestration Layer

> **Status**: Enhancement Specification
> **Version**: 2.0
> **Date**: January 2026

---

## Executive Summary

MAO V2 introduces a **multi-model orchestration framework** where Claude Opus serves as the intelligent Orchestrator that delegates tasks to diverse AI models (Gemini, GPT, Claude Sonnet) via **PAL-MCP server**. This maximizes agent diversity by leveraging each model's unique strengths.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CLAUDE OPUS (ORCHESTRATOR)                      │
│                      megathink (always on)                          │
│                                                                     │
│  Responsibilities:                                                  │
│  - Analyze task requirements and complexity                         │
│  - Select optimal model for each subtask                            │
│  - Craft prompts tailored to each model's strengths                 │
│  - Manage parallel workloads via PAL-MCP                            │
│  - Synthesize results from diverse models                           │
│  - Resolve conflicts and ensure consistency                         │
│  - Maintain context continuity across model switches                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PAL-MCP SERVER                              │
│            (Provider Abstraction Layer - Model Context Protocol)    │
│                                                                     │
│  Features:                                                          │
│  - CLI-to-CLI bridging (clink tool)                                 │
│  - Context persistence across model switches                        │
│  - Parallel task execution                                          │
│  - Automatic fallback handling                                      │
└─────────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
    │ Gemini │    │  GPT   │    │ Claude │    │ Local  │
    │  CLI   │    │  CLI   │    │  CLI   │    │(Ollama)│
    └────────┘    └────────┘    └────────┘    └────────┘
```

---

## Model Roster & Specializations

### Available Models

| Model | Provider | CLI | Strengths | Thinking Mode |
|-------|----------|-----|-----------|---------------|
| **Claude Opus 4.5** | Anthropic | `claude` | Orchestration, synthesis, architecture, long-context | `megathink` |
| **Claude Sonnet 4** | Anthropic | `claude` | Balanced speed/quality, tool use | `ultrathink` |
| **Claude Haiku 4** | Anthropic | `claude` | Speed, cost efficiency | `think hard` |
| **Gemini 2.0 Pro** | Google | `gemini` | Long context, deep analysis, multimodal | Max |
| **Gemini 2.0 Flash** | Google | `gemini` | Speed, quick iterations | Standard |
| **GPT-4o** | OpenAI | `openai` | Code generation, creativity | High |
| **GPT Codex 5.2** | OpenAI | `openai` | Code-specialized, completion | High |
| **O3** | OpenAI | `openai` | Reasoning, algorithm validation | Max |
| **DeepSeek Coder** | DeepSeek | N/A | Cost-effective coding | Standard |
| **CodeLlama 34B** | Ollama | `ollama` | Privacy, offline work | N/A |

### Model Selection Criteria

```yaml
selection_criteria:
  structural_analysis: gemini-pro     # Long context, pattern recognition
  code_generation: gpt-codex          # Specialized for code
  algorithm_design: o3                # Strong reasoning
  implementation: sonnet              # Balanced quality
  test_generation: gpt-codex          # Test pattern expertise
  security_review: o3                 # Vulnerability reasoning
  documentation: gemini-pro           # Document analysis
  quick_checks: haiku                 # Speed and cost
```

---

## Task-to-Model Routing

### Development Workstreams

| Workstream | Primary Model | Fallback | Rationale |
|------------|---------------|----------|-----------|
| **Schemas** | Gemini Pro | Sonnet | Excels at structural analysis |
| **Storage** | GPT Codex | Sonnet | Database pattern expertise |
| **Core Logic** | O3 | Opus | Algorithm validation strength |
| **Implementation** | Sonnet | GPT Codex | Balanced quality |
| **Tests** | GPT Codex | Sonnet | Test generation expertise |

### QA Dimensions

| Dimension | Weight | Primary Model | Rationale |
|-----------|--------|---------------|-----------|
| **PRD Compliance** | 30% | Gemini Pro | Document analysis |
| **Error Handling** | 25% | Sonnet | Balanced review |
| **Type Safety** | 20% | GPT Codex | TypeScript expertise |
| **Architecture** | 15% | Opus | High-level patterns |
| **Security** | 10% | O3 | Vulnerability reasoning |

---

## Enhanced Commands

### `/develop` V2

```
/develop 2, 3
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 0: OPUS ORCHESTRATOR (megathink)                          │
│                                                                 │
│ 1. Analyze task complexity and requirements                     │
│ 2. Run dependency check (Haiku - fast, cheap)                   │
│ 3. Assign optimal model per workstream                          │
│ 4. Determine parallel vs sequential strategy                    │
│ 5. Output execution plan with diversity score                   │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1-4: MULTI-MODEL EXECUTION (via PAL-MCP)                  │
│                                                                 │
│ Section 2 (parallel):                                           │
│ ├── Gemini Pro   → Schemas (structural analysis)                │
│ ├── GPT Codex    → Storage (database patterns)                  │
│ ├── O3           → Core Logic (algorithm validation)            │
│ ├── Sonnet       → Implementation (balanced quality)            │
│ └── GPT Codex    → Tests (test generation)                      │
│                                                                 │
│ Section 3 (parallel):                                           │
│ └── [Same diverse assignment]                                   │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5: SYNTHESIS (Opus megathink)                             │
│                                                                 │
│ 1. Collect results from all models                              │
│ 2. Resolve conflicts between outputs                            │
│ 3. Ensure consistency across diverse code                       │
│ 4. Run verification (tsc, tests, build)                         │
│ 5. Generate unified summary report                              │
└─────────────────────────────────────────────────────────────────┘
```

### `/qa` V2

```
/qa 2
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ OPUS ORCHESTRATOR assigns dimensions to specialists             │
└─────────────────────────────────────────────────────────────────┘
    │
    ├── Gemini Pro → PRD Compliance (30%)
    ├── Sonnet     → Error Handling (25%)
    ├── GPT Codex  → Type Safety (20%)
    ├── Opus       → Architecture (15%)
    └── O3         → Security (10%)
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ SYNTHESIS: Multi-perspective QA report                          │
│ - 5 different model viewpoints                                  │
│ - Unified issue categorization                                  │
│ - Fix assignments to appropriate models                         │
└─────────────────────────────────────────────────────────────────┘
```

### `/journal` V2

```
/journal
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ Multi-perspective session analysis:                             │
│                                                                 │
│ ├── Gemini Pro → Technical summary (what was built)             │
│ ├── Sonnet     → Process reflection (how it went)               │
│ └── GPT-4o     → Creative insights (lessons learned)            │
│                                                                 │
│ Opus synthesizes into unified journal entry                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration

### PAL-MCP Server Setup

**File:** `.mcp.json`

```json
{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "pal": {
      "type": "stdio",
      "command": "uvx",
      "args": ["pal-mcp-server"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}",
        "GEMINI_API_KEY": "${GEMINI_API_KEY}",
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

### Model Registry

**File:** `.claude/models/registry.md`

```yaml
models:
  opus:
    provider: anthropic
    cli: claude
    capabilities: [orchestration, synthesis, architecture, long-context]
    thinking: megathink
    role: orchestrator

  sonnet:
    provider: anthropic
    cli: claude
    capabilities: [implementation, balanced, tool-use]
    thinking: ultrathink
    role: worker

  haiku:
    provider: anthropic
    cli: claude
    capabilities: [speed, pre-flight, simple-tasks]
    thinking: think hard
    role: checker

  gemini-pro:
    provider: google
    cli: gemini
    capabilities: [analysis, long-context, multimodal, structural]
    thinking: max
    role: analyzer

  gemini-flash:
    provider: google
    cli: gemini
    capabilities: [speed, drafts, iterations]
    thinking: standard
    role: drafter

  gpt-codex:
    provider: openai
    cli: openai
    capabilities: [code-generation, refactoring, completion, tests]
    thinking: high
    role: coder

  o3:
    provider: openai
    cli: openai
    capabilities: [reasoning, validation, algorithms, security]
    thinking: max
    role: validator
```

### Task Routing Rules

**File:** `.claude/models/task-routing.md`

```yaml
development:
  schema_design:
    primary: gemini-pro
    fallback: sonnet
  storage_layer:
    primary: gpt-codex
    fallback: sonnet
  core_logic:
    primary: o3
    fallback: opus
  implementation:
    primary: sonnet
    fallback: gpt-codex
  tests:
    primary: gpt-codex
    fallback: sonnet

qa:
  prd_compliance:
    primary: gemini-pro
    fallback: opus
  error_handling:
    primary: sonnet
    fallback: opus
  type_safety:
    primary: gpt-codex
    fallback: sonnet
  architecture:
    primary: opus
    fallback: gemini-pro
  security:
    primary: o3
    fallback: opus

pre_flight:
  dependency_check:
    primary: haiku
    fallback: gemini-flash
```

---

## Orchestrator Behavior

### Decision Process

```
┌─────────────────────────────────────────────────────────────────┐
│ OPUS ORCHESTRATOR DECISION FLOW                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
    ┌─────────────────────────┼─────────────────────────┐
    ▼                         ▼                         ▼
┌─────────┐            ┌─────────────┐           ┌─────────────┐
│ ANALYZE │            │   ASSIGN    │           │  DELEGATE   │
│  TASK   │     →      │   MODELS    │     →     │  VIA PAL    │
└─────────┘            └─────────────┘           └─────────────┘
    │                         │                         │
    │ • Complexity?           │ • Best model per        │ • Craft prompt
    │ • Dependencies?         │   workstream            │ • Set thinking
    │ • Parallel safe?        │ • Fallback chain        │ • Send via clink
    │                         │ • Diversity score       │
    ▼                         ▼                         ▼
┌─────────┐            ┌─────────────┐           ┌─────────────┐
│SYNTHESIZE│    ←      │   COLLECT   │     ←     │   EXECUTE   │
│ RESULTS │            │   OUTPUTS   │           │   TASKS     │
└─────────┘            └─────────────┘           └─────────────┘
    │
    │ • Resolve conflicts
    │ • Ensure consistency
    │ • Run verification
    │ • Report summary
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ FINAL OUTPUT: Unified, verified implementation                  │
└─────────────────────────────────────────────────────────────────┘
```

### Prompt Crafting

Opus tailors prompts for each model's strengths:

**For Gemini Pro (structural analysis):**
```markdown
Analyze the data structures needed for [section].

You excel at:
- Long-context understanding
- Structural pattern recognition
- Comprehensive analysis

Output Zod schemas with:
- Clear type definitions
- Validation rules
- Documentation comments
```

**For GPT Codex (code generation):**
```markdown
Implement the storage layer for [section].

You excel at:
- Database patterns
- Code completion
- Efficient implementations

Requirements:
- Repository pattern
- Atomic writes
- Error handling
```

**For O3 (reasoning):**
```markdown
Validate the algorithm correctness for [section].

You excel at:
- Logical reasoning
- Edge case identification
- Correctness proofs

Verify:
- Algorithm completeness
- Edge case handling
- Performance characteristics
```

---

## Fallback Strategy

### Auto-Fallback Chain

```
Primary Model → [fails] → Fallback Model → [fails] → Opus (universal)
```

**Behavior:**
- Silent fallback (no interruption)
- Log which model was used
- Continue execution seamlessly

**Example:**
```
gemini-pro → [timeout] → sonnet → [success]
Log: "Schema generation: fallback from gemini-pro to sonnet (timeout)"
```

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Agent Diversity** | 5+ models = 5+ perspectives, reducing blind spots |
| **Specialized Expertise** | Each model used for what it does best |
| **Resilience** | Auto-fallback ensures task completion |
| **Quality Through Diversity** | Different training data = novel solutions |
| **Context Persistence** | PAL-MCP maintains context across switches |
| **CLI-Based** | Uses existing subscriptions, no API billing |

---

## Implementation Status

- [ ] PAL-MCP server integration
- [ ] Model registry configuration
- [ ] Task routing rules
- [ ] Enhanced `/develop` command
- [ ] Enhanced `/qa` command
- [ ] Enhanced `/journal` command
- [ ] Orchestrator skill
- [ ] Documentation complete

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial template with Opus/Haiku |
| 2.0 | Jan 2026 | Multi-model orchestration via PAL-MCP |
