# Development Guide

## Prerequisites

- Node.js 18+ 
- Yarn 1.22+
- Docker (for local services)
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ensei-platform
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development servers**
   ```bash
   yarn dev
   ```

## Project Structure

```
ensei-platform/
├── apps/                    # Applications
│   ├── web/                # Next.js web app
│   ├── mobile/             # React Native app
│   ├── telegram-bot/       # Telegram bot
│   └── admin-dashboard/    # Admin interface
├── services/               # Backend services
│   ├── api-gateway/        # API Gateway (Fastify)
│   ├── mission-engine/     # Mission processing
│   ├── payment-service/    # Payment processing
│   ├── verification-service/ # AI verification
│   ├── notification-service/ # Notifications
│   └── analytics-service/  # Analytics
├── packages/               # Shared packages
│   ├── shared-types/       # TypeScript types
│   ├── validation-schemas/ # Zod schemas
│   ├── api-client/         # API client
│   ├── ui-components/      # React components
│   └── blockchain-utils/   # Blockchain utilities
├── smart-contracts/        # TON smart contracts
├── database/              # Database migrations & seeds
├── infrastructure/        # IaC (Terraform, K8s)
└── docs/                  # Documentation
```

## Development Commands

### Root Level
```bash
yarn dev              # Start all dev servers
yarn build            # Build all packages
yarn test             # Run all tests
yarn lint             # Lint all code
yarn type-check       # Type check all code
yarn clean            # Clean all builds
yarn format           # Format all code
```

### Package Specific
```bash
yarn turbo run dev --filter=@ensei/web
yarn turbo run build --filter=@ensei/api-gateway
yarn turbo run test --filter=@ensei/shared-types
```

### Database
```bash
yarn db:migrate       # Run migrations
yarn db:seed          # Seed database
```

## Code Quality

### Pre-commit Hooks
The repository uses Husky for pre-commit hooks:
- **Linting**: Runs ESLint on changed files
- **Tests**: Runs tests on changed files
- **Format**: Formats code with Prettier

### Commit Convention
We use conventional commits:
```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

## Testing

### Unit Tests
```bash
yarn turbo run test:unit
```

### Integration Tests
```bash
yarn turbo run test:integration
```

### E2E Tests
```bash
yarn turbo run test:e2e
```

## Environment Variables

Create `.env.local` with:
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ensei

# Redis
REDIS_URL=redis://localhost:6379

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Blockchain
TON_NETWORK=testnet
TON_WALLET_MNEMONIC=your_mnemonic_here

# AI Verification
OPENAI_API_KEY=your_openai_key
```

## Docker Development

```bash
# Start services
yarn docker:up

# Stop services
yarn docker:down
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 3000, 3001, 5432, 6379 are available
2. **Node version**: Ensure you're using Node.js 18+
3. **Yarn cache**: Clear with `yarn cache clean`
4. **Turbo cache**: Clear with `yarn turbo clean`

### Reset Development Environment
```bash
yarn clean
rm -rf node_modules
yarn install
yarn db:migrate
yarn db:seed
```

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests and linting
4. Commit with conventional commit format
5. Create a pull request

## Architecture

### Mission Flow
1. **Creation**: User creates mission via web app
2. **Processing**: Mission engine validates and stores
3. **Execution**: Users submit proofs
4. **Verification**: AI service validates proofs
5. **Payout**: Payment service distributes rewards

### Data Flow
```
Web App → API Gateway → Mission Engine → Database
                ↓
            Payment Service → TON Blockchain
                ↓
            Notification Service → Users
```

## Security

- All API endpoints require authentication
- Sensitive data is encrypted at rest
- Blockchain transactions are signed securely
- AI verification prevents fraud
- Regular security scans via GitHub Actions
