# API Design Rules

## RESTful Conventions

### HTTP Methods

| Method | Purpose | Idempotent | Request Body |
|--------|---------|------------|--------------|
| GET | Retrieve resource(s) | Yes | No |
| POST | Create new resource | No | Yes |
| PUT | Replace entire resource | Yes | Yes |
| PATCH | Partial update | Yes | Yes |
| DELETE | Remove resource | Yes | No |

### URL Structure

```
GET    /api/v1/users              # List users
GET    /api/v1/users/:id          # Get single user
POST   /api/v1/users              # Create user
PUT    /api/v1/users/:id          # Replace user
PATCH  /api/v1/users/:id          # Update user
DELETE /api/v1/users/:id          # Delete user

# Nested resources
GET    /api/v1/users/:id/posts    # Get user's posts
POST   /api/v1/users/:id/posts    # Create post for user

# Actions (when CRUD doesn't fit)
POST   /api/v1/users/:id/activate # Custom action
```

### Naming Conventions

- Use **plural nouns** for resources: `/users`, `/posts`, `/orders`
- Use **lowercase** with hyphens for multi-word: `/order-items`
- Use **query parameters** for filtering, sorting, pagination

```
GET /api/v1/users?status=active&sort=-createdAt&page=1&limit=20
```

## Request/Response Validation with Zod

### Request Schemas

```typescript
import { z } from 'zod';

// Path parameters
const userParamsSchema = z.object({
  id: z.string().uuid(),
});

// Query parameters
const listUsersQuerySchema = z.object({
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().regex(/^-?[a-zA-Z]+$/).optional(),
});

// Request body
const createUserBodySchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
});
```

### Response Schemas

```typescript
// Single resource response
const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// List response with pagination
const usersListResponseSchema = z.object({
  data: z.array(userResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
```

## Error Response Format

### Consistent Error Structure

```typescript
interface ApiError {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    details?: unknown[];    // Additional error details (validation errors, etc.)
    requestId?: string;     // For tracking/debugging
  };
}
```

### Standard Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Request validation failed |
| 400 | BAD_REQUEST | Malformed request |
| 401 | UNAUTHORIZED | Authentication required |
| 401 | INVALID_TOKEN | Token expired or invalid |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | UNPROCESSABLE_ENTITY | Business logic error |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Unexpected server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

### Error Response Examples

```typescript
// Validation error (400)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "age",
        "message": "Must be a positive number"
      }
    ],
    "requestId": "req_abc123"
  }
}

// Not found error (404)
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User with ID 'xyz' not found",
    "requestId": "req_abc123"
  }
}

// Rate limit error (429)
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "details": {
      "retryAfter": 60
    },
    "requestId": "req_abc123"
  }
}
```

### Error Handler Implementation

```typescript
import { z, ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown[]
  ) {
    super(message);
  }
}

export function handleError(error: unknown, requestId: string): Response {
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
          requestId,
        },
      },
      { status: 400 }
    );
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  return Response.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        requestId,
      },
    },
    { status: 500 }
  );
}
```

## API Documentation with JSDoc

### Endpoint Documentation

```typescript
/**
 * Create a new user
 *
 * @route POST /api/v1/users
 *
 * @param {CreateUserBody} body - User creation data
 * @param {string} body.email - User's email address
 * @param {string} body.name - User's display name
 * @param {('admin'|'user'|'guest')} [body.role='user'] - User's role
 *
 * @returns {UserResponse} 201 - Created user
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 409 - Email already exists
 *
 * @example request
 * {
 *   "email": "john@example.com",
 *   "name": "John Doe",
 *   "role": "user"
 * }
 *
 * @example response - 201
 * {
 *   "id": "550e8400-e29b-41d4-a716-446655440000",
 *   "email": "john@example.com",
 *   "name": "John Doe",
 *   "role": "user",
 *   "createdAt": "2024-01-15T10:30:00Z",
 *   "updatedAt": "2024-01-15T10:30:00Z"
 * }
 */
export async function createUser(req: Request): Promise<Response> {
  // Implementation
}
```

## Pagination

### Standard Pagination Response

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### Cursor-Based Pagination (for large datasets)

```typescript
interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}
```

## Rate Limiting Headers

```typescript
// Include rate limit info in responses
const rateLimitHeaders = {
  'X-RateLimit-Limit': '100',        // Max requests per window
  'X-RateLimit-Remaining': '95',     // Remaining requests
  'X-RateLimit-Reset': '1640000000', // Unix timestamp of reset
};
```

## Versioning

- Use URL path versioning: `/api/v1/`, `/api/v2/`
- Maintain backwards compatibility within a version
- Document breaking changes when incrementing versions
- Support at least one previous version during migration periods
