# $PROJECT_NAME

## Quick Commands
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
- Seed Context: `npm run seed-context`
- Retrieve Context: `npx tsx scripts/retrieve-context.ts "query"`

## Model & Thinking Configuration

### Default Models
| Role | Model | Thinking |
|------|-------|----------|
| **Main Development** | `opus` (latest) | `ultrathink` |
| **QA Review** | `opus` (latest) | `ultrathink` |
| **Dependency Check** | `haiku` (latest) | `think hard` |
| **Code Review** | `haiku` (latest) | `think hard` |

### Thinking Keywords (Always Enabled)
Extended thinking is **ALWAYS ON** by default in this project. Use these keywords to control thinking depth:

| Keyword | Budget | Use Case |
|---------|--------|----------|
| `think` | Low | Simple lookups, formatting |
| `think hard` | Medium | Analysis, planning, Haiku tasks |
| `think harder` | High | Complex reasoning |
| `ultrathink` | Very High | **DEFAULT** - Implementation, architecture |
| `megathink` | Maximum | Critical decisions, error recovery |

### Agent Prompt Requirements
**All agent prompts MUST include a thinking keyword.** Examples:

```markdown
# Good - includes ultrathink
Task: Implement user authentication
ultrathink
Requirements: ...

# Good - includes think hard for Haiku
Task: Analyze dependencies
think hard
Sections: 2, 3, 4
```

## Architecture
[Describe your project architecture here after running init-project.sh]

## Tech Stack
- TypeScript (ES2022, NodeNext modules)
- Zod for validation
- LanceDB for VectorDB
- OpenAI for embeddings

## Conventions
@.claude/rules/code-style.md
@.claude/rules/testing.md
@.claude/rules/security.md
@.claude/rules/api-design.md

## Context System
This project uses VectorDB for semantic context retrieval.

### Usage
- `npm run seed-context` - Index docs/todo/journal into VectorDB
- `npx tsx scripts/retrieve-context.ts "query"` - Query relevant context
- Include `use context7` in prompts for up-to-date library documentation

### For Agents
Agents should retrieve context from VectorDB instead of reading raw files:
```bash
npx tsx scripts/retrieve-context.ts "Section X implementation"
```

## Multi-Section Development

### `/develop` Command
Supports intelligent parallel development:

```bash
# Single section - 5 Opus agents
/develop 2

# Multiple sections - Haiku dependency check, then 5 agents per section
/develop 2, 3

# If independent: 10 agents in parallel
# If dependent: Sequential phases (5 + 5)
```

### Dependency Check Flow
```
/develop 2, 3, 4
    │
    ▼
┌─────────────────────────────────────┐
│ Phase 0: Haiku + think hard         │
│ - Analyze inter-section deps        │
│ - Output: parallel OR sequential    │
│ - Cost: ~$0.002 (100x cheaper)      │
└─────────────────────────────────────┘
    │
    ├── No deps? → All sections parallel (15 Opus agents)
    │
    └── Has deps? → Sequential phases with 5 agents each
```

## Key Files
| File | Purpose |
|------|---------|
| `docs/` | PRD, architecture, specs |
| `todo/tasks.md` | Task tracking |
| `journal.md` | Session history |
| `src/context/` | VectorDB infrastructure |
| `scripts/` | CLI tools |

## Skills Reference

| Skill | Model | Thinking | Purpose |
|-------|-------|----------|---------|
| `/develop-section` | Opus | ultrathink | 5 parallel dev agents per section |
| `/dependency-check` | Haiku | think hard | Pre-flight dependency analysis |
| `/qa-section` | Opus | ultrathink | 5-dimension QA with fixes |
