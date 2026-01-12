---
description: Develop features using parallel dev agents with dependency-aware orchestration
argument-hint: <section_number | comma-separated sections | feature description>
---

# Development Orchestrator

Orchestrate feature development using parallel dev agents with intelligent dependency analysis.

## Input

**Argument**: `$ARGUMENTS`

The argument can be:
- A single section (e.g., `2.1`, `3.2.1`) - 5 parallel agents
- Multiple sections (e.g., `2, 3` or `2.1, 2.2, 2.3`) - 5 agents PER section if independent
- A feature description (e.g., `user authentication flow`)

## Model Configuration

| Role | Model | Thinking | Purpose |
|------|-------|----------|---------|
| **Dependency Analyzer** | `haiku` (latest) | `think hard` | Fast pre-flight dependency check |
| **Dev Agents** | `opus` (latest) | `ultrathink` | Deep implementation with reasoning |

## Execution Flow

### Phase 0: Dependency Pre-Check (Haiku) 🔍

**CRITICAL**: Before spawning expensive Opus agents, run a fast Haiku analysis to detect inter-section dependencies.

```
Task: Dependency Analysis
Model: haiku
Thinking: think hard

Analyze sections: $ARGUMENTS

For each section pair, check:
1. Type/interface dependencies (does Section B use types from Section A?)
2. Import dependencies (does Section B import from Section A's files?)
3. Data flow dependencies (does Section B need data produced by Section A?)
4. Schema dependencies (does Section B extend/reference Section A schemas?)

Output JSON:
{
  "sections": ["2", "3"],
  "analysis": {
    "canParallelize": true | false,
    "reason": "string",
    "dependencies": [
      { "from": "2", "to": "3", "type": "schema", "detail": "Section 3 uses UserSchema from Section 2" }
    ],
    "executionOrder": ["2", "3"] | [["2", "3"]]  // sequential array OR nested parallel groups
  }
}
```

**Decision Logic:**
- `canParallelize: true` → Spawn all section agents in parallel
- `canParallelize: false` → Execute sections sequentially per `executionOrder`

### Phase 1: Context Retrieval

1. **Parse Input**
   - Identify if input is section number(s) or description
   - Extract relevant identifiers

2. **Retrieve Context from VectorDB**
   ```bash
   # For each section
   npx tsx scripts/retrieve-context.ts "Section $SECTION implementation requirements"
   ```

3. **Gather Dependencies**
   - Identify files that need modification
   - Find related types and interfaces
   - Locate existing tests

### Phase 2: Work Breakdown (Per Section)

Each section gets broken into 5 workstreams:

| Workstream | Focus Area | Agent |
|------------|------------|-------|
| **1. Schemas** | Zod schemas, type definitions, interfaces | Opus + ultrathink |
| **2. Storage** | Database models, file storage, caching | Opus + ultrathink |
| **3. Core Logic** | Business logic, algorithms, transformations | Opus + ultrathink |
| **4. Implementation** | API endpoints, UI components, integrations | Opus + ultrathink |
| **5. Tests** | Unit tests, integration tests, fixtures | Opus + ultrathink |

### Phase 3: Agent Spawning Strategy

#### Single Section (`/develop 2`)
```
┌─────────────────────────────────────────────┐
│ Section 2: 5 Parallel Agents (Opus)         │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │Schma│ │Store│ │Logic│ │Impl │ │Tests│    │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘    │
└─────────────────────────────────────────────┘
Total: 5 agents
```

#### Multiple Independent Sections (`/develop 2, 3` - no dependencies)
```
┌─────────────────────────────────────────────┐
│ Section 2: 5 Parallel Agents                │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │Schma│ │Store│ │Logic│ │Impl │ │Tests│    │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘    │
├─────────────────────────────────────────────┤
│ Section 3: 5 Parallel Agents                │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │Schma│ │Store│ │Logic│ │Impl │ │Tests│    │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘    │
└─────────────────────────────────────────────┘
Total: 10 agents (all parallel)
```

#### Multiple Dependent Sections (`/develop 2, 3` - Section 3 depends on 2)
```
Phase A:
┌─────────────────────────────────────────────┐
│ Section 2: 5 Parallel Agents                │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │Schma│ │Store│ │Logic│ │Impl │ │Tests│    │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘    │
└─────────────────────────────────────────────┘
           ↓ Wait for completion ↓
Phase B:
┌─────────────────────────────────────────────┐
│ Section 3: 5 Parallel Agents (uses 2's output)│
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │Schma│ │Store│ │Logic│ │Impl │ │Tests│    │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘    │
└─────────────────────────────────────────────┘
Total: 10 agents (5 + 5 sequential)
```

### Phase 4: Spawn Dev Agents

For each section, spawn 5 Task agents with:

```
Task: @dev
Model: opus
Thinking: ultrathink

Section: [X]
Workstream: [Schemas|Storage|Core Logic|Implementation|Tests]

Context:
- PRD Requirements: [from VectorDB]
- Existing Patterns: [from patterns.md]
- Related Types: [from codebase scan]

Implement the [workstream] for Section [X]:
- Follow strict TypeScript (no `any`)
- Use Zod for all validation
- Include comprehensive error handling
- Write atomic, focused code

Output files to: src/[workstream]/section-[X]/
```

### Phase 5: Consolidation

1. **Collect Results** from all agents
2. **Integration Check**
   ```bash
   # Type checking
   npx tsc --noEmit

   # Linting
   npm run lint

   # Tests
   npm test
   ```
3. **Conflict Resolution** if multiple agents touched same files
4. **Generate Summary Report**

### Phase 6: Summary Report

```markdown
# Development Report: $ARGUMENTS

## Dependency Analysis (Haiku)
- Sections analyzed: [list]
- Can parallelize: [yes/no]
- Dependencies found: [list or "none"]
- Execution mode: [parallel | sequential]

## Agent Summary
| Section | Agents | Status | Time |
|---------|--------|--------|------|
| 2 | 5 | Complete | 2m |
| 3 | 5 | Complete | 2m |
| **Total** | **10** | | |

## Files Changed
[Complete list with descriptions]

## Verification Results
- TypeScript: [PASS/FAIL]
- Lint: [PASS/FAIL]
- Tests: [X/Y passing]
- Build: [PASS/FAIL]

## Integration Notes
[How components connect]

## Next Steps
[Follow-up tasks if any]
```

## Example Usage

### Single Section
```
/develop 2.1
→ Phase 0: Skip (single section)
→ Spawn 5 Opus agents with ultrathink
```

### Multiple Sections (Independent)
```
/develop 2, 3
→ Phase 0: Haiku analyzes → "canParallelize: true"
→ Spawn 10 Opus agents (5 per section) in parallel
```

### Multiple Sections (Dependent)
```
/develop 2, 3
→ Phase 0: Haiku analyzes → "canParallelize: false, Section 3 needs Section 2 types"
→ Spawn 5 agents for Section 2
→ Wait for completion
→ Spawn 5 agents for Section 3 with Section 2 context
```

### Feature Description
```
/develop implement user profile with avatar upload
→ Phase 0: Skip (not section-based)
→ Break into work items
→ Spawn appropriate agents
```

## Error Handling

- **Dependency check fails**: Fall back to sequential execution
- **Agent fails**: Retry with more context, then escalate
- **Integration fails**: Report conflicts with resolution suggestions
- **Tests fail**: Include failure details, suggest fixes
