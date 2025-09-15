#!/usr/bin/env node

/**
 * Emergency Firestore Rules Fix
 * This script deploys emergency rules to fix database access restrictions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚨 Emergency Firestore Rules Fix');
console.log('================================');

try {
  // Check if Firebase CLI is available
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI found');
  } catch (error) {
    console.error('❌ Firebase CLI not found. Please install it first:');
    console.log('npm install -g firebase-tools');
    process.exit(1);
  }

  // Check if we're in a Firebase project
  if (!fs.existsSync('firebase.json')) {
    console.error('❌ Not in a Firebase project directory');
    process.exit(1);
  }

  console.log('📄 Backing up current rules...');
  
  // Backup current rules
  const currentRules = fs.readFileSync('firestore.rules', 'utf8');
  fs.writeFileSync('firestore.rules.backup', currentRules);
  console.log('✅ Current rules backed up to firestore.rules.backup');

  console.log('🔄 Deploying emergency rules...');
  
  // Deploy the emergency rules
  try {
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('✅ Emergency rules deployed successfully');
  } catch (error) {
    console.error('❌ Failed to deploy emergency rules:', error.message);
    
    // Restore backup
    fs.writeFileSync('firestore.rules', currentRules);
    console.log('🔄 Restored original rules');
    process.exit(1);
  }

  console.log('\n🎉 Emergency fix completed!');
  console.log('\nNext steps:');
  console.log('1. Test your application - database access should now work');
  console.log('2. Run: npm run validate:rules');
  console.log('3. Run: npm run fix:permissions');
  console.log('4. Once confirmed working, you can restore more restrictive rules');
  console.log('\nTo restore original rules:');
  console.log('cp firestore.rules.backup firestore.rules');
  console.log('firebase deploy --only firestore:rules');

} catch (error) {
  console.error('❌ Emergency fix failed:', error.message);
  process.exit(1);
}
