---
description: Run QA review on TODO sections
argument-hint: <section_number | comma-separated sections>
---

# QA Orchestrator

Orchestrate comprehensive QA reviews with automated fix cycles and re-verification.

## Input

**Argument**: `$ARGUMENTS`

- A section number (e.g., `2.1`) - review single section
- Multiple sections (e.g., `2.1, 2.2, 2.3`) - batch review
- `all` - review all implemented sections

## Execution Flow

### Phase 1: Context Retrieval

1. **Check VectorDB Availability**
   ```bash
   ls ~/.${PROJECT_SLUG:-project}/context/lancedb/ 2>/dev/null && echo "VectorDB: AVAILABLE" || echo "VectorDB: NOT FOUND"
   ```

2. **Retrieve Context**
   ```bash
   npx tsx scripts/retrieve-context.ts "Section $ARGUMENTS QA review"
   ```

### Phase 2: QA Review Execution

Spawn qa-reviewer agent with the 5-dimension framework:

```
Task: @qa-reviewer

Review Section $ARGUMENTS against requirements.

Context from VectorDB:
[PASTE VECTORDB OUTPUT]

Dimensions to assess:
- PRD Compliance (30%)
- Error Handling (25%)
- Type Safety (20%)
- Architecture (15%)
- Security (10%)

Output: Create docs/Section$ARGUMENTS-QA-issues.md
```

### Phase 3: Fix Cycle

For critical and major issues:

1. **Spawn dev agents** (5 in parallel for efficiency)
2. **Distribute issues** by category:
   - Agent 1: Critical + architectural
   - Agent 2: Critical + security
   - Agent 3: Major (error handling)
   - Agent 4: Major (type safety)
   - Agent 5: Remaining issues

### Phase 4: Re-verification

```bash
# After fixes
npm run build
npm test

# Re-run QA review
Task: @qa-reviewer Re-verify Section $ARGUMENTS after fixes
```

### Phase 5: Summary Report

```markdown
# QA Summary: Section $ARGUMENTS

## Status: [PASS / ISSUES_REMAINING]

## QA Passes
- First pass: X issues (Y Critical, Z Major)
- Re-verification: X remaining

## Fixes Applied
- Files modified: [list]
- Issues fixed: X of Y

## Build/Test
- TypeScript: PASS/FAIL
- Tests: PASS/FAIL

## Remaining Issues (if any)
- [list with reasons]
```

## Mandatory: Run /journal after completion
