---
name: startagain
description: Bootstrap a new session with context retrieval from VectorDB
context: fork
model: opus
allowed-tools: Read, Bash, Glob, Grep
---

# Start Again Skill

Bootstrap a new session with context retrieval from VectorDB.

## Thinking Configuration

```yaml
model: opus (latest)
thinking: ultrathink
purpose: Deep context analysis for session continuity
```

## Description

This skill initializes a new working session by retrieving relevant context from the project's VectorDB (if available), presenting a context summary, and asking for the session focus. It provides continuity between sessions by leveraging semantic search over project documentation, journals, and task lists.

## Usage

```
/startagain
/startagain authentication implementation
```

## Steps

### Step 1: Check VectorDB Availability

```bash
# Check if context infrastructure exists
ls -la src/context/
ls -la .lancedb/
```

If VectorDB is not configured, use fallback mode.

### Step 2: If VectorDB is Available

**Retrieve recent context:**

```bash
# Get recent journal entries
npx tsx scripts/retrieve-context.ts "recent session progress"

# Get current tasks
npx tsx scripts/retrieve-context.ts "current tasks todo pending"

# Get architectural context
npx tsx scripts/retrieve-context.ts "architecture design decisions"
```

**Parse and summarize results:**
- Extract key points from retrieved chunks
- Identify incomplete tasks
- Note recent decisions and their rationale
- Highlight any blockers mentioned

### Step 3: If VectorDB is NOT Available (Fallback)

**Read key files directly:**

```bash
# Read task list
cat todo/tasks.md 2>/dev/null || cat TODO.md 2>/dev/null

# Read recent journal (last 50 lines)
tail -50 journal.md 2>/dev/null

# Read project context
cat .claude/CLAUDE.md 2>/dev/null
```

**Suggest setting up VectorDB:**

```
Note: VectorDB is not configured. For better context retrieval, run:
npm run seed-context
```

### Step 4: Present Context Summary

Display a structured summary:

```markdown
## Session Context

### Recent Progress
- [Summary of last session's work]
- [Key accomplishments]

### Open Tasks
- [ ] [Pending task 1]
- [ ] [Pending task 2]

### Key Decisions
- [Recent architectural/design decisions]

### Blockers
- [Any unresolved issues]
```

### Step 5: Ask for Session Focus

Prompt the user:

```
What would you like to focus on this session?

Suggestions based on context:
1. Continue with [incomplete task from last session]
2. Address [blocker if any]
3. Start new work

Enter your focus or describe what you'd like to accomplish:
```

### Step 6: Retrieve Targeted Context

Based on user's focus, run additional retrieval:

```bash
npx tsx scripts/retrieve-context.ts "[user's focus area]"
```

### Step 7: Begin Session

Present relevant context for the chosen focus and offer to help with first steps.

## Example Session

```
$ /startagain

Retrieving project context...

## Session Context

### Recent Progress (Last Session: 2024-01-14)
- Implemented user registration endpoint
- Added email verification flow
- Created database migrations for users table

### Open Tasks
- [ ] Add password reset functionality
- [ ] Implement rate limiting on auth endpoints
- [ ] Set up Redis for session storage
- [ ] Write integration tests for auth flow

### Key Decisions
- Using JWT with RS256 signing
- Refresh tokens stored in httpOnly cookies
- Redis for token blacklisting

### Blockers
- None currently identified

---

What would you like to focus on this session?

Suggestions based on context:
1. Continue with password reset functionality
2. Implement rate limiting
3. Start new work

> password reset

Retrieving context for "password reset"...

Found relevant context:
- Email service already configured (src/services/email.ts)
- Token utilities available (src/utils/tokens.ts)
- Similar flow exists in email verification

Ready to help with password reset. Would you like to:
1. Design the API endpoints first
2. Start with the token generation logic
3. Review existing email verification for patterns
```

## VectorDB Queries

The skill uses these semantic queries:

| Query | Purpose |
|-------|---------|
| "recent session progress" | Get latest journal entries |
| "current tasks todo pending" | Find incomplete work items |
| "architecture design decisions" | Understand project patterns |
| "[user focus]" | Targeted retrieval for session |

## Fallback Mode

When VectorDB is not available:

1. Reads files directly from disk
2. Shows last 50 lines of journal
3. Displays full task list
4. Recommends setting up VectorDB

To enable VectorDB:

```bash
# Ensure OpenAI API key is set
export OPENAI_API_KEY=your-key

# Seed the database
npm run seed-context
```

## Configuration

Customize context sources in `src/context/config.ts`:

```typescript
export const contextConfig = {
  sources: [
    { path: 'docs/', type: 'documentation' },
    { path: 'todo/', type: 'tasks' },
    { path: 'journal.md', type: 'journal' },
  ],
  retrieval: {
    topK: 5,
    minScore: 0.7,
  },
};
```
