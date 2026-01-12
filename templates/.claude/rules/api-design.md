# API Design Rules

## Universal Principles

### RESTful Conventions

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

### Error Response Structure

All languages should use this consistent error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ],
    "requestId": "req_abc123"
  }
}
```

### Pagination Patterns

**Offset-based** (simpler, for small datasets):
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Cursor-based** (efficient, for large datasets):
```json
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6MTAwfQ==",
    "hasMore": true,
    "limit": 20
  }
}
```

### Versioning Strategy

- Use URL path versioning: `/api/v1/`, `/api/v2/`
- Maintain backwards compatibility within a version
- Document breaking changes when incrementing versions
- Support at least one previous version during migration periods

---

## TypeScript

### Request Validation with Zod

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

// Response schema
const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
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

### Pagination Response Types

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

interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}
```

### Rate Limiting Headers

```typescript
const rateLimitHeaders = {
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Remaining': '95',
  'X-RateLimit-Reset': '1640000000',
};
```

### API Documentation with JSDoc

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
 */
export async function createUser(req: Request): Promise<Response> {
  // Implementation
}
```

---

## Python (FastAPI)

### Request Validation with Pydantic

```python
from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

class UserRole(str, Enum):
    admin = "admin"
    user = "user"
    guest = "guest"

class UserStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    pending = "pending"

# Query parameters
class ListUsersQuery(BaseModel):
    status: UserStatus | None = None
    search: str | None = Field(default=None, max_length=100)
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    sort: str | None = Field(default=None, pattern=r"^-?[a-zA-Z]+$")

# Request body
class CreateUserRequest(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = UserRole.user

# Response
class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    role: UserRole
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### Error Handler Implementation

```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
import uuid

app = FastAPI()

class ErrorDetail(BaseModel):
    field: str
    message: str

class ApiErrorResponse(BaseModel):
    code: str
    message: str
    details: list[ErrorDetail] | None = None
    request_id: str

class ApiError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: list[ErrorDetail] | None = None
    ):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details

@app.exception_handler(ApiError)
async def api_error_handler(request: Request, exc: ApiError):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": [d.model_dump() for d in exc.details] if exc.details else None,
                "requestId": request_id,
            }
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    details = [
        {"field": ".".join(str(loc) for loc in err["loc"]), "message": err["msg"]}
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": details,
                "requestId": request_id,
            }
        },
    )
```

### Endpoint Implementation

```python
from fastapi import FastAPI, Query, Path, Depends
from typing import Annotated

app = FastAPI()

@app.get("/api/v1/users", response_model=PaginatedResponse[UserResponse])
async def list_users(
    status: Annotated[UserStatus | None, Query()] = None,
    search: Annotated[str | None, Query(max_length=100)] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    sort: Annotated[str | None, Query(pattern=r"^-?[a-zA-Z]+$")] = None,
):
    """List users with filtering and pagination."""
    # Implementation
    pass

@app.get("/api/v1/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: Annotated[UUID, Path(description="User ID")]
):
    """Get a single user by ID."""
    # Implementation
    pass

@app.post("/api/v1/users", response_model=UserResponse, status_code=201)
async def create_user(request: CreateUserRequest):
    """Create a new user."""
    # Implementation
    pass
```

### Pagination Response Types

```python
from typing import Generic, TypeVar

T = TypeVar("T")

class PaginationInfo(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool

class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    pagination: PaginationInfo

class CursorPaginationInfo(BaseModel):
    cursor: str | None
    has_more: bool
    limit: int

class CursorPaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    pagination: CursorPaginationInfo
```

### Rate Limiting with SlowAPI

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/v1/users")
@limiter.limit("100/minute")
async def list_users(request: Request):
    # Add rate limit headers to response
    response.headers["X-RateLimit-Limit"] = "100"
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset_timestamp)
    return data
```

---

## SwiftUI (API Client)

### Request/Response Models with Codable

```swift
import Foundation

enum UserRole: String, Codable {
    case admin
    case user
    case guest
}

// Request body
struct CreateUserRequest: Codable {
    let email: String
    let name: String
    let role: UserRole

    init(email: String, name: String, role: UserRole = .user) {
        self.email = email
        self.name = name
        self.role = role
    }
}

// Response
struct UserResponse: Codable, Identifiable {
    let id: UUID
    let email: String
    let name: String
    let role: UserRole
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id, email, name, role
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// Paginated response
struct PaginatedResponse<T: Codable>: Codable {
    let data: [T]
    let pagination: PaginationInfo
}

struct PaginationInfo: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
    let hasNext: Bool
    let hasPrev: Bool

    enum CodingKeys: String, CodingKey {
        case page, limit, total
        case totalPages = "total_pages"
        case hasNext = "has_next"
        case hasPrev = "has_prev"
    }
}
```

### Error Handling

```swift
import Foundation

struct ApiErrorResponse: Codable {
    let error: ApiErrorDetail
}

struct ApiErrorDetail: Codable {
    let code: String
    let message: String
    let details: [ValidationError]?
    let requestId: String

    enum CodingKeys: String, CodingKey {
        case code, message, details
        case requestId = "request_id"
    }
}

struct ValidationError: Codable {
    let field: String
    let message: String
}

enum ApiError: LocalizedError {
    case validationError(details: [ValidationError])
    case unauthorized
    case forbidden
    case notFound(message: String)
    case conflict(message: String)
    case rateLimited(retryAfter: Int)
    case serverError(message: String)
    case networkError(Error)
    case decodingError(Error)

    var errorDescription: String? {
        switch self {
        case .validationError(let details):
            return details.map { "\($0.field): \($0.message)" }.joined(separator: ", ")
        case .unauthorized:
            return "Authentication required"
        case .forbidden:
            return "Access denied"
        case .notFound(let message):
            return message
        case .conflict(let message):
            return message
        case .rateLimited(let retryAfter):
            return "Too many requests. Retry after \(retryAfter) seconds."
        case .serverError(let message):
            return message
        case .networkError(let error):
            return error.localizedDescription
        case .decodingError(let error):
            return "Failed to parse response: \(error.localizedDescription)"
        }
    }

    static func from(statusCode: Int, errorResponse: ApiErrorDetail) -> ApiError {
        switch statusCode {
        case 400 where errorResponse.code == "VALIDATION_ERROR":
            return .validationError(details: errorResponse.details ?? [])
        case 401:
            return .unauthorized
        case 403:
            return .forbidden
        case 404:
            return .notFound(message: errorResponse.message)
        case 409:
            return .conflict(message: errorResponse.message)
        case 429:
            return .rateLimited(retryAfter: 60)
        default:
            return .serverError(message: errorResponse.message)
        }
    }
}
```

### API Client Implementation

```swift
import Foundation

actor ApiClient {
    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init(baseURL: URL) {
        self.baseURL = baseURL

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: config)

        self.decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        self.encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
    }

    // MARK: - Users API

    func listUsers(
        status: String? = nil,
        search: String? = nil,
        page: Int = 1,
        limit: Int = 20
    ) async throws -> PaginatedResponse<UserResponse> {
        var components = URLComponents(url: baseURL.appendingPathComponent("api/v1/users"), resolvingAgainstBaseURL: false)!

        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "page", value: String(page)),
            URLQueryItem(name: "limit", value: String(limit))
        ]
        if let status = status {
            queryItems.append(URLQueryItem(name: "status", value: status))
        }
        if let search = search {
            queryItems.append(URLQueryItem(name: "search", value: search))
        }
        components.queryItems = queryItems

        return try await request(url: components.url!, method: "GET")
    }

    func getUser(id: UUID) async throws -> UserResponse {
        let url = baseURL.appendingPathComponent("api/v1/users/\(id.uuidString)")
        return try await request(url: url, method: "GET")
    }

    func createUser(_ request: CreateUserRequest) async throws -> UserResponse {
        let url = baseURL.appendingPathComponent("api/v1/users")
        return try await request(url: url, method: "POST", body: request)
    }

    // MARK: - Generic Request

    private func request<T: Decodable, B: Encodable>(
        url: URL,
        method: String,
        body: B? = nil as String?,
        token: String? = nil
    ) async throws -> T {
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = method
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.setValue(UUID().uuidString, forHTTPHeaderField: "X-Request-ID")

        if let token = token {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            urlRequest.httpBody = try encoder.encode(body)
        }

        let (data, response) = try await session.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw ApiError.networkError(URLError(.badServerResponse))
        }

        // Handle rate limiting
        if httpResponse.statusCode == 429 {
            let retryAfter = Int(httpResponse.value(forHTTPHeaderField: "X-RateLimit-Reset") ?? "60") ?? 60
            throw ApiError.rateLimited(retryAfter: retryAfter)
        }

        // Handle errors
        guard (200...299).contains(httpResponse.statusCode) else {
            do {
                let errorResponse = try decoder.decode(ApiErrorResponse.self, from: data)
                throw ApiError.from(statusCode: httpResponse.statusCode, errorResponse: errorResponse.error)
            } catch let decodingError as DecodingError {
                throw ApiError.serverError(message: "Unknown server error")
            }
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw ApiError.decodingError(error)
        }
    }
}
```

### Usage in SwiftUI

```swift
import SwiftUI

@Observable
final class UsersViewModel {
    private let api = ApiClient(baseURL: URL(string: "https://api.example.com")!)

    var users: [UserResponse] = []
    var isLoading = false
    var errorMessage: String?

    @MainActor
    func loadUsers(page: Int = 1) async {
        isLoading = true
        errorMessage = nil

        do {
            let response = try await api.listUsers(page: page)
            users = response.data
        } catch let error as ApiError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    @MainActor
    func createUser(email: String, name: String) async -> Bool {
        do {
            let request = CreateUserRequest(email: email, name: name)
            let newUser = try await api.createUser(request)
            users.insert(newUser, at: 0)
            return true
        } catch let error as ApiError {
            errorMessage = error.errorDescription
            return false
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
}

struct UsersListView: View {
    @State private var viewModel = UsersViewModel()

    var body: some View {
        List(viewModel.users) { user in
            VStack(alignment: .leading) {
                Text(user.name)
                    .font(.headline)
                Text(user.email)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
            Button("OK") { viewModel.errorMessage = nil }
        } message: {
            if let message = viewModel.errorMessage {
                Text(message)
            }
        }
        .task {
            await viewModel.loadUsers()
        }
    }
}
```

---

## Cross-Language Consistency Checklist

When building APIs consumed by multiple clients, ensure:

| Aspect | Requirement |
|--------|-------------|
| **Date Format** | ISO 8601 (`2024-01-15T10:30:00Z`) |
| **UUID Format** | Lowercase with hyphens (`550e8400-e29b-41d4-a716-446655440000`) |
| **Casing** | `snake_case` for JSON keys (most common) |
| **Null Handling** | Omit null fields or use explicit `null` consistently |
| **Error Codes** | Consistent machine-readable codes across all errors |
| **Pagination** | Same structure for all paginated endpoints |
| **Timestamps** | UTC timezone, include timezone indicator |

