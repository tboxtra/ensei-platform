# Feature-First Architecture Guide

This document explains the feature-first architecture principles implemented in the Ensei Platform to ensure consistent code organization and maintainability.

## 🎯 Core Principle

**Group code by FEATURE, not by type.**

Instead of organizing code by technical concerns (components, utils, services), we organize by business features to create cohesive, maintainable modules.

## 📁 Directory Structure

### Web Application (`apps/web/`)
```
src/
├── features/                    # Feature-based organization
│   ├── _TEMPLATE/              # Template for new features
│   ├── auth/                   # Authentication feature
│   │   ├── components/         # Auth-specific components
│   │   ├── hooks/             # Auth-specific hooks
│   │   ├── api/               # Auth API calls
│   │   ├── state/             # Auth state management
│   │   ├── schemas/           # Auth validation schemas
│   │   └── index.ts           # Public exports
│   ├── missions/              # Mission management feature
│   └── rewards/               # Rewards system feature
├── shared/                     # Truly cross-feature code
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Shared hooks
│   ├── utils/                 # Utility functions
│   └── types/                 # Shared types
└── pages/                     # Next.js pages (import from features only)
```

### API Gateway (`services/api-gateway/`)
```
src/
├── modules/                    # Module-based organization
│   ├── _TEMPLATE/             # Template for new modules
│   ├── auth/                  # Authentication module
│   │   ├── http/              # Routes and controllers
│   │   ├── app/               # Use cases and coordinators
│   │   ├── infra/             # Database and external services
│   │   ├── domain/            # Business entities and rules
│   │   └── index.ts           # Public exports
│   ├── missions/              # Mission management module
│   └── payments/              # Payment processing module
├── shared/                    # Truly cross-module code
│   ├── database/              # Database utilities
│   ├── middleware/            # Shared middleware
│   └── types/                 # Shared types
└── index.ts                   # Main application entry
```

## 🚫 Prohibited Global Buckets

These directories are **forbidden** and will be caught by pre-commit hooks:

- `apps/web/src/components` (use `src/features/*/components` instead)
- `apps/web/src/utils` (use `src/shared/utils` or feature-specific utils)
- `apps/web/src/services` (use `src/features/*/api` instead)
- `services/api-gateway/src/services` (use `src/modules/*/infra` instead)
- `services/api-gateway/src/utils` (use `src/shared/utils` instead)

## ✅ Feature Placement Rules

### For Web Features:
1. **Components**: Place in `src/features/<feature>/components/`
2. **Hooks**: Place in `src/features/<feature>/hooks/`
3. **API Calls**: Place in `src/features/<feature>/api/`
4. **State Management**: Place in `src/features/<feature>/state/`
5. **Validation**: Place in `src/features/<feature>/schemas/`
6. **Types**: Place in `src/features/<feature>/types/`
7. **Tests**: Co-locate with code (`*.test.ts[x]`)

### For API Modules:
1. **HTTP Layer**: Place in `src/modules/<module>/http/`
2. **Application Logic**: Place in `src/modules/<module>/app/`
3. **Infrastructure**: Place in `src/modules/<module>/infra/`
4. **Domain Logic**: Place in `src/modules/<module>/domain/`
5. **Tests**: Co-locate with code (`*.test.ts`)

## 🔗 Import Rules

### Web Application:
- **Pages**: Can only import from `src/features/*` and `src/shared/*`
- **Features**: Can import from `src/shared/*` and other features via their public API
- **Cross-feature**: Use feature's `index.ts` exports only
- **Shared types**: Import from `@types/*` (packages/shared-types)

### API Gateway:
- **Modules**: Can import from `src/shared/*` and other modules via their public API
- **Cross-module**: Use module's `index.ts` exports only
- **Domain**: Cannot import from any other layer
- **Application**: Can only import from domain layer
- **Infrastructure**: Can import from domain layer (interfaces only)
- **HTTP**: Can import from application and domain layers

## 🛠️ Development Workflow

### Creating a New Feature (Web):
1. Copy `src/features/_TEMPLATE/` to `src/features/<feature-name>/`
2. Follow the template structure
3. Export public API through `index.ts`
4. Write tests co-located with code
5. Import only from `src/shared/*` and other features' public APIs

### Creating a New Module (API):
1. Copy `src/modules/_TEMPLATE/` to `src/modules/<module-name>/`
2. Follow hexagonal architecture principles
3. Export public API through `index.ts`
4. Write tests co-located with code
5. Respect layer boundaries (domain → app → infra → http)

## 🔍 Quality Gates

### Pre-commit Hooks:
- **Structure Check**: Prevents creation of global buckets
- **ESLint Boundaries**: Enforces import rules
- **Linting**: Code quality checks
- **Testing**: Runs tests on changed files

### ESLint Rules:
- **Import Boundaries**: Prevents cross-feature deep imports
- **Public API**: Only allow imports via feature/module `index.ts`
- **Layer Boundaries**: Enforce hexagonal architecture in API modules

## 📝 Naming Conventions

### Features/Modules:
- Use kebab-case: `user-profile`, `mission-creation`

### Files:
- **Components**: PascalCase: `UserProfile.tsx`
- **Hooks**: Start with `use`: `useUserProfile.ts`
- **API**: End with `Api`: `userApi.ts`
- **Stores**: End with `Store`: `userStore.ts`
- **Schemas**: End with `Schemas`: `userSchemas.ts`
- **Types**: End with `Types`: `userTypes.ts`

## 🎯 Benefits

1. **Cohesion**: Related code lives together
2. **Maintainability**: Easy to find and modify feature code
3. **Testability**: Co-located tests with clear boundaries
4. **Scalability**: New features don't pollute global namespaces
5. **Team Collaboration**: Clear ownership and boundaries
6. **Code Reuse**: Shared code is explicitly identified

## 🚀 Quick Start

### For Cursor AI:
Use this prompt when generating code:
> "Place all new code in feature folders (src/features/<feature> for web, src/modules/<module> for API), expose via index.ts, and never add logic to global buckets."

### For Developers:
1. Always start with the feature template
2. Follow the import rules strictly
3. Run pre-commit hooks before committing
4. Use path aliases for clean imports
5. Co-locate tests with code

## 📚 Templates

- **Web Feature**: `apps/web/src/features/_TEMPLATE/README.md`
- **API Module**: `services/api-gateway/src/modules/_TEMPLATE/README.md`

## 🔧 Configuration Files

- **ESLint**: `.eslintrc.cjs` in each app/service
- **TypeScript**: `tsconfig.json` with path aliases
- **Pre-commit**: `.husky/pre-commit` with structure checks
- **Structure Check**: `tools/scripts/check-structure.js`

This architecture ensures that the Ensei Platform remains maintainable and scalable as it grows, with clear boundaries and consistent patterns across all features and modules.
