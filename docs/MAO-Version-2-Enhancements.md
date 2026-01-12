# MAO Version 2: Multi-Model Orchestration Layer

> **Status**: Enhancement Specification
> **Version**: 2.2
> **Date**: January 2026
> **Updated**: Accurate thinking parameters per provider, GPT-5.2 family as default

---

## Executive Summary

MAO V2 introduces a **multi-model orchestration framework** where **Claude Opus 4.5** serves as the intelligent Orchestrator that delegates tasks to diverse AI models via **PAL-MCP server**. This maximizes agent diversity by leveraging each model's unique strengths.

### ⚡ CRITICAL: Thinking Always On

**All models MUST run with thinking/reasoning at maximum level. No exceptions.**

| Provider | Models | Thinking Parameter |
|----------|--------|-------------------|
| **Anthropic** | Opus 4.5, Sonnet 4.5, Haiku 4.5 | `thinking: { enabled: true, budget_tokens: 10000 }` ⚡ |
| **OpenAI** | GPT-5.2, GPT-5.2-Codex, o3, o4-mini | `reasoning_effort: "high"` ⚡ |
| **Google** | Gemini 3 Pro, Gemini 3 Flash | `thinking_level: "high"` ⚡ |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                  CLAUDE OPUS 4.5 (ORCHESTRATOR)                     │
│             thinking: { enabled: true, budget_tokens: 32000 } ⚡      │
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

| Model | Provider | CLI | Strengths | Thinking Parameter |
|-------|----------|-----|-----------|-------------------|
| **Claude Opus 4.5** | Anthropic | `claude` | Orchestration, synthesis, architecture, coding | `budget_tokens: 32000` ⚡ |
| **Claude Sonnet 4.5** | Anthropic | `claude` | Balanced speed/quality, agents, computer use | `budget_tokens: 16000` ⚡ |
| **Claude Haiku 4.5** | Anthropic | `claude` | Speed, near-frontier coding | `budget_tokens: 8000` ⚡ |
| **GPT-5.2** | OpenAI | `openai` | Smartest reasoning, 93%+ GPQA Diamond | `reasoning_effort: "high"` ⚡ |
| **GPT-5.2-Codex** | OpenAI | `openai` | Agentic coding, 90%+ ARC-AGI | `reasoning_effort: "high"` ⚡ |
| **o3** | OpenAI | `openai` | Frontier reasoning, tools, visual perception | `reasoning_effort: "high"` ⚡ |
| **o4-mini** | OpenAI | `openai` | Fast reasoning, cost-efficient | `reasoning_effort: "medium"` ⚡ |
| **Gemini 3 Pro** | Google | `gemini` | Higher-reasoning, Deep Think mode | `thinking_level: "high"` ⚡ |
| **Gemini 3 Flash** | Google | `gemini` | Fast, Pro-grade reasoning at Flash speed | `thinking_level: "high"` ⚡ |

### Model Selection Criteria

```yaml
# ⚡ THINKING ALWAYS ON - Latest models only
# NOTE: GPT-5.2 family is preferred default for OpenAI tasks
selection_criteria:
  structural_analysis: gemini-3-pro     # Deep reasoning, agent-oriented
  code_generation: gpt-5.2-codex        # 90%+ ARC-AGI, agentic coding
  algorithm_design: gpt-5.2             # 93%+ GPQA Diamond, smartest reasoning
  implementation: sonnet-4.5            # Balanced quality, agents
  test_generation: gpt-5.2-codex        # Test expertise, agentic capabilities
  security_review: gpt-5.2              # Deep vulnerability reasoning
  documentation: gemini-3-pro           # Document analysis, 1501 Elo
  quick_checks: haiku-4.5               # Fast with near-frontier quality
  complex_reasoning: gpt-5.2            # Preferred for hard problems
```

---

## Task-to-Model Routing

### ⚡ ALL WITH THINKING ENABLED

### Development Workstreams

| Workstream | Primary Model | Fallback | Rationale |
|------------|---------------|----------|-----------|
| **Schemas** | Gemini 3 Pro ⚡ | GPT-5.2 | Deep structural analysis, 1501 Elo |
| **Storage** | GPT-5.2-Codex ⚡ | Sonnet 4.5 | Agentic coding, 90%+ ARC-AGI |
| **Core Logic** | GPT-5.2 ⚡ | Opus 4.5 | 93%+ GPQA Diamond, smartest |
| **Implementation** | GPT-5.2-Codex ⚡ | Sonnet 4.5 | Agentic coding excellence |
| **Tests** | GPT-5.2-Codex ⚡ | Sonnet 4.5 | Test generation expertise |

### QA Dimensions

| Dimension | Weight | Primary Model | Rationale |
|-----------|--------|---------------|-----------|
| **PRD Compliance** | 30% | Gemini 3 Pro ⚡ | Document analysis, Deep Think |
| **Error Handling** | 25% | GPT-5.2 ⚡ | Deep reasoning capabilities |
| **Type Safety** | 20% | GPT-5.2-Codex ⚡ | TypeScript expertise |
| **Architecture** | 15% | Opus 4.5 ⚡ | High-level patterns |
| **Security** | 10% | GPT-5.2 ⚡ | Deep vulnerability reasoning |

---

## Enhanced Commands

### `/develop` V2 - ALL WITH THINKING ⚡

```
/develop 2, 3
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 0: OPUS 4.5 ORCHESTRATOR                                   │
│          thinking: { enabled: true, budget_tokens: 32000 } ⚡     │
│                                                                 │
│ 1. Analyze task complexity and requirements                     │
│ 2. Run dependency check (Haiku 4.5, budget_tokens: 8000) ⚡      │
│ 3. Assign LATEST model per workstream (prefer GPT-5.2 family)   │
│ 4. Determine parallel vs sequential strategy                    │
│ 5. Output execution plan with diversity score                   │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1-4: MULTI-MODEL EXECUTION (via PAL-MCP) ⚡ ALL THINKING   │
│                                                                 │
│ Section 2 (parallel):                                           │
│ ├── Gemini 3 Pro  → Schemas (thinking_level: high) ⚡            │
│ ├── GPT-5.2-Codex → Storage (reasoning_effort: high) ⚡          │
│ ├── GPT-5.2       → Core Logic (reasoning_effort: high) ⚡       │
│ ├── GPT-5.2-Codex → Implementation (reasoning_effort: high) ⚡   │
│ └── GPT-5.2-Codex → Tests (reasoning_effort: high) ⚡            │
│                                                                 │
│ Section 3 (parallel):                                           │
│ └── [Same diverse assignment - all with thinking]               │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5: SYNTHESIS (Opus 4.5)                                    │
│          thinking: { enabled: true, budget_tokens: 32000 } ⚡     │
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
│ OPUS 4.5 ORCHESTRATOR (budget_tokens: 32000) ⚡                   │
│ Assigns dimensions to LATEST models                             │
└─────────────────────────────────────────────────────────────────┘
    │
    ├── Gemini 3 Pro  → PRD Compliance (30%) thinking_level: high ⚡
    ├── GPT-5.2       → Error Handling (25%) reasoning_effort: high ⚡
    ├── GPT-5.2-Codex → Type Safety (20%) reasoning_effort: high ⚡
    ├── Opus 4.5      → Architecture (15%) budget_tokens: 16000 ⚡
    └── GPT-5.2       → Security (10%) reasoning_effort: high ⚡
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ SYNTHESIS: Multi-perspective QA report (Opus 4.5) ⚡             │
│ - 5 different model viewpoints (all with thinking)              │
│ - Unified issue categorization                                  │
│ - Fix assignments to GPT-5.2 family (preferred)                 │
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
│ ├── Gemini 3 Pro → Technical summary (thinking_level: high) ⚡   │
│ ├── GPT-5.2      → Process reflection (reasoning_effort: high) ⚡│
│ └── GPT-5.2      → Creative insights (reasoning_effort: high) ⚡ │
│                                                                 │
│ Opus 4.5 synthesizes (budget_tokens: 16000) ⚡                   │
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
  # ANTHROPIC - Claude 4.5 Series (Extended Thinking via budget_tokens)
  opus-4.5:
    provider: anthropic
    cli: claude
    endpoint: claude-opus-4-5-20251101
    capabilities: [orchestration, synthesis, architecture, coding, agents]
    thinking:
      enabled: true
      budget_tokens: 32000  # ⚡ Maximum for complex tasks
    role: orchestrator

  sonnet-4.5:
    provider: anthropic
    cli: claude
    endpoint: claude-sonnet-4-5-20250929
    capabilities: [implementation, balanced, agents, computer-use]
    thinking:
      enabled: true
      budget_tokens: 16000  # ⚡ High for development
    role: worker

  haiku-4.5:
    provider: anthropic
    cli: claude
    endpoint: claude-haiku-4-5-20251001
    capabilities: [speed, near-frontier-coding, fast-tasks]
    thinking:
      enabled: true
      budget_tokens: 8000  # ⚡ Medium for fast checks
    role: checker

  # OPENAI - GPT-5.2 Series + o-Series Reasoning Models
  gpt-5.2:
    provider: openai
    cli: openai
    endpoint: gpt-5.2
    capabilities: [smartest, 93%-gpqa-diamond, synthesis]
    reasoning_effort: high  # ⚡ Maximum reasoning
    role: reasoner

  gpt-5.2-codex:
    provider: openai
    cli: openai
    endpoint: gpt-5.2-codex
    capabilities: [agentic-coding, refactoring, 90%-arc-agi]
    reasoning_effort: high  # ⚡ Maximum reasoning
    role: coder

  o3:
    provider: openai
    cli: openai
    endpoint: o3
    capabilities: [frontier-reasoning, tools, visual-perception, 87.7%-gpqa]
    reasoning_effort: high  # ⚡ Maximum reasoning
    role: reasoner

  o4-mini:
    provider: openai
    cli: openai
    endpoint: o4-mini
    capabilities: [fast-reasoning, cost-efficient, math, coding]
    reasoning_effort: medium  # ⚡ Balanced for speed
    role: fast-reasoner

  # GOOGLE - Gemini 3 Series (thinking_level parameter)
  gemini-3-pro:
    provider: google
    cli: gemini
    endpoint: gemini-3-pro
    capabilities: [higher-reasoning, deep-think, 1501-elo-lmarena]
    thinking_level: high  # ⚡ Maximum reasoning
    role: analyzer

  gemini-3-flash:
    provider: google
    cli: gemini
    endpoint: gemini-3-flash
    capabilities: [fast, pro-grade-reasoning, 90.4%-gpqa, cost-efficient]
    thinking_level: high  # ⚡ Maximum reasoning
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
    primary: haiku-4.5        # budget_tokens: 8000
    fallback: gemini-3-flash  # thinking_level: low
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

**For Gemini 3 Pro (structural analysis):**
```markdown
Analyze the data structures needed for [section].

[Configure: thinking_level: "high"]

You excel at:
- Long-context understanding (1M+ tokens)
- Structural pattern recognition (1501 Elo)
- Comprehensive analysis with Deep Think

Output Zod schemas with:
- Clear type definitions
- Validation rules
- Documentation comments
```

**For GPT-5.2-Codex (code generation):**
```markdown
Implement the storage layer for [section].

[Configure: reasoning_effort: "high"]

You excel at:
- Agentic coding (90%+ ARC-AGI)
- Database patterns
- Efficient implementations

Requirements:
- Repository pattern
- Atomic writes
- Error handling
```

**For GPT-5.2 (reasoning):**
```markdown
Validate the algorithm correctness for [section].

[Configure: reasoning_effort: "high"]

You excel at:
- Deep logical reasoning (93%+ GPQA Diamond)
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

## Thinking API Reference

### Anthropic Claude (Extended Thinking)

```yaml
# API Parameter Structure
thinking:
  enabled: true
  budget_tokens: <1024-128000>  # Minimum 1024, max varies by model

# Budget Token Guidelines
budget_tokens:
  minimum: 1024          # Start here and increase as needed
  haiku_default: 8000    # Fast checks, dependency analysis
  sonnet_default: 16000  # Development, implementation
  opus_default: 32000    # Complex orchestration, synthesis

# Supported Models
supported:
  - claude-opus-4-5-20251101
  - claude-sonnet-4-5-20250929
  - claude-haiku-4-5-20251001
```

### OpenAI (Reasoning Models)

```yaml
# API Parameter
reasoning_effort: "low" | "medium" | "high"

# Reasoning Effort Levels
levels:
  low: Faster responses, fewer reasoning tokens
  medium: Balanced (default)
  high: Maximum reasoning depth, more tokens

# Use max_completion_tokens instead of max_tokens for o-series
# Use reasoning_effort for GPT-5.x models that support reasoning

# Supported Models
supported:
  - gpt-5.2
  - gpt-5.2-codex
  - o3
  - o3-pro
  - o4-mini
```

### Google Gemini (Thinking Mode)

```yaml
# API Parameter (Gemini 3)
thinking_level: "minimal" | "low" | "medium" | "high"

# Thinking Levels (Gemini 3 Flash)
levels:
  minimal: Near-zero thinking, fastest
  low: Minimal thinking, chat/high-throughput
  medium: Balanced reasoning
  high: Maximum reasoning depth (default for complex tasks)

# Thinking Levels (Gemini 3 Pro)
# Only supports: "low" | "high"

# Legacy Parameter (Gemini 2.5)
thinking_budget: <0-32768>  # Token budget

# Supported Models
supported:
  - gemini-3-pro
  - gemini-3-flash
  - gemini-2.5-pro
  - gemini-2.5-flash
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
| 2.1 | Jan 2026 | Latest models (GPT-5.2, Gemini 3) + Thinking Always On |
| 2.2 | Jan 2026 | Accurate thinking params per provider (budget_tokens, reasoning_effort, thinking_level), GPT-5.2 family as default, added o3/o4-mini, Thinking API Reference |
