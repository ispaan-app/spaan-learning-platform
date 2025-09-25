const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function updateSuperAdminAuth() {
  try {
    console.log('🔧 Updating Super Admin Authentication...\n');

    const superAdminEmail = 'developer@ispaan.com';
    const newPassword = 'SuperAdmin123!';

    // Find the user by email
    console.log('🔍 Finding super admin user...');
    const userRecord = await admin.auth().getUserByEmail(superAdminEmail);
    console.log(`✅ Found user: ${userRecord.uid}`);

    // Update the user's password
    console.log('🔐 Setting password for super admin...');
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword
    });
    console.log('✅ Password set successfully');

    // Update the user document in Firestore
    console.log('📄 Updating Firestore user document...');
    await db.collection('users').doc(userRecord.uid).update({
      passwordSet: true,
      lastPasswordChange: admin.firestore.FieldValue.serverTimestamp(),
      authMethod: 'email-password'
    });
    console.log('✅ Firestore user document updated');

    // Remove PIN authentication if it exists
    console.log('🗑️ Removing PIN authentication...');
    try {
      await db.collection('userAuth').doc(userRecord.uid).delete();
      console.log('✅ PIN authentication removed');
    } catch (error) {
      console.log('ℹ️ No PIN authentication found to remove');
    }

    // Create a notification about the password change
    console.log('🔔 Creating password notification...');
    await db.collection('notifications').add({
      userId: userRecord.uid,
      type: 'password_set',
      title: 'Password Authentication Enabled',
      message: 'Your super admin account now uses email and password authentication. Please change your password after first login.',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      data: {
        action: 'profile',
        priority: 'high'
      }
    });
    console.log('✅ Password notification created');

    // Summary
    console.log('\n🎉 Super Admin Authentication Updated Successfully!');
    console.log('==========================================');
    console.log(`📧 Email: ${superAdminEmail}`);
    console.log(`🆔 User ID: ${userRecord.uid}`);
    console.log(`🔐 Password: ${newPassword}`);
    console.log(`👑 Role: super-admin`);
    console.log('==========================================');
    console.log('\n📝 Next Steps:');
    console.log('1. Login using the email and password above');
    console.log('2. Change the password immediately after first login');
    console.log('3. Your account now uses email/password authentication');
    console.log('4. PIN authentication has been removed');
    console.log('\n⚠️  Security Note:');
    console.log('- Change the password immediately after first login');
    console.log('- Use a strong, unique password');
    console.log('- Enable two-factor authentication if available');

  } catch (error) {
    console.error('❌ Error updating super admin authentication:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 The super admin user was not found. Please run the create-super-admin script first.');
    }
    
    process.exit(1);
  }
}

// Run the script
updateSuperAdminAuth()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });































