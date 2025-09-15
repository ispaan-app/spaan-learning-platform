#!/usr/bin/env node

/**
 * Firebase Permissions Fix Script
 * This script helps fix common Firebase permission issues
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase Admin SDK environment variables');
  console.log('Required variables:');
  console.log('- FIREBASE_ADMIN_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  console.log('- FIREBASE_ADMIN_CLIENT_EMAIL');
  console.log('- FIREBASE_ADMIN_PRIVATE_KEY');
  process.exit(1);
}

async function fixFirebasePermissions() {
  try {
    console.log('🔧 Initializing Firebase Admin SDK...');
    
    const serviceAccount = {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };

    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });

    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('✅ Firebase Admin SDK initialized successfully');

    // Test basic permissions
    console.log('🧪 Testing Firestore permissions...');
    
    try {
      // Test reading users collection
      const usersSnapshot = await db.collection('users').limit(1).get();
      console.log('✅ Users collection read permission: OK');
    } catch (error) {
      console.error('❌ Users collection read permission failed:', error.message);
    }

    try {
      // Test reading applications collection
      const appsSnapshot = await db.collection('applications').limit(1).get();
      console.log('✅ Applications collection read permission: OK');
    } catch (error) {
      console.error('❌ Applications collection read permission failed:', error.message);
    }

    try {
      // Test reading programs collection
      const programsSnapshot = await db.collection('programs').limit(1).get();
      console.log('✅ Programs collection read permission: OK');
    } catch (error) {
      console.error('❌ Programs collection read permission failed:', error.message);
    }

    try {
      // Test reading stipend reports collection
      const stipendSnapshot = await db.collection('stipendReports').limit(1).get();
      console.log('✅ Stipend reports collection read permission: OK');
    } catch (error) {
      console.error('❌ Stipend reports collection read permission failed:', error.message);
    }

    // Create a test document to verify write permissions
    console.log('🧪 Testing write permissions...');
    
    try {
      const testDoc = await db.collection('test').doc('permission-test').set({
        test: true,
        timestamp: new Date(),
        message: 'Permission test successful'
      });
      console.log('✅ Write permission: OK');
      
      // Clean up test document
      await db.collection('test').doc('permission-test').delete();
      console.log('✅ Test document cleaned up');
    } catch (error) {
      console.error('❌ Write permission failed:', error.message);
    }

    console.log('\n🎉 Firebase permissions check completed!');
    console.log('\nIf you see any ❌ errors above, check:');
    console.log('1. Firestore security rules are properly configured');
    console.log('2. Service account has proper IAM roles');
    console.log('3. Environment variables are correctly set');
    console.log('4. Firebase project is active and accessible');

  } catch (error) {
    console.error('❌ Firebase permissions fix failed:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your service account key is valid');
    console.log('2. Check that the service account has these IAM roles:');
    console.log('   - Firebase Admin SDK Administrator Service Agent');
    console.log('   - Cloud Datastore User');
    console.log('   - Storage Object Admin');
    console.log('3. Ensure your Firebase project is active');
    console.log('4. Check your .env.local file has correct values');
    process.exit(1);
  }
}

// Run the script
fixFirebasePermissions();
