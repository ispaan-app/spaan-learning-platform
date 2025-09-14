#!/usr/bin/env node

/**
 * Firebase Setup Script
 * This script helps you set up your Firebase configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('🔥 Firebase Setup Script');
  console.log('========================\n');
  
  console.log('This script will help you configure Firebase for your existing backend.\n');
  
  // Check if .env.local already exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env.local already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  console.log('\n📋 Please provide your Firebase configuration:\n');
  
  // Get Firebase configuration
  const apiKey = await question('API Key: ');
  const authDomain = await question('Auth Domain (e.g., your-project.firebaseapp.com): ');
  const projectId = await question('Project ID: ');
  const storageBucket = await question('Storage Bucket (e.g., your-project.appspot.com): ');
  const messagingSenderId = await question('Messaging Sender ID: ');
  const appId = await question('App ID: ');
  
  console.log('\n🔐 Now provide your Firebase Admin SDK credentials:\n');
  
  const adminProjectId = await question('Admin Project ID (usually same as above): ') || projectId;
  const clientEmail = await question('Service Account Email: ');
  
  console.log('\n🔑 Private Key (paste the entire key including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----):');
  console.log('(Press Enter when done, then Ctrl+D on a new line)');
  
  let privateKey = '';
  rl.on('line', (line) => {
    privateKey += line + '\n';
  });
  
  // Wait for user to finish entering private key
  await new Promise((resolve) => {
    rl.on('close', resolve);
  });
  
  // Clean up private key
  privateKey = privateKey.trim();
  if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
    console.log('❌ Invalid private key format. Please try again.');
    rl.close();
    return;
  }
  
  // Create .env.local content
  const envContent = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${appId}

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=${adminProjectId}
FIREBASE_ADMIN_CLIENT_EMAIL=${clientEmail}
FIREBASE_ADMIN_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Other configuration
NODE_ENV=development
PORT=3000
`;

  // Write .env.local file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env.local file created successfully!');
  } catch (error) {
    console.log('❌ Error creating .env.local file:', error.message);
    rl.close();
    return;
  }
  
  console.log('\n🎉 Firebase configuration complete!');
  console.log('\nNext steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Visit http://localhost:3000/test-firebase to test your connection');
  console.log('3. Check the test results to ensure everything is working');
  console.log('\n📚 For more information, see docs/FIREBASE_INTEGRATION.md');
  
  rl.close();
}

main().catch(console.error);






