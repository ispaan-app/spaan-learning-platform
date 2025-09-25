#!/usr/bin/env node

/**
 * Deploy Emergency Admin Rules Script
 * Deploys highly permissive Firestore rules for development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚨 Deploying Emergency Admin Rules...\n');

try {
  // Check if firestore-emergency-admin.rules exists
  const rulesPath = path.join(process.cwd(), 'firestore-emergency-admin.rules');
  if (!fs.existsSync(rulesPath)) {
    console.error('❌ Emergency rules file not found:', rulesPath);
    process.exit(1);
  }

  // Backup current rules
  const currentRulesPath = path.join(process.cwd(), 'firestore.rules');
  const backupPath = path.join(process.cwd(), 'firestore.rules.backup');
  
  if (fs.existsSync(currentRulesPath)) {
    fs.copyFileSync(currentRulesPath, backupPath);
    console.log('✅ Backed up current rules to firestore.rules.backup');
  }

  // Copy emergency rules to main rules file
  fs.copyFileSync(rulesPath, currentRulesPath);
  console.log('✅ Copied emergency rules to firestore.rules');

  // Deploy the rules
  console.log('🚀 Deploying emergency rules to Firebase...');
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n🎉 Emergency admin rules deployed successfully!');
  console.log('\n📋 What this fixes:');
  console.log('• All authenticated users can now read/write all documents');
  console.log('• Admin dashboard should work without "Database Access Restricted" errors');
  console.log('• Highly permissive rules for development environment');
  console.log('\n⚠️  WARNING: These rules are highly permissive and should only be used in development!');
  console.log('\n📋 Next Steps:');
  console.log('1. Test the admin dashboard at http://localhost:3002/admin/dashboard');
  console.log('2. If working, you can restore original rules with: cp firestore.rules.backup firestore.rules');
  console.log('3. Then deploy: firebase deploy --only firestore:rules');

} catch (error) {
  console.error('❌ Error deploying emergency rules:', error.message);
  process.exit(1);
}






















