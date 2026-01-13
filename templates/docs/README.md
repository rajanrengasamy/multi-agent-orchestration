# Documentation

Place your project documentation here:

## Recommended Structure

```
docs/
├── README.md           # This file
├── prd.md              # Product Requirements Document
├── architecture.md     # System architecture
├── api-design.md       # API specifications
└── QA-reports/         # QA review outputs
    └── Section1-QA-issues.md
```

## PRD Template

Create `prd.md` with:

1. **Overview** - What the project does
2. **Goals** - What success looks like
3. **Requirements** - Functional and non-functional
4. **Architecture** - High-level system design
5. **API Specifications** - Endpoints, schemas
6. **Data Models** - Database schemas
7. **Security** - Authentication, authorization
8. **Testing** - Test strategy

## Usage with VectorDB

When you run `npm run seed-context`, the following are indexed:

| Directory | What's Indexed | Purpose |
|-----------|----------------|---------|
| `docs/*.md` | All markdown files | PRD, architecture, specs |
| `todo/*.md` | All markdown files | Task tracking (tasks.md, todo.md, etc.) |
| `journal.md` | Root journal file | Session history |

Each file is:
1. Parsed and chunked by section
2. Embedded using OpenAI embeddings
3. Stored in VectorDB for semantic search

Agents can then query relevant context using:
```bash
npx tsx scripts/retrieve-context.ts "your query here"
```
