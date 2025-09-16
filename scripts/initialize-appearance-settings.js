#!/usr/bin/env node

/**
 * Initialize Appearance Settings Script
 * Creates default appearance settings in Firestore if they don't exist
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

console.log('🎨 Initializing Appearance Settings...\n');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function initializeAppearanceSettings() {
  try {
    // Initialize Firebase Admin SDK
    const serviceAccountPath = path.join(process.cwd(), 'credentials', 'service-account-key.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ Service account key not found at:', serviceAccountPath);
      console.log('Please ensure your Firebase credentials are properly configured.');
      return false;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    const db = getFirestore(app);

    // Default appearance settings
    const defaultSettings = {
      heroImageUrl: '/images/default-hero.jpg',
      platformName: 'iSpaan App',
      primaryColor: '#4F46E5',
      secondaryColor: '#7C3AED',
      lastUpdated: new Date(),
      updatedBy: 'system'
    };

    // Check if appearance settings already exist
    const appearanceRef = db.collection('settings').doc('appearance');
    const existingDoc = await appearanceRef.get();

    if (existingDoc.exists) {
      console.log('✅ Appearance settings already exist');
      const existingData = existingDoc.data();
      console.log('Current settings:', {
        platformName: existingData.platformName,
        heroImageUrl: existingData.heroImageUrl,
        lastUpdated: existingData.lastUpdated?.toDate?.() || existingData.lastUpdated
      });
    } else {
      // Create default appearance settings
      await appearanceRef.set(defaultSettings);
      console.log('✅ Created default appearance settings');
      console.log('Settings:', defaultSettings);
    }

    // Test read access
    console.log('\n🔍 Testing read access...');
    const testDoc = await appearanceRef.get();
    if (testDoc.exists) {
      console.log('✅ Read access working - appearance settings can be accessed');
    } else {
      console.log('❌ Read access failed');
    }

    console.log('\n🎉 Appearance settings initialization complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Visit http://localhost:3002/super-admin/appearance to manage settings');
    console.log('2. Visit http://localhost:3002/ to see the landing page');
    console.log('3. Test uploading a new hero image and verify it updates the landing page');

    return true;

  } catch (error) {
    console.error('❌ Error initializing appearance settings:', error);
    return false;
  }
}

// Run the initialization
initializeAppearanceSettings()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });



