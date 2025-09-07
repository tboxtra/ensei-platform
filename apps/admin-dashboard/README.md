# Ensei Admin Dashboard

A comprehensive admin dashboard for the Ensei Platform, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Protected routes with permission-based access
- Session management and auto-logout

### 📊 Mission Management
- View all missions with filtering and search
- Mission statistics and analytics
- Platform-specific mission tracking
- Mission status management

### 👥 User Management
- User listing with role-based filtering
- User profile management
- Role assignment and permissions
- User activity tracking

### 📈 Analytics Dashboard
- Platform performance metrics
- Revenue and user growth charts
- Mission completion rates
- Real-time statistics

### 🔍 Enhanced Review System
- Decentralized peer review system
- 5 reviewers per submission
- 1-5 star rating system
- Reviewer management and performance tracking
- Review queue with priority handling

### ⚙️ System Configuration
- Platform settings management
- Feature flags and toggles
- Security configuration
- Pricing and limits management

### 🔔 Real-time Updates
- WebSocket-based notifications
- Live mission and submission updates
- System alerts and warnings
- Real-time statistics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Authentication**: JWT with refresh tokens
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Heroicons
- **Real-time**: WebSocket (simulated)

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── analytics/         # Analytics dashboard
│   ├── missions/          # Mission management
│   ├── review/            # Review queue
│   ├── settings/          # System configuration
│   ├── users/             # User management
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   ├── analytics/         # Analytics components
│   ├── missions/          # Mission components
│   ├── review/            # Review components
│   ├── settings/          # Settings components
│   ├── users/             # User components
│   ├── layout/            # Layout components
│   └── realtime/          # Real-time components
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
└── lib/                   # Utility functions
    ├── auth.ts            # Authentication utilities
    └── api.ts             # API client
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- Access to Ensei API Gateway

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Set environment variables:
```bash
cp .env.example .env.local
```

3. Configure API endpoint:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/v1
```

4. Start development server:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login

For development, use these credentials:
- **Username**: admin
- **Password**: password

## API Integration

The admin dashboard integrates with the Ensei API Gateway through the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - User logout

### Missions
- `GET /admin/missions` - List missions
- `GET /admin/missions/:id` - Get mission details
- `PUT /admin/missions/:id` - Update mission
- `DELETE /admin/missions/:id` - Delete mission

### Users
- `GET /admin/users` - List users
- `GET /admin/users/:id` - Get user details
- `PUT /admin/users/:id` - Update user
- `PUT /admin/users/:id/role` - Update user role

### Submissions
- `GET /admin/submissions` - List submissions
- `GET /admin/submissions/:id` - Get submission details
- `POST /admin/submissions/:id/review` - Review submission

### Analytics
- `GET /admin/analytics/overview` - Platform overview
- `GET /admin/analytics/revenue` - Revenue data
- `GET /admin/analytics/user-growth` - User growth data
- `GET /admin/analytics/platform-performance` - Platform metrics

## Components

### Authentication Components

- **LoginForm**: User login form with validation
- **ProtectedRoute**: Route protection with RBAC
- **AuthContext**: Authentication state management

### Mission Components

- **MissionCard**: Mission display card
- **MissionFilters**: Mission filtering interface
- **MissionStats**: Mission statistics display

### Review Components

- **ReviewQueue**: Decentralized review interface
- **ReviewStats**: Review statistics and metrics
- **ReviewerManagement**: Reviewer management interface

### Analytics Components

- **AnalyticsOverview**: Key metrics overview
- **RevenueChart**: Revenue trends chart
- **UserGrowthChart**: User growth visualization
- **PlatformAnalytics**: Platform performance metrics

### Settings Components

- **SystemConfig**: Platform configuration
- **SecuritySettings**: Security configuration
- **FeatureFlags**: Feature toggle management

## Permissions

The admin dashboard uses a permission-based access control system:

- `missions:read` - View missions
- `missions:write` - Create/edit missions
- `missions:delete` - Delete missions
- `users:read` - View users
- `users:write` - Edit users
- `users:delete` - Delete users
- `submissions:read` - View submissions
- `submissions:review` - Review submissions
- `analytics:read` - View analytics
- `settings:read` - View settings
- `settings:write` - Edit settings

## Development

### Code Style

- Use TypeScript for all components
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for async operations

### Testing

```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

### Building

```bash
# Build for production
yarn build

# Start production server
yarn start
```

## Deployment

The admin dashboard can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Docker** container

### Environment Variables

Required environment variables for production:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.ensei.com/v1
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://admin.ensei.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Ensei Platform and is proprietary software.
