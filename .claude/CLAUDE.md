# $PROJECT_NAME

## Quick Commands
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
- Seed Context: `npm run seed-context`
- Retrieve Context: `npx tsx scripts/retrieve-context.ts "query"`

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

## Key Files
| File | Purpose |
|------|---------|
| `docs/` | PRD, architecture, specs |
| `todo/tasks.md` | Task tracking |
| `journal.md` | Session history |
| `src/context/` | VectorDB infrastructure |
| `scripts/` | CLI tools |
