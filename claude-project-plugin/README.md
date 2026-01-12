# Claude Project Workflow Plugin

A Claude Code plugin providing standard project workflow commands for session management, git synchronization, and context-aware session bootstrapping.

## Features

- **Session Journaling**: Structured journal entries with VectorDB storage
- **Git Sync**: Automated commit, pull, and push workflow
- **Session Bootstrap**: Context retrieval via RAG for session continuity

## Installation

### Local Testing

Run Claude Code with the plugin directory:

```bash
claude --plugin-dir ./claude-project-plugin
```

### Global Installation

Copy to your Claude plugins directory:

```bash
cp -r claude-project-plugin ~/.claude/plugins/project-workflow
```

## Available Commands

### `/journal`

Record a structured session journal entry.

```
/journal
```

Or with a summary:

```
/journal Implemented user authentication with JWT
```

**Features:**
- Reflects on session accomplishments
- Generates structured markdown entry
- Appends to `journal.md`
- Stores in VectorDB for semantic retrieval

**Entry Format:**
```markdown
## Session: [DATE] [TIME]

### Summary
[Overview of accomplishments]

### Completed
- [Completed items]

### Decisions
- [Key decisions with rationale]

### Blockers/Challenges
- [Issues and resolutions]

### Next Steps
- [ ] [Upcoming tasks]
```

### `/sync`

Git synchronization workflow.

```
/sync
```

Or with a custom commit message:

```
/sync "feat(auth): add password reset flow"
```

**Features:**
- Checks git status
- Stages and commits changes
- Generates commit message from diff
- Pulls with rebase
- Pushes to remote
- Verifies clean state

**Safety:**
- Never force pushes
- Stops on rebase conflicts
- Shows diff before commit
- Uses conventional commit format

### `/startagain`

Bootstrap a new session with context retrieval.

```
/startagain
```

Or with a specific focus:

```
/startagain authentication implementation
```

**Features:**
- Checks VectorDB availability
- Retrieves recent context via semantic search
- Presents context summary
- Asks for session focus
- Provides targeted context for chosen focus

**Fallback Mode:**
If VectorDB is not configured, reads files directly:
- `todo/tasks.md` - Task list
- `journal.md` - Recent entries
- `.claude/CLAUDE.md` - Project context

## Requirements

- **Node.js**: >= 18.0.0
- **Claude Code**: Latest version
- **Git**: For `/sync` command
- **OpenAI API Key**: For VectorDB features (optional)

## Project Setup

For full VectorDB support, your project should have:

```
project/
├── src/context/           # VectorDB infrastructure
├── scripts/
│   ├── seed-context.ts    # Index documents
│   └── retrieve-context.ts # Query context
├── docs/                  # Documentation to index
├── todo/tasks.md          # Task tracking
├── journal.md             # Session journal
└── .context-db/           # VectorDB storage
```

### Setting Up VectorDB

1. Set OpenAI API key:
   ```bash
   export OPENAI_API_KEY=your-key
   ```

2. Seed the database:
   ```bash
   npm run seed-context
   ```

3. Test retrieval:
   ```bash
   npx tsx scripts/retrieve-context.ts "test query"
   ```

## Configuration

### Commit Message Format

Customize in `.claude/rules/git.md`:

```markdown
## Commit Format
- Use conventional commits
- Include ticket: `feat(scope): TICKET-123 description`
```

### Context Sources

Configure in `src/context/config.ts`:

```typescript
export const contextConfig = {
  sources: [
    { path: 'docs/', type: 'documentation' },
    { path: 'todo/', type: 'tasks' },
    { path: 'journal.md', type: 'journal' },
  ],
};
```

### Journal Location

Default: `journal.md` in project root

Alternatives:
- `docs/journal.md`
- `.claude/journal.md`

## Development

### Plugin Structure

```
claude-project-plugin/
├── .claude-plugin/
│   └── plugin.json        # Plugin metadata
├── commands/
│   ├── journal.md         # Journal command
│   ├── sync.md            # Git sync command
│   └── startagain.md      # Session bootstrap
└── README.md              # This file
```

### Testing Changes

1. Make changes to command files
2. Restart Claude Code with plugin:
   ```bash
   claude --plugin-dir ./claude-project-plugin
   ```
3. Test commands in a project

## Troubleshooting

### Commands Not Found

1. Verify plugin directory path
2. Check `plugin.json` is valid JSON
3. Ensure command files have `.md` extension
4. Restart Claude Code

### VectorDB Not Working

1. Check OpenAI API key is set
2. Run `npm run seed-context`
3. Verify `.context-db/` directory exists
4. Check for errors in seed output

### Git Sync Conflicts

If rebase conflicts occur:
1. Resolve conflicts manually
2. Run `git add <files>` and `git rebase --continue`
3. Run `/sync` again

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

## Author

Your Name

## Links

- [Repository](https://github.com/rajanrengasamy/claude-project-plugin)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
