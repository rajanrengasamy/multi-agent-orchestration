# Code Style Rules

## Universal Principles

### Naming Philosophy
- **Clarity over brevity**: Names should reveal intent without requiring comments
- **Consistency within codebase**: Follow existing patterns in the project
- **Domain language**: Use terms from the problem domain, not implementation details
- **Avoid abbreviations**: `userRepository` not `usrRepo`, `configuration` not `cfg`

### Code Organization
- **Import hierarchy**: Organize dependencies in logical groups
  1. Standard library / framework imports
  2. External third-party packages
  3. Internal project packages
  4. Local/relative imports
- **Separate groups** with blank lines for visual clarity

### Immutability Philosophy
- **Default to immutable**: Prefer constants; reassignment should be the exception
- **Declare at point of use**: Introduce variables where first needed, not at scope top
- **Minimize scope**: Each variable should have the smallest necessary visibility

### Function Design
- **Explicit signatures**: Public functions should have clear input/output types
- **Single responsibility**: Functions should do one thing well
- **Fail fast**: Validate inputs early and return/throw immediately on failure

### String Handling
- **Interpolation over concatenation**: Use string formatting, not `+` operators
- **Consistent quote style**: Pick one style per language and stick with it

### Error Handling Philosophy
- **Type all errors**: Catch specific error types, not generic "any" or bare exceptions
- **Never swallow errors**: Always log, rethrow, or handle meaningfully
- **Preserve context**: When re-throwing, chain the original error

---

## TypeScript

### Strict Mode Requirements
- Always use TypeScript strict mode (`"strict": true` in tsconfig.json)
- Never use the `any` type - use `unknown` with type guards instead
- Enable `noImplicitReturns` and `noUncheckedIndexedAccess`

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Variables, functions | camelCase | `userName`, `getUserById()` |
| Types, interfaces, classes | PascalCase | `UserProfile`, `ApiResponse<T>` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Enums | PascalCase (both) | `enum UserRole { Admin, Editor }` |

### Import Organization
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

### Variable Declarations
- **Prefer `const`** over `let` - only use `let` when reassignment is necessary
- **Never use `var`**

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

### Function Declarations
- **Always use explicit return types** for public functions
- Arrow functions for callbacks, function declarations for top-level

```typescript
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

async function fetchUserData(id: string): Promise<UserData> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}
```

### Error Handling
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

### Validation with Zod
```typescript
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

type User = z.infer<typeof UserSchema>;
```

---

## Python

### Style Guide
- Follow **PEP 8** as the baseline
- Use **Ruff** for linting and formatting (replaces Black, Flake8, isort)
- Target **Python 3.11+** for modern syntax

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Variables, functions | snake_case | `user_name`, `get_user_by_id()` |
| Classes | PascalCase | `UserProfile`, `ApiResponse` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Private | Leading underscore | `_internal_method()` |
| Module-level | snake_case | `user_service.py` |

### Import Organization
```python
# Standard library
import os
from datetime import datetime
from typing import Optional

# Third-party packages
from pydantic import BaseModel, Field
import httpx

# Local imports
from .models import User
from .exceptions import NotFoundError
```

### Type Hints (Modern Syntax)
```python
# Python 3.10+ union syntax
def get_user(user_id: str) -> User | None:
    ...

# Use lowercase built-ins (Python 3.9+)
def process_items(items: list[str]) -> dict[str, int]:
    ...

# Optional is still acceptable but | None is preferred
from typing import Optional  # Only if supporting < 3.10
```

### Variable Declarations
```python
# Good - clear, typed, immutable where possible
users: list[User] = await fetch_users()
MAX_RETRIES: int = 3

# Use Final for true constants
from typing import Final
API_BASE_URL: Final[str] = "https://api.example.com"
```

### Validation with Pydantic
```python
from pydantic import BaseModel, Field, field_validator

class User(BaseModel):
    id: str
    email: str
    name: str = Field(..., min_length=1, max_length=100)
    age: int | None = None

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower()

# Usage
user = User.model_validate(data)  # Pydantic v2
user_dict = user.model_dump()
```

### Error Handling
```python
class AppError(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str, code: str):
        self.message = message
        self.code = code
        super().__init__(self.message)

class NotFoundError(AppError):
    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            f"{resource} with ID '{resource_id}' not found",
            code="NOT_FOUND"
        )

# Catching errors
try:
    result = await risky_operation()
except NotFoundError as e:
    logger.warning(f"Not found: {e.message}")
except AppError as e:
    logger.error(f"App error [{e.code}]: {e.message}")
except Exception as e:
    logger.exception(f"Unexpected error: {e}")
    raise
```

### Async Patterns
```python
import asyncio

# Task groups (Python 3.11+)
async def fetch_all_users(user_ids: list[str]) -> list[User]:
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch_user(uid)) for uid in user_ids]
    return [task.result() for task in tasks]

# Context managers
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_db_connection():
    conn = await create_connection()
    try:
        yield conn
    finally:
        await conn.close()
```

---

## SwiftUI

### Style Guide
- Follow **Swift API Design Guidelines**
- Use **SwiftFormat** and **SwiftLint** for consistency
- Target **iOS 17+** for modern patterns (@Observable)

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Variables, functions | camelCase | `userName`, `getUserById()` |
| Types, protocols | PascalCase | `UserProfile`, `Fetchable` |
| Constants | camelCase or UPPER_SNAKE | `maxRetryCount` or `MAX_RETRY_COUNT` |
| Property wrappers | @ prefix | `@State`, `@Binding`, `@Observable` |

### Import Organization
```swift
// Framework imports
import SwiftUI
import Foundation

// Third-party packages
import Alamofire

// Local modules
import SharedModels
```

### State Management (iOS 17+)
```swift
// Modern @Observable (iOS 17+)
@Observable final class UserViewModel {
    var user: User?
    var isLoading = false
    var errorMessage: String?

    @MainActor
    func loadUser(id: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            user = try await fetchUser(id: id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// In SwiftUI View
struct UserView: View {
    @State private var viewModel = UserViewModel()

    var body: some View {
        // ...
    }
}
```

### State Management (iOS 14-16)
```swift
// Legacy ObservableObject pattern
class UserViewModel: ObservableObject {
    @Published var user: User?
    @Published var isLoading = false
}

// In SwiftUI View
struct UserView: View {
    @StateObject private var viewModel = UserViewModel()
    // ...
}
```

### Property Wrapper Guidelines
| Wrapper | Use Case |
|---------|----------|
| `@State` | Local view state (value types, always private) |
| `@Binding` | Two-way connection to parent's state |
| `@Observable` | Reference type state (iOS 17+) |
| `@StateObject` | Own the ObservableObject lifecycle (iOS 14-16) |
| `@ObservedObject` | Receive ObservableObject from parent |
| `@Environment` | Access environment values |

### Error Handling
```swift
enum NetworkError: LocalizedError {
    case invalidURL
    case serverError(Int)
    case decodingError

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .serverError(let code): return "Server error: \(code)"
        case .decodingError: return "Failed to decode response"
        }
    }
}

func fetchUser(id: String) async throws -> User {
    guard let url = URL(string: "https://api.example.com/users/\(id)") else {
        throw NetworkError.invalidURL
    }

    let (data, response) = try await URLSession.shared.data(from: url)

    guard let httpResponse = response as? HTTPURLResponse,
          (200...299).contains(httpResponse.statusCode) else {
        throw NetworkError.serverError((response as? HTTPURLResponse)?.statusCode ?? 0)
    }

    return try JSONDecoder().decode(User.self, from: data)
}
```

### Validation with Codable
```swift
struct User: Codable {
    let id: String
    let email: String
    let name: String
    let age: Int?

    enum CodingKeys: String, CodingKey {
        case id, email, name
        case age = "user_age"  // Map different JSON key
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        email = try container.decode(String.self, forKey: .email)
        name = try container.decode(String.self, forKey: .name)
        age = try container.decodeIfPresent(Int.self, forKey: .age)

        // Custom validation
        guard email.contains("@") else {
            throw DecodingError.dataCorruptedError(
                forKey: .email,
                in: container,
                debugDescription: "Invalid email format"
            )
        }
    }
}
```

### View Composition
```swift
// Extract subviews to keep files manageable
struct UserDetailView: View {
    let user: User

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                UserHeaderView(user: user)
                UserStatsView(user: user)
                UserActionsView(user: user)
            }
            .padding()
        }
    }
}

// Previews (iOS 17+)
#Preview {
    UserDetailView(user: .preview)
}
```
