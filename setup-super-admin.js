#!/usr/bin/env node

/**
 * Setup script for Super Admin access
 * This script helps configure Firebase for super admin access
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Super Admin access for sifiso@thegaselagroup.co.za...\n');

// Create .env.local file with Firebase configuration
const envContent = `# Firebase Configuration for Super Admin Access
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDJLTb_gzIHEshVJ821Zdx_WewHhMAmpsI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ispaan-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ispaan-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ispaan-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1044946444806
NEXT_PUBLIC_FIREBASE_APP_ID=1:1044946444806:web:91bef1984e842d6b1a9987

# Firebase Admin SDK (Optional - for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=ispaan-app
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email@ispaan-app.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"

# Super Admin Configuration
SUPER_ADMIN_EMAIL=sifiso@thegaselagroup.co.za
SUPER_ADMIN_ROLE=super-admin

# Development Configuration
NODE_ENV=development
SKIP_AUTH_CHECKS=false
`;

try {
  // Write .env.local file
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Created .env.local file with Firebase configuration');
  
  // Create firestore.rules file
  const rulesContent = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow super admin full access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        (request.auth.token.email == 'sifiso@thegaselagroup.co.za' ||
         request.auth.token.role == 'super-admin' ||
         request.auth.token.admin == true);
    }
    
    // Allow authenticated users to read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow admins to read user data
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.token.role in ['admin', 'super-admin'] ||
         request.auth.token.email == 'sifiso@thegaselagroup.co.za');
    }
    
    // Allow super admin to read all collections
    match /{collection}/{document} {
      allow read, write: if request.auth != null && 
        (request.auth.token.email == 'sifiso@thegaselagroup.co.za' ||
         request.auth.token.role == 'super-admin');
    }
  }
}`;

  fs.writeFileSync('firestore.rules', rulesContent);
  console.log('✅ Created firestore.rules file for super admin access');
  
  console.log('\n🎉 Setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project: ispaan-app');
  console.log('3. Go to Firestore Database > Rules');
  console.log('4. Copy the contents of firestore.rules and paste them in the rules editor');
  console.log('5. Click "Publish" to apply the rules');
  console.log('6. Go to Authentication > Users');
  console.log('7. Find sifiso@thegaselagroup.co.za and verify the account exists');
  console.log('8. If needed, create the user account with the email and a password');
  console.log('\n🔐 Super Admin Login:');
  console.log('Email: sifiso@thegaselagroup.co.za');
  console.log('Password: [Use the password set in Firebase Authentication]');
  console.log('Role: Super Admin');
  console.log('\n🌐 Access URLs:');
  console.log('- Login: http://localhost:3000/login/admin');
  console.log('- Super Admin Dashboard: http://localhost:3000/super-admin/dashboard');
  console.log('- Test Login: http://localhost:3000/test-login');
  
} catch (error) {
  console.error('❌ Error setting up super admin access:', error.message);
  process.exit(1);
}






