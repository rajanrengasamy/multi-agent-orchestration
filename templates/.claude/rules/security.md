# Security Rules

## Universal Principles

### Secrets Management
- **Never hardcode secrets**: API keys, tokens, passwords, and credentials must never appear in source code
- **Environment variables**: Store all sensitive configuration in environment variables
- **Gitignore**: Always exclude `.env`, `*.pem`, `*.key`, and credential files from version control
- **Validate at startup**: Check for required secrets early to fail fast

### Input Validation
- **Validate at boundaries**: All external input (API requests, user input, file uploads) must be validated
- **Fail fast**: Reject invalid input immediately before processing
- **Sanitize for context**: Apply appropriate escaping based on output context (HTML, SQL, shell)

### Secure Defaults
- **Deny by default**: Start with no permissions, explicitly grant what's needed
- **Least privilege**: Each component should have minimum required access
- **Defense in depth**: Multiple layers of security, not just perimeter protection

### Prohibited Patterns
- **No dynamic code execution**: Avoid `eval()` and equivalents in all languages
- **No string concatenation in queries**: Always use parameterized queries
- **No sensitive data in logs**: Redact passwords, tokens, and PII before logging
- **No secrets in URLs**: Query parameters are logged and cached

---

## TypeScript

### Secrets Management
```typescript
// NEVER DO THIS
const apiKey = 'sk-1234567890abcdef';
const dbPassword = 'supersecretpassword';

// CORRECT - Use environment variables
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;
```

### Environment Validation with Zod
```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
});

// Validate at startup - fail fast
const env = envSchema.parse(process.env);

export { env };
```

### Input Validation
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

### Sanitization
```typescript
import DOMPurify from 'dompurify';
import { escape } from 'html-escaper';

// Sanitize HTML content
const cleanHtml = DOMPurify.sanitize(userInput);

// Escape for text display
const safeText = escape(userInput);
```

### Prohibited Patterns
```typescript
// NEVER DO THIS
eval(userCode);
new Function(userCode)();
setTimeout(userString, 0);
setInterval(userString, 0);

// SQL Injection - NEVER
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// CORRECT - Parameterized queries
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// With ORM
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

### Database Security
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

// MongoDB - Use $eq to prevent operator injection
const user = await collection.findOne({
  email: sanitizedEmail,
  status: { $eq: status }
});

// Always limit results
const users = await prisma.user.findMany({
  take: Math.min(limit, 100),
  skip: offset,
});
```

### Password Hashing
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

### HTTP Security Headers
```typescript
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
```

### Secure Logging
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

---

## Python

### Secrets Management
```python
import os

# NEVER DO THIS
api_key = "sk-1234567890abcdef"
db_password = "supersecretpassword"

# CORRECT - Use environment variables
api_key = os.environ["API_KEY"]
db_password = os.environ["DB_PASSWORD"]

# With default (for optional configs only)
debug_mode = os.environ.get("DEBUG", "false").lower() == "true"
```

### Environment Validation with Pydantic
```python
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings with validation."""

    database_url: str = Field(..., min_length=1)
    api_key: str = Field(..., min_length=1)
    jwt_secret: str = Field(..., min_length=32)
    environment: str = Field(default="development", pattern="^(development|staging|production)$")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Validate at startup - fails if missing/invalid
settings = Settings()
```

### Input Validation with Pydantic
```python
from pydantic import BaseModel, EmailStr, Field, field_validator

class CreateUserRequest(BaseModel):
    """Validated user creation request."""

    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    age: int | None = Field(default=None, ge=0, le=150)

    @field_validator('name')
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()

# Usage in FastAPI
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.post("/users")
async def create_user(request: CreateUserRequest):
    # Pydantic validates automatically, raises 422 on failure
    validated_data = request.model_dump()
    # Proceed with validated data
```

### HTML Sanitization
```python
import html
import bleach

# Escape for text display
safe_text = html.escape(user_input)

# Sanitize HTML (allow limited tags)
allowed_tags = ['p', 'br', 'strong', 'em', 'a']
allowed_attrs = {'a': ['href', 'title']}
clean_html = bleach.clean(
    user_input,
    tags=allowed_tags,
    attributes=allowed_attrs,
    strip=True
)
```

### Prohibited Patterns
```python
# NEVER DO THIS
eval(user_code)
exec(user_code)
compile(user_code, '<string>', 'exec')
__import__(user_module)

# SQL Injection - NEVER
query = f"SELECT * FROM users WHERE id = '{user_id}'"

# Shell Injection - NEVER
import os
os.system(f"echo {user_input}")
```

### Database Security
```python
import asyncpg
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# asyncpg - Parameterized queries
async def get_user(conn: asyncpg.Connection, user_id: str):
    return await conn.fetchrow(
        "SELECT * FROM users WHERE id = $1",
        user_id
    )

# SQLAlchemy - Use bindparams
async def search_users(session: AsyncSession, email: str, status: str):
    query = text(
        "SELECT * FROM users WHERE email = :email AND status = :status"
    )
    result = await session.execute(
        query.bindparams(email=email, status=status)
    )
    return result.fetchall()

# SQLAlchemy ORM (preferred)
from sqlalchemy import select
from models import User

async def get_user_orm(session: AsyncSession, user_id: str):
    stmt = select(User).where(User.id == user_id)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()

# Always limit results
async def list_users(session: AsyncSession, limit: int = 20, offset: int = 0):
    stmt = select(User).limit(min(limit, 100)).offset(offset)
    result = await session.execute(stmt)
    return result.scalars().all()
```

### Password Hashing
```python
from passlib.context import CryptContext

# Configure Argon2 (recommended) or bcrypt
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto",
    argon2__memory_cost=65536,
    argon2__time_cost=3,
    argon2__parallelism=4,
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### JWT Security
```python
from datetime import datetime, timedelta, timezone
import jwt

SECRET_KEY = settings.jwt_secret
ALGORITHM = "HS256"

def create_access_token(user_id: str, expires_delta: timedelta = timedelta(hours=1)) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + expires_delta,
        "aud": "your-app",
        "iss": "your-api",
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            audience="your-app",
            issuer="your-api",
        )
        return payload
    except jwt.InvalidTokenError as e:
        raise AuthenticationError(f"Invalid token: {e}")
```

### Secure Logging
```python
import logging
from typing import Any

logger = logging.getLogger(__name__)

# NEVER log sensitive data
logger.info("User logged in", extra={"user_id": user.id})
# NEVER: password, token, api_key, credit_card

def sanitize_request(request: dict[str, Any]) -> dict[str, Any]:
    """Redact sensitive fields before logging."""
    sensitive_fields = {"password", "token", "api_key", "authorization", "secret"}

    def redact(obj: Any, key: str = "") -> Any:
        if isinstance(obj, dict):
            return {
                k: "[REDACTED]" if k.lower() in sensitive_fields else redact(v, k)
                for k, v in obj.items()
            }
        elif isinstance(obj, list):
            return [redact(item) for item in obj]
        return obj

    return redact(request)
```

### Subprocess Security
```python
import subprocess
import shlex

# NEVER - Shell injection vulnerable
subprocess.run(f"echo {user_input}", shell=True)

# CORRECT - Use list arguments, no shell
subprocess.run(["echo", user_input], shell=False, check=True)

# If shell is required, use shlex.quote
safe_input = shlex.quote(user_input)
subprocess.run(f"echo {safe_input}", shell=True, check=True)
```

---

## SwiftUI

### Secrets Management
```swift
import Foundation

// NEVER DO THIS - hardcoded secrets
let apiKey = "sk-1234567890abcdef"
let dbPassword = "supersecretpassword"

// CORRECT - Use environment variables (build time)
enum Config {
    static let apiKey: String = {
        guard let key = ProcessInfo.processInfo.environment["API_KEY"] else {
            fatalError("API_KEY environment variable not set")
        }
        return key
    }()
}

// CORRECT - Use Keychain for runtime secrets
import Security

final class KeychainService {
    static let shared = KeychainService()

    func save(key: String, data: Data) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        SecItemDelete(query as CFDictionary) // Remove existing
        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }

    func load(key: String) throws -> Data {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else {
            throw KeychainError.loadFailed(status)
        }
        return data
    }
}
```

### Input Validation with Codable
```swift
import Foundation

struct CreateUserRequest: Codable {
    let email: String
    let name: String
    let age: Int?

    enum CodingKeys: String, CodingKey {
        case email, name, age
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        // Validate email format
        let rawEmail = try container.decode(String.self, forKey: .email)
        guard rawEmail.contains("@"), rawEmail.count <= 255 else {
            throw ValidationError.invalidEmail
        }
        email = rawEmail.lowercased()

        // Validate name
        let rawName = try container.decode(String.self, forKey: .name).trimmingCharacters(in: .whitespaces)
        guard rawName.count >= 1, rawName.count <= 100 else {
            throw ValidationError.invalidName
        }
        name = rawName

        // Validate age if present
        if let rawAge = try container.decodeIfPresent(Int.self, forKey: .age) {
            guard rawAge >= 0, rawAge <= 150 else {
                throw ValidationError.invalidAge
            }
            age = rawAge
        } else {
            age = nil
        }
    }
}

enum ValidationError: LocalizedError {
    case invalidEmail
    case invalidName
    case invalidAge

    var errorDescription: String? {
        switch self {
        case .invalidEmail: return "Invalid email format"
        case .invalidName: return "Name must be 1-100 characters"
        case .invalidAge: return "Age must be 0-150"
        }
    }
}
```

### Secure Network Requests
```swift
import Foundation

actor SecureAPIClient {
    private let session: URLSession
    private let baseURL: URL

    init(baseURL: URL) {
        let config = URLSessionConfiguration.default
        config.tlsMinimumSupportedProtocolVersion = .TLSv12
        config.urlCache = nil // Disable caching for sensitive data

        self.session = URLSession(configuration: config)
        self.baseURL = baseURL
    }

    func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Encodable? = nil,
        token: String? = nil
    ) async throws -> T {
        var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add authorization header securely
        if let token = token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.httpError(httpResponse.statusCode)
        }

        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

### Secure Data Storage
```swift
import Foundation
import CryptoKit

// Use Data Protection for files
func saveSecureFile(data: Data, filename: String) throws {
    let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    let fileURL = documentsURL.appendingPathComponent(filename)

    try data.write(
        to: fileURL,
        options: [.atomic, .completeFileProtection] // Encrypted until first unlock
    )
}

// Encrypt sensitive data before storage
struct EncryptedStorage {
    private let key: SymmetricKey

    init() throws {
        // Load or generate key from Keychain
        if let keyData = try? KeychainService.shared.load(key: "encryption_key") {
            key = SymmetricKey(data: keyData)
        } else {
            key = SymmetricKey(size: .bits256)
            try KeychainService.shared.save(key: "encryption_key", data: key.withUnsafeBytes { Data($0) })
        }
    }

    func encrypt(_ data: Data) throws -> Data {
        let sealedBox = try AES.GCM.seal(data, using: key)
        guard let combined = sealedBox.combined else {
            throw EncryptionError.sealingFailed
        }
        return combined
    }

    func decrypt(_ data: Data) throws -> Data {
        let sealedBox = try AES.GCM.SealedBox(combined: data)
        return try AES.GCM.open(sealedBox, using: key)
    }
}
```

### Biometric Authentication
```swift
import LocalAuthentication

actor BiometricAuthService {
    func authenticate(reason: String) async throws -> Bool {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            throw BiometricError.notAvailable(error?.localizedDescription ?? "Unknown error")
        }

        return try await withCheckedThrowingContinuation { continuation in
            context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: reason
            ) { success, error in
                if let error = error {
                    continuation.resume(throwing: BiometricError.failed(error.localizedDescription))
                } else {
                    continuation.resume(returning: success)
                }
            }
        }
    }
}
```

### Secure Logging
```swift
import os.log

private let logger = Logger(subsystem: Bundle.main.bundleIdentifier!, category: "Security")

// NEVER log sensitive data
logger.info("User logged in: \(user.id, privacy: .public)")

// Use privacy annotations
logger.debug("Request to: \(endpoint, privacy: .public)")
logger.debug("User email: \(email, privacy: .private)") // Redacted in release builds
logger.debug("Token: \(token, privacy: .private(mask: .hash))") // Shows hash only

// Custom redaction for sensitive types
extension User {
    var safeDescription: String {
        "User(id: \(id), email: [REDACTED])"
    }
}
```

### App Transport Security
```xml
<!-- Info.plist - Enforce HTTPS -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <!-- Only add exceptions if absolutely necessary -->
</dict>
```

---

## Required .gitignore Entries (All Languages)

```gitignore
# Environment files
.env
.env.local
.env.*.local
.env.production

# Secrets and keys
*.pem
*.key
*.p12
*.keystore
credentials.json
secrets.json
service-account*.json

# IDE secrets
.idea/secrets/
.vscode/*.json

# Language-specific
# Python
.python-version
__pycache__/
*.pyc

# Node
node_modules/
.npm/

# iOS/macOS
*.xcuserdata
*.xcscmblueprint
```

---

## Security Audit Checklist

Use this checklist before deployment:

### Secrets
- [ ] No hardcoded secrets in source code
- [ ] All secrets in environment variables or secure vaults
- [ ] `.env` files excluded from version control
- [ ] API keys have appropriate scope limits
- [ ] Secrets rotated after any potential exposure

### Input Validation
- [ ] All API inputs validated with schema (Zod/Pydantic/Codable)
- [ ] File uploads validated (type, size, content)
- [ ] URLs validated before fetching
- [ ] No direct user input in SQL/shell commands

### Authentication
- [ ] Passwords hashed with Argon2/bcrypt
- [ ] JWT tokens have expiration
- [ ] Session tokens are cryptographically random
- [ ] Failed login attempts are rate-limited

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] TLS 1.2+ enforced for all connections
- [ ] PII handled according to regulations
- [ ] Logs redact sensitive information

