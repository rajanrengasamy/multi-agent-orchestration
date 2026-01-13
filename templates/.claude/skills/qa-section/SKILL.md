---
name: qa-section
description: Run complete QA cycle on a single TODO section. Reviews code, identifies issues, fixes them, re-verifies.
context: fork
model: opus
thinking: ultrathink
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task, TodoWrite
---

# QA Section Skill

Run a comprehensive quality assurance cycle on a completed TODO section using **latest Opus with ultrathink** for deep analysis.

## Thinking Configuration

```yaml
orchestrator: opus (latest) + ultrathink
qa_reviewer: opus (latest) + ultrathink
fix_agents: opus (latest) + ultrathink
thinking: ALWAYS ON (ultrathink keyword in all agent prompts)
```

## Usage

```
/qa-section <section-name>
```

## Workflow

### Step 1: Completeness Check

Verify the section is marked complete before QA:

```bash
# Check TODO.md for section status
grep -A 5 "$ARGUMENTS" TODO.md | grep -q "\[x\]" || {
  echo "ERROR: Section '$ARGUMENTS' is not marked complete in TODO.md"
  echo "Run /develop-section first"
  exit 1
}
```

### Step 2: VectorDB Context Retrieval

Retrieve context to understand requirements:

```bash
# Check VectorDB availability
if ls ./.lancedb/ 2>/dev/null; then
  npm run retrieve -- "$ARGUMENTS"
else
  echo "WARNING: VectorDB not available. QA will proceed without PRD context."
fi
```

### Step 3: First QA Pass with QA Reviewer Agent

Spawn a QA reviewer agent with ultrathink for thorough analysis:

```
Task (QA Review):
ultrathink

Review the implementation of [section] against the 5-dimension QA framework in dimensions.md.

Check:
1. PRD Compliance (30%): Does implementation match requirements?
2. Error Handling (25%): Are all error paths covered?
3. Type Safety (20%): No any, proper types, Zod alignment?
4. Architecture (15%): Good organization, DRY, modularity?
5. Security (10%): Input validation, no secrets exposed?

Output a structured QA report with:
- Score for each dimension (0-100)
- Specific issues found with file:line references
- Severity: CRITICAL / HIGH / MEDIUM / LOW
- Suggested fixes"
```

### Step 4: Parse QA Report and Categorize Issues

Process the QA report:

```typescript
interface QAIssue {
  dimension: 'prd' | 'error' | 'types' | 'architecture' | 'security';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  file: string;
  line?: number;
  description: string;
  suggestedFix: string;
}

// Categorize issues by priority
const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
const highIssues = issues.filter(i => i.severity === 'HIGH');
const mediumIssues = issues.filter(i => i.severity === 'MEDIUM');
const lowIssues = issues.filter(i => i.severity === 'LOW');
```

**Priority Order:**
1. CRITICAL - Security vulnerabilities, data loss risks
2. HIGH - Broken functionality, missing error handling
3. MEDIUM - Type issues, code quality problems
4. LOW - Style issues, minor improvements

### Step 5: Fix Issues with Dev Agents

Spawn 5 parallel dev agents (using Opus + ultrathink) to fix categorized issues:

```
Task 1 (PRD Fixes):
ultrathink
Fix all PRD compliance issues: [list issues]. Ensure implementation matches requirements.

Task 2 (Error Handling):
ultrathink
Fix all error handling issues: [list issues]. Add proper try/catch, null checks, API error handling.

Task 3 (Type Safety):
ultrathink
Fix all type safety issues: [list issues]. Remove any, add proper types, align with Zod schemas.

Task 4 (Architecture):
ultrathink
Fix all architecture issues: [list issues]. Improve modularity, remove duplication, better organization.

Task 5 (Security):
ultrathink
Fix all security issues: [list issues]. Add input validation, remove hardcoded secrets, prevent injection.
```

Each agent should:
- Focus only on their assigned dimension
- Make minimal changes to fix issues
- Not introduce new functionality
- Document changes made

### Step 6: Re-verification with QA Reviewer

After fixes are applied, run another QA pass with ultrathink:

```
Task (Re-verify):
ultrathink

Re-review [section] implementation.

Verify:
1. All previously identified issues are fixed
2. No new issues introduced
3. All 5 dimensions now pass threshold (>80%)

Output updated QA report with:
- New scores for each dimension
- Remaining issues (if any)
- Overall PASS/FAIL status"
```

**Pass Criteria:**
- All dimensions score >= 80%
- No CRITICAL issues remaining
- No more than 2 HIGH issues remaining
- Build and tests pass

### Step 7: Final Verification

Run automated verification:

```bash
# TypeScript check
npx tsc --noEmit
TSC_RESULT=$?

# Run tests
npm test
TEST_RESULT=$?

# Build check
npm run build
BUILD_RESULT=$?

# Overall result
if [ $TSC_RESULT -eq 0 ] && [ $TEST_RESULT -eq 0 ] && [ $BUILD_RESULT -eq 0 ]; then
  echo "FINAL VERIFICATION: PASS"
else
  echo "FINAL VERIFICATION: FAIL"
fi
```

### Step 8: Summary Report

Generate final QA summary:

```markdown
## QA Summary: [Section Name]

### Dimension Scores
| Dimension | Initial | Final | Status |
|-----------|---------|-------|--------|
| PRD Compliance | XX% | XX% | PASS/FAIL |
| Error Handling | XX% | XX% | PASS/FAIL |
| Type Safety | XX% | XX% | PASS/FAIL |
| Architecture | XX% | XX% | PASS/FAIL |
| Security | XX% | XX% | PASS/FAIL |

### Issues Summary
- CRITICAL: X found, X fixed
- HIGH: X found, X fixed
- MEDIUM: X found, X fixed
- LOW: X found, X fixed

### Verification Results
- TypeScript: PASS/FAIL
- Tests: X/Y passing
- Build: PASS/FAIL

### Files Modified
- `path/to/file.ts` - [description of changes]

### Remaining Issues
[List any issues that could not be fixed automatically]

### Overall Status: PASS/FAIL

### Recommendations
[Suggestions for future improvements]
```

## Iteration Limit

- Maximum 3 QA cycles per section
- If issues persist after 3 cycles:
  1. Report all remaining issues
  2. Mark section as "QA - Manual Review Required"
  3. Create detailed remediation plan

## Rollback

If QA fixes cause regressions:

```bash
# Check for regressions
npm test

# If tests fail, rollback
git checkout HEAD~1 -- src/features/[section]/
echo "Rolled back changes due to regression"
```
