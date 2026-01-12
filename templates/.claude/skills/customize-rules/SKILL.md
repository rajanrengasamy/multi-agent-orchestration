---
description: Add framework-specific patterns to project rules
model: opus
---

# Customize Rules Skill

Add framework-specific patterns to the project's rule files based on the detected tech stack.

ultrathink

## Arguments

This skill accepts a comma-separated list of stack identifiers:
- `react` - React/Next.js patterns
- `vue` - Vue/Nuxt patterns
- `convex` - Convex backend patterns
- `tailwind` - Tailwind CSS patterns

Example: `/customize-rules react, convex`

## Process

1. Parse the stack identifiers from arguments
2. Read the current rule files from `.claude/rules/`
3. For each stack, identify what patterns are missing
4. Add minimal, targeted additions (append to existing sections)
5. Report what was added

## Error Handling

### Invalid Stack Identifiers
If an unrecognized stack identifier is provided:
1. Report which identifiers are invalid
2. List valid options: `react`, `vue`, `convex`, `tailwind`
3. Continue processing any valid identifiers in the list

Example: `/customize-rules react, angular, tailwind`
- Report: "Unknown stack identifier: `angular`. Valid options: react, vue, convex, tailwind"
- Continue with: `react` and `tailwind`

### Missing Rule Files
If a target rule file doesn't exist in `.claude/rules/`:
- Skip additions for that file
- Report which files were skipped
- Continue with existing files

## Detection Logic

Before adding each section, check if it already exists to prevent duplicates.

### Search Patterns
| Stack | Search For | In File |
|-------|------------|---------|
| react | `### React Security` | security.md |
| react | `### React Hooks` | code-style.md |
| react | `### React Testing Library` | testing.md |
| vue | `### Vue Security` | security.md |
| vue | `### Vue Composables` | code-style.md |
| convex | `### Convex Security` | security.md |
| convex | `### Convex Patterns` | api-design.md |
| tailwind | `### Tailwind CSS` | code-style.md |

### Process
1. Read the target rule file
2. Search for the section header (e.g., `### React Security`)
3. If found, skip that section and report "Section already exists"
4. If not found, append the section to the file

## Stack-Specific Additions

### React (`react`)

**security.md** - Add React Security section:
```markdown
### React Security

#### dangerouslySetInnerHTML
Never use `dangerouslySetInnerHTML` with unsanitized user input:

\`\`\`typescript
// DANGEROUS - XSS vulnerable
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// SAFE - sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
\`\`\`

#### URL Handling
Validate URLs before using in `href` or `src`:

\`\`\`typescript
// DANGEROUS - javascript: protocol injection
<a href={userProvidedUrl}>Link</a>

// SAFE - validate protocol
const isSafeUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};
\`\`\`
```

**code-style.md** - Add React Hooks section:
```markdown
### React Hooks

#### useEffect Dependencies
Always include all dependencies:

\`\`\`typescript
// BAD - missing dependency
useEffect(() => {
  fetchUser(userId);
}, []); // userId should be in deps

// GOOD - all deps included
useEffect(() => {
  fetchUser(userId);
}, [userId]);
\`\`\`

#### Custom Hooks Naming
Prefix custom hooks with `use`:

\`\`\`typescript
// GOOD
function useUserData(id: string) { ... }

// BAD
function getUserData(id: string) { ... }
\`\`\`
```

**testing.md** - Add React Testing Library section:
```markdown
### React Testing Library

#### Query Priority
Use accessible queries in this order:
1. `getByRole` - most accessible
2. `getByLabelText` - form elements
3. `getByPlaceholderText` - inputs
4. `getByText` - visible text
5. `getByTestId` - last resort

\`\`\`typescript
// GOOD - accessible query
screen.getByRole('button', { name: /submit/i });

// BAD - avoid unless necessary
screen.getByTestId('submit-button');
\`\`\`

#### User Event Over FireEvent
Use `userEvent` for realistic interactions:

\`\`\`typescript
import userEvent from '@testing-library/user-event';

// GOOD - simulates real user
await userEvent.click(button);
await userEvent.type(input, 'hello');

// BAD - less realistic simulation
fireEvent.click(button);
\`\`\`
```

### Vue (`vue`)

**security.md** - Add Vue Security section:
```markdown
### Vue Security

#### v-html Directive
Never use `v-html` with unsanitized content:

\`\`\`vue
<!-- DANGEROUS -->
<div v-html="userContent"></div>

<!-- SAFE - sanitize first -->
<div v-html="sanitizedContent"></div>

<script setup>
import DOMPurify from 'dompurify';
const sanitizedContent = computed(() => DOMPurify.sanitize(userContent));
</script>
\`\`\`
```

**code-style.md** - Add Vue Composables section:
```markdown
### Vue Composables

#### Naming Convention
Prefix composables with `use`:

\`\`\`typescript
// composables/useUser.ts
import { ref, computed, type Ref } from 'vue';

export function useUser(id: Ref<string>) {
  const user = ref<User | null>(null);
  // ...
  return { user };
}
\`\`\`

#### Reactive References
Use `ref` for primitives, `reactive` for objects:

\`\`\`typescript
import { ref, reactive } from 'vue';

// BAD - unnecessary wrapper for primitives
const count = reactive({ value: 0 });
count.value++; // awkward access

// GOOD - ref for primitives
const count = ref(0);
count.value++;

// GOOD - reactive for objects
const user = reactive({ name: '', email: '' });
user.name = 'John'; // direct access
\`\`\`
```

### Convex (`convex`)

**security.md** - Add Convex Security section:
```markdown
### Convex Security

#### Argument Validation
Always validate function arguments with Convex validators:

\`\`\`typescript
import { v } from 'convex/values';

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // args are validated automatically
  },
});
\`\`\`

#### Authentication Checks
Check auth in mutations and queries:

\`\`\`typescript
export const getUserData = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthenticated');
    }
    // proceed with authenticated user
  },
});
\`\`\`
```

**api-design.md** - Add Convex Patterns section:
```markdown
### Convex Patterns

#### Real-time Queries
Use queries for real-time data subscriptions:

\`\`\`typescript
// convex/messages.ts
export const list = query({
  args: { channelId: v.id('channels') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_channel', (q) => q.eq('channelId', args.channelId))
      .order('desc')
      .take(50);
  },
});
\`\`\`

#### Optimistic Updates
Use optimistic updates for better UX:

\`\`\`typescript
const sendMessage = useMutation(api.messages.send);

// Optimistic update in component
await sendMessage({ text, channelId }, {
  optimisticUpdate: (localStore) => {
    const existing = localStore.getQuery(api.messages.list, { channelId });
    if (existing) {
      localStore.setQuery(api.messages.list, { channelId }, [
        ...existing,
        { text, _id: 'temp', _creationTime: Date.now() },
      ]);
    }
  },
});
\`\`\`
```

### Tailwind (`tailwind`)

**code-style.md** - Add Tailwind section:
```markdown
### Tailwind CSS

#### Class Organization
Order classes consistently:
1. Layout (flex, grid, position)
2. Sizing (w, h, p, m)
3. Typography (text, font)
4. Colors (bg, text color, border)
5. Effects (shadow, opacity)
6. States (hover, focus)

\`\`\`typescript
// Organized
<div className="flex items-center gap-4 p-4 text-sm text-gray-700 bg-white rounded-lg shadow-md hover:shadow-lg">

// Avoid mixing concerns randomly
\`\`\`

#### Extracting Components
Extract repeated patterns to components, not @apply:

\`\`\`typescript
// GOOD - component extraction
type ButtonProps = {
  children: React.ReactNode;
  variant: 'primary' | 'secondary';
};

function Button({ children, variant }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  return <button className={\`\${baseClasses} \${variants[variant]}\`}>{children}</button>;
}
\`\`\`
```

## Guidelines

- **Prefer additions over rewrites** - Append to existing sections
- **Check before adding** - Skip if pattern already exists
- **Keep it minimal** - Only add the most common/important patterns
- **Use Context7 MCP** - For up-to-date best practices if needed

## Output

After adding patterns, report:

```markdown
## Rules Customization Complete

Added patterns for: [stack list]

### Changes Made
- `security.md`: Added [section name]
- `code-style.md`: Added [section name]
- `testing.md`: Added [section name]

### Patterns Added
- [List of key patterns added]

The project rules now include framework-specific guidance for your stack.
```
