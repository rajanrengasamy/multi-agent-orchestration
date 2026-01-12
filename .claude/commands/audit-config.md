---
description: Audit current Claude Code configuration
---

# Configuration Audit Command

Verify the Claude Code setup is complete and working.

## Checks to Perform

### 1. Memory Files

```bash
# Check main instruction file
cat .claude/CLAUDE.md

# Check rules
ls .claude/rules/

# Check settings
cat .claude/settings.local.json
```

### 2. Agents

```bash
# List agents
ls .claude/agents/

# Verify each agent has frontmatter
for f in .claude/agents/*.md; do head -10 "$f"; done
```

### 3. Commands

```bash
# List commands
ls .claude/commands/

# Verify command frontmatter
for f in .claude/commands/*.md; do head -5 "$f"; done
```

### 4. Skills

```bash
# List skills
ls .claude/skills/

# Check skill structure
ls .claude/skills/*/
```

### 5. Hooks

```bash
# Check hooks configuration
cat .claude/hooks/hooks.json
```

### 6. MCP Servers

```bash
# Check MCP config
cat .mcp.json
```

### 7. VectorDB Health

```bash
# Check database exists
ls ~/.${PROJECT_SLUG:-project}/context/lancedb/

# Test retrieval
npx tsx scripts/retrieve-context.ts "test query"
```

## Report Format

```markdown
## Configuration Audit Report

| Component | Status | Issues |
|-----------|--------|--------|
| CLAUDE.md | [OK/MISSING] | |
| Rules (4) | [OK/PARTIAL] | |
| Agents (4) | [OK/PARTIAL] | |
| Commands (4) | [OK/PARTIAL] | |
| Skills (2) | [OK/PARTIAL] | |
| Hooks | [OK/MISSING] | |
| MCP (Context7) | [OK/MISSING] | |
| VectorDB | [OK/MISSING] | |

## Issues Found
[List any issues]

## Recommendations
[Suggested fixes]
```

## Quick Fix Commands

```bash
# Re-initialize if needed
./scripts/init-project.sh

# Re-seed VectorDB
npm run seed-context

# Install missing deps
npm install
```
