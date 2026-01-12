# Testing Rules

## Universal Principles

### Test Organization
- **Co-location**: Keep test files physically near the code they test
- **Clear naming**: Test names should describe expected behavior, not implementation
  - Pattern: `should [expected outcome] when [condition]`
  - Anti-pattern: `test X`, `works`, `handles error`

### Test Structure: Arrange-Act-Assert (AAA)
Every test follows a consistent three-phase structure:
1. **Arrange**: Set up test preconditions and fixtures
2. **Act**: Execute the code being tested
3. **Assert**: Verify the outcome matches expectations

### Test Philosophy
- **Test behavior, not mechanics**: Verify what code does, not how it does it
- **Mock external systems**: Isolate the code under test by replacing dependencies
  - Mock at boundaries: APIs, databases, filesystems, time
  - Use dependency injection to make mocking possible
- **Independent tests**: Tests must not depend on execution order or shared state
- **Fast feedback**: Unit tests should run in milliseconds

### Coverage Philosophy
- **Critical paths first**: Auth, payments, data mutations need highest coverage
- **Quality over quantity**: One meaningful test beats ten trivial ones
- **Branch coverage matters**: Test both happy paths and error cases

### Test Categories
| Category | Scope | Speed | Dependencies |
|----------|-------|-------|--------------|
| **Unit** | Single function/method | < 100ms | All mocked |
| **Integration** | Multiple components | Seconds | Real services allowed |
| **E2E** | Complete user flow | Minutes | Full system |

### Anti-Patterns
- Testing implementation details instead of behavior
- Tests that depend on execution order
- Flaky tests with timing dependencies
- Over-mocking that tests nothing
- Tests without assertions
- Commented-out tests

---

## TypeScript (Jest/Vitest)

### File Organization
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

### Test Structure
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = { email: 'john@example.com', name: 'John' };

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user.email).toBe('john@example.com');
      expect(user.id).toBeDefined();
    });

    it('should throw ValidationError for invalid email', async () => {
      await expect(userService.createUser({ email: 'invalid' }))
        .rejects.toThrow(ValidationError);
    });
  });
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

### Mocking
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

### Async Testing
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

### Coverage Commands
```bash
vitest run --coverage
jest --coverage
```

---

## Python (pytest)

### File Organization
```
project/
├── src/
│   └── my_package/
│       ├── services/
│       │   ├── user.py
│       │   └── __init__.py
├── tests/
│   ├── conftest.py              # Shared fixtures
│   ├── unit/
│   │   └── services/
│   │       └── test_user.py
│   └── integration/
│       └── test_api.py
```

### Test Structure
```python
# tests/unit/services/test_user.py
import pytest
from src.my_package.services.user import UserService

class TestUserService:
    """Tests for UserService."""

    def test_create_user_with_valid_data(self, db_session):
        """Should create new user with valid data."""
        # Arrange
        service = UserService(db_session)
        user_data = {'email': 'john@example.com', 'name': 'John Doe'}

        # Act
        user = service.create_user(**user_data)

        # Assert
        assert user.email == 'john@example.com'
        assert user.name == 'John Doe'
        assert user.id is not None

    def test_create_user_with_duplicate_email(self, db_session):
        """Should raise error when email already exists."""
        # Arrange
        service = UserService(db_session)
        service.create_user(email='john@example.com', name='John')

        # Act & Assert
        with pytest.raises(ValueError, match="Email already exists"):
            service.create_user(email='john@example.com', name='Jane')
```

### Fixtures (conftest.py)
```python
# tests/conftest.py
import pytest
import pytest_asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture(scope="session")
def db_engine():
    """Create test database engine (runs once per session)."""
    engine = create_engine("sqlite:///:memory:")
    yield engine
    engine.dispose()

@pytest.fixture
def db_session(db_engine):
    """Create fresh database session for each test."""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def mock_user():
    """Sample user for testing."""
    return {"id": "123", "email": "test@example.com", "name": "Test User"}
```

### Async Testing
```python
import pytest
import pytest_asyncio

class TestAsyncAPI:
    """Tests for async operations."""

    @pytest.mark.asyncio
    async def test_fetch_user_async(self, async_client):
        """Should fetch user data asynchronously."""
        response = await async_client.get('/api/users/123')
        assert response.status_code == 200
        assert response.json()['id'] == '123'

    @pytest.mark.asyncio
    async def test_concurrent_requests(self, async_client):
        """Should handle multiple concurrent requests."""
        import asyncio

        tasks = [async_client.get(f'/api/users/{i}') for i in range(10)]
        responses = await asyncio.gather(*tasks)
        assert all(r.status_code == 200 for r in responses)
```

### Mocking
```python
from unittest.mock import Mock, AsyncMock, patch

class TestUserServiceWithMocks:
    """Tests with mocked dependencies."""

    def test_user_creation_sends_email(self):
        """Should send welcome email when user is created."""
        # Arrange
        mock_email_service = Mock()
        mock_db = Mock()
        service = UserService(mock_db, email_service=mock_email_service)

        # Act
        service.create_user(email='john@example.com', name='John')

        # Assert
        mock_email_service.send_welcome_email.assert_called_once_with(
            email='john@example.com',
            name='John'
        )

    @pytest.mark.asyncio
    async def test_async_service_with_mock(self):
        """Test async service with mocked async calls."""
        mock_api = AsyncMock()
        mock_api.fetch_data.return_value = {'id': '123', 'name': 'John'}

        result = await mock_api.fetch_data('123')

        assert result['id'] == '123'
```

### Coverage Commands
```bash
pytest --cov=src --cov-report=html --cov-report=term-missing
pytest --cov=src --cov-fail-under=80
```

### pyproject.toml Configuration
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "--cov=src --cov-report=term-missing"
python_files = ["test_*.py", "*_test.py"]
asyncio_mode = "auto"
```

---

## SwiftUI (XCTest / Swift Testing)

### File Organization
```
MyApp/
├── Sources/
│   └── MyApp/
│       ├── Services/
│       │   └── UserService.swift
│       └── ViewModels/
│           └── UserViewModel.swift
└── Tests/
    └── MyAppTests/
        ├── Services/
        │   └── UserServiceTests.swift
        └── ViewModels/
            └── UserViewModelTests.swift
```

### XCTest Structure (Traditional)
```swift
import XCTest
@testable import MyApp

final class UserServiceTests: XCTestCase {

    var sut: UserService!  // System Under Test
    var mockRepository: MockUserRepository!

    override func setUp() {
        super.setUp()
        mockRepository = MockUserRepository()
        sut = UserService(repository: mockRepository)
    }

    override func tearDown() {
        sut = nil
        mockRepository = nil
        super.tearDown()
    }

    func test_createUser_withValidData_returnsUser() async throws {
        // Arrange
        let userData = CreateUserRequest(email: "john@example.com", name: "John")

        // Act
        let user = try await sut.createUser(userData)

        // Assert
        XCTAssertEqual(user.email, "john@example.com")
        XCTAssertNotNil(user.id)
    }

    func test_createUser_withInvalidEmail_throwsValidationError() async {
        // Arrange
        let userData = CreateUserRequest(email: "invalid", name: "John")

        // Act & Assert
        do {
            _ = try await sut.createUser(userData)
            XCTFail("Expected ValidationError to be thrown")
        } catch {
            XCTAssertTrue(error is ValidationError)
        }
    }
}
```

### Swift Testing Framework (iOS 18+ / Xcode 16+)
```swift
import Testing
@testable import MyApp

@Suite("UserService Tests")
struct UserServiceTests {

    let mockRepository = MockUserRepository()
    var sut: UserService { UserService(repository: mockRepository) }

    @Test("Create user with valid data returns user")
    func createUserWithValidData() async throws {
        // Arrange
        let userData = CreateUserRequest(email: "john@example.com", name: "John")

        // Act
        let user = try await sut.createUser(userData)

        // Assert
        #expect(user.email == "john@example.com")
        #expect(user.id != nil)
    }

    @Test("Create user with invalid email throws ValidationError")
    func createUserWithInvalidEmail() async throws {
        let userData = CreateUserRequest(email: "invalid", name: "John")

        await #expect(throws: ValidationError.self) {
            try await sut.createUser(userData)
        }
    }
}
```

### Testing ViewModels
```swift
import XCTest
@testable import MyApp

@MainActor
final class UserViewModelTests: XCTestCase {

    func test_loadUser_updatesUserProperty() async {
        // Arrange
        let mockService = MockUserService()
        mockService.userToReturn = User(id: "123", name: "John", email: "john@example.com")
        let viewModel = UserViewModel(service: mockService)

        // Act
        await viewModel.loadUser(id: "123")

        // Assert
        XCTAssertEqual(viewModel.user?.name, "John")
        XCTAssertFalse(viewModel.isLoading)
    }

    func test_loadUser_onError_setsErrorMessage() async {
        // Arrange
        let mockService = MockUserService()
        mockService.errorToThrow = NetworkError.serverError(500)
        let viewModel = UserViewModel(service: mockService)

        // Act
        await viewModel.loadUser(id: "123")

        // Assert
        XCTAssertNil(viewModel.user)
        XCTAssertNotNil(viewModel.errorMessage)
    }
}
```

### Mock Protocols
```swift
protocol UserRepositoryProtocol {
    func findById(_ id: String) async throws -> User?
    func create(_ user: User) async throws -> User
}

class MockUserRepository: UserRepositoryProtocol {
    var userToReturn: User?
    var errorToThrow: Error?
    var createCallCount = 0

    func findById(_ id: String) async throws -> User? {
        if let error = errorToThrow { throw error }
        return userToReturn
    }

    func create(_ user: User) async throws -> User {
        createCallCount += 1
        if let error = errorToThrow { throw error }
        return user
    }
}
```

### Async Testing
```swift
func test_concurrentOperations() async throws {
    // Use TaskGroup for concurrent test operations
    try await withThrowingTaskGroup(of: User.self) { group in
        for i in 0..<10 {
            group.addTask {
                try await self.sut.fetchUser(id: "\(i)")
            }
        }

        var results: [User] = []
        for try await user in group {
            results.append(user)
        }

        XCTAssertEqual(results.count, 10)
    }
}
```

### UI Testing (SwiftUI)
```swift
import XCTest

final class UserFlowUITests: XCTestCase {

    let app = XCUIApplication()

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app.launch()
    }

    func test_loginFlow_withValidCredentials_showsHome() {
        // Arrange
        let emailField = app.textFields["email"]
        let passwordField = app.secureTextFields["password"]
        let loginButton = app.buttons["login"]

        // Act
        emailField.tap()
        emailField.typeText("test@example.com")
        passwordField.tap()
        passwordField.typeText("password123")
        loginButton.tap()

        // Assert
        XCTAssertTrue(app.staticTexts["Welcome"].waitForExistence(timeout: 5))
    }
}
```

### Coverage Commands
```bash
# Xcode command line
xcodebuild test -scheme MyApp -enableCodeCoverage YES

# View coverage report
xcrun xccov view --report Build/Logs/Test/*.xcresult
```

---

## Coverage Requirements (All Languages)

| Code Type | Minimum Coverage |
|-----------|------------------|
| New code | 80% |
| Critical paths (auth, payments) | 95% |
| Utilities | 70% |
| UI components | 60% |

Coverage should include:
- Statement coverage
- Branch coverage
- Function coverage
