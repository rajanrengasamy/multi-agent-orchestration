# TypeScript Code Style Rules

## Strict Mode Requirements

- Always use TypeScript strict mode (`"strict": true` in tsconfig.json)
- Never use the `any` type - use `unknown` with type guards or proper generic types instead
- Enable `noImplicitReturns` and `noUncheckedIndexedAccess`

## Naming Conventions

- **Variables and Functions**: Use `camelCase`
  ```typescript
  const userName = 'john';
  function getUserById(id: string): User { }
  ```
- **Types, Interfaces, and Classes**: Use `PascalCase`
  ```typescript
  interface UserProfile { }
  type ApiResponse<T> = { }
  class UserService { }
  ```
- **Constants**: Use `UPPER_SNAKE_CASE` for true constants
  ```typescript
  const MAX_RETRY_COUNT = 3;
  const API_BASE_URL = '/api/v1';
  ```
- **Enums**: Use `PascalCase` for enum names, `PascalCase` for members
  ```typescript
  enum UserRole {
    Admin,
    Editor,
    Viewer
  }
  ```

## Import Organization

Organize imports in the following order with blank lines between groups:

1. **External packages** (node_modules)
2. **Internal packages** (aliases like `@/`, workspace packages)
3. **Relative imports** (local files)

```typescript
// External packages
import { z } from 'zod';
import express from 'express';

// Internal packages
import { logger } from '@/utils/logger';
import { UserService } from '@/services/user';

// Relative imports
import { validateInput } from './validators';
import type { LocalConfig } from './types';
```

## Variable Declarations

- **Prefer `const`** over `let` - only use `let` when reassignment is necessary
- **Never use `var`**
- Declare variables at the point of first use, not at the top of scope

```typescript
// Good
const users = await fetchUsers();
for (const user of users) {
  const profile = await getProfile(user.id);
}

// Bad
let users;
users = await fetchUsers();
```

## Function Declarations

- **Always use explicit return types** for public functions
- Use arrow functions for callbacks and short inline functions
- Use function declarations for top-level functions

```typescript
// Explicit return types
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Arrow functions for callbacks
const activeUsers = users.filter((user) => user.isActive);

// Async functions
async function fetchUserData(id: string): Promise<UserData> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}
```

## String Handling

- **Use template literals** over string concatenation
- Use single quotes for simple strings, template literals for interpolation

```typescript
// Good
const greeting = `Hello, ${userName}!`;
const url = `${baseUrl}/users/${userId}/profile`;

// Bad
const greeting = 'Hello, ' + userName + '!';
const url = baseUrl + '/users/' + userId + '/profile';
```

## Object and Array Patterns

- Use object shorthand when property name matches variable name
- Use destructuring for accessing object properties
- Use spread operator for shallow copies

```typescript
// Object shorthand
const user = { name, email, role };

// Destructuring
const { id, name, email } = user;
const [first, second, ...rest] = items;

// Spread for copies
const updatedUser = { ...user, name: newName };
const allItems = [...existingItems, newItem];
```

## Error Handling

- Always type catch clause errors as `unknown`
- Use type guards to narrow error types

```typescript
try {
  await riskyOperation();
} catch (error: unknown) {
  if (error instanceof CustomError) {
    logger.error('Custom error:', error.code);
  } else if (error instanceof Error) {
    logger.error('Error:', error.message);
  } else {
    logger.error('Unknown error:', error);
  }
}
```
