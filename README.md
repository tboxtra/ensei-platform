# 🚀 Ensei Platform

A comprehensive social media mission platform built with modern web technologies.

## ✨ Features

- **Multi-Platform Support**: Twitter, Instagram, TikTok, Facebook, WhatsApp, Snapchat, Telegram
- **Mission Types**: Engage, Content, Ambassador
- **Pricing Models**: Fixed (per-user) and Degen (time-based)
- **Modern UI/UX**: Built with Next.js 14, Tailwind CSS, and custom components
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Monorepo Architecture**: Organized with Turborepo for scalability

## 🏗️ Architecture

```
apps/
├── web/                 # Next.js 14 web application
├── admin-dashboard/     # Admin interface
└── telegram-bot/        # Telegram bot integration

services/
├── api-gateway/         # Fastify API server
├── mission-engine/      # Business logic & pricing
├── payment-service/     # Payment processing
└── verification-service/ # Proof validation

packages/
├── shared-types/        # TypeScript type definitions
├── validation-schemas/  # Zod validation schemas
├── api-client/          # Type-safe API client
└── ui-components/       # Reusable UI components
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn 3+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ensei-platform

# Install dependencies
yarn install

# Build all packages
yarn build

# Start development servers
yarn dev
```

### Development

```bash
# Start web app
cd apps/web && yarn dev

# Start API gateway
cd services/api-gateway && yarn dev

# Start payment service
cd services/payment-service && yarn dev
```

## 📱 Web Application

The main web application is built with Next.js 14 and includes:

- **Dashboard**: User overview and statistics
- **Mission Creation**: Create Fixed and Degen missions
- **Mission Management**: View and manage your missions
- **Review System**: Review and approve submissions
- **Wallet**: Manage Honors and USD balances

## 🔌 API

The API is built with Fastify and provides:

- **Mission Management**: CRUD operations for missions
- **Submission Handling**: Process user submissions
- **Pricing Calculations**: Dynamic pricing for different mission types
- **User Management**: Authentication and user profiles

## 💰 Pricing

### Fixed Missions
- Per-user pricing model
- Minimum 60 participants
- Platform fee: 10%

### Degen Missions
- Time-based pricing with preset durations
- User pool: 50% of creator cost
- Premium multiplier: 5x

### Exchange Rate
- 1 USD = 450 Honors

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run specific package tests
cd packages/shared-types && yarn test
cd services/mission-engine && yarn test
```

## 📦 Deployment

### Vercel (Web App)

```bash
# Deploy to Vercel
vercel --prod
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.
