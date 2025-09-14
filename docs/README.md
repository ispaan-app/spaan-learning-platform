# iSpaan Documentation

Welcome to the iSpaan AI-Powered Learning Platform documentation. This comprehensive guide will help you understand, deploy, and maintain the platform.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [User Guides](#user-guides)
- [Admin Documentation](#admin-documentation)
- [Developer Documentation](#developer-documentation)
- [API Documentation](#api-documentation)
- [Deployment Guide](#deployment-guide)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

iSpaan is a comprehensive AI-powered learning platform designed to facilitate work-integrated learning programs. The platform connects learners with industry placements, provides AI-powered career mentoring, and offers administrative tools for managing the entire learning ecosystem.

### Key Features

- **Multi-Role System**: Applicants, Learners, Admins, and Super Admins
- **AI Integration**: Career mentoring, content generation, and analytics
- **Work-Integrated Learning**: Placement management and hour tracking
- **Document Management**: Secure document upload and verification
- **Real-time Updates**: Live data synchronization and notifications
- **Performance Monitoring**: Comprehensive analytics and reporting
- **Security**: Enterprise-grade security and compliance

### Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Admin SDK
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth with custom tokens
- **AI**: Google Genkit with Gemini 1.5 Flash
- **Storage**: Firebase Storage
- **Deployment**: Vercel, Docker, Kubernetes

## Quick Start

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase project
- Google Cloud account (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ispaan.git
   cd ispaan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Configure Firebase**
   - Create a Firebase project
   - Enable Firestore, Authentication, and Storage
   - Add your web app to the project
   - Copy the configuration to your `.env.local`

2. **Set up Google Cloud AI**
   - Enable the Generative AI API
   - Create a service account
   - Download the service account key
   - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

3. **Initialize the database**
   ```bash
   npm run db:init
   ```

4. **Create your first admin user**
   ```bash
   npm run create-admin
   ```

## User Guides

### For Applicants

#### Getting Started
1. Visit the application page
2. Fill out the comprehensive application form
3. Upload required documents
4. Wait for admin review
5. Receive approval notification

#### Application Process
- **Step 1**: Complete personal information
- **Step 2**: Provide educational background
- **Step 3**: Upload required documents (CV, ID, certificates)
- **Step 4**: Submit for review

#### Required Documents
- Certified copy of ID document
- Curriculum Vitae (CV)
- Academic transcripts
- Relevant certificates
- Reference letters (optional)

### For Learners

#### Dashboard Overview
- **Work Progress**: Track monthly hours and stipend eligibility
- **Placement Details**: View assigned company and role
- **Upcoming Classes**: See scheduled learning sessions
- **AI Mentor**: Access personalized career guidance

#### Logging Work Hours
1. Navigate to the Check-In page
2. Select work date and hours
3. Provide work description
4. Submit for verification

#### Leave Requests
1. Go to the Leave section
2. Select leave type and dates
3. Provide reason for leave
4. Submit for admin approval

### For Admins

#### Managing Applications
1. Review new applications
2. Check document completeness
3. Approve or reject applications
4. Communicate with applicants

#### Learner Management
- View learner progress
- Manage placements
- Approve leave requests
- Monitor work hours

#### AI-Powered Tools
- **Dropout Risk Analysis**: Identify at-risk learners
- **Placement Matching**: AI-assisted learner-placement matching
- **Content Generation**: AI-powered announcements and reports

### For Super Admins

#### System Management
- User role management
- System configuration
- Security monitoring
- Performance analytics

#### AI Configuration
- Configure AI models
- Set up AI flows
- Monitor AI performance
- Manage AI costs

## Admin Documentation

### User Management

#### Creating Users
```bash
# Create a new admin user
npm run create-user -- --role=admin --email=admin@example.com

# Create a new learner
npm run create-user -- --role=learner --email=learner@example.com
```

#### Role Permissions
- **Applicant**: Can apply and upload documents
- **Learner**: Can log hours, request leave, access AI mentor
- **Admin**: Can manage applications and learners
- **Super Admin**: Full system access

### Database Management

#### Backup
```bash
# Create a backup
npm run db:backup

# Restore from backup
npm run db:restore -- --backup=backup-2024-01-15.json
```

#### Migration
```bash
# Run database migrations
npm run db:migrate

# Rollback migrations
npm run db:rollback
```

### Security

#### Security Headers
The platform includes comprehensive security headers:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options

#### Rate Limiting
- API endpoints: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- File uploads: 10 files per hour

#### Audit Logging
All actions are logged with:
- User identification
- Action performed
- Timestamp
- IP address
- User agent

## Developer Documentation

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── applicant/         # Applicant pages
│   ├── learner/           # Learner pages
│   ├── admin/             # Admin pages
│   └── super-admin/       # Super Admin pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── auth/             # Authentication components
│   ├── applicant/        # Applicant-specific components
│   ├── learner/          # Learner-specific components
│   ├── admin/            # Admin-specific components
│   └── shared/           # Shared components
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   ├── auth.ts           # Authentication utilities
│   ├── validation.ts     # Data validation
│   └── utils.ts          # General utilities
├── ai/                   # AI integration
│   └── flows/            # Genkit flows
└── hooks/                # Custom React hooks
```

### API Development

#### Creating New Endpoints
1. Create a new file in `src/app/api/`
2. Export named functions for HTTP methods
3. Add proper error handling
4. Include API documentation
5. Add tests

Example:
```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### Authentication Middleware
```typescript
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Protected route logic
}
```

### Component Development

#### Creating New Components
1. Create component file in appropriate directory
2. Use TypeScript interfaces for props
3. Include proper error handling
4. Add accessibility attributes
5. Write tests

Example:
```typescript
// src/components/ui/Button.tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className, variant = 'default', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
        },
        {
          'h-9 px-3 text-sm': size === 'sm',
          'h-10 px-4 py-2': size === 'md',
          'h-11 px-8 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
}
```

### Testing

#### Running Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

#### Writing Tests
```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## API Documentation

### Authentication

All API requests require authentication via JWT tokens.

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "role": "learner"
    },
    "token": "jwt-token-here"
  }
}
```

### Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {},
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **File Upload**: 10 files per hour

Rate limit headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Deployment Guide

### Environment Setup

#### Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

#### Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FIREBASE_PROJECT_ID=your-project-id
    depends_on:
      - redis
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Kubernetes Deployment

#### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ispaan-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ispaan-app
  template:
    metadata:
      labels:
        app: ispaan-app
    spec:
      containers:
      - name: app
        image: ispaan:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: FIREBASE_PROJECT_ID
          valueFrom:
            secretKeyRef:
              name: ispaan-secrets
              key: firebase-project-id
```

#### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: ispaan-service
spec:
  selector:
    app: ispaan-app
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Vercel Deployment

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Configure build settings

2. **Environment Variables**
   - Add all required environment variables
   - Set up secrets for sensitive data

3. **Deploy**
   - Automatic deployment on push to main branch
   - Preview deployments for pull requests

## Configuration

### Environment Variables

#### Required Variables
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key

# Google Cloud AI
GOOGLE_APPLICATION_CREDENTIALS=path-to-service-account-key

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Security
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

#### Optional Variables
```bash
# Performance
ENABLE_CACHING=true
CACHE_TTL=300

# Monitoring
ENABLE_MONITORING=true
SENTRY_DSN=your-sentry-dsn

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Firebase Configuration

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can read all users
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super-admin'];
    }
    
    // Public documents (announcements)
    match /announcements/{announcementId} {
      allow read: if resource.data.published == true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super-admin'];
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own documents
    match /documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public assets
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super-admin'];
    }
  }
}
```

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### Firebase Connection Issues
1. Verify Firebase configuration
2. Check service account permissions
3. Ensure Firestore is enabled
4. Verify security rules

#### AI Features Not Working
1. Check Google Cloud AI API is enabled
2. Verify service account has AI permissions
3. Check API quotas and limits
4. Review error logs

#### Performance Issues
1. Enable caching
2. Check database indexes
3. Monitor memory usage
4. Review query performance

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment variable
export DEBUG=ispaan:*

# Run with debug logging
npm run dev
```

### Logs

#### Application Logs
```bash
# View application logs
npm run logs

# View specific log types
npm run logs:error
npm run logs:auth
npm run logs:performance
```

#### Firebase Logs
```bash
# View Firebase logs
firebase functions:log

# View specific function logs
firebase functions:log --only functions:yourFunction
```

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write tests**
5. **Run the test suite**
   ```bash
   npm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m "Add your feature"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a pull request**

### Code Standards

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Use Prettier for code formatting
- **Testing**: Write tests for all new features
- **Documentation**: Update documentation for API changes

### Pull Request Guidelines

- **Clear description**: Explain what the PR does
- **Tests**: Include tests for new features
- **Documentation**: Update relevant documentation
- **Breaking changes**: Clearly mark breaking changes
- **Screenshots**: Include screenshots for UI changes

## Support

### Getting Help

- **Documentation**: Check this documentation first
- **Issues**: Create a GitHub issue for bugs
- **Discussions**: Use GitHub discussions for questions
- **Email**: Contact dev@ispaan.co.za for urgent issues

### Community

- **GitHub**: [github.com/your-org/ispaan](https://github.com/your-org/ispaan)
- **Discord**: Join our developer community
- **Twitter**: Follow [@ispaan_dev](https://twitter.com/ispaan_dev)

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**License**: MIT

