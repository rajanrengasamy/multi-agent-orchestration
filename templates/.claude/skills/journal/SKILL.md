---
name: journal
description: Record a structured session journal entry with VectorDB storage
context: fork
model: haiku
allowed-tools: Read, Write, Edit, Bash
---

# Journal Skill

Record a structured session journal entry for continuity across Claude Code sessions. Entries are stored both in `journal.md` (human-readable) and VectorDB (semantic retrieval via `/startagain`).

## Thinking Configuration

```yaml
model: haiku (latest)
thinking: think hard
purpose: Lightweight session logging with minimal cost
```

## Usage

```
/journal
/journal "Brief summary of what was accomplished"
```

## Workflow

### Step 1: Gather Session Information

If no summary was provided via arguments, prompt for session details:

```
Please provide a brief summary of what was accomplished this session:
```

Collect the following information either from user input or by analyzing recent conversation:

1. **Summary** - Brief 1-2 sentence overview
2. **Work Completed** - List of completed tasks
3. **Issues & Resolutions** - Any problems encountered and how they were solved
4. **Key Decisions** - Architectural or design decisions made
5. **Learnings** - Technical insights discovered
6. **Open Items** - Remaining tasks or blockers
7. **Context for Next Session** - What to focus on next

### Step 2: Format Journal Entry

Create a structured journal entry following this template:

```markdown
---

## Session: [DATE] [TIME]

### Summary
[Brief overview of what was accomplished]

### Work Completed
- [Task 1]
- [Task 2]

### Issues & Resolutions
| Issue | Resolution | Status |
|:------|:-----------|:-------|
| [Problem] | [Solution] | Resolved/Open |

### Key Decisions
- [Decision and rationale]

### Learnings
- [Technical insight discovered]

### Open Items / Blockers
- [ ] [Item needing attention]

### Context for Next Session
[Brief narrative of where things stand and recommended next steps]

---
```

### Step 3: Append to journal.md

Check if `journal.md` exists in the project root:

```bash
if [ -f "./journal.md" ]; then
  echo "Journal file exists"
else
  echo "Creating journal.md with header"
  cat > ./journal.md << 'EOF'
# Project Journal

This file maintains session history for continuity across Claude Code sessions.
Use alongside `todo/tasks.md` (task list) and `docs/` (PRD/specs) when starting new sessions.

> Note: Entries are also stored in VectorDB for semantic retrieval via `/startagain`.
EOF
fi
```

Append the new entry to `journal.md`.

### Step 4: Store in VectorDB

Store the entry in VectorDB if available:

```bash
# Check if VectorDB is available
if [ -d "./.lancedb" ]; then
  npx tsx scripts/store-journal-entry.ts /tmp/journal-entry.json
  echo "Journal entry stored in VectorDB"
else
  echo "WARNING: VectorDB not available. Entry saved to journal.md only."
  echo "Run 'npm run seed-context' to enable VectorDB storage."
fi
```

### Step 5: Confirmation

Output confirmation with summary:

```markdown
## Journal Entry Recorded

**Date:** [DATE] [TIME]
**Summary:** [SUMMARY]

**Stored in:**
- journal.md (appended)
- VectorDB (for semantic retrieval)

**Work Completed:** [X] items
**Open Items:** [Y] items

To retrieve this entry later:
- View: `cat journal.md | tail -100`
- Search: `npx tsx scripts/retrieve-context.ts "[topic]"`
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Required for VectorDB embeddings | (required) |

### File Locations

| File | Purpose |
|------|---------|
| `journal.md` | Human-readable session history |
| `.lancedb/` | VectorDB storage for semantic retrieval |
| `scripts/store-journal-entry.ts` | VectorDB storage script |

## Integration with Other Skills

- **`/startagain`** - Retrieves relevant journal entries when starting a new session
- **`/develop`** - Journal entries provide context for development tasks
- **`/qa-section`** - QA results can reference previous session decisions

## Best Practices

1. **Run at session end** - Record progress before closing Claude Code
2. **Be specific** - Include file names, function names, and specific changes
3. **Note blockers** - Help future sessions understand what was stuck
4. **Include rationale** - Document why decisions were made, not just what
5. **Link to files** - Reference specific files and line numbers when relevant
