---
name: dependency-check
description: Fast pre-flight analysis to detect inter-section dependencies before parallel development. Uses Haiku for speed and cost efficiency.
context: fork
model: haiku
allowed-tools: Read, Glob, Grep
---

# Dependency Check Skill

Fast dependency analysis using **latest Haiku with thinking** to determine if multiple sections can be developed in parallel.

## Model Configuration

```yaml
model: haiku (latest)
thinking: think hard (enabled for accurate analysis)
purpose: Pre-flight check before spawning expensive Opus agents
cost: ~100x cheaper than Opus
speed: ~10x faster than Opus
```

## Usage

```
/dependency-check 2, 3, 4
```

## Purpose

Before spawning 5+ Opus agents per section (expensive), this skill quickly analyzes whether sections have dependencies on each other. This prevents:
- Wasted compute on parallel runs that will fail
- Type errors from missing dependencies
- Import errors from unimplemented modules

## Workflow

### Step 1: Parse Input Sections

```
Input: "2, 3, 4"
Parsed: ["2", "3", "4"]
Pairs to analyze: [(2,3), (2,4), (3,4)]
```

### Step 2: Retrieve Section Requirements

For each section, query VectorDB to understand:
- What types/schemas this section defines
- What types/schemas this section requires
- What modules this section exports
- What modules this section imports

```bash
# For each section
npx tsx scripts/retrieve-context.ts "Section $SECTION dependencies and requirements"
```

### Step 3: Analyze Dependencies

think hard

For each pair of sections, check:

**1. Type Dependencies**
```
Does Section B use types defined in Section A?
- Look for: import { TypeX } from './section-a'
- Look for: extends SectionASchema
- Look for: references to Section A interfaces
```

**2. Schema Dependencies**
```
Does Section B extend/compose schemas from Section A?
- Look for: z.object({ ...SectionASchema.shape })
- Look for: SectionASchema.merge()
- Look for: SectionASchema.extend()
```

**3. Data Flow Dependencies**
```
Does Section B consume data produced by Section A?
- Look for: function calls to Section A services
- Look for: database queries on Section A tables
- Look for: API calls to Section A endpoints
```

**4. Temporal Dependencies**
```
Must Section A be complete before Section B can start?
- Look for: migrations that must run first
- Look for: seed data requirements
- Look for: configuration dependencies
```

### Step 4: Build Dependency Graph

```typescript
interface DependencyAnalysis {
  sections: string[];
  dependencies: Array<{
    from: string;      // Source section
    to: string;        // Dependent section
    type: 'schema' | 'type' | 'data' | 'temporal';
    detail: string;    // Specific dependency description
    severity: 'blocking' | 'soft';
  }>;
  canParallelize: boolean;
  executionOrder: string[] | string[][];  // Sequential or parallel groups
  reason: string;
}
```

### Step 5: Determine Execution Strategy

**Case 1: No Dependencies Found**
```json
{
  "sections": ["2", "3", "4"],
  "dependencies": [],
  "canParallelize": true,
  "executionOrder": [["2", "3", "4"]],
  "reason": "No inter-section dependencies detected. All sections can run in parallel."
}
```
→ Spawn all section agents simultaneously

**Case 2: Linear Dependencies**
```json
{
  "sections": ["2", "3", "4"],
  "dependencies": [
    { "from": "2", "to": "3", "type": "schema", "detail": "Section 3 uses UserSchema from Section 2" },
    { "from": "3", "to": "4", "type": "type", "detail": "Section 4 imports UserProfile from Section 3" }
  ],
  "canParallelize": false,
  "executionOrder": ["2", "3", "4"],
  "reason": "Linear dependency chain: 2 → 3 → 4. Must execute sequentially."
}
```
→ Execute sections one after another

**Case 3: Partial Dependencies**
```json
{
  "sections": ["2", "3", "4"],
  "dependencies": [
    { "from": "2", "to": "4", "type": "schema", "detail": "Section 4 uses BaseSchema from Section 2" }
  ],
  "canParallelize": "partial",
  "executionOrder": [["2", "3"], ["4"]],
  "reason": "Section 4 depends on Section 2, but Section 3 is independent. Run [2,3] in parallel, then 4."
}
```
→ Execute in waves: first wave parallel, then dependent sections

### Step 6: Output Report

```markdown
## Dependency Analysis Report

### Sections Analyzed
- Section 2: User Management
- Section 3: Authentication
- Section 4: Profile Settings

### Dependencies Found
| From | To | Type | Detail |
|------|----|----|--------|
| 2 | 3 | schema | Section 3 extends UserSchema |
| 2 | 4 | type | Section 4 uses UserId type |

### Execution Strategy
**Mode**: Sequential (dependencies found)

**Order**:
1. Phase 1: Section 2 (5 agents)
2. Phase 2: Section 3, Section 4 (10 agents, parallel after 2 completes)

### Recommendation
```json
{
  "canParallelize": false,
  "executionOrder": ["2", ["3", "4"]],
  "estimatedAgents": 15,
  "estimatedPhases": 2
}
```
```

## Error Handling

If analysis is uncertain:
1. Log the uncertainty with details
2. **Default to sequential execution** (safer)
3. Report potential dependencies for human review
4. Suggest running `/dependency-check` with more context

## Performance Notes

| Metric | Value |
|--------|-------|
| Typical execution time | 5-15 seconds |
| Token usage | ~2K-5K tokens |
| Cost | ~$0.001-0.003 |
| Compared to failed parallel run | 100x cheaper than wasted Opus agents |
