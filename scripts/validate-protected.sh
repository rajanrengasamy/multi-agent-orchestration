#!/bin/bash
# PreToolUse hook: Validate that protected files are not being modified
# Exit code 2 = block the operation
# Exit code 0 = allow the operation

# Read the tool input from stdin (JSON format)
INPUT=$(cat)

# Extract file path from JSON (requires jq)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filename // empty' 2>/dev/null)

# If no file path, allow
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# List of protected files/patterns
PROTECTED_FILES=(
  "package-lock.json"
  ".env"
  ".env.local"
  ".claude/settings.local.json"
)

# Check if file is protected
for protected in "${PROTECTED_FILES[@]}"; do
  if [[ "$FILE_PATH" == *"$protected"* ]]; then
    echo "BLOCKED: Cannot modify protected file: $FILE_PATH" >&2
    exit 2
  fi
done

# Allow the operation
exit 0
