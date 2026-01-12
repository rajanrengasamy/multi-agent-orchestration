# MAO Version 2: Multi-Model Orchestration Layer

> **Status**: Enhancement Specification
> **Version**: 2.1
> **Date**: January 2026
> **Updated**: Latest models + Thinking Always On

---

## Executive Summary

MAO V2 introduces a **multi-model orchestration framework** where **Claude Opus 4.5** serves as the intelligent Orchestrator that delegates tasks to diverse AI models via **PAL-MCP server**. This maximizes agent diversity by leveraging each model's unique strengths.

### ⚡ CRITICAL: Thinking Always On

**All models MUST run with thinking/reasoning at maximum level. No exceptions.**

| Provider | Models | Thinking |
|----------|--------|----------|
| **Anthropic** | Opus 4.5, Sonnet 4.5, Haiku 4.5 | `effort: high` ⚡ |
| **OpenAI** | GPT-5.2, GPT-5.2-Codex | Native (built-in) ⚡ |
| **Google** | Gemini 3 Pro, Gemini 3 Flash | Thinking model ⚡ |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                  CLAUDE OPUS 4.5 (ORCHESTRATOR)                     │
│                   effort: high / megathink ⚡                        │
│                                                                     │
│  Responsibilities:                                                  │
│  - Analyze task requirements and complexity                         │
│  - Select LATEST model for each subtask                             │
│  - Craft prompts with THINKING ALWAYS ON                            │
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
│                    ⚡ ALL MODELS WITH THINKING ⚡                     │
│                                                                     │
│  Features:                                                          │
│  - CLI-to-CLI bridging (clink tool)                                 │
│  - Context persistence across model switches                        │
│  - Parallel task execution                                          │
│  - Automatic fallback handling                                      │
└─────────────────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Gemini 3 │  │  GPT-5.2  │  │ Claude   │
    │ Pro/Flash│  │  Codex   │  │Sonnet 4.5│
    │    ⚡     │  │    ⚡     │  │    ⚡     │
    └──────────┘  └──────────┘  └──────────┘
```

---

## Model Roster - LATEST ONLY (January 2026)

### ⚡ ALL MODELS RUN WITH THINKING AT MAXIMUM LEVEL

| Model | Provider | CLI | Strengths | Thinking |
|-------|----------|-----|-----------|----------|
| **Claude Opus 4.5** | Anthropic | `claude` | Orchestration, synthesis, architecture, coding | `effort: high` ⚡ |
| **Claude Sonnet 4.5** | Anthropic | `claude` | Balanced speed/quality, agents, computer use | `effort: high` ⚡ |
| **Claude Haiku 4.5** | Anthropic | `claude` | Speed, near-frontier coding | `effort: high` ⚡ |
| **GPT-5.2** | OpenAI | `openai` | Smartest, thinking built-in, 196k context | Native ⚡ |
| **GPT-5.2-Codex** | OpenAI | `openai` | Code-specialized, 90%+ ARC-AGI | Native ⚡ |
| **Gemini 3 Pro** | Google | `gemini` | Higher-reasoning, agent-oriented | Thinking model ⚡ |
| **Gemini 3 Flash** | Google | `gemini` | Fast, production-ready | Thinking model ⚡ |

### Model Selection Criteria

```yaml
# ⚡ THINKING ALWAYS ON - Latest models only
selection_criteria:
  structural_analysis: gemini-3-pro     # Deep reasoning, agent-oriented
  code_generation: gpt-5.2-codex        # 90%+ ARC-AGI performance
  algorithm_design: gpt-5.2              # Smartest, native thinking
  implementation: sonnet-4.5            # Balanced quality, agents
  test_generation: gpt-5.2-codex        # Code expertise
  security_review: gpt-5.2               # Deep vulnerability reasoning
  documentation: gemini-3-pro           # Document analysis
  quick_checks: haiku-4.5               # Fast with near-frontier quality
```

---

## Task-to-Model Routing

### ⚡ ALL WITH THINKING ENABLED

### Development Workstreams

| Workstream | Primary Model | Fallback | Rationale |
|------------|---------------|----------|-----------|
| **Schemas** | Gemini 3 Pro ⚡ | Sonnet 4.5 | Deep structural analysis |
| **Storage** | GPT-5.2-Codex ⚡ | Sonnet 4.5 | Database patterns, 90%+ ARC-AGI |
| **Core Logic** | GPT-5.2⚡ | Opus 4.5 | Smartest, native thinking |
| **Implementation** | Sonnet 4.5 ⚡ | GPT-5.2-Codex | Balanced quality, agents |
| **Tests** | GPT-5.2-Codex ⚡ | Sonnet 4.5 | Test generation expertise |

### QA Dimensions

| Dimension | Weight | Primary Model | Rationale |
|-----------|--------|---------------|-----------|
| **PRD Compliance** | 30% | Gemini 3 Pro ⚡ | Document analysis |
| **Error Handling** | 25% | Sonnet 4.5 ⚡ | Balanced review |
| **Type Safety** | 20% | GPT-5.2-Codex ⚡ | TypeScript expertise |
| **Architecture** | 15% | Opus 4.5 ⚡ | High-level patterns |
| **Security** | 10% | GPT-5.2⚡ | Deep vulnerability reasoning |

---

## Enhanced Commands

### `/develop` V2 - ALL WITH THINKING ⚡

```
/develop 2, 3
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 0: OPUS 4.5 ORCHESTRATOR (effort: high / megathink) ⚡     │
│                                                                 │
│ 1. Analyze task complexity and requirements                     │
│ 2. Run dependency check (Haiku 4.5 - fast, thinking on) ⚡       │
│ 3. Assign LATEST model per workstream                           │
│ 4. Determine parallel vs sequential strategy                    │
│ 5. Output execution plan with diversity score                   │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1-4: MULTI-MODEL EXECUTION (via PAL-MCP) ⚡ ALL THINKING   │
│                                                                 │
│ Section 2 (parallel):                                           │
│ ├── Gemini 3 Pro  → Schemas (structural analysis) ⚡             │
│ ├── GPT-5.2-Codex → Storage (database patterns) ⚡               │
│ ├── GPT-5.2        → Core Logic (smartest reasoning) ⚡           │
│ ├── Sonnet 4.5    → Implementation (balanced quality) ⚡         │
│ └── GPT-5.2-Codex → Tests (test generation) ⚡                   │
│                                                                 │
│ Section 3 (parallel):                                           │
│ └── [Same diverse assignment - all with thinking]               │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5: SYNTHESIS (Opus 4.5 effort: high / megathink) ⚡        │
│                                                                 │
│ 1. Collect results from all models                              │
│ 2. Resolve conflicts between outputs                            │
│ 3. Ensure consistency across diverse code                       │
│ 4. Run verification (tsc, tests, build)                         │
│ 5. Generate unified summary report                              │
└─────────────────────────────────────────────────────────────────┘
```

### `/qa` V2 - ALL WITH THINKING ⚡

```
/qa 2
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ OPUS 4.5 ORCHESTRATOR assigns dimensions to LATEST models ⚡     │
└─────────────────────────────────────────────────────────────────┘
    │
    ├── Gemini 3 Pro  → PRD Compliance (30%) ⚡
    ├── Sonnet 4.5    → Error Handling (25%) ⚡
    ├── GPT-5.2-Codex → Type Safety (20%) ⚡
    ├── Opus 4.5      → Architecture (15%) ⚡
    └── GPT-5.2        → Security (10%) ⚡
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ SYNTHESIS: Multi-perspective QA report (Opus 4.5) ⚡             │
│ - 5 different model viewpoints (all with thinking)              │
│ - Unified issue categorization                                  │
│ - Fix assignments to appropriate LATEST models                  │
└─────────────────────────────────────────────────────────────────┘
```

### `/journal` V2 - ALL WITH THINKING ⚡

```
/journal
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ Multi-perspective session analysis (all with thinking) ⚡        │
│                                                                 │
│ ├── Gemini 3 Pro → Technical summary (what was built) ⚡         │
│ ├── Sonnet 4.5   → Process reflection (how it went) ⚡           │
│ └── GPT-5.2       → Creative insights (lessons learned) ⚡        │
│                                                                 │
│ Opus 4.5 synthesizes into unified journal entry ⚡               │
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

### Model Registry - LATEST ONLY (January 2026)

**File:** `.claude/models/registry.md`

```yaml
# ⚡ THINKING ALWAYS ON - LATEST MODELS ONLY
global:
  thinking_always_on: true
  use_latest_models: true

models:
  # ANTHROPIC - Claude 4.5 Series
  opus-4.5:
    provider: anthropic
    cli: claude
    endpoint: claude-opus-4-5-20251124
    capabilities: [orchestration, synthesis, architecture, coding, agents]
    thinking: effort: high  # ⚡ Maximum
    role: orchestrator

  sonnet-4.5:
    provider: anthropic
    cli: claude
    endpoint: claude-sonnet-4-5-20250929
    capabilities: [implementation, balanced, agents, computer-use]
    thinking: effort: high  # ⚡ Maximum
    role: worker

  haiku-4.5:
    provider: anthropic
    cli: claude
    endpoint: claude-haiku-4-5
    capabilities: [speed, near-frontier-coding, fast-tasks]
    thinking: effort: high  # ⚡ Maximum
    role: checker

  # OPENAI - GPT-5.2 Series
  gpt-5.2:
    provider: openai
    cli: openai
    endpoint: gpt-5.2
    capabilities: [smartest, native-thinking, 196k-context, synthesis]
    thinking: native  # ⚡ Built-in
    role: reasoner

  gpt-5.2-codex:
    provider: openai
    cli: openai
    endpoint: gpt-5.2-codex
    capabilities: [code-generation, refactoring, 90%-arc-agi]
    thinking: native  # ⚡ Built-in
    role: coder

  # GOOGLE - Gemini 3 Series
  gemini-3-pro:
    provider: google
    cli: gemini
    endpoint: gemini-3-pro
    capabilities: [higher-reasoning, agent-oriented, deep-analysis]
    thinking: thinking-model  # ⚡ Native
    role: analyzer

  gemini-3-flash:
    provider: google
    cli: gemini
    endpoint: gemini-3-flash
    capabilities: [fast, production-ready, iterations]
    thinking: thinking-model  # ⚡ Native
    role: drafter
```

### Task Routing Rules - LATEST MODELS (January 2026)

**File:** `.claude/models/task-routing.md`

```yaml
# ⚡ THINKING ALWAYS ON - ALL MODELS
development:
  schema_design:
    primary: gemini-3-pro      # ⚡ Deep structural analysis
    fallback: sonnet-4.5
  storage_layer:
    primary: gpt-5.2-codex     # ⚡ 90%+ ARC-AGI performance
    fallback: sonnet-4.5
  core_logic:
    primary: gpt-5.2            # ⚡ Smartest, native thinking
    fallback: opus-4.5
  implementation:
    primary: sonnet-4.5        # ⚡ Balanced quality, agents
    fallback: gpt-5.2-codex
  tests:
    primary: gpt-5.2-codex     # ⚡ Code expertise
    fallback: sonnet-4.5

qa:
  prd_compliance:
    primary: gemini-3-pro      # ⚡ Document analysis
    fallback: opus-4.5
  error_handling:
    primary: sonnet-4.5        # ⚡ Balanced review
    fallback: opus-4.5
  type_safety:
    primary: gpt-5.2-codex     # ⚡ TypeScript expertise
    fallback: sonnet-4.5
  architecture:
    primary: opus-4.5          # ⚡ High-level patterns
    fallback: gemini-3-pro
  security:
    primary: gpt-5.2            # ⚡ Deep vulnerability reasoning
    fallback: opus-4.5

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
