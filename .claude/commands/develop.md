---
description: Develop features using parallel dev agents
argument-hint: <section_number | feature description>
---

# Development Orchestrator

Orchestrate feature development using parallel dev agents for efficient implementation.

## Input

**Argument**: `$ARGUMENTS`

The argument can be:
- A section number (e.g., `2.1`, `3.2.1`) - references a PRD or spec section
- A feature description (e.g., `user authentication flow`)
- Multiple sections (e.g., `2.1, 2.2, 2.3`)

## Execution Flow

### Phase 1: Context Retrieval

1. **Parse Input**
   - Identify if input is section number(s) or description
   - Extract relevant identifiers

2. **Retrieve Context from VectorDB**
   ```
   Search for:
   - PRD/specification sections matching input
   - Related implementation files
   - Existing patterns and utilities
   - Type definitions and interfaces
   ```

3. **Gather Dependencies**
   - Identify files that need modification
   - Find related types and interfaces
   - Locate existing tests

### Phase 2: Work Breakdown

1. **Analyze Scope**
   - Break feature into implementable units
   - Identify independent vs dependent tasks
   - Estimate complexity per unit

2. **Create Work Items**
   ```markdown
   ## Work Items

   ### Independent (can parallelize)
   - [ ] Item 1: [description] - Files: [list]
   - [ ] Item 2: [description] - Files: [list]

   ### Sequential (has dependencies)
   - [ ] Item 3: [description] - Depends on: Item 1
   - [ ] Item 4: [description] - Depends on: Item 2, Item 3
   ```

### Phase 3: Parallel Agent Spawning

For each independent work item, spawn a dev agent:

```
Task: @dev [work item description]

Context:
- Relevant PRD section: [content]
- Files to modify: [list]
- Related types: [list]
- Existing patterns: [examples]

Requirements:
- [Specific requirements from PRD]
- [Acceptance criteria]

Constraints:
- Follow project code style
- Maintain type safety
- Include unit tests
```

### Phase 4: Sequential Implementation

For dependent work items:
1. Wait for prerequisite items to complete
2. Pass completed work as context to next agent
3. Ensure integration between components

### Phase 5: Consolidation

1. **Collect Results**
   - Gather all agent outputs
   - Compile list of changed files
   - Collect implementation notes

2. **Integration Check**
   - Verify components work together
   - Check for conflicts in modified files
   - Ensure consistent patterns

3. **Quality Verification**
   ```bash
   # Type checking
   npx tsc --noEmit

   # Linting
   npm run lint

   # Tests
   npm test
   ```

4. **Generate Summary**
   ```markdown
   ## Development Summary

   ### Completed
   - [List of completed work items]

   ### Files Changed
   - [List of all modified/created files]

   ### Tests Added
   - [List of new tests]

   ### Integration Notes
   - [How components connect]
   - [Key decisions made]

   ### Next Steps
   - [Follow-up tasks if any]
   - [Remaining work]
   ```

## Example Usage

### Single Section
```
/develop 2.1
```

### Multiple Sections
```
/develop 2.1, 2.2, 2.3
```

### Feature Description
```
/develop implement user profile page with avatar upload
```

## Output Format

```markdown
# Development Report: $ARGUMENTS

## Context Retrieved
- PRD Sections: [list]
- Related Files: [count]
- Dependencies: [list]

## Work Breakdown
[Work items table]

## Implementation

### Agent 1: [Work Item]
- Status: Complete
- Files: [list]
- Notes: [summary]

### Agent 2: [Work Item]
- Status: Complete
- Files: [list]
- Notes: [summary]

## Integration
- TypeScript: PASS
- Lint: PASS
- Tests: PASS ([X] passing)

## Summary
[Overall summary of work completed]

## Files Changed
[Complete list with descriptions]
```

## Error Handling

- If PRD section not found: Ask for clarification
- If agent fails: Retry with more context or escalate
- If integration fails: Report conflicts and suggest resolution
- If tests fail: Include failure details in report
