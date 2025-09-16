const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'ispaan-app',
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

if (!serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.log('Firebase Admin SDK credentials not found. Using default credentials...');
  admin.initializeApp({
    projectId: 'ispaan-app'
  });
} else {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'ispaan-app'
  });
}

const auth = admin.auth();

async function setUserClaims() {
  try {
    // Get the user by email
    const userEmail = 'developer@ispaan.com';
    const user = await auth.getUserByEmail(userEmail);
    
    console.log(`Found user: ${user.uid} (${user.email})`);
    
    // Set custom claims
    const customClaims = {
      role: 'super-admin',
      admin: true,
      email_verified: true
    };
    
    await auth.setCustomUserClaims(user.uid, customClaims);
    
    console.log(`✅ Successfully set custom claims for ${userEmail}:`, customClaims);
    
    // Verify the claims were set
    const updatedUser = await auth.getUser(user.uid);
    console.log('Updated user custom claims:', updatedUser.customClaims);
    
  } catch (error) {
    console.error('Error setting user claims:', error);
  }
}

setUserClaims().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});











