# Code Patterns Reference

Follow these patterns when implementing any section.

## TypeScript Patterns

### Strict Types - No `any`

```typescript
// BAD - avoid any
function processData(data: any): any {
  return data.value;
}

// GOOD - explicit types
interface DataInput {
  value: string;
  metadata?: Record<string, unknown>;
}

interface DataOutput {
  processed: string;
  timestamp: Date;
}

function processData(data: DataInput): DataOutput {
  return {
    processed: data.value.trim(),
    timestamp: new Date(),
  };
}
```

### Type Guards

```typescript
function isValidResponse(response: unknown): response is ApiResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    'data' in response
  );
}
```

### Generic Constraints

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

## Zod Schema Patterns

### Basic Schema Definition

```typescript
import { z } from 'zod';

// Define schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.coerce.date(),
  metadata: z.record(z.unknown()).optional(),
});

// Derive type from schema
export type User = z.infer<typeof UserSchema>;

// Input schema (for creation)
export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true
});
export type CreateUser = z.infer<typeof CreateUserSchema>;
```

### Schema Composition

```typescript
const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const ProductSchema = BaseEntitySchema.extend({
  name: z.string(),
  price: z.number().positive(),
  category: z.string(),
});
```

### Validation with Error Handling

```typescript
function validateUser(input: unknown): User {
  const result = UserSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      'Invalid user data',
      result.error.flatten()
    );
  }

  return result.data;
}
```

## Error Handling with Retry

### Retry Pattern

```typescript
interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === opts.maxAttempts) break;

      const delay = Math.min(
        opts.baseDelayMs * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelayMs
      );

      await sleep(delay);
    }
  }

  throw lastError;
}
```

### Result Type Pattern

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchData(id: string): Promise<Result<Data>> {
  try {
    const response = await api.get(`/data/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// Usage
const result = await fetchData('123');
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.message);
}
```

## Atomic File Writes

### Safe Write Pattern

```typescript
import { writeFile, rename, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import { dirname, join } from 'path';

async function atomicWrite(
  filePath: string,
  content: string | Buffer
): Promise<void> {
  const dir = dirname(filePath);
  const tempPath = join(dir, `.tmp-${randomUUID()}`);

  try {
    // Write to temp file
    await writeFile(tempPath, content, { mode: 0o644 });

    // Atomic rename
    await rename(tempPath, filePath);
  } catch (error) {
    // Clean up temp file on failure
    try {
      await unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}
```

### JSON File Operations

```typescript
async function readJsonFile<T>(
  filePath: string,
  schema: z.ZodType<T>
): Promise<T> {
  const content = await readFile(filePath, 'utf-8');
  const data = JSON.parse(content);
  return schema.parse(data);
}

async function writeJsonFile<T>(
  filePath: string,
  data: T,
  schema: z.ZodType<T>
): Promise<void> {
  // Validate before writing
  const validated = schema.parse(data);
  const content = JSON.stringify(validated, null, 2);
  await atomicWrite(filePath, content);
}
```

## API Call Wrapping

### API Client Pattern

```typescript
interface ApiClientOptions {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl;
    this.timeout = options.timeout ?? 30000;
    this.headers = options.headers ?? {};
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options: {
      body?: unknown;
      params?: Record<string, string>;
      schema?: z.ZodType<T>;
    } = {}
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ApiError(
          `API request failed: ${response.status}`,
          response.status,
          await response.text()
        );
      }

      const data = await response.json();

      if (options.schema) {
        return options.schema.parse(data);
      }

      return data as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  get<T>(path: string, options?: { params?: Record<string, string>; schema?: z.ZodType<T> }) {
    return this.request<T>('GET', path, options);
  }

  post<T>(path: string, body: unknown, options?: { schema?: z.ZodType<T> }) {
    return this.request<T>('POST', path, { ...options, body });
  }
}
```

### Custom Error Classes

```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public details: z.typeToFlattenedError<unknown>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class RetryableError extends Error {
  constructor(
    message: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RetryableError';
  }
}
```

## Utility Functions

### Sleep

```typescript
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Safe JSON Parse

```typescript
function safeJsonParse<T>(
  input: string,
  schema: z.ZodType<T>
): Result<T> {
  try {
    const parsed = JSON.parse(input);
    const validated = schema.parse(parsed);
    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Parse failed')
    };
  }
}
```

### Deep Clone

```typescript
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
```
