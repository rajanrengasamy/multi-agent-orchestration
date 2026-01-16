---
name: develop-section
description: Develop a single TODO section with 5 parallel dev agents using latest Opus with extended thinking
context: fork
model: opus
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task, TodoWrite
hooks:
  - type: PreToolUse
    matcher: Edit|Write
    command: "./scripts/validate-protected.sh"
  - type: PostToolUse
    matcher: Write|Edit
    command: "npx prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null || true"
---

# Develop Section Skill

Implement a specific TODO section using 5 parallel development agents running on **latest Opus with ultrathink** for maximum reasoning depth.

## Model Configuration

```yaml
orchestrator: opus (latest) + ultrathink
dev_agents: opus (latest) + ultrathink
total_agents: 5 per section
thinking: ALWAYS ON (ultrathink keyword in all prompts)
```

## Usage

```
/develop-section <section-name>
```

## Workflow

### Step 1: VectorDB Context Retrieval

First, check if VectorDB is available and retrieve relevant context:

```bash
# Check VectorDB availability
if ls ~/.${PROJECT_SLUG:-project}/context/lancedb/ 2>/dev/null; then
  echo "VectorDB available"
else
  echo "ERROR: VectorDB not found. Run 'npm run seed-context' first."
  exit 1
fi

# Retrieve context for the section
npx tsx scripts/retrieve-context.ts "$ARGUMENTS"
```

### Step 2: Understand Requirements

Parse the VectorDB output to understand:
- PRD requirements for this section
- Related architecture decisions
- Existing code patterns to follow
- Dependencies and interfaces

Read the TODO.md file to get the specific tasks for this section.

### Step 3: Plan Work into 5 Parallel Workstreams

Divide the section implementation into these workstreams:

| Workstream | Focus Area | Model | Thinking |
|------------|------------|-------|----------|
| **1. Schemas** | Zod schemas, type definitions, interfaces | Opus (latest) | ultrathink |
| **2. Storage** | Database models, file storage, caching | Opus (latest) | ultrathink |
| **3. Core Logic** | Business logic, algorithms, transformations | Opus (latest) | ultrathink |
| **4. Implementation** | API endpoints, UI components, integrations | Opus (latest) | ultrathink |
| **5. Tests** | Unit tests, integration tests, fixtures | Opus (latest) | ultrathink |

### Step 4: Spawn 5 Dev Agents in Parallel

Use the Task tool to spawn parallel development agents. **CRITICAL**: Always include `ultrathink` in the prompt to enable extended thinking.

**Agent 1 - Schemas:**
```
Task: Implement Zod schemas and TypeScript types for $ARGUMENTS

ultrathink

Context from VectorDB: [PASTE CONTEXT]
Patterns to follow: Read patterns.md

Requirements:
- Strict TypeScript (no `any`, enable `noUncheckedIndexedAccess`)
- Zod schemas for all data structures
- Export both schema and inferred types
- Include validation helpers

Output: src/schemas/[section].ts
```

**Agent 2 - Storage:**
```
Task: Implement storage layer for $ARGUMENTS

ultrathink

Context from VectorDB: [PASTE CONTEXT]
Schema types from: src/schemas/[section].ts

Requirements:
- Atomic write operations
- Proper error handling with typed errors
- Transaction support where needed
- Use repository pattern

Output: src/storage/[section].ts
```

**Agent 3 - Core Logic:**
```
Task: Implement core business logic for $ARGUMENTS

ultrathink

Context from VectorDB: [PASTE CONTEXT]
Types from: src/schemas/[section].ts
Storage from: src/storage/[section].ts

Requirements:
- Pure functions where possible
- Functional composition patterns
- Comprehensive error handling
- No side effects in core logic

Output: src/core/[section].ts
```

**Agent 4 - Implementation:**
```
Task: Implement feature integration for $ARGUMENTS

ultrathink

Context from VectorDB: [PASTE CONTEXT]
All module dependencies available

Requirements:
- Wire together schemas, storage, and core logic
- API endpoints or UI components as needed
- Input validation at boundaries
- Proper logging and monitoring hooks

Output: src/features/[section]/
```

**Agent 5 - Tests:**
```
Task: Write comprehensive tests for $ARGUMENTS

ultrathink

Context from VectorDB: [PASTE CONTEXT]
All implementation files available

Requirements:
- Unit tests for all public functions
- Integration tests for data flows
- Edge case coverage
- Mocked external dependencies
- Minimum 80% coverage target

Output: tests/[section]/
```

### Step 5: Consolidation

After all agents complete:

1. **Collect Reports**: Gather output from each agent
2. **Verify Integration**: Ensure all pieces work together
3. **Run Type Check**: Execute `npx tsc --noEmit`
4. **Run Tests**: Execute `npm test`
5. **Run Build**: Execute `npm run build`
6. **Update TODO**: Mark section as complete if all passes

```bash
# Verification commands (run sequentially)
npx tsc --noEmit && npm test && npm run build
```

### Step 6: Summary Report

Generate a summary in this format:

```markdown
## Development Summary: [Section Name]

### Model Configuration
- Orchestrator: Opus (latest) + ultrathink
- Dev Agents: 5x Opus (latest) + ultrathink
- Total thinking tokens used: [estimate]

### Completed Tasks
- [x] Schemas: Complete
- [x] Storage: Complete
- [x] Core Logic: Complete
- [x] Implementation: Complete
- [x] Tests: Complete

### Files Created/Modified
| File | Purpose | Lines |
|------|---------|-------|
| `src/schemas/[section].ts` | Zod schemas and types | ~X |
| `src/storage/[section].ts` | Data persistence | ~X |
| `src/core/[section].ts` | Business logic | ~X |
| `src/features/[section]/` | Feature integration | ~X |
| `tests/[section]/` | Test suite | ~X |

### Verification Results
- TypeScript: [PASS/FAIL]
- Tests: [X/Y passing, Z% coverage]
- Build: [PASS/FAIL]

### Architecture Decisions
[Key decisions made during implementation with reasoning]

### Notes
[Any issues encountered or follow-up items]
```

## Error Handling

If any workstream fails:
1. Log the error details with full context
2. Attempt automatic fix with additional reasoning (re-run with megathink)
3. If fix fails, report to user with specific failure and suggested resolution
4. Do not mark section complete until all passes

## Thinking Keywords Reference

| Keyword | Thinking Budget | Use Case |
|---------|-----------------|----------|
| `think` | Low | Simple tasks |
| `think hard` | Medium | Moderate complexity |
| `think harder` | High | Complex reasoning |
| `ultrathink` | Very High | Deep implementation (DEFAULT) |
| `megathink` | Maximum | Error recovery, architecture |
