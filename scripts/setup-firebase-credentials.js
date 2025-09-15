#!/usr/bin/env node

/**
 * Firebase Credentials Setup Script
 * This script helps you set up the proper Firebase credentials for user creation
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Firebase Credentials Setup');
console.log('============================\n');

// Check if service account key exists
const serviceAccountPath = path.join(__dirname, '..', 'credentials', 'service-account-key.json');
const envLocalPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(serviceAccountPath)) {
  console.log('❌ Service account key file not found at:', serviceAccountPath);
  console.log('\n📋 To fix this:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project: ispaan-app');
  console.log('3. Go to Project Settings > Service Accounts');
  console.log('4. Click "Generate new private key"');
  console.log('5. Download the JSON file');
  console.log('6. Save it as: credentials/service-account-key.json');
  process.exit(1);
}

try {
  // Read the service account key
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  // Check if it's properly configured
  if (serviceAccount.private_key === '-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n') {
    console.log('❌ Service account key contains placeholder values');
    console.log('\n📋 Please download a real service account key from Firebase Console');
    process.exit(1);
  }

  // Create .env.local with proper values
  const envContent = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDJLTb_gzIHEshVJ821Zdx_WewHhMAmpsI'}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'ispaan-app.firebaseapp.com'}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || serviceAccount.project_id}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ispaan-app.firebasestorage.app'}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1044946444806'}
NEXT_PUBLIC_FIREBASE_APP_ID=${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1044946444806:web:91bef1984e842d6b1a9987'}

# Firebase Admin SDK Configuration
FIREBASE_ADMIN_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_ADMIN_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_ADMIN_PRIVATE_KEY="${serviceAccount.private_key}"

# JWT Configuration
JWT_SECRET=${process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production'}
JWT_REFRESH_SECRET=${process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here-change-this-in-production'}

# Other Configuration
NODE_ENV=${process.env.NODE_ENV || 'development'}
`;

  fs.writeFileSync(envLocalPath, envContent);
  
  console.log('✅ Firebase credentials configured successfully!');
  console.log('📁 Created/updated .env.local file');
  console.log('\n🔍 Configuration details:');
  console.log(`   Project ID: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}`);
  console.log(`   Private Key: ${serviceAccount.private_key.substring(0, 50)}...`);
  
  console.log('\n🚀 Next steps:');
  console.log('1. Restart your development server');
  console.log('2. Try creating a user account again');
  console.log('3. Check the console for any remaining errors');
  
} catch (error) {
  console.error('❌ Error setting up Firebase credentials:', error.message);
  process.exit(1);
}
