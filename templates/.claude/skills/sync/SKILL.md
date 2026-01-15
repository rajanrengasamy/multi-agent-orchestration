---
name: sync
description: Git synchronization workflow - commit, pull with rebase, and push
context: fork
model: haiku
allowed-tools: Bash, Read
---

# Sync Skill

Git synchronization workflow: commit staged changes, pull with rebase, and push to remote.

## Thinking Configuration

```yaml
model: haiku (latest)
thinking: think hard
purpose: Fast git operations with minimal cost
```

## Usage

```
/sync
/sync "commit message here"
```

## Description

This skill provides a streamlined git workflow that:
1. Commits any staged changes (with optional message)
2. Pulls from remote with rebase to maintain clean history
3. Pushes local commits to remote
4. Handles common conflicts and errors gracefully

## Workflow

### Step 1: Check Git Status

```bash
git status --porcelain
git log --oneline -1
```

Determine:
- Are there staged changes to commit?
- Are there unstaged changes that need attention?
- What is the current branch?

### Step 2: Stage and Commit (if needed)

If there are changes to commit:

```bash
# If no message provided, generate one based on changes
git diff --cached --stat

# Commit with message
git commit -m "[message]"
```

If no commit message was provided as an argument:
- Analyze the staged changes
- Generate a concise, descriptive commit message
- Follow conventional commit format when appropriate

### Step 3: Pull with Rebase

```bash
git pull --rebase origin $(git branch --show-current)
```

**Handle conflicts if they occur:**

```bash
# Check for conflicts
git status | grep -E "^(UU|AA|DD)"

# If conflicts exist, report them and pause
echo "Conflicts detected in:"
git diff --name-only --diff-filter=U
```

If conflicts are detected:
1. List the conflicting files
2. Ask user how to proceed:
   - Abort rebase: `git rebase --abort`
   - Help resolve conflicts
   - Skip this commit: `git rebase --skip`

### Step 4: Push to Remote

```bash
git push origin $(git branch --show-current)
```

**Handle push failures:**

If push is rejected (e.g., remote has new commits):
```bash
# Try pull --rebase again
git pull --rebase origin $(git branch --show-current)
git push origin $(git branch --show-current)
```

If push requires force (after rebase changed history):
```bash
# Only suggest --force-with-lease, never --force
echo "Push rejected. You may need to force push with:"
echo "git push --force-with-lease origin $(git branch --show-current)"
```

### Step 5: Report Results

Output a summary:

```markdown
## Sync Complete

**Branch:** main
**Commit:** abc1234 - "feat: add user authentication"
**Status:** Pushed to origin/main

### Changes Synced
- 3 files changed
- 45 insertions(+)
- 12 deletions(-)

### Remote Status
- Up to date with origin/main
```

## Error Handling

### No Changes to Commit

```
No staged changes to commit. Working tree is clean.
Pulling latest changes...
```

### Uncommitted Changes Block Pull

```bash
# Stash changes temporarily
git stash push -m "sync-temp-stash"

# Pull with rebase
git pull --rebase origin $(git branch --show-current)

# Restore stashed changes
git stash pop
```

### Authentication Failure

```
Push failed: Authentication required.
Please ensure your git credentials are configured:
- SSH: Check your SSH key is added to ssh-agent
- HTTPS: Run 'git credential-manager' or set up a token
```

### Diverged Branches

```
Your branch has diverged from the remote.
Options:
1. Rebase onto remote (recommended): git pull --rebase
2. Merge remote changes: git pull
3. Force push local (destructive): git push --force-with-lease
```

## Safety Features

1. **Never force push to main/master** - Always warn and require confirmation
2. **Use --force-with-lease** - Never use bare `--force`
3. **Stash before pull** - Preserve uncommitted work
4. **Report conflicts** - Never auto-resolve merge conflicts
5. **Show diff before commit** - Let user verify changes

## Examples

### Basic Sync (No Uncommitted Changes)

```
$ /sync

Checking git status...
No local changes to commit.

Pulling from origin/main...
Already up to date.

Nothing to push.

## Sync Complete
Branch: main
Status: Up to date with origin/main
```

### Sync with Commit Message

```
$ /sync "fix: resolve authentication timeout"

Checking git status...
Found 2 staged files.

Committing changes...
[main abc1234] fix: resolve authentication timeout
 2 files changed, 15 insertions(+), 3 deletions(-)

Pulling from origin/main...
Already up to date.

Pushing to origin/main...
Done.

## Sync Complete
Branch: main
Commit: abc1234 - "fix: resolve authentication timeout"
Status: Pushed to origin/main
```

### Sync with Conflicts

```
$ /sync

Checking git status...
No local changes to commit.

Pulling from origin/main...
CONFLICT (content): Merge conflict in src/auth.ts
Auto-merge failed; fix conflicts and then commit the result.

## Conflicts Detected

The following files have conflicts:
- src/auth.ts

Options:
1. I can help resolve the conflicts
2. Abort the rebase: git rebase --abort
3. Resolve manually and run /sync again

How would you like to proceed?
```

## Configuration

The sync skill respects your git configuration:

```bash
# View current settings
git config --list | grep -E "(user\.|push\.|pull\.)"

# Recommended settings for sync
git config pull.rebase true
git config push.autoSetupRemote true
```
