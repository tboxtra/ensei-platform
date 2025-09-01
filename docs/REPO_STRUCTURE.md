# Ensei Platform – Repository Structure

Authoritative monorepo tree:

# Ensei Platform - Enterprise Repository Structure
`
ensei-platform/
├── .github/                           # GitHub configuration
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── mission_type_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── workflows/                     # GitHub Actions CI/CD
│   │   ├── api-tests.yml
│   │   ├── web-app-deploy.yml
│   │   ├── mobile-build.yml
│   │   ├── smart-contracts-test.yml
│   │   ├── security-scan.yml
│   │   └── dependency-update.yml
│   ├── CODEOWNERS
│   └── dependabot.yml
│
├── apps/                              # Application layer
│   ├── web/                          # Main web application
│   │   ├── src/
│   │   │   ├── components/           # Reusable UI components
│   │   │   │   ├── ui/              # Base UI components (Button, Input, etc.)
│   │   │   │   ├── mission/         # Mission-specific components
│   │   │   │   ├── auth/           # Authentication components
│   │   │   │   └── dashboard/      # Dashboard components
│   │   │   ├── pages/              # Next.js pages
│   │   │   │   ├── api/           # API routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── missions/
│   │   │   │   └── profile/
│   │   │   ├── hooks/              # React hooks
│   │   │   ├── utils/              # Utility functions
│   │   │   ├── stores/             # State management (Zustand/Redux)
│   │   │   ├── styles/             # Global styles and themes
│   │   │   └── types/              # TypeScript type definitions
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   │
│   ├── mobile/                       # React Native mobile app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── navigation/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── android/
│   │   ├── ios/
│   │   ├── package.json
│   │   └── react-native.config.js
│   │
│   ├── telegram-bot/                 # Telegram Mini App
│   │   ├── src/
│   │   │   ├── handlers/
│   │   │   ├── middlewares/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── admin-dashboard/              # Admin/Enterprise dashboard
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   └── utils/
│       ├── package.json
│       └── vite.config.ts
│
├── services/                         # Backend microservices
│   ├── api-gateway/                 # Main API gateway (Express/Fastify)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── missions.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── payments.ts
│   │   │   │   └── admin.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rateLimit.ts
│   │   │   │   ├── validation.ts
│   │   │   │   └── cors.ts
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   │
│   ├── mission-engine/              # Mission processing service
│   │   ├── src/
│   │   │   ├── processors/         # Mission type processors
│   │   │   │   ├── engage.ts
│   │   │   │   ├── content.ts
│   │   │   │   └── ambassador.ts
│   │   │   ├── validators/         # Proof validation logic
│   │   │   ├── schedulers/         # Mission scheduling
│   │   │   └── notifications/      # Notification handlers
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── payment-service/             # TON blockchain integration
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   │   ├── ton-wallet.ts
│   │   │   │   ├── honor-conversion.ts
│   │   │   │   └── withdrawal.ts
│   │   │   ├── models/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── verification-service/        # AI-powered content verification
│   │   ├── src/
│   │   │   ├── ai/
│   │   │   │   ├── image-analysis.ts
│   │   │   │   ├── text-analysis.ts
│   │   │   │   └── video-analysis.ts
│   │   │   ├── social-apis/        # Platform API integrations
│   │   │   │   ├── twitter.ts
│   │   │   │   ├── instagram.ts
│   │   │   │   ├── tiktok.ts
│   │   │   │   └── facebook.ts
│   │   │   ├── validators/
│   │   │   └── utils/
│   │   ├── requirements.txt         # Python dependencies for AI
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── notification-service/        # Push notifications & messaging
│   │   ├── src/
│   │   │   ├── providers/
│   │   │   │   ├── telegram.ts
│   │   │   │   ├── email.ts
│   │   │   │   └── push.ts
│   │   │   ├── templates/
│   │   │   ├── schedulers/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── analytics-service/           # Data analytics & reporting
│       ├── src/
│       │   ├── collectors/         # Data collection
│       │   ├── processors/         # Data processing
│       │   ├── reporters/          # Report generation
│       │   └── dashboards/         # Dashboard APIs
│       ├── package.json
│       └── Dockerfile
│
├── packages/                        # Shared packages
│   ├── shared-types/               # TypeScript types shared across services
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── database/
│   │   │   ├── blockchain/
│   │   │   └── common/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui-components/              # Shared UI component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── styles/
│   │   ├── package.json
│   │   ├── rollup.config.js
│   │   └── tsconfig.json
│   │
│   ├── api-client/                 # Shared API client
│   │   ├── src/
│   │   │   ├── clients/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── blockchain-utils/           # TON blockchain utilities
│   │   ├── src/
│   │   │   ├── contracts/
│   │   │   ├── wallets/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── validation-schemas/         # Shared validation schemas
│       ├── src/
│       │   ├── mission/
│       │   ├── user/
│       │   └── payment/
│       ├── package.json
│       └── tsconfig.json
│
├── smart-contracts/                # TON smart contracts
│   ├── contracts/
│   │   ├── Mission.fc              # Mission contract
│   │   ├── Honor.fc                # Honor token contract
│   │   ├── Escrow.fc              # Payment escrow contract
│   │   └── Governance.fc          # DAO governance contract
│   ├── scripts/
│   │   ├── deploy.ts
│   │   ├── verify.ts
│   │   └── migrate.ts
│   ├── tests/
│   ├── package.json
│   └── ton.config.js
│
├── infrastructure/                 # Infrastructure as Code
│   ├── terraform/                 # Terraform configurations
│   │   ├── environments/
│   │   │   ├── development/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   ├── modules/
│   │   │   ├── database/
│   │   │   ├── kubernetes/
│   │   │   ├── networking/
│   │   │   └── storage/
│   │   └── variables.tf
│   │
│   ├── kubernetes/                # Kubernetes manifests
│   │   ├── namespaces/
│   │   ├── deployments/
│   │   ├── services/
│   │   ├── ingress/
│   │   └── configmaps/
│   │
│   ├── docker/                    # Docker configurations
│   │   ├── development/
│   │   ├── production/
│   │   └── docker-compose.override.yml
│   │
│   └── monitoring/                # Monitoring setup
│       ├── prometheus/
│       ├── grafana/
│       └── alertmanager/
│
├── database/                      # Database schemas and migrations
│   ├── migrations/               # Database migration files
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_missions.sql
│   │   ├── 003_add_honors_system.sql
│   │   └── 004_add_degen_missions.sql
│   ├── seeds/                   # Seed data for development
│   ├── schemas/                 # Database schema documentation
│   └── scripts/                 # Database utility scripts
│
├── docs/                         # Documentation
│   ├── api/                     # API documentation
│   │   ├── openapi.yaml
│   │   └── endpoints/
│   ├── architecture/            # System architecture docs
│   │   ├── overview.md
│   │   ├── microservices.md
│   │   ├── database-design.md
│   │   └── blockchain-integration.md
│   ├── deployment/              # Deployment guides
│   │   ├── local-setup.md
│   │   ├── staging-deployment.md
│   │   └── production-deployment.md
│   ├── user-guides/             # User documentation
│   │   ├── creator-guide.md
│   │   ├── shinobi-guide.md
│   │   └── api-integration.md
│   └── contributing/            # Development guides
│       ├── CONTRIBUTING.md
│       ├── coding-standards.md
│       ├── testing-guidelines.md
│       └── security-guidelines.md
│
├── tests/                        # End-to-end and integration tests
│   ├── e2e/                     # End-to-end tests
│   │   ├── mission-flow.spec.ts
│   │   ├── payment-flow.spec.ts
│   │   └── user-journey.spec.ts
│   ├── integration/             # Integration tests
│   │   ├── api/
│   │   ├── database/
│   │   └── blockchain/
│   ├── performance/             # Load testing
│   │   ├── mission-load.js
│   │   └── api-stress.js
│   └── fixtures/                # Test data fixtures
│
├── tools/                        # Development tools
│   ├── scripts/                 # Build and deployment scripts
│   │   ├── setup-dev.sh
│   │   ├── build-all.sh
│   │   ├── deploy.sh
│   │   └── backup-db.sh
│   ├── generators/              # Code generators
│   │   ├── mission-type.js
│   │   └── api-endpoint.js
│   └── cli/                     # Custom CLI tools
│       ├── ensei-cli/
│       └── migration-tool/
│
├── config/                       # Configuration files
│   ├── environments/
│   │   ├── development.env
│   │   ├── staging.env
│   │   └── production.env
│   ├── database.config.js
│   ├── blockchain.config.js
│   └── monitoring.config.js
│
├── security/                     # Security configurations
│   ├── policies/
│   │   ├── api-security.md
│   │   ├── data-privacy.md
│   │   └── blockchain-security.md
│   ├── certificates/
│   └── secrets/
│       └── .gitkeep
│
├── .gitignore
├── .env.example
├── .nvmrc
├── package.json                  # Root package.json for workspaces
├── turbo.json                    # Turborepo configuration
├── tsconfig.json                 # Root TypeScript config
├── README.md
├── CHANGELOG.md
├── LICENSE
└── SECURITY.md
## Key Architecture Decisions
### 1. Monorepo Structure
- **Turborepo** for efficient builds and caching
- **Yarn Workspaces** for dependency management
- Shared packages for common code
### 2. Microservices Architecture
- **API Gateway** as single entry point
- **Mission Engine** for core business logic
- **Verification Service** with AI capabilities
- **Payment Service** for blockchain integration
- **Notification Service** for user engagement
### 3. Technology Stack Recommendations
#### Frontend
- **Next.js 14** (App Router) for web application
- **React Native** for mobile apps
- **TailwindCSS** for styling
- **Zustand/Redux Toolkit** for state management
- **React Query** for data fetching
#### Backend
- **Node.js/TypeScript** for most services
- **Fastify** for high-performance API gateway
- **Python** for AI/ML verification service
- **PostgreSQL** for primary database
- **Redis** for caching and sessions
- **TON** for blockchain integration
#### Infrastructure
- **Kubernetes** for container orchestration
- **Terraform** for infrastructure as code
- **GitHub Actions** for CI/CD
- **Prometheus/Grafana** for monitoring
- **Sentry** for error tracking
### 4. Development Workflow
```bash
# Clone repository
git clone https://github.com/ensei-labs/ensei-platform.git
cd ensei-platform
# Install dependencies
yarn install
# Setup development environment
yarn dev:setup
# Start all services in development
yarn dev
# Run tests
yarn test
# Build for production
yarn build
# Deploy to staging
yarn deploy:staging
### 5. Security Considerations
- JWT authentication with refresh tokens
- Rate limiting on all API endpoints
- Input validation using shared schemas
- Secrets management with environment variables
- Regular security audits and dependency updates
### 6. Scalability Features
- Horizontal scaling of microservices
- Database read replicas
- CDN for static assets
- Message queues for background processing
- Auto-scaling based on metrics
This structure provides a solid foundation for building a scalable, maintainable enterprise platform while allowing for future growth and feature additions.



Rules:
- All new code must live inside this structure.
- Never create files at OS-level paths (e.g., `/Users/...`) or outside monorepo root.
- Packages = reusable logic, services = business logic, apps = user-facing.