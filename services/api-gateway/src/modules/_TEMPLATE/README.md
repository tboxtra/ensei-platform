# Module Template

This is the standard structure for all modules in the API gateway. Use this as a template when creating new modules following hexagonal architecture principles.

## Directory Structure

```
src/modules/<module>/
├── http/               # Routes and controllers (presentation layer)
│   ├── routes.ts       # Express routes definition
│   ├── controllers.ts  # Request/response handling
│   ├── middleware.ts   # Module-specific middleware
│   ├── validators.ts   # Request validation schemas
│   └── index.ts        # Export all HTTP-related code
├── app/                # Use cases and coordinators (application layer)
│   ├── useCases.ts     # Business use cases
│   ├── coordinators.ts # Orchestrate multiple use cases
│   ├── services.ts     # Application services
│   └── index.ts        # Export all application logic
├── infra/              # Database repos and external SDK clients (infrastructure layer)
│   ├── repositories.ts # Database access layer
│   ├── clients.ts      # External API clients
│   ├── adapters.ts     # Framework/SDK adapters
│   └── index.ts        # Export all infrastructure code
├── domain/             # Domain entities and business rules (domain layer)
│   ├── entities.ts     # Domain entities
│   ├── valueObjects.ts # Value objects
│   ├── repositories.ts # Repository interfaces
│   └── index.ts        # Export all domain code
└── index.ts            # Public exports only - main entry point
```

## Hexagonal Architecture Principles

### 1. **Domain Layer** (`domain/`)
- Contains pure business logic
- No dependencies on external frameworks or libraries
- Defines entities, value objects, and business rules
- Contains repository interfaces (not implementations)

### 2. **Application Layer** (`app/`)
- Orchestrates use cases and business workflows
- Depends only on domain layer
- Contains use cases, coordinators, and application services
- No direct database or external API calls

### 3. **Infrastructure Layer** (`infra/`)
- Implements domain interfaces (repositories, external services)
- Handles database access, external API calls, file system operations
- Contains adapters for frameworks and SDKs
- Depends on domain layer through interfaces

### 4. **HTTP Layer** (`http/`)
- Handles HTTP requests and responses
- Validates input data
- Converts between HTTP and domain models
- Depends on application layer

## Dependency Flow

```
HTTP Layer → Application Layer → Domain Layer
     ↓              ↓
Infrastructure Layer → Domain Layer (interfaces)
```

## Usage Guidelines

1. **Domain Logic**: All business rules and entities go in the `domain/` folder
2. **Use Cases**: Business workflows and orchestration in `app/`
3. **Infrastructure**: Database and external service implementations in `infra/`
4. **HTTP**: Request/response handling in `http/`
5. **Tests**: Co-locate test files next to the code they test (`*.test.ts`)
6. **Exports**: Only export what other modules need through the main `index.ts`

## Import Rules

- **Domain**: Cannot import from any other layer
- **Application**: Can only import from domain layer
- **Infrastructure**: Can import from domain layer (interfaces only)
- **HTTP**: Can import from application and domain layers
- **Cross-module**: Avoid direct imports; use shared modules instead
- **Framework/SDK**: Only import in infrastructure layer through adapters

## Example Module Structure

```typescript
// src/modules/user/index.ts
export { userRoutes } from './http';
export { createUser, updateUser, deleteUser } from './app';
export { UserRepository } from './domain';
export type { User, UserCreateRequest } from './domain';
```

## Naming Conventions

- Module folders should be lowercase with hyphens: `user-management`, `mission-processing`
- Route files should end with `Routes`: `userRoutes.ts`
- Controller files should end with `Controllers`: `userControllers.ts`
- Use case files should end with `UseCases`: `userUseCases.ts`
- Repository files should end with `Repositories`: `userRepositories.ts`
- Entity files should end with `Entities`: `userEntities.ts`

## Testing

- Each layer should have its own test files
- Domain layer tests should be pure unit tests
- Application layer tests should mock infrastructure dependencies
- Infrastructure layer tests should use test databases/mocks
- HTTP layer tests should use supertest or similar HTTP testing tools

## Error Handling

- Domain layer should define domain-specific errors
- Application layer should handle business logic errors
- Infrastructure layer should handle technical errors
- HTTP layer should convert errors to appropriate HTTP responses

## Example Implementation

```typescript
// domain/entities.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string
  ) {}
}

// domain/repositories.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// app/useCases.ts
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}
  
  async execute(email: string, name: string): Promise<User> {
    const user = new User(generateId(), email, name);
    await this.userRepository.save(user);
    return user;
  }
}

// infra/repositories.ts
export class DatabaseUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    // Database implementation
  }
  
  async save(user: User): Promise<void> {
    // Database implementation
  }
}

// http/controllers.ts
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}
  
  async createUser(req: Request, res: Response) {
    const { email, name } = req.body;
    const user = await this.createUserUseCase.execute(email, name);
    res.json(user);
  }
}
```
