#!/usr/bin/env node

/**
 * Firebase Configuration Verification Script
 * This script helps you verify your Firebase configuration is correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Configuration Verification');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log('📁 Environment File Check:');
console.log(`   .env.local exists: ${envExists ? '✅ YES' : '❌ NO'}`);

if (!envExists) {
  console.log('\n❌ ISSUE: .env.local file is missing!');
  console.log('\n📋 To fix this:');
  console.log('1. Create a .env.local file in your project root');
  console.log('2. Copy the contents from env.example');
  console.log('3. Replace the placeholder values with your actual Firebase credentials');
  console.log('\nOr run: node scripts/setup-firebase.js');
  process.exit(1);
}

// Read and check .env.local
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
  process.exit(1);
}

console.log('\n🔍 Environment Variables Check:');

// Required environment variables
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY'
];

let allPresent = true;
const missingVars = [];

requiredVars.forEach(varName => {
  const regex = new RegExp(`^${varName}=(.+)$`, 'm');
  const match = envContent.match(regex);
  
  if (match && match[1] && !match[1].includes('your-') && !match[1].includes('YOUR_')) {
    console.log(`   ${varName}: ✅ Set`);
  } else {
    console.log(`   ${varName}: ❌ Missing or placeholder`);
    missingVars.push(varName);
    allPresent = false;
  }
});

console.log('\n🔧 Configuration Files Check:');

// Check firebase.ts
const firebaseTsPath = path.join(process.cwd(), 'src/lib/firebase.ts');
const firebaseTsExists = fs.existsSync(firebaseTsPath);
console.log(`   src/lib/firebase.ts: ${firebaseTsExists ? '✅ Exists' : '❌ Missing'}`);

if (firebaseTsExists) {
  const firebaseTsContent = fs.readFileSync(firebaseTsPath, 'utf8');
  const hasEnvVars = firebaseTsContent.includes('process.env.NEXT_PUBLIC_FIREBASE_');
  console.log(`   Uses environment variables: ${hasEnvVars ? '✅ Yes' : '❌ No'}`);
}

// Check firebase-admin.ts
const firebaseAdminTsPath = path.join(process.cwd(), 'src/lib/firebase-admin.ts');
const firebaseAdminTsExists = fs.existsSync(firebaseAdminTsPath);
console.log(`   src/lib/firebase-admin.ts: ${firebaseAdminTsExists ? '✅ Exists' : '❌ Missing'}`);

if (firebaseAdminTsExists) {
  const firebaseAdminTsContent = fs.readFileSync(firebaseAdminTsPath, 'utf8');
  const hasEnvVars = firebaseAdminTsContent.includes('process.env.FIREBASE_ADMIN_');
  console.log(`   Uses environment variables: ${hasEnvVars ? '✅ Yes' : '❌ No'}`);
}

// Summary
console.log('\n📊 Summary:');
if (allPresent && firebaseTsExists && firebaseAdminTsExists) {
  console.log('✅ All Firebase configuration files are properly set up!');
  console.log('\n🚀 Next steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Visit http://localhost:3000/test-firebase to test your connection');
  console.log('3. Check the test results to ensure everything is working');
} else {
  console.log('❌ Some issues found that need to be fixed:');
  
  if (missingVars.length > 0) {
    console.log('\n🔧 Missing or placeholder environment variables:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
  }
  
  if (!firebaseTsExists) {
    console.log('\n🔧 Missing file: src/lib/firebase.ts');
  }
  
  if (!firebaseAdminTsExists) {
    console.log('\n🔧 Missing file: src/lib/firebase-admin.ts');
  }
  
  console.log('\n📚 For help, see docs/FIREBASE_INTEGRATION.md');
}

console.log('\n🔗 Quick Links:');
console.log('   - Firebase Console: https://console.firebase.google.com/');
console.log('   - Test Page: http://localhost:3000/test-firebase');
console.log('   - User Management: http://localhost:3000/admin/users');


















