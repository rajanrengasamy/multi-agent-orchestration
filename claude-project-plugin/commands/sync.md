# Sync Command

Git synchronization workflow: commit local changes, pull updates, and push to remote.

## Description

This command provides a safe, automated git workflow that handles committing local changes, pulling remote updates with rebase, and pushing to the remote repository. It generates meaningful commit messages from the diff.

## Steps

1. **Check git status**
   ```bash
   git status --porcelain
   ```
   - Identify untracked files
   - Identify modified files
   - Identify staged files
   - Check if working tree is clean

2. **If there are changes to commit:**

   a. **Review the diff**
   ```bash
   git diff
   git diff --cached
   ```

   b. **Stage changes**
   ```bash
   git add -A
   ```
   Or selectively stage specific files if preferred.

   c. **Generate commit message from diff**
   Analyze the changes and create a descriptive commit message:
   - Use conventional commit format: `type(scope): description`
   - Types: feat, fix, docs, style, refactor, test, chore
   - Keep subject line under 72 characters
   - Add body for complex changes

   d. **Create commit**
   ```bash
   git commit -m "type(scope): description"
   ```

3. **Pull remote changes with rebase**
   ```bash
   git pull --rebase origin $(git branch --show-current)
   ```
   - If conflicts occur, stop and notify user
   - Do NOT attempt automatic conflict resolution

4. **Push to remote**
   ```bash
   git push origin $(git branch --show-current)
   ```

5. **Verify clean state**
   ```bash
   git status
   git log --oneline -3
   ```
   - Confirm working tree is clean
   - Show recent commits for verification

## Usage

```
/sync
```

With a custom commit message:

```
/sync "feat(auth): add password reset functionality"
```

## Example Session

```
$ /sync

Checking git status...

Modified files:
  - src/auth/login.ts
  - src/middleware/auth.ts

New files:
  - src/auth/reset-password.ts
  - tests/auth/reset-password.test.ts

Generating commit message from changes...

Proposed commit:
  feat(auth): add password reset functionality

  - Add reset-password endpoint with email verification
  - Create token generation and validation
  - Add tests for reset flow

Proceed with commit? [Y/n] y

Committing changes...
[main abc1234] feat(auth): add password reset functionality

Pulling remote changes with rebase...
Already up to date.

Pushing to origin/main...
Done.

Status: Clean working tree
Recent commits:
  abc1234 feat(auth): add password reset functionality
  def5678 fix(api): correct error response format
  ghi9012 docs: update API documentation
```

## Safety Features

- **Never force push**: Always uses regular push
- **Rebase conflicts**: Stops and notifies user if conflicts occur
- **Review before commit**: Shows diff and proposed message
- **Branch awareness**: Works on current branch, shows branch name

## Conflict Handling

If conflicts occur during rebase:

1. The command will stop and display conflicting files
2. User must resolve conflicts manually:
   ```bash
   # Edit conflicting files
   git add <resolved-files>
   git rebase --continue
   ```
3. Run `/sync` again after resolution

## Configuration

You can customize the commit message format in your project's `.claude/rules/git.md`:

```markdown
## Commit Message Format
- Use conventional commits
- Include ticket number: `feat(auth): ABC-123 add login`
- Sign commits with GPG
```
