---
description: Initialize project with Claude Code setup
---

# Project Setup Command

Initialize the project with Claude Code development infrastructure.

## Steps

### 1. Run Initialization Script

```bash
chmod +x scripts/init-project.sh
./scripts/init-project.sh
```

### 2. Verify Setup

Check that all components are created:

```bash
# Check directories
ls -la .claude/
ls -la docs/
ls -la todo/
ls -la src/context/

# Check key files
cat .claude/CLAUDE.md
cat .claude/settings.local.json
```

### 3. Configure Environment

1. Copy `.env.example` to `.env`
2. Add your `OPENAI_API_KEY`
3. Update `PROJECT_NAME` and `PROJECT_SLUG`

### 4. Seed VectorDB

```bash
npm run seed-context
```

### 5. Test Context Retrieval

```bash
npx tsx scripts/retrieve-context.ts "project setup test"
```

## Verification Checklist

- [ ] .claude/CLAUDE.md exists and customized
- [ ] .claude/settings.local.json has permissions
- [ ] docs/ directory ready for PRD
- [ ] todo/tasks.md ready for task tracking
- [ ] VectorDB initialized and seeded
- [ ] Context retrieval working
- [ ] npm install completed

## Next Steps

1. Add project documentation to `docs/`
2. Define tasks in `todo/tasks.md`
3. Re-run `npm run seed-context` to index
4. Start using `/develop` and `/qa` commands
