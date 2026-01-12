# Multi-Agent Orchestration Template

A Claude Code project template with multi-agent orchestration and VectorDB semantic context retrieval.

## Features

- **Multi-Agent Development**: Parallel dev agents for efficient feature implementation
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
/develop <section>    # Develop features
/qa <section>         # Run QA review
/journal              # Record session notes
/sync                 # Git sync workflow
/startagain           # Bootstrap new session
```

## Directory Structure

```
.
├── .claude/                    # Claude Code configuration
│   ├── CLAUDE.md              # Main project memory
│   ├── agents/                # Agent definitions
│   │   ├── dev.md             # Developer agent
│   │   ├── qa-reviewer.md     # QA reviewer agent
│   │   ├── code-reviewer.md   # Read-only reviewer
│   │   └── debugger.md        # Bug investigator
│   ├── commands/              # Custom slash commands
│   │   ├── develop.md         # /develop command
│   │   ├── qa.md              # /qa command
│   │   ├── setup-project.md   # /setup-project command
│   │   └── audit-config.md    # /audit-config command
│   ├── skills/                # Context-forking skills
│   │   ├── develop-section/   # Parallel development
│   │   └── qa-section/        # QA cycle
│   ├── rules/                 # Modular coding rules
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── api-design.md
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

## Agents

| Agent | Model | Description |
|-------|-------|-------------|
| `@dev` | Opus | Feature implementation |
| `@qa-reviewer` | Opus | QA review with 5-dimension framework |
| `@code-reviewer` | Haiku | Read-only code review |
| `@debugger` | Opus | Bug investigation |

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

### Adding Rules

Create `.claude/rules/my-rules.md` and import in CLAUDE.md:
```markdown
@.claude/rules/my-rules.md
```

## Requirements

- Node.js >= 18
- npm
- OpenAI API key (for embeddings)

## License

MIT
