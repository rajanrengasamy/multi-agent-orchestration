# Security Rules

## Secrets Management

### Never Hardcode Secrets

- **NEVER** commit secrets, API keys, tokens, or passwords to source control
- Scan for accidentally committed secrets before every commit

```typescript
// NEVER DO THIS
const apiKey = 'sk-1234567890abcdef';
const dbPassword = 'supersecretpassword';

// CORRECT - Use environment variables
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;
```

### Environment Variables

- Store all sensitive configuration in environment variables
- Use `.env` files for local development (never commit)
- Validate required environment variables at startup

```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
});

// Validate at startup
const env = envSchema.parse(process.env);

export { env };
```

### Required .gitignore Entries

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Secrets
*.pem
*.key
credentials.json
secrets.json
```

## Input Validation

### Validate All External Input with Zod

- All API request bodies, query params, and path params must be validated
- Define schemas at API boundaries
- Fail fast on invalid input

```typescript
import { z } from 'zod';

// Define strict schemas
const createUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).trim(),
  age: z.number().int().min(0).max(150).optional(),
});

// Validate at API boundary
export async function createUser(req: Request): Promise<Response> {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return Response.json(
      { error: 'Validation failed', details: result.error.issues },
      { status: 400 }
    );
  }

  const validatedData = result.data;
  // Proceed with validated data
}
```

### Sanitize User Input

- Sanitize all user input before use in HTML, SQL, or shell commands
- Use parameterized queries for databases
- Escape HTML entities for display

```typescript
import DOMPurify from 'dompurify';
import { escape } from 'html-escaper';

// Sanitize HTML content
const cleanHtml = DOMPurify.sanitize(userInput);

// Escape for text display
const safeText = escape(userInput);
```

## Prohibited Patterns

### No eval() or Dynamic Code Execution

```typescript
// NEVER DO THIS
eval(userCode);
new Function(userCode)();
setTimeout(userString, 0);
setInterval(userString, 0);

// If dynamic execution is absolutely required, use a sandboxed environment
```

### No String Concatenation in Queries

```typescript
// NEVER DO THIS - SQL Injection vulnerable
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// CORRECT - Use parameterized queries
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// With an ORM
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

## Database Security

### Always Use Parameterized Queries

```typescript
// PostgreSQL with pg
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1 AND status = $2',
  [email, status]
);

// MySQL with mysql2
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE email = ? AND status = ?',
  [email, status]
);

// MongoDB
const user = await collection.findOne({
  email: sanitizedEmail,
  status: { $eq: status }  // Use $eq to prevent operator injection
});
```

### Limit Query Results

```typescript
// Always paginate large queries
const users = await prisma.user.findMany({
  take: Math.min(limit, 100),  // Cap maximum results
  skip: offset,
});
```

## Authentication & Authorization

### Secure Password Handling

```typescript
import { hash, verify } from '@node-rs/argon2';

// Hash passwords with strong algorithm
const hashedPassword = await hash(password, {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
});

// Verify passwords
const isValid = await verify(hashedPassword, inputPassword);
```

### JWT Security

```typescript
import { SignJWT, jwtVerify } from 'jose';

// Sign with proper claims
const token = await new SignJWT({ userId: user.id })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('1h')
  .setAudience('your-app')
  .setIssuer('your-api')
  .sign(secret);

// Verify with all claims
const { payload } = await jwtVerify(token, secret, {
  audience: 'your-app',
  issuer: 'your-api',
});
```

## HTTP Security Headers

```typescript
// Required security headers
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
```

## Logging Security

```typescript
// NEVER log sensitive data
logger.info('User logged in', {
  userId: user.id,
  // NEVER: password, token, apiKey, creditCard
});

// Redact sensitive fields
const sanitizedRequest = {
  ...request,
  headers: {
    ...request.headers,
    authorization: '[REDACTED]',
  },
  body: {
    ...request.body,
    password: '[REDACTED]',
  },
};
```
