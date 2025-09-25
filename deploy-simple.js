#!/usr/bin/env node

/**
 * Simple Firebase Deployment Script
 * Copies built files to public directory and deploys
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying iSpaan to Firebase (Simple Method)...\n');

try {
  // Build the application
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed!\n');

  // Copy built files to public directory
  console.log('📁 Copying built files to public directory...');
  
  // Copy static files
  if (fs.existsSync('.next/static')) {
    execSync('xcopy .next\\static public\\_next\\static /E /I /Y', { stdio: 'inherit' });
  }
  
  // Copy server files
  if (fs.existsSync('.next/server')) {
    execSync('xcopy .next\\server public\\_next\\server /E /I /Y', { stdio: 'inherit' });
  }
  
  // Copy other necessary files
  if (fs.existsSync('.next/BUILD_ID')) {
    execSync('copy .next\\BUILD_ID public\\BUILD_ID', { stdio: 'inherit' });
  }
  
  if (fs.existsSync('.next/package.json')) {
    execSync('copy .next\\package.json public\\package.json', { stdio: 'inherit' });
  }

  console.log('✅ Files copied to public directory!\n');

  // Deploy to Firebase
  console.log('🔥 Deploying to Firebase...');
  console.log('   Site: ispaan-app.web.app');
  console.log('   Project: ispaan-app\n');

  execSync('firebase deploy --only hosting:ispaan-app --project ispaan-app', { 
    stdio: 'inherit'
  });

  console.log('\n🎉 Deployment successful!');
  console.log('🌐 Your app is live at: https://ispaan-app.web.app');
  console.log('📊 Firebase Console: https://console.firebase.google.com/project/ispaan-app/hosting');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check Firebase login: firebase login');
  console.log('2. Verify project: firebase use ispaan-app');
  console.log('3. Check build errors above');
  process.exit(1);
}