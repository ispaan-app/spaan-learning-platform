#!/usr/bin/env node

/**
 * Firebase Deployment Script for iSpaan
 * Handles environment variables and deployment to ispaan.web.app
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Firebase deployment for iSpaan...\n');

// Check if we're in the right directory
if (!fs.existsSync('firebase.json')) {
  console.error('❌ Error: firebase.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.warn('⚠️  Warning: .env.local not found. Using default values.');
  console.log('   Please ensure your Firebase project is properly configured.');
}

try {
  console.log('📦 Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!\n');

  console.log('🔥 Deploying to Firebase...');
  console.log('   Target: ispaan.web.app');
  console.log('   Project: ispaan-app\n');

  // Deploy to Firebase
  execSync('firebase deploy --only hosting', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_PUBLIC_APP_URL: 'https://ispaan.web.app'
    }
  });

  console.log('\n🎉 Deployment completed successfully!');
  console.log('🌐 Your app is now live at: https://ispaan.web.app');
  console.log('📊 Firebase Console: https://console.firebase.google.com/project/ispaan-app');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure you\'re logged in: firebase login');
  console.log('2. Check your Firebase project: firebase use ispaan-app');
  console.log('3. Verify environment variables in .env.local');
  console.log('4. Ensure Node.js version is compatible (16, 18, or 20)');
  process.exit(1);
}
