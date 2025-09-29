# Mission Wizard

A step-by-step guided interface for creating missions, replacing the traditional single-page form with a modern wizard experience.

## Features

- **7-Step Guided Process**: Platform → Model → Type → Tasks → Settings → Details → Review
- **Auto-advance**: Automatically moves to next step when single-choice selections are made
- **Real-time Validation**: Step-by-step validation with clear error messages
- **State Persistence**: Saves progress to localStorage for session recovery
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Feature Flag**: Can be toggled on/off without affecting existing functionality

## Usage

### Enable the Wizard

Set the environment variable to enable the wizard:

```bash
NEXT_PUBLIC_MISSION_WIZARD=1
```

### Access the Wizard

- **With flag enabled**: Navigate to `/missions/create` to see the wizard
- **Force legacy mode**: Add `?mode=legacy` to the URL to use the old form
- **Force wizard mode**: Add `?mode=wizard` to the URL (when flag is disabled)

## Architecture

### File Structure

```
mission-wizard/
├── MissionWizard.tsx              # Main container component
├── components/
│   ├── StepIndicator.tsx          # Progress indicator
│   └── WizardNav.tsx              # Navigation controls
├── steps/
│   ├── PlatformStep.tsx           # Platform selection
│   ├── ModelStep.tsx              # Mission model selection
│   ├── TypeStep.tsx               # Mission type selection
│   ├── TasksStep.tsx              # Task selection (TODO)
│   ├── SettingsStep.tsx           # Settings configuration (TODO)
│   ├── DetailsStep.tsx            # Content details (TODO)
│   └── ReviewStep.tsx             # Final review (TODO)
├── state/
│   ├── useWizardState.ts          # Zustand state management
│   └── validation.ts              # Zod validation schemas
├── adapters/
│   └── payload.ts                 # API payload conversion
└── types/
    └── wizard.types.ts            # TypeScript definitions
```

### State Management

Uses Zustand for state management with localStorage persistence:

```typescript
const {
  platform, setPlatform,
  model, setModel,
  type, setType,
  tasks, setTasks,
  cap, setCap,
  audience, setAudience,
  details, setDetails,
  currentStep, nextStep, previousStep,
  validateStep, isSubmitting
} = useWizardState();
```

### Validation

Each step has its own validation schema:

```typescript
const stepValidators = {
  1: (state) => !!state.platform,
  2: (state) => !!state.model,
  3: (state) => !!state.type,
  4: (state) => state.tasks.length > 0,
  5: (state) => !!state.cap && state.cap > 0,
  6: (state) => state.details.instructions.length >= 10,
  7: (state) => validateAllSteps(state)
};
```

## Implementation Status

### ✅ Completed
- [x] Core wizard infrastructure
- [x] State management with Zustand
- [x] Step indicator with progress tracking
- [x] Navigation controls
- [x] Platform selection step
- [x] Model selection step
- [x] Type selection step
- [x] Tasks selection step
- [x] Settings configuration step
- [x] Details input step
- [x] Review and submission step
- [x] Feature flag integration
- [x] API payload adapter
- [x] Authentication integration
- [x] Pricing integration
- [x] Keyboard navigation support
- [x] Loading states and transitions
- [x] Comprehensive error handling
- [x] State persistence
- [x] Auto-advance functionality
- [x] Real-time validation
- [x] Responsive design

### 🚧 In Progress
- [ ] Analytics tracking
- [ ] Performance optimizations
- [ ] Advanced error recovery

### 📋 TODO
- [ ] Add unit tests
- [ ] Add e2e tests
- [ ] Add accessibility improvements
- [ ] Add internationalization support
- [ ] Add mission templates
- [ ] Add bulk mission creation

## Development

### Adding New Steps

1. Create a new step component in `steps/`
2. Add the step to the wizard state types
3. Update the step validation
4. Add the step to the main wizard render function

### Modifying State

The wizard state is managed by Zustand and automatically persists to localStorage. Changes to the state structure should be backward compatible.

### Testing

```bash
# Enable the wizard
NEXT_PUBLIC_MISSION_WIZARD=1 npm run dev

# Test the wizard flow
# Navigate to /missions/create
# Complete each step and verify state persistence

# Test specific wizard page
# Navigate to /test-wizard
# This bypasses the feature flag for direct testing
```

### Test Scenarios

1. **Complete Flow Test**
   - Select platform → auto-advance to model
   - Select model → auto-advance to type
   - Select type → auto-advance to tasks
   - Select tasks → continue to settings
   - Configure settings → continue to details
   - Enter details → continue to review
   - Review and submit → verify mission creation

2. **State Persistence Test**
   - Fill out several steps
   - Refresh the page
   - Verify state is restored
   - Continue from where you left off

3. **Validation Test**
   - Try to proceed without required fields
   - Verify validation messages appear
   - Complete required fields and verify progression

4. **Keyboard Navigation Test**
   - Use arrow keys to navigate
   - Use Enter to continue
   - Verify keyboard shortcuts work

5. **Error Handling Test**
   - Test with invalid URLs
   - Test with insufficient instructions
   - Verify error messages are clear

## Migration Strategy

The wizard is designed to be a drop-in replacement for the existing mission creation form:

1. **Feature Flag**: Toggle between old and new interfaces
2. **API Compatibility**: Uses the same API endpoints and payload structure
3. **State Preservation**: Maintains all existing functionality
4. **Gradual Rollout**: Can be enabled for specific users or environments

## Performance

- **Lazy Loading**: Step components are loaded on demand
- **Memoization**: Expensive calculations are memoized
- **State Persistence**: Reduces data loss on page refresh
- **Optimistic Updates**: Immediate UI feedback for better UX
