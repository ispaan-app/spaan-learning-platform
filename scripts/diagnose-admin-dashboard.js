#!/usr/bin/env node

/**
 * Admin Dashboard Diagnostic Script
 * Comprehensive diagnosis of admin dashboard data access issues
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

console.log('🔍 Admin Dashboard Diagnostic Tool\n');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function diagnoseAdminDashboard() {
  try {
    console.log('📋 Environment Check:');
    console.log('• NODE_ENV:', process.env.NODE_ENV || 'undefined');
    console.log('• FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'undefined');
    console.log('• NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'undefined');
    
    // Check service account key
    const serviceAccountPath = path.join(process.cwd(), 'credentials', 'service-account-key.json');
    if (fs.existsSync(serviceAccountPath)) {
      console.log('• Service Account Key: ✅ Found');
    } else {
      console.log('• Service Account Key: ❌ Not found');
      return false;
    }

    console.log('\n🔧 Firebase Connection Test:');
    
    // Initialize Firebase Admin SDK
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    const db = getFirestore(app);
    console.log('• Firebase Admin SDK: ✅ Initialized');

    // Test basic Firestore access
    console.log('\n📊 Firestore Access Test:');
    
    const collections = [
      'users',
      'applications', 
      'placements',
      'programs',
      'settings'
    ];

    for (const collection of collections) {
      try {
        const snapshot = await db.collection(collection).limit(1).get();
        console.log(`• ${collection}: ✅ Accessible (${snapshot.size} documents)`);
      } catch (error) {
        console.log(`• ${collection}: ❌ Error - ${error.message}`);
      }
    }

    // Test specific admin dashboard queries
    console.log('\n🎯 Admin Dashboard Query Test:');
    
    try {
      // Test users query (role-based)
      const usersSnapshot = await db.collection('users')
        .where('role', '==', 'learner')
        .limit(5)
        .get();
      console.log(`• Users (role=learner): ✅ ${usersSnapshot.size} documents`);
    } catch (error) {
      console.log(`• Users (role=learner): ❌ ${error.message}`);
    }

    try {
      // Test applications query
      const appsSnapshot = await db.collection('applications')
        .where('status', '==', 'pending-review')
        .limit(5)
        .get();
      console.log(`• Applications (pending-review): ✅ ${appsSnapshot.size} documents`);
    } catch (error) {
      console.log(`• Applications (pending-review): ❌ ${error.message}`);
    }

    try {
      // Test placements query
      const placementsSnapshot = await db.collection('placements')
        .where('status', '==', 'active')
        .limit(5)
        .get();
      console.log(`• Placements (active): ✅ ${placementsSnapshot.size} documents`);
    } catch (error) {
      console.log(`• Placements (active): ❌ ${error.message}`);
    }

    // Test settings collection
    try {
      const settingsSnapshot = await db.collection('settings').doc('appearance').get();
      if (settingsSnapshot.exists) {
        console.log(`• Settings (appearance): ✅ Document exists`);
      } else {
        console.log(`• Settings (appearance): ⚠️  Document does not exist`);
      }
    } catch (error) {
      console.log(`• Settings (appearance): ❌ ${error.message}`);
    }

    console.log('\n🎉 Diagnostic Complete!');
    console.log('\n📋 Recommendations:');
    console.log('1. If all tests pass, the admin dashboard should work');
    console.log('2. If any tests fail, check Firestore security rules');
    console.log('3. Ensure you are logged in with an admin account');
    console.log('4. Clear browser cache and try again');

    return true;

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
    return false;
  }
}

// Run the diagnostic
diagnoseAdminDashboard()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });








