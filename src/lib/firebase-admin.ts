import { initializeApp, getApps, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

let app: App | undefined;
let adminAuth: Auth;
let adminDb: Firestore;
let adminStorage: Storage;
let messaging: Messaging;

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
// The raw private key, which may have literal '\n' characters.
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.warn(
    'Firebase Admin SDK environment variables are not set. Using mock Admin SDK services. ' +
    'Server-side Firebase features will not work.'
  );
  console.warn('To fix this, run: node scripts/setup-comprehensive-env.js');
  // Provide mock objects for each service to prevent crashes during build/dev
  app = undefined;
  adminAuth = {} as Auth;
  adminDb = {} as Firestore;
  adminStorage = {} as Storage;
  messaging = {} as Messaging;
} else {
  try {
    const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail,
      // Important: Replace the literal `\n` sequence with actual newline characters.
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };

    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0];
    } else {
      app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: 'ispaan-app.firebasestorage.app',
      });
    }

    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
    adminStorage = getStorage(app);
    messaging = getMessaging(app);

    console.log('✅ Firebase Admin SDK initialized successfully');

  } catch (e: any) {
    console.error("Failed to initialize Firebase Admin SDK:", e.message);
    console.warn("⚠️ Firebase Admin SDK initialization failed. Server will continue with mock services.");
    // Provide mock objects for each service to prevent crashes
    app = undefined;
    adminAuth = {} as Auth;
    adminDb = {} as Firestore;
    adminStorage = {} as Storage;
    messaging = {} as Messaging;
  }
}

export { adminAuth, adminDb, adminStorage, messaging };
export default app;