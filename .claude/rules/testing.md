# Testing Rules

## File Organization

- Test files must be placed **next to source files** with `.test.ts` or `.spec.ts` suffix
- Use `.test.ts` for unit tests, `.spec.ts` for integration tests

```
src/
├── services/
│   ├── user.ts
│   ├── user.test.ts        # Unit tests
│   └── user.spec.ts        # Integration tests
├── utils/
│   ├── validation.ts
│   └── validation.test.ts
```

## Test Structure (Jest/Vitest)

### Describe Blocks for Grouping

- Use `describe` blocks to group related tests by feature or function
- Nest `describe` blocks for sub-features or scenarios

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // test implementation
    });

    it('should throw ValidationError for invalid email', async () => {
      // test implementation
    });
  });

  describe('updateUser', () => {
    // ...
  });
});
```

### Meaningful Test Names

- Test names should describe the expected behavior
- Use the pattern: `should [expected behavior] when [condition]`

```typescript
// Good
it('should return null when user is not found', async () => { });
it('should throw AuthError when token is expired', async () => { });
it('should update lastLogin timestamp on successful login', async () => { });

// Bad
it('test user not found', async () => { });
it('works', async () => { });
it('handles error', async () => { });
```

## Test Patterns

### Arrange-Act-Assert (AAA)

```typescript
it('should calculate total with discount applied', () => {
  // Arrange
  const items = [
    { name: 'Item A', price: 100 },
    { name: 'Item B', price: 50 },
  ];
  const discount = 0.1;

  // Act
  const result = calculateTotal(items, discount);

  // Assert
  expect(result).toBe(135);
});
```

### Setup and Teardown

```typescript
describe('DatabaseService', () => {
  let connection: DatabaseConnection;

  beforeAll(async () => {
    connection = await createTestConnection();
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    await connection.clear();
  });

  // tests...
});
```

## Mocking External Dependencies

- **Always mock external services** (APIs, databases, file system)
- Use dependency injection to make mocking easier
- Prefer explicit mocks over auto-mocking

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserService } from './user';
import type { UserRepository } from './repository';

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: UserRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    userService = new UserService(mockRepository);
  });

  it('should return user when found', async () => {
    const mockUser = { id: '1', name: 'John' };
    vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);

    const result = await userService.getUser('1');

    expect(result).toEqual(mockUser);
    expect(mockRepository.findById).toHaveBeenCalledWith('1');
  });
});
```

## Async Testing

```typescript
// Using async/await
it('should fetch user data', async () => {
  const user = await userService.fetchUser('123');
  expect(user.name).toBe('John');
});

// Testing rejected promises
it('should throw when user not found', async () => {
  await expect(userService.fetchUser('invalid'))
    .rejects.toThrow(NotFoundError);
});
```

## Coverage Requirements

- **Minimum 80% coverage** for all new code
- Critical paths (auth, payments, data mutations) require **95% coverage**
- Coverage should include:
  - Statement coverage
  - Branch coverage
  - Function coverage
  - Line coverage

### Running Coverage

```bash
# Vitest
vitest run --coverage

# Jest
jest --coverage
```

## Test Categories

### Unit Tests
- Test individual functions/methods in isolation
- Mock all dependencies
- Fast execution (< 100ms per test)

### Integration Tests
- Test interaction between components
- May use real databases (test containers)
- Slower execution acceptable

### E2E Tests
- Test complete user flows
- Use real browser/API calls
- Separate test suite, run less frequently

## Anti-Patterns to Avoid

- Testing implementation details instead of behavior
- Tests that depend on execution order
- Flaky tests with timing dependencies
- Over-mocking that tests nothing
- Tests without assertions
- Commented-out tests
