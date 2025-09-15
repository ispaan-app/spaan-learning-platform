#!/usr/bin/env node

/**
 * Firestore Rules Validation Script
 * This script validates Firestore security rules for common permission issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Firestore security rules...');

const rulesPath = path.join(process.cwd(), 'firestore.rules');
const rulesContent = fs.readFileSync(rulesPath, 'utf8');

console.log('📄 Firestore rules loaded');

// Check for common permission issues
const issues = [];
const warnings = [];

// Check if all major collections have proper read permissions
const collections = [
  'users', 'applications', 'programs', 'placements', 'attendance',
  'leaveRequests', 'stipendReports', 'issueReports', 'learnerProfiles',
  'notifications', 'activities', 'documents'
];

collections.forEach(collection => {
  const collectionPattern = new RegExp(`match /${collection}/\\{[^}]+\\}`, 'g');
  const matches = rulesContent.match(collectionPattern);
  
  if (!matches || matches.length === 0) {
    warnings.push(`⚠️  Collection '${collection}' not found in rules`);
  } else {
    // Check if the collection allows authenticated users to read
    const collectionBlock = rulesContent.split(`match /${collection}/`)[1]?.split('}')[0];
    if (collectionBlock && !collectionBlock.includes('allow read: if isAuthenticated()')) {
      if (!collectionBlock.includes('allow read: if isAdmin()') && !collectionBlock.includes('allow read: if isSuperAdmin()')) {
        issues.push(`❌ Collection '${collection}' may not allow authenticated users to read`);
      }
    }
  }
});

// Check for catch-all rule
if (!rulesContent.includes('match /{collection}/{document}')) {
  issues.push('❌ No catch-all rule found for dynamic collections');
}

// Check for proper admin functions
if (!rulesContent.includes('function isAdmin()')) {
  issues.push('❌ isAdmin() function not found');
}

if (!rulesContent.includes('function isSuperAdmin()')) {
  issues.push('❌ isSuperAdmin() function not found');
}

if (!rulesContent.includes('function isAuthenticated()')) {
  issues.push('❌ isAuthenticated() function not found');
}

// Check for specific permission patterns that might cause issues
const problematicPatterns = [
  {
    pattern: /allow read: if isOwner\(resource\.data\.userId\);/g,
    issue: 'Some collections only allow owners to read - this may cause dashboard issues'
  },
  {
    pattern: /allow read: if isAdmin\(\);/g,
    issue: 'Some collections only allow admins to read - this may cause user dashboard issues'
  }
];

problematicPatterns.forEach(({ pattern, issue }) => {
  const matches = rulesContent.match(pattern);
  if (matches && matches.length > 3) {
    warnings.push(`⚠️  ${issue}`);
  }
});

// Check for missing collections that are commonly accessed
const commonlyAccessedCollections = [
  'stipendReports', 'issueReports', 'activities', 'documents'
];

commonlyAccessedCollections.forEach(collection => {
  if (!rulesContent.includes(`match /${collection}/`)) {
    issues.push(`❌ Collection '${collection}' is missing from rules`);
  }
});

// Display results
console.log('\n📊 Validation Results:');

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed! Firestore rules look good.');
} else {
  if (issues.length > 0) {
    console.log('\n🚨 Critical Issues:');
    issues.forEach(issue => console.log(issue));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(warning));
  }
}

// Provide recommendations
console.log('\n💡 Recommendations:');
console.log('1. Ensure all collections allow authenticated users to read for dashboard functionality');
console.log('2. Add specific rules for collections that are accessed frequently');
console.log('3. Test rules in Firebase Console > Firestore > Rules');
console.log('4. Use the Firebase Emulator to test rules locally');
console.log('5. Consider adding more permissive rules for development');

// Check for specific permission patterns that are good
const goodPatterns = [
  'allow read: if isAuthenticated(); // Allow reading for dashboard stats',
  'allow create: if isAuthenticated();',
  'allow read: if isOwner(resource.data.userId);'
];

console.log('\n✅ Good patterns found:');
goodPatterns.forEach(pattern => {
  if (rulesContent.includes(pattern)) {
    console.log(`✅ ${pattern}`);
  }
});

console.log('\n🎯 Next steps:');
console.log('1. Deploy updated rules: firebase deploy --only firestore:rules');
console.log('2. Test permissions with: node scripts/fix-firebase-permissions.js');
console.log('3. Monitor Firebase Console for any permission errors');

if (issues.length > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 Firestore rules validation completed successfully!');
}
