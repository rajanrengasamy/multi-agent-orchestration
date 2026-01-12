# Multi-Agent Orchestration Template

A Claude Code project template with multi-agent orchestration, dependency-aware parallel development, and VectorDB semantic context retrieval.

## Features

- **Dependency-Aware Development**: Haiku pre-flight checks before spawning expensive Opus agents
- **Multi-Section Parallelization**: `/develop 2, 3` spawns 10 agents (5 per section) when independent
- **Extended Thinking by Default**: All agents use `ultrathink` for deep reasoning
- **5-Dimension QA Framework**: Comprehensive code review with automated fix cycles
- **VectorDB Context**: Semantic search for PRD, tasks, and session history
- **Context7 Integration**: Up-to-date library documentation in prompts
- **Hooks System**: Auto-formatting, file protection, session startup checks
- **Modular Rules**: Path-specific coding conventions

## Quick Start

### 1. Clone the Template

```bash
git clone https://github.com/rajanrengasamy/multi-agent-orchestration.git my-project
cd my-project
```

### 2. Initialize Your Project

```bash
./scripts/init-project.sh "My Project Name"
```

### 3. Configure Environment

Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-...
```

### 4. Seed the VectorDB

```bash
npm run seed-context
```

### 5. Start Using Commands

```bash
# In Claude Code
/develop <section>    # Develop features (5 agents per section)
/develop 2, 3         # Multi-section with dependency check
/qa <section>         # Run QA review
/journal              # Record session notes
/sync                 # Git sync workflow
/startagain           # Bootstrap new session
```

## Multi-Section Development

The `/develop` command supports intelligent parallel development with automatic dependency detection.

### How It Works

```
/develop 2, 3
    │
    ▼
┌─────────────────────────────────────┐
│ Phase 0: Haiku Dependency Check     │
│ Model: haiku (latest) + think hard  │
│ Cost: ~$0.002 (100x cheaper)        │
│                                     │
│ Analyzes:                           │
│ - Type/schema dependencies          │
│ - Import dependencies               │
│ - Data flow dependencies            │
│                                     │
│ Output: parallel OR sequential      │
└─────────────────────────────────────┘
    │
    ├── No dependencies found?
    │   └── Spawn ALL section agents in parallel
    │       /develop 2, 3 → 10 Opus agents simultaneously
    │
    └── Dependencies found?
        └── Execute sections sequentially
            Phase 1: Section 2 (5 agents)
            Phase 2: Section 3 (5 agents, uses Section 2 output)
```

### Agent Scaling

| Command | Sections | Dependency Check | Agents Spawned |
|---------|----------|------------------|----------------|
| `/develop 2` | 1 | Skipped | 5 Opus |
| `/develop 2, 3` | 2 (independent) | Yes | 10 Opus (parallel) |
| `/develop 2, 3` | 2 (dependent) | Yes | 5 + 5 Opus (sequential) |
| `/develop 2, 3, 4` | 3 (independent) | Yes | 15 Opus (parallel) |

### Workstreams Per Section

Each section spawns 5 parallel agents:

| Workstream | Focus | Output |
|------------|-------|--------|
| **Schemas** | Zod schemas, TypeScript types | `src/schemas/` |
| **Storage** | Database models, persistence | `src/storage/` |
| **Core Logic** | Business logic, algorithms | `src/core/` |
| **Implementation** | API endpoints, UI components | `src/features/` |
| **Tests** | Unit tests, integration tests | `tests/` |

## Extended Thinking

All agents have extended thinking enabled by default for deeper reasoning.

### Model & Thinking Configuration

| Agent | Model | Thinking | Purpose |
|-------|-------|----------|---------|
| `@dev` | Opus (latest) | `ultrathink` | Feature implementation |
| `@qa-reviewer` | Opus (latest) | `ultrathink` | QA review with 5-dimension framework |
| `@debugger` | Opus (latest) | `ultrathink` | Bug investigation |
| `@code-reviewer` | Haiku (latest) | `think hard` | Fast read-only review |
| `@dependency-check` | Haiku (latest) | `think hard` | Pre-flight dependency analysis |

### Thinking Keywords

Use these keywords in prompts to control thinking depth:

| Keyword | Budget | Use Case |
|---------|--------|----------|
| `think` | Low | Simple lookups, formatting |
| `think hard` | Medium | Analysis, planning, Haiku tasks |
| `think harder` | High | Complex reasoning |
| `ultrathink` | Very High | **DEFAULT** - Implementation, architecture |
| `megathink` | Maximum | Critical decisions, error recovery |

### Example Agent Prompt

```markdown
Task: Implement user authentication

ultrathink

Requirements:
- JWT-based authentication
- Refresh token rotation
- Secure cookie storage
```

## Directory Structure

```
.
├── .claude/                    # Claude Code configuration
│   ├── CLAUDE.md              # Main project memory
│   ├── agents/                # Agent definitions
│   │   ├── dev.md             # Developer agent (opus + ultrathink)
│   │   ├── qa-reviewer.md     # QA reviewer (opus + ultrathink)
│   │   ├── code-reviewer.md   # Read-only reviewer (haiku + think hard)
│   │   └── debugger.md        # Bug investigator (opus + ultrathink)
│   ├── commands/              # Custom slash commands
│   │   ├── develop.md         # /develop command with dependency check
│   │   ├── qa.md              # /qa command
│   │   ├── setup-project.md   # /setup-project command
│   │   └── audit-config.md    # /audit-config command
│   ├── skills/                # Context-forking skills
│   │   ├── develop-section/   # Parallel development (5 agents)
│   │   ├── dependency-check/  # Haiku pre-flight analysis
│   │   └── qa-section/        # QA cycle with fixes
│   ├── rules/                 # Modular coding rules
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── api-design.md
│   ├── settings.json          # Model/thinking defaults
│   └── hooks/                 # Automation hooks
│       └── hooks.json
├── src/context/               # VectorDB infrastructure
│   ├── types.ts
│   ├── retrieval.ts
│   ├── storage.ts
│   └── index.ts
├── scripts/                   # CLI tools
│   ├── init-project.sh
│   ├── seed-context.ts
│   ├── retrieve-context.ts
│   ├── store-journal-entry.ts
│   └── get-todo-section.ts
├── docs/                      # Project documentation
├── todo/                      # Task tracking
├── journal.md                 # Session history
├── .mcp.json                  # MCP servers (Context7)
└── package.json
```

## Claude Code Plugin

Install the companion plugin for global commands:

```bash
claude --plugin-dir ./claude-project-plugin
```

### Plugin Commands

| Command | Description |
|---------|-------------|
| `/journal` | Record session retrospective |
| `/sync` | Git commit + rebase + push |
| `/startagain` | Bootstrap new session with context |

## Skills Reference

| Skill | Model | Thinking | Purpose |
|-------|-------|----------|---------|
| `/develop-section` | Opus | ultrathink | 5 parallel dev agents per section |
| `/dependency-check` | Haiku | think hard | Pre-flight dependency analysis |
| `/qa-section` | Opus | ultrathink | 5-dimension QA with auto-fixes |

## VectorDB Context System

The template includes a semantic retrieval system using LanceDB:

```bash
# Seed documentation into VectorDB
npm run seed-context

# Query context
npx tsx scripts/retrieve-context.ts "authentication implementation"
```

### Collections

| Collection | Content |
|------------|---------|
| `prd_sections` | Documentation chunks |
| `todo_snapshots` | Task state history |
| `journal_entries` | Session summaries |
| `session_summaries` | Quick context |

## Hooks

| Hook | Event | Action |
|------|-------|--------|
| SessionStart | Session begins | Check VectorDB availability |
| PostToolUse | After Write/Edit | Auto-format with Prettier |
| PreToolUse | Before Write/Edit | Validate protected files |

## Context7 Integration

Include `use context7` in prompts for up-to-date library documentation:

```
Implement user authentication using NextAuth. use context7
```

## Customization

### Adding New Agents

Create `.claude/agents/my-agent.md`:
```yaml
---
name: my-agent
description: Description for auto-detection
model: opus
thinking: ultrathink
---

# Agent instructions...
```

### Adding New Commands

Create `.claude/commands/my-command.md`:
```yaml
---
description: Command description
argument-hint: <arg>
---

# Command instructions...
```

### Adding New Skills

Create `.claude/skills/my-skill/SKILL.md`:
```yaml
---
name: my-skill
description: Skill description
context: fork
model: opus
thinking: ultrathink
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
---

# Skill workflow...
```

### Adding Rules

Create `.claude/rules/my-rules.md` and import in CLAUDE.md:
```markdown
@.claude/rules/my-rules.md
```

## Cost Optimization

The dependency check pattern saves money:

| Scenario | Without Pre-Check | With Pre-Check |
|----------|-------------------|----------------|
| 2 independent sections | 10 Opus agents (~$0.50) | 10 Opus agents (~$0.50) |
| 2 dependent sections (fails) | 10 Opus agents wasted (~$0.50) | Haiku check (~$0.002) + 10 Opus sequential (~$0.50) |
| **Savings on failure** | $0 | **~$0.50 saved** |

The ~$0.002 Haiku pre-flight check prevents wasting ~$0.50+ on parallel Opus runs that would fail due to missing dependencies.

## Requirements

- Node.js >= 18
- npm
- OpenAI API key (for embeddings)
- Claude Code CLI

## License

MIT
