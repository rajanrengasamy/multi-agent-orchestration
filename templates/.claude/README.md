# Claude Code Project Configuration

This directory contains the Claude Code configuration for your project.

## Directory Structure

```
.claude/
├── CLAUDE.md           # Main project context (auto-loaded by Claude)
├── README.md           # This file
├── rules/              # Coding standards and conventions
│   ├── code-style.md   # Code formatting and style rules
│   ├── testing.md      # Testing conventions
│   ├── security.md     # Security best practices
│   └── api-design.md   # API design guidelines
├── agents/             # Specialized agent configurations
├── commands/           # Custom slash commands
└── skills/             # Skill definitions
```

## Customization Guide

### 1. Update CLAUDE.md

After running `init-project.sh`, customize the main CLAUDE.md:

1. Replace `$PROJECT_NAME` with your actual project name
2. Fill in the Architecture section with your project structure
3. Add any project-specific commands to Quick Commands
4. Update the Tech Stack if using different technologies

### 2. Configure Rules

Edit the files in `rules/` to match your team's conventions:

- **code-style.md**: Indentation, naming, imports, formatting
- **testing.md**: Test structure, coverage requirements, mocking
- **security.md**: Input validation, secrets handling, dependencies
- **api-design.md**: REST conventions, error handling, versioning

### 3. Add Custom Commands

Create custom slash commands in `commands/`:

```markdown
# commands/my-command.md

Description of what this command does.

## Steps
1. First step
2. Second step
```

### 4. Configure Agents

Add specialized agents in `agents/` for specific tasks:

- `researcher.md` - For investigation tasks
- `implementer.md` - For coding tasks
- `reviewer.md` - For code review

### 5. Context System

The VectorDB context system allows semantic retrieval of project documentation:

```bash
# Seed the database with your docs
npm run seed-context

# Query relevant context
npx tsx scripts/retrieve-context.ts "authentication flow"
```

## Best Practices

1. **Keep CLAUDE.md concise** - Focus on essential information
2. **Use @references** - Link to detailed docs rather than duplicating
3. **Update regularly** - Keep context fresh as the project evolves
4. **Version control** - Commit .claude/ changes with the project

## Session Management Skills

These skills are automatically available (no setup required):

| Skill | Purpose |
|-------|---------|
| `/startagain` | Bootstrap new session with VectorDB context retrieval |
| `/journal` | Record structured session journal entry |
| `/sync` | Git commit, pull --rebase, and push workflow |

Usage:
```
/startagain              # Start a new session with context
/journal                 # Record session progress
/sync                    # Commit and push changes
```

## Troubleshooting

### VectorDB Not Working
1. Ensure OpenAI API key is set: `export OPENAI_API_KEY=your-key`
2. Run seed-context: `npm run seed-context`
3. Check `.context-db/` directory exists

### Rules Not Loading
1. Verify files exist in `.claude/rules/`
2. Check @references in CLAUDE.md are correct
3. Ensure markdown formatting is valid

### Commands Not Found
1. Check command file exists in `.claude/commands/`
2. Verify file has `.md` extension
3. Restart Claude Code session
