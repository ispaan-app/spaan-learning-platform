#!/usr/bin/env node

/**
 * Firebase Deployment Script with Fixed Environment Variables
 * Handles reserved prefix conflicts and Node.js compatibility
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying iSpaan to Firebase with fixes...\n');

// Create a temporary .env file for Firebase deployment
const firebaseEnvContent = `
# Firebase-compatible environment variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ispaan-app.web.app

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ispaan-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ispaan-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ispaan-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Admin Configuration (renamed to avoid conflicts)
ADMIN_PROJECT_ID=ispaan-app
ADMIN_CLIENT_EMAIL=your-service-account@ispaan-app.iam.gserviceaccount.com
ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"

# Other Configuration
GOOGLE_AI_API_KEY=your-google-ai-api-key
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@ispaan.co.za

# CORS Configuration
CORS_ORIGIN=https://ispaan-app.web.app
CORS_CREDENTIALS=true
`;

try {
  // Backup existing .env files
  if (fs.existsSync('.env.local')) {
    fs.copyFileSync('.env.local', '.env.local.backup');
    console.log('📁 Backed up .env.local');
  }
  
  if (fs.existsSync('.env')) {
    fs.copyFileSync('.env', '.env.backup');
    console.log('📁 Backed up .env');
  }

  // Create Firebase-compatible .env file
  fs.writeFileSync('.env', firebaseEnvContent);
  console.log('✅ Created Firebase-compatible .env file\n');

  // Build the application
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed!\n');

  // Deploy to Firebase
  console.log('🔥 Deploying to Firebase...');
  console.log('   Site: ispaan-app.web.app');
  console.log('   Project: ispaan-app\n');

  // Set environment variables for deployment
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    // Remove problematic environment variables
    FIREBASE_ADMIN_PROJECT_ID: undefined,
    FIREBASE_ADMIN_CLIENT_EMAIL: undefined,
    FIREBASE_ADMIN_PRIVATE_KEY: undefined,
  };

  // Deploy with environment variables
  execSync('firebase deploy --only hosting --project ispaan-app', { 
    stdio: 'inherit',
    env: env
  });

  console.log('\n🎉 Deployment successful!');
  console.log('🌐 Your app is live at: https://ispaan-app.web.app');
  console.log('📊 Firebase Console: https://console.firebase.google.com/project/ispaan-app/hosting');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  
  // Restore backup files
  if (fs.existsSync('.env.local.backup')) {
    fs.copyFileSync('.env.local.backup', '.env.local');
    fs.unlinkSync('.env.local.backup');
    console.log('🔄 Restored .env.local');
  }
  
  if (fs.existsSync('.env.backup')) {
    fs.copyFileSync('.env.backup', '.env');
    fs.unlinkSync('.env.backup');
    console.log('🔄 Restored .env');
  }
  
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check Firebase login: firebase login');
  console.log('2. Verify project: firebase use ispaan-app');
  console.log('3. Check build errors above');
  process.exit(1);
}
