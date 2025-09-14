# iSpaan - AI-Powered Learning Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.0-orange)](https://firebase.google.com/)
[![AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-purple)](https://ai.google.dev/)

A comprehensive AI-powered learning platform designed to facilitate work-integrated learning programs. iSpaan connects learners with industry placements, provides AI-powered career mentoring, and offers administrative tools for managing the entire learning ecosystem.

## 🚀 Features

### Core Features
- **Multi-Role System**: Applicants, Learners, Admins, and Super Admins
- **Work-Integrated Learning**: Placement management and hour tracking
- **Document Management**: Secure document upload and verification
- **Real-time Updates**: Live data synchronization and notifications
- **Performance Monitoring**: Comprehensive analytics and reporting
- **Enterprise Security**: Role-based access control and audit logging

### AI-Powered Features
- **Career Mentoring**: Personalized AI career guidance
- **Content Generation**: AI-assisted announcements and reports
- **Dropout Risk Analysis**: Proactive learner support
- **Placement Matching**: AI-powered learner-placement matching
- **Performance Analytics**: AI-driven insights and recommendations

### Technical Features
- **Modern Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Real-time Database**: Firebase Firestore with live updates
- **AI Integration**: Google Genkit with Gemini 1.5 Flash
- **Performance Optimized**: Caching, code splitting, and lazy loading
- **Comprehensive Testing**: Unit, integration, and E2E tests
- **Production Ready**: Docker, Kubernetes, and monitoring

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Quick Start

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
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Environment Variables

Copy `env.example` to `.env.local` and configure the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Google Cloud AI
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account-key.json

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Redis Configuration
REDIS_URL=redis://localhost:6379
```

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore, Authentication, and Storage
3. Add your web app to the project
4. Download the service account key
5. Configure the environment variables

### Google Cloud AI Setup

1. Enable the Generative AI API
2. Create a service account with AI permissions
3. Download the service account key
4. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

## 📖 Usage

### For Applicants

1. **Apply**: Visit the application page and fill out the form
2. **Upload Documents**: Submit required documents (CV, ID, certificates)
3. **Wait for Review**: Admin will review your application
4. **Get Approved**: Receive notification when approved

### For Learners

1. **Dashboard**: View your progress and upcoming classes
2. **Log Hours**: Track your work hours daily
3. **AI Mentor**: Get personalized career guidance
4. **Request Leave**: Apply for leave when needed

### For Admins

1. **Review Applications**: Process new applications
2. **Manage Learners**: Monitor learner progress
3. **AI Tools**: Use AI-powered analytics and tools
4. **Create Placements**: Set up new work placements

### For Super Admins

1. **System Management**: Manage users and system settings
2. **AI Configuration**: Configure AI models and flows
3. **Security Monitoring**: Monitor security and performance
4. **Global Analytics**: View platform-wide insights

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: [http://localhost:3000/api-docs/swagger](http://localhost:3000/api-docs/swagger)
- **API Reference**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Authentication

All API requests require authentication via JWT tokens:

```bash
curl -H "Authorization: Bearer your-jwt-token" \
     http://localhost:3000/api/users
```

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **File Upload**: 10 files per hour

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build the image manually
docker build -t ispaan .
docker run -p 3000:3000 ispaan
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get pods -n ispaan
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Production Deployment

```bash
# Run deployment script
./scripts/deploy.sh production v1.0.0

# Or use Docker Compose for production
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

### Run Tests

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

### Test Coverage

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability scanning

## 📊 Monitoring

### Health Checks

- **Health Endpoint**: `/api/health`
- **Metrics Endpoint**: `/api/metrics`
- **Performance Dashboard**: `/super-admin/performance`

### Monitoring Stack

- **Prometheus**: Metrics collection
- **Grafana**: Visualization and dashboards
- **Fluentd**: Log aggregation
- **AlertManager**: Alerting and notifications

## 🔧 Development

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
├── lib/                  # Utility libraries
├── ai/                   # AI integration
└── hooks/                # Custom React hooks
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Code Standards

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Use Prettier for code formatting
- **Testing**: Write tests for all new features
- **Documentation**: Update documentation for API changes

## 🤝 Contributing

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

### Pull Request Guidelines

- **Clear description**: Explain what the PR does
- **Tests**: Include tests for new features
- **Documentation**: Update relevant documentation
- **Breaking changes**: Clearly mark breaking changes
- **Screenshots**: Include screenshots for UI changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the [docs](docs/) directory
- **Issues**: Create a [GitHub issue](https://github.com/your-org/ispaan/issues)
- **Discussions**: Use [GitHub discussions](https://github.com/your-org/ispaan/discussions)
- **Email**: Contact dev@ispaan.co.za for urgent issues

### Community

- **GitHub**: [github.com/your-org/ispaan](https://github.com/your-org/ispaan)
- **Discord**: Join our developer community
- **Twitter**: Follow [@ispaan_dev](https://twitter.com/ispaan_dev)

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing framework
- **Firebase Team**: For the backend services
- **Google AI Team**: For the AI capabilities
- **Open Source Community**: For the amazing tools and libraries

---

**Made with ❤️ by the iSpaan Team**

*Last Updated: January 2024*