---
name: develop-section
description: Develop a single TODO section with parallel dev agents. Use for implementing specific sections from the TODO list.
context: fork
model: opus
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task, TodoWrite
---

# Develop Section Skill

Implement a specific TODO section using parallel development agents for maximum efficiency.

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
npm run retrieve -- "$ARGUMENTS"
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

| Workstream | Focus Area | Priority |
|------------|------------|----------|
| **Schemas** | Zod schemas, type definitions, interfaces | 1 |
| **Storage** | Database models, file storage, caching | 2 |
| **Core Logic** | Business logic, algorithms, transformations | 3 |
| **Implementation** | API endpoints, UI components, integrations | 4 |
| **Tests** | Unit tests, integration tests, fixtures | 5 |

### Step 4: Spawn 5 Dev Agents in Parallel

Use the Task tool to spawn parallel development agents:

```
Task 1 (Schemas): "Implement Zod schemas and TypeScript types for [section]. Follow patterns in patterns.md. Output: src/schemas/[section].ts"

Task 2 (Storage): "Implement storage layer for [section]. Use atomic writes, proper error handling. Output: src/storage/[section].ts"

Task 3 (Core Logic): "Implement core business logic for [section]. Follow functional patterns. Output: src/core/[section].ts"

Task 4 (Implementation): "Implement [section] feature using schemas and core logic. Output: src/features/[section]/"

Task 5 (Tests): "Write comprehensive tests for [section]. Cover edge cases. Output: tests/[section]/"
```

Each agent should:
- Read the patterns.md file for coding standards
- Use strict TypeScript (no `any`)
- Implement proper error handling
- Write atomic, focused code

### Step 5: Consolidation

After all agents complete:

1. **Collect Reports**: Gather output from each agent
2. **Verify Integration**: Ensure all pieces work together
3. **Run Type Check**: Execute `npx tsc --noEmit`
4. **Run Tests**: Execute `npm test`
5. **Update TODO**: Mark section as complete if all passes

```bash
# Verification commands
npx tsc --noEmit
npm test
npm run build
```

### Step 6: Summary Report

Generate a summary in this format:

```markdown
## Development Summary: [Section Name]

### Completed Tasks
- [ ] Schemas: [status]
- [ ] Storage: [status]
- [ ] Core Logic: [status]
- [ ] Implementation: [status]
- [ ] Tests: [status]

### Files Created/Modified
- `src/schemas/[section].ts`
- `src/storage/[section].ts`
- `src/core/[section].ts`
- `src/features/[section]/`
- `tests/[section]/`

### Verification Results
- TypeScript: [PASS/FAIL]
- Tests: [X/Y passing]
- Build: [PASS/FAIL]

### Notes
[Any issues encountered or decisions made]
```

## Error Handling

If any workstream fails:
1. Log the error details
2. Attempt automatic fix with context
3. If fix fails, report to user with specific failure
4. Do not mark section complete until all passes
