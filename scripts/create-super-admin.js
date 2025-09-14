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

async function createSuperAdmin() {
  try {
    console.log('🚀 Starting Super Admin creation process...\n');

    // Super Admin details
    const superAdminData = {
      email: 'developer@ispaan.com',
      displayName: 'iSpaan Developer',
      role: 'super-admin',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: null,
      permissions: [
        'users:read',
        'users:write',
        'users:delete',
        'applications:read',
        'applications:write',
        'applications:delete',
        'placements:read',
        'placements:write',
        'placements:delete',
        'attendance:read',
        'attendance:write',
        'reports:read',
        'reports:write',
        'settings:read',
        'settings:write',
        'notifications:read',
        'notifications:write',
        'stipend:read',
        'stipend:write',
        'issues:read',
        'issues:write',
        'leave:read',
        'leave:write'
      ],
      profile: {
        firstName: 'iSpaan',
        lastName: 'Developer',
        phone: '+27 82 000 0000',
        department: 'Development',
        position: 'Platform Developer',
        bio: 'Platform developer and system administrator for iSpaan WIL Management System'
      }
    };

    // Create user in Firebase Auth with password
    console.log('📧 Creating Firebase Auth user...');
    const defaultPassword = 'SuperAdmin123!';
    const userRecord = await admin.auth().createUser({
      email: superAdminData.email,
      password: defaultPassword,
      displayName: superAdminData.displayName,
      emailVerified: true,
      disabled: false
    });

    console.log(`✅ Firebase Auth user created: ${userRecord.uid}`);

    // Create user document in Firestore
    console.log('📄 Creating Firestore user document...');
    await db.collection('users').doc(userRecord.uid).set({
      ...superAdminData,
      uid: userRecord.uid,
      emailVerified: true,
      passwordSet: true,
      lastPasswordChange: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Firestore user document created');

    // Create super admin profile document
    console.log('👤 Creating super admin profile...');
    await db.collection('superAdminProfiles').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: superAdminData.email,
      displayName: superAdminData.displayName,
      role: 'super-admin',
      permissions: superAdminData.permissions,
      profile: superAdminData.profile,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: null,
      loginCount: 0,
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        dashboard: {
          defaultView: 'overview',
          showCharts: true,
          showRecentActivity: true
        },
        privacy: {
          showProfile: true,
          showContact: false
        }
      }
    });

    console.log('✅ Super admin profile created');

    // Create system settings if they don't exist
    console.log('⚙️ Creating system settings...');
    const settingsRef = db.collection('systemSettings').doc('main');
    const settingsDoc = await settingsRef.get();
    
    if (!settingsDoc.exists) {
      await settingsRef.set({
        appName: 'iSpaan',
        version: '1.0.0',
        maintenanceMode: false,
        registrationEnabled: true,
        maxLoginAttempts: 5,
        lockoutDuration: 30, // minutes
        sessionTimeout: 480, // minutes
        createdBy: userRecord.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ System settings created');
    } else {
      console.log('ℹ️ System settings already exist');
    }

    // Create initial notification for the super admin
    console.log('🔔 Creating welcome notification...');
    await db.collection('notifications').add({
      userId: userRecord.uid,
      type: 'welcome',
      title: 'Welcome to iSpaan!',
      message: 'Your super admin account has been successfully created. You can now access all administrative features.',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      data: {
        action: 'dashboard',
        priority: 'high'
      }
    });

    console.log('✅ Welcome notification created');

    // Summary
    console.log('\n🎉 Super Admin Account Created Successfully!');
    console.log('==========================================');
    console.log(`📧 Email: ${superAdminData.email}`);
    console.log(`👤 Display Name: ${superAdminData.displayName}`);
    console.log(`🆔 User ID: ${userRecord.uid}`);
    console.log(`🔐 Default Password: ${defaultPassword}`);
    console.log(`👑 Role: ${superAdminData.role}`);
    console.log('==========================================');
    console.log('\n📝 Next Steps:');
    console.log('1. Login using the email and password above');
    console.log('2. Change the default password immediately');
    console.log('3. Update your profile information');
    console.log('4. Review and configure system settings');
    console.log('5. Set up additional admin users as needed');
    console.log('\n⚠️  Security Note:');
    console.log('- Change the default password immediately after first login');
    console.log('- Enable two-factor authentication if available');
    console.log('- Regularly review user permissions and access logs');
    console.log('- Keep your Firebase service account credentials secure');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n💡 The email already exists. You may need to:');
      console.log('1. Delete the existing user from Firebase Console');
      console.log('2. Or use a different email address');
      console.log('3. Or update the existing user to super-admin role');
    }
    
    process.exit(1);
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
