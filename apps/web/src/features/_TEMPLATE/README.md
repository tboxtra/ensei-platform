# Feature Template

This is the standard structure for all features in the web application. Use this as a template when creating new features.

## Directory Structure

```
src/features/<feature>/
├── components/          # Feature-specific React components
│   ├── FeatureComponent.tsx
│   ├── FeatureComponent.test.tsx
│   └── index.ts         # Export all components
├── hooks/              # Feature-specific React hooks
│   ├── useFeatureData.ts
│   ├── useFeatureData.test.ts
│   └── index.ts         # Export all hooks
├── api/                # Client calls to backend
│   ├── featureApi.ts
│   ├── featureApi.test.ts
│   └── index.ts         # Export all API functions
├── state/              # Zustand/Redux slices for this feature
│   ├── featureStore.ts
│   ├── featureStore.test.ts
│   └── index.ts         # Export store and actions
├── schemas/            # Zod schemas for this feature
│   ├── featureSchemas.ts
│   ├── featureSchemas.test.ts
│   └── index.ts         # Export all schemas
├── types/              # TypeScript types specific to this feature
│   ├── featureTypes.ts
│   └── index.ts         # Export all types
└── index.ts            # Public exports only - main entry point
```

## Usage Guidelines

1. **Components**: Place all React components specific to this feature in the `components/` folder
2. **Hooks**: Custom hooks that manage feature-specific logic go in `hooks/`
3. **API**: All API calls related to this feature go in `api/`
4. **State**: Feature-specific state management (Zustand stores, Redux slices) in `state/`
5. **Schemas**: Zod validation schemas for this feature's data in `schemas/`
6. **Types**: TypeScript interfaces and types specific to this feature in `types/`
7. **Tests**: Co-locate test files next to the code they test (`*.test.ts[x]`)
8. **Exports**: Only export what other features need through the main `index.ts`

## Import Rules

- **Internal imports**: Components can import from other folders within the same feature
- **External imports**: Only import from `src/shared/*` and `packages/shared-types/*`
- **Cross-feature imports**: Avoid importing directly from other features; use shared modules instead
- **Public API**: Other features should only import from the feature's main `index.ts`

## Example Feature Structure

```typescript
// src/features/rewards/index.ts
export { RewardsList } from './components';
export { useRewards } from './hooks';
export { fetchRewards, claimReward } from './api';
export { rewardsStore } from './state';
export { rewardSchema } from './schemas';
export type { Reward, RewardClaim } from './types';
```

## Naming Conventions

- Feature folders should be lowercase with hyphens: `user-profile`, `mission-creation`
- Component files should be PascalCase: `RewardCard.tsx`
- Hook files should start with `use`: `useRewardData.ts`
- API files should end with `Api`: `rewardApi.ts`
- Store files should end with `Store`: `rewardStore.ts`
- Schema files should end with `Schemas`: `rewardSchemas.ts`
- Type files should end with `Types`: `rewardTypes.ts`

## Testing

- Each file should have a corresponding test file
- Tests should be co-located with the code they test
- Use descriptive test names that explain the behavior being tested
- Mock external dependencies and API calls
- Test both happy path and error scenarios
