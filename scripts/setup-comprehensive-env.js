#!/usr/bin/env node

/**
 * Comprehensive Environment Setup Script
 * This script helps set up all necessary environment variables for Firebase
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up comprehensive Firebase environment...');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

let envContent = '';

if (fs.existsSync(envLocalPath)) {
  console.log('📄 Found existing .env.local file');
  envContent = fs.readFileSync(envLocalPath, 'utf8');
} else if (fs.existsSync(envExamplePath)) {
  console.log('📄 Using env.example as template');
  envContent = fs.readFileSync(envExamplePath, 'utf8');
} else {
  console.log('📄 Creating new .env.local file');
  envContent = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ispaan-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ispaan-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ispaan-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=ispaan-app
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@ispaan-app.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"

# Google Cloud AI
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account-key.json

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@ispaan.co.za

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_REAL_TIME_UPDATES=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=true

# Development Configuration
DEBUG=ispaan:*
HOT_RELOAD=true
MOCK_AI_RESPONSES=false
SKIP_AUTH_CHECKS=false
`;
}

// Update the content with correct Firebase project settings
envContent = envContent.replace(/your-project-id/g, 'ispaan-app');
envContent = envContent.replace(/your-project\.firebaseapp\.com/g, 'ispaan-app.firebaseapp.com');
envContent = envContent.replace(/your-project\.appspot\.com/g, 'ispaan-app.firebasestorage.app');
envContent = envContent.replace(/your-project-id\.appspot\.com/g, 'ispaan-app.firebasestorage.app');

// Ensure the storage bucket is correct
if (!envContent.includes('ispaan-app.firebasestorage.app')) {
  envContent = envContent.replace(
    /NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=.*/,
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ispaan-app.firebasestorage.app'
  );
}

// Write the updated content
fs.writeFileSync(envLocalPath, envContent);
console.log('✅ .env.local file updated with correct Firebase project settings');

// Create a service account key template if it doesn't exist
const serviceAccountPath = path.join(process.cwd(), 'credentials', 'service-account-key.json');
const serviceAccountDir = path.dirname(serviceAccountPath);

if (!fs.existsSync(serviceAccountDir)) {
  fs.mkdirSync(serviceAccountDir, { recursive: true });
}

if (!fs.existsSync(serviceAccountPath)) {
  const serviceAccountTemplate = {
    "type": "service_account",
    "project_id": "ispaan-app",
    "private_key_id": "your-private-key-id",
    "private_key": "-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n",
    "client_email": "your-service-account@ispaan-app.iam.gserviceaccount.com",
    "client_id": "your-client-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40ispaan-app.iam.gserviceaccount.com"
  };
  
  fs.writeFileSync(serviceAccountPath, JSON.stringify(serviceAccountTemplate, null, 2));
  console.log('✅ Service account key template created');
}

console.log('\n🎉 Environment setup completed!');
console.log('\nNext steps:');
console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
console.log('2. Generate a new private key and download the JSON file');
console.log('3. Replace the placeholder values in .env.local with real values');
console.log('4. Replace the placeholder values in credentials/service-account-key.json');
console.log('5. Run: npm run dev');
console.log('\nFor detailed instructions, see: docs/FIREBASE_SETUP_GUIDE.md');
