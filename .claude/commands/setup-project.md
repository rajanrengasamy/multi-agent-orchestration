---
description: Initialize project with Claude Code setup
---

# Project Setup Command

Initialize the project with Claude Code development infrastructure.

ultrathink

---

## Phase 0: Project Discovery

Before initializing, understand what the user is building.

### Step 1: Gather Project Info

Use the AskUserQuestion tool to ask:

**Question 1: What are you building?**
- Web application
- Mobile app (iOS/Android)
- API/Backend service
- CLI tool
- Other (describe)

**Question 2: What's your tech stack?** (select all that apply)
- React/Next.js
- Vue/Nuxt
- SwiftUI (iOS/macOS)
- Node.js/Express
- Python/FastAPI
- Tailwind CSS
- Convex
- Vercel
- Other

**Question 3: How detailed are your requirements?**
- I have a clear PRD/spec
- I have rough ideas
- Just exploring

### Step 2: Create Project Profile

Write the gathered information to `docs/project-profile.md`:

```markdown
# Project Profile

## Overview
[User's description of what they're building]

## Project Type
[Web app / Mobile app / API / CLI / Other]

## Tech Stack
- **Frontend**: [Selected frameworks]
- **Backend**: [Selected frameworks]
- **Deployment**: [Vercel/etc if selected]
- **Other**: [Additional selections]

## Requirements Status
- [ ] PRD defined
- [ ] Architecture planned
- [ ] Tasks breakdown complete

## Created
[Current timestamp]
```

### Step 3: Rules Customization (Optional)

Check if the selected tech stack includes frameworks that need additional patterns:

| Stack | Additions Available |
|-------|---------------------|
| React/Next.js | `dangerouslySetInnerHTML` security, hooks rules, Testing Library |
| Vue/Nuxt | Template security, composables patterns |
| Convex | Schema validation, real-time patterns |
| Tailwind CSS | Class organization, component extraction |

If relevant framework detected, ask:

> "Your stack includes [Framework]. Would you like me to add framework-specific patterns to the project rules? This helps catch common issues."
>
> - Yes, customize rules for my stack
> - No, use existing rules

If yes → Run the `/customize-rules` skill with the detected stack.

### Stack Identifier Mapping

When running `/customize-rules`, use these identifiers:

| Tech Stack Selection | Skill Identifier |
|---------------------|------------------|
| React/Next.js | `react` |
| Vue/Nuxt | `vue` |
| Convex | `convex` |
| Tailwind CSS | `tailwind` |

Example: If user selects React/Next.js and Tailwind CSS, run `/customize-rules react, tailwind`

**Note**: Python/FastAPI and SwiftUI already have comprehensive patterns in the base rules and don't require additional customization.

---

## Phase 1: Run Initialization Script

```bash
chmod +x scripts/init-project.sh
./scripts/init-project.sh
```

## Phase 2: Verify Setup

Check that all components are created:

```bash
# Check directories
ls -la .claude/
ls -la docs/
ls -la todo/
ls -la src/context/

# Check key files
cat .claude/CLAUDE.md
cat .claude/settings.local.json
```

## Phase 3: Configure Environment

1. Copy `.env.example` to `.env`
2. Add your `OPENAI_API_KEY`
3. Update `PROJECT_NAME` and `PROJECT_SLUG`

## Phase 4: Seed VectorDB

```bash
npm run seed-context
```

## Phase 5: Test Context Retrieval

```bash
npx tsx scripts/retrieve-context.ts "project setup test"
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `npm install` fails | Ensure Node.js v18+ is installed. Delete `node_modules` and `package-lock.json`, then retry |
| `sed: illegal option` | You're on Linux. The script uses macOS sed syntax. Edit the `-i ''` to `-i` in init-project.sh |
| Script hangs at prompt | Press Enter or provide the project name as argument: `./scripts/init-project.sh "My Project"` |
| VectorDB seed fails | Ensure `.env` has valid `OPENAI_API_KEY` |
| Already initialized | Safe to re-run. Only `.env` customizations may be overwritten |

### Recovery Steps

If initialization fails partway through:
1. Check which step failed in the output
2. Fix the underlying issue (permissions, missing deps, etc.)
3. Re-run the script - it's mostly idempotent

---

## Verification Checklist

- [ ] Project profile created (`docs/project-profile.md`)
- [ ] .claude/CLAUDE.md exists and customized
- [ ] .claude/settings.local.json has permissions
- [ ] docs/ directory ready for PRD
- [ ] todo/tasks.md ready for task tracking
- [ ] VectorDB initialized and seeded
- [ ] Context retrieval working
- [ ] npm install completed
- [ ] Rules customized for stack (if selected)

## Next Steps

1. Add project documentation to `docs/`
2. Define tasks in `todo/tasks.md`
3. Re-run `npm run seed-context` to index
4. Start using `/develop` and `/qa` commands
