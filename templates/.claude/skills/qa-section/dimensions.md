# 5-Dimension QA Framework

A comprehensive quality assurance framework for evaluating code implementations.

## Overview

| Dimension | Weight | Focus |
|-----------|--------|-------|
| PRD Compliance | 30% | Implementation matches requirements |
| Error Handling | 25% | All error paths covered |
| Type Safety | 20% | Strong typing throughout |
| Architecture | 15% | Code organization and quality |
| Security | 10% | Protection against vulnerabilities |

---

## 1. PRD Compliance (30%)

### What to Check

Compare implementation against Product Requirements Document:

- **Feature Completeness**: All required features implemented
- **Behavior Match**: Features work as specified
- **Edge Cases**: Specified edge cases handled
- **Acceptance Criteria**: All criteria met

### Review Checklist

```markdown
- [ ] All required endpoints/functions exist
- [ ] Input/output formats match specification
- [ ] Business logic follows requirements exactly
- [ ] Required integrations are implemented
- [ ] Performance requirements met (if specified)
- [ ] Data persistence works as specified
```

### Common Issues

| Issue | Severity | Example |
|-------|----------|---------|
| Missing feature | CRITICAL | Required endpoint not implemented |
| Wrong behavior | HIGH | Function returns wrong format |
| Missing edge case | MEDIUM | Empty array not handled per spec |
| Inconsistent naming | LOW | API uses different field names |

### Scoring Guide

- **90-100%**: Full compliance, all requirements met
- **70-89%**: Minor deviations, non-critical features missing
- **50-69%**: Some features missing or incorrect
- **Below 50%**: Significant gaps in implementation

---

## 2. Error Handling (25%)

### What to Check

Ensure all error paths are properly handled:

- **Null/Undefined Checks**: No uncaught null references
- **API Failures**: Network errors handled gracefully
- **Validation Errors**: Invalid input rejected properly
- **Resource Failures**: File/DB errors caught
- **Timeout Handling**: Long operations have timeouts

### Review Checklist

```markdown
- [ ] All async operations have try/catch
- [ ] API calls handle network failures
- [ ] Null/undefined checked before access
- [ ] Invalid input returns meaningful errors
- [ ] File operations handle missing/locked files
- [ ] Database operations handle connection failures
- [ ] Timeouts set for external calls
- [ ] Errors are logged appropriately
- [ ] User-facing errors are friendly
```

### Common Issues

| Issue | Severity | Example |
|-------|----------|---------|
| Unhandled promise rejection | CRITICAL | `await api.call()` without catch |
| Null reference | HIGH | `user.name` without null check |
| Missing validation | HIGH | API accepts malformed input |
| Silent failure | MEDIUM | Error caught but not logged |
| Generic error message | LOW | "Something went wrong" |

### Error Handling Patterns

```typescript
// GOOD: Comprehensive error handling
async function fetchUser(id: string): Promise<Result<User>> {
  if (!id || typeof id !== 'string') {
    return { success: false, error: new ValidationError('Invalid user ID') };
  }

  try {
    const response = await withRetry(() => api.get(`/users/${id}`));

    if (!response.ok) {
      return {
        success: false,
        error: new ApiError(`Failed to fetch user: ${response.status}`)
      };
    }

    const data = await response.json();
    const user = UserSchema.parse(data);

    return { success: true, data: user };
  } catch (error) {
    logger.error('Failed to fetch user', { id, error });
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}
```

### Scoring Guide

- **90-100%**: All paths handled, graceful degradation
- **70-89%**: Most paths handled, some edge cases missing
- **50-69%**: Basic error handling, many uncaught scenarios
- **Below 50%**: Minimal error handling, crashes likely

---

## 3. Type Safety (20%)

### What to Check

Ensure strong TypeScript typing throughout:

- **No `any` Types**: All types explicitly defined
- **Proper Annotations**: Function parameters and returns typed
- **Zod Alignment**: Runtime schemas match TypeScript types
- **Generic Usage**: Generics used appropriately
- **Type Guards**: Proper narrowing for unions

### Review Checklist

```markdown
- [ ] No `any` type usage
- [ ] All function parameters typed
- [ ] All function return types explicit
- [ ] Interfaces/types for all data structures
- [ ] Zod schemas derive TypeScript types
- [ ] Type guards for union types
- [ ] Generics constrained appropriately
- [ ] No type assertions without validation
- [ ] Strict null checks respected
```

### Common Issues

| Issue | Severity | Example |
|-------|----------|---------|
| Using `any` | HIGH | `function process(data: any)` |
| Missing return type | MEDIUM | `function get()` (implicit any) |
| Type assertion | MEDIUM | `data as User` without validation |
| Implicit any | HIGH | Untyped callback parameter |
| Schema mismatch | HIGH | Zod schema differs from interface |

### Type Safety Patterns

```typescript
// BAD: Type issues
function processData(data: any) {
  return data.items.map((item: any) => item.value);
}

// GOOD: Proper typing
interface DataInput {
  items: Array<{ value: string }>;
}

function processData(data: DataInput): string[] {
  return data.items.map(item => item.value);
}

// GOOD: Zod-derived types
const DataInputSchema = z.object({
  items: z.array(z.object({ value: z.string() }))
});
type DataInput = z.infer<typeof DataInputSchema>;
```

### Scoring Guide

- **90-100%**: No any, full type coverage, Zod aligned
- **70-89%**: Minimal any usage, mostly typed
- **50-69%**: Some any usage, incomplete coverage
- **Below 50%**: Widespread any, poor type safety

---

## 4. Architecture (15%)

### What to Check

Evaluate code organization and design quality:

- **Modularity**: Code split into logical modules
- **DRY**: No unnecessary duplication
- **Separation of Concerns**: Clear boundaries
- **Dependency Direction**: Proper layering
- **Testability**: Code is easy to test

### Review Checklist

```markdown
- [ ] Functions have single responsibility
- [ ] No code duplication (>10 lines)
- [ ] Clear module boundaries
- [ ] Dependencies injected, not hardcoded
- [ ] Configuration separated from logic
- [ ] Side effects isolated
- [ ] Pure functions where possible
- [ ] Consistent file/folder structure
- [ ] Appropriate use of abstractions
```

### Common Issues

| Issue | Severity | Example |
|-------|----------|---------|
| God function | HIGH | Function >100 lines doing everything |
| Code duplication | MEDIUM | Same logic in multiple files |
| Circular dependency | HIGH | A imports B, B imports A |
| Hardcoded config | MEDIUM | `const API_URL = 'http://...'` |
| Mixed concerns | MEDIUM | Business logic in API handler |

### Architecture Patterns

```typescript
// BAD: Mixed concerns, hardcoded values
async function handleCreateUser(req: Request, res: Response) {
  const user = req.body;
  const hash = await bcrypt.hash(user.password, 10);
  const result = await db.query(
    `INSERT INTO users VALUES ('${user.email}', '${hash}')`
  );
  await fetch('http://email-service/send', {
    body: JSON.stringify({ to: user.email, template: 'welcome' })
  });
  res.json(result);
}

// GOOD: Separated concerns
// userService.ts
class UserService {
  constructor(
    private db: Database,
    private hasher: PasswordHasher,
    private emailService: EmailService
  ) {}

  async createUser(input: CreateUserInput): Promise<User> {
    const hashedPassword = await this.hasher.hash(input.password);
    const user = await this.db.users.create({
      email: input.email,
      password: hashedPassword
    });
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}

// userController.ts
async function handleCreateUser(req: Request, res: Response) {
  const input = CreateUserSchema.parse(req.body);
  const user = await userService.createUser(input);
  res.json(user);
}
```

### Scoring Guide

- **90-100%**: Clean architecture, well-organized, DRY
- **70-89%**: Good structure, minor duplication
- **50-69%**: Some organization issues, some duplication
- **Below 50%**: Poor organization, significant duplication

---

## 5. Security (10%)

### What to Check

Identify and prevent security vulnerabilities:

- **Injection Risks**: SQL, NoSQL, command injection
- **Secrets Handling**: No hardcoded credentials
- **Input Validation**: All user input validated
- **Output Encoding**: Prevent XSS
- **Authentication**: Proper auth checks

### Review Checklist

```markdown
- [ ] No SQL/command injection vulnerabilities
- [ ] No hardcoded secrets/API keys
- [ ] All user input validated and sanitized
- [ ] Parameterized queries used
- [ ] Authentication on protected routes
- [ ] Authorization checks implemented
- [ ] Sensitive data encrypted
- [ ] No sensitive data in logs
- [ ] HTTPS used for external calls
- [ ] Rate limiting on APIs
```

### Common Issues

| Issue | Severity | Example |
|-------|----------|---------|
| SQL injection | CRITICAL | `db.query(\`SELECT * WHERE id='${id}'\`)` |
| Hardcoded secret | CRITICAL | `const API_KEY = 'sk-...'` |
| Missing auth | CRITICAL | Admin endpoint without auth check |
| XSS vulnerability | HIGH | `innerHTML = userInput` |
| Missing validation | HIGH | API accepts any input shape |
| Sensitive in logs | MEDIUM | `logger.info('Password:', pw)` |

### Security Patterns

```typescript
// BAD: Multiple security issues
async function getUser(id: string) {
  const API_KEY = 'secret-key-123';  // Hardcoded secret!
  const result = await db.query(
    `SELECT * FROM users WHERE id = '${id}'`  // SQL injection!
  );
  console.log('User password:', result.password);  // Sensitive in logs!
  return result;
}

// GOOD: Secure implementation
async function getUser(id: string): Promise<User | null> {
  // Validate input
  const validatedId = z.string().uuid().parse(id);

  // Use parameterized query
  const result = await db.users.findUnique({
    where: { id: validatedId },
    select: { id: true, email: true, name: true }  // Exclude sensitive fields
  });

  // Safe logging
  logger.info('Fetched user', { id: validatedId });

  return result;
}

// Config from environment
const config = {
  apiKey: process.env.API_KEY ?? throwError('API_KEY not set')
};
```

### Scoring Guide

- **90-100%**: No vulnerabilities, best practices followed
- **70-89%**: Minor issues, no critical vulnerabilities
- **50-69%**: Some vulnerabilities, needs hardening
- **Below 50%**: Critical vulnerabilities present

---

## Overall Scoring

Calculate weighted overall score:

```
Overall = (PRD × 0.30) + (Error × 0.25) + (Types × 0.20) + (Arch × 0.15) + (Security × 0.10)
```

### Pass/Fail Thresholds

| Status | Criteria |
|--------|----------|
| **PASS** | Overall >= 80%, no CRITICAL issues, all dimensions >= 70% |
| **CONDITIONAL** | Overall >= 70%, no CRITICAL issues, max 1 dimension < 70% |
| **FAIL** | Overall < 70% OR any CRITICAL issue OR 2+ dimensions < 70% |

### Report Template

```markdown
## QA Report: [Section Name]

### Summary
Overall Score: XX% - [PASS/CONDITIONAL/FAIL]

### Dimension Scores
1. PRD Compliance: XX% [PASS/FAIL]
2. Error Handling: XX% [PASS/FAIL]
3. Type Safety: XX% [PASS/FAIL]
4. Architecture: XX% [PASS/FAIL]
5. Security: XX% [PASS/FAIL]

### Issues Found
#### CRITICAL
- [issue description] - file:line

#### HIGH
- [issue description] - file:line

#### MEDIUM
- [issue description] - file:line

#### LOW
- [issue description] - file:line

### Recommendations
1. [recommendation]
2. [recommendation]
```
