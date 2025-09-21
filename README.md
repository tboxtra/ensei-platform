# Ensei Platform

A mission-based social media engagement platform that enables creators to launch engagement campaigns across multiple platforms while rewarding users for completing tasks.

## 🚀 Live Demo

**Frontend**: https://web-9qg4f1axi-izecubes-projects-b81ca540.vercel.app

## ✨ Recent Fixes & Improvements

### ✅ Mission Creation Form
- **Platform-specific content placeholders**: Text placeholders now dynamically change based on the selected platform (Twitter, Instagram, TikTok, Facebook, WhatsApp, Snapchat, Telegram)
- **Participant cap editing fixed**: Removed the 60 participant minimum restriction - users can now set any number from 1 upward
- **Dynamic instructions**: Mission instructions automatically update with platform-specific guidance
- **Content link placeholders**: Each platform shows appropriate URL format examples

### ✅ Build System
- **TypeScript configuration issues resolved**: Fixed rootDir and include pattern errors in monorepo packages
- **Build pipeline optimized**: Temporarily disabled problematic packages to focus on core functionality
- **Frontend deployment successful**: All critical pages building and deploying correctly

### ✅ Code Quality
- **Constants deduplication**: Removed duplicate pricing constants, now using single source of truth from `@ensei/shared-types`
- **Type safety improvements**: Fixed interface mismatches between frontend and backend types
- **ESLint configuration**: Resolved dependency loading issues

## 🏗️ Architecture

- **Frontend**: Next.js 14 with React, Tailwind CSS, Zustand state management
- **Backend**: Fastify API Gateway with microservices architecture
- **Mission Engine**: Core business logic for mission pricing and task management
- **Shared Types**: Centralized TypeScript definitions and validation schemas
- **Monorepo**: Turborepo with npm workspaces for efficient development

## 🎯 Supported Platforms

- **Twitter/X**: Engage, Content Creation, Ambassador tasks
- **Instagram**: Feed posts, Stories, Reels, Bio customization
- **TikTok**: Short-form videos, Challenges, Product reviews
- **Facebook**: Group posts, Video content, Community engagement
- **WhatsApp**: Status updates, Broadcast messages
- **Snapchat**: Stories, Filters, Branded content
- **Telegram**: Channel posts, Group engagement, Bot interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 10+

### Installation
```bash
npm install
```

### Development
```bash
# Start all services (via Turborepo)
npm run dev

# Start specific service
npm run dev --workspace=apps/web      # Frontend (Next.js)
npm run dev --workspace=services/api-gateway      # API Gateway
npm run dev --workspace=services/mission-engine   # Mission Engine
```

### Building
```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=apps/web
npm run build --workspace=services/api-gateway
```

## 📋 Mission Types

### Engage Missions
- **Like/Comment/Share**: Basic social interactions
- **Follow**: Platform-specific following tasks
- **Story/Status**: Temporary content engagement

### Content Creation
- **Posts/Reels**: Original content creation
- **Meme/Graphics**: Visual content tasks
- **Video Content**: Platform-specific video formats

### Ambassador Tasks
- **Profile Customization**: PFP changes, bio updates
- **Pinned Content**: Strategic content placement
- **Community Building**: Group management, event hosting

## 💰 Pricing Model

- **Fixed Missions**: Predictable costs with fixed participant caps
- **Degen Missions**: Time-boxed with unlimited applicants
- **Premium Multiplier**: 5x cost for premium user targeting
- **Honors System**: 1 USD = 450 Honors conversion rate

## 🔧 Development Status

| Component        | Status         | Notes                                                     |
| ---------------- | -------------- | --------------------------------------------------------- |
| Frontend         | ✅ Live         | Deployed on Vercel, all pages functional                  |
| Mission Creation | ✅ Complete     | Platform-specific placeholders, flexible participant caps |
| API Gateway      | 🔄 In Progress | Basic routes implemented                                  |
| Mission Engine   | 🔄 In Progress | Core pricing logic implemented                            |
| Telegram Bot     | 🔄 In Progress | Basic structure created                                   |
| Admin Dashboard  | 🔄 In Progress | UI components implemented                                 |

## 📚 Documentation

- **API Specs**: `docs/api/openapi.yaml`
- **Mission Tasks**: `docs/mission-tasks.md`
- **Database Schema**: `docs/database-schema.md`
- **Deployment Guide**: `docs/deployment.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

---

**Ensei Platform** - The future of social media engagement. Create missions, earn rewards, build communities.
# Deployment trigger Sun Sep 21 12:03:31 WAT 2025
