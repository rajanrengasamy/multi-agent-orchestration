# Journal Command

Record a structured session journal entry with optional VectorDB storage.

## Description

This command helps you reflect on the current session and create a structured journal entry that captures decisions, progress, and insights. The entry is appended to `journal.md` and optionally stored in VectorDB for semantic retrieval.

## Steps

1. **Reflect on the session**
   - Review what was accomplished
   - Note any significant decisions made
   - Identify blockers or challenges encountered
   - Capture lessons learned

2. **Gather session metadata**
   - Current date and time
   - Session duration (if tracked)
   - Files modified
   - Key topics discussed

3. **Generate journal entry using this template**

```markdown
---
## Session: [DATE] [TIME]

### Summary
[2-3 sentence overview of what was accomplished]

### Completed
- [Task or feature completed]
- [Another completed item]

### Decisions
- [Key decision and rationale]
- [Another decision]

### Blockers/Challenges
- [Issue encountered and resolution or status]

### Next Steps
- [ ] [Upcoming task]
- [ ] [Another task]

### Notes
[Any additional context, insights, or reminders]

---
```

4. **Append to journal.md**
   - Read existing journal.md content
   - Prepend new entry (newest first) or append (chronological)
   - Write updated content

5. **Store in VectorDB (if available)**
   - Check if VectorDB is configured (`src/context/` exists)
   - If available, trigger context seeding:
     ```bash
     npm run seed-context
     ```
   - This makes the journal entry retrievable via semantic search

## Usage

```
/journal
```

Or with a summary:

```
/journal Implemented user authentication with JWT tokens
```

## Example Output

```markdown
---
## Session: 2024-01-15 14:30

### Summary
Implemented JWT-based authentication system with refresh token support. Added middleware for protected routes and created user login/logout endpoints.

### Completed
- Created auth middleware in `src/middleware/auth.ts`
- Added login endpoint with password hashing
- Implemented refresh token rotation
- Added logout with token blacklisting

### Decisions
- Using RS256 for JWT signing (asymmetric for better security)
- Refresh tokens stored in httpOnly cookies
- Access token expiry: 15 minutes, Refresh: 7 days

### Blockers/Challenges
- Redis connection issues resolved by updating connection string format

### Next Steps
- [ ] Add password reset flow
- [ ] Implement rate limiting on auth endpoints
- [ ] Add 2FA support

### Notes
Consider adding session management UI in admin dashboard.

---
```

## Configuration

The journal file location can be customized in your project:
- Default: `journal.md` in project root
- Alternative: `docs/journal.md` or `.claude/journal.md`
