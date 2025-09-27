import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Enhanced Firebase configuration with better error handling
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDJLTb_gzIHEshVJ821Zdx_WewHhMAmpsI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ispaan-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ispaan-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ispaan-app.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1044946444806",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1044946444806:web:91bef1984e842d6b1a9987"
}

// Validate Firebase configuration
const validateFirebaseConfig = (config: any) => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
  const missing = required.filter(key => !config[key] || config[key].includes('your-'))
  
  if (missing.length > 0) {
    console.error('❌ Firebase Configuration Error: Missing or invalid values for:', missing)
    return false
  }
  return true
}

// Validate configuration before initializing
if (!validateFirebaseConfig(firebaseConfig)) {
  console.error('❌ Firebase configuration validation failed. Please check your environment variables.')
}

console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
})

// Initialize Firebase app with error handling
let app
try {
  app = initializeApp(firebaseConfig)
  console.log('✅ Firebase app initialized successfully')
} catch (error) {
  console.error('❌ Firebase initialization failed:', error)
  throw new Error('Firebase initialization failed. Please check your configuration.')
}

// Initialize Firebase services with comprehensive error handling
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Configure auth settings for better network handling
auth.settings.appVerificationDisabledForTesting = process.env.NODE_ENV === 'development'

// Enhanced error handling and debugging (client-side only)
if (typeof window !== 'undefined') {
  auth.onAuthStateChanged(
    (user) => {
      if (user) {
        console.log('✅ User authenticated:', user.email)
      } else {
        console.log('ℹ️ No user authenticated')
      }
    },
    (error: any) => {
      console.error('❌ Firebase Auth Error:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      
      if (error.code === 'auth/network-request-failed') {
        console.error('🔧 FIREBASE NETWORK ERROR - SOLUTIONS:')
        console.error('')
        console.error('1. 🔗 Firebase Console Setup:')
        console.error('   → Go to: https://console.firebase.google.com/project/ispaan-app')
        console.error('   → Navigate to: Authentication > Settings > Authorized domains')
        console.error('   → Add these domains:')
        console.error('     • localhost')
        console.error('     • 127.0.0.1')
        console.error('     • localhost:3000')
        console.error('     • localhost:3001')
        console.error('     • localhost:3002')
        console.error('     • 127.0.0.1:3000')
        console.error('   → Save changes and refresh the page')
        console.error('')
        console.error('2. 🌐 Network Issues:')
        console.error('   → Check your internet connection')
        console.error('   → Try disabling VPN/proxy if active')
        console.error('   → Clear browser cache and cookies')
        console.error('   → Try incognito/private browsing mode')
        console.error('')
        console.error('3. 🔧 Development Setup:')
        console.error('   → Restart your development server')
        console.error('   → Check if .env.local file exists with correct values')
        console.error('   → Verify Firebase project is active and billing is enabled')
        console.error('')
        console.error('4. 🚨 Emergency Fix:')
        console.error('   → Run: npm run setup:firebase')
        console.error('   → Or: npm run setup:complete')
        
        // Show comprehensive user-friendly error message
        if (typeof window !== 'undefined') {
          const errorDiv = document.createElement('div')
          errorDiv.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #fee, #fdd); border: 2px solid #fcc; padding: 15px; z-index: 9999; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <div style="max-width: 800px; margin: 0 auto;">
                <h3 style="color: #d32f2f; margin: 0 0 10px 0;">🔧 Firebase Network Error</h3>
                <p style="margin: 0 0 10px 0; color: #333;">
                  <strong>Quick Fix:</strong> Go to <a href="https://console.firebase.google.com/project/ispaan-app/authentication/settings" target="_blank" style="color: #1976d2;">Firebase Console</a> → Authentication → Settings → Authorized domains → Add "localhost"
                </p>
                <p style="margin: 0; font-size: 14px; color: #666;">
                  Or run: <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">npm run setup:firebase</code>
                </p>
                <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: #fcc; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">×</button>
              </div>
            </div>
          `
          document.body.appendChild(errorDiv)
        }
      }
    }
  )
}

// Initialize client-side error handling only when needed
let clientSideInitialized = false

export const initializeClientSideErrorHandling = () => {
  if (typeof window !== 'undefined' && !clientSideInitialized) {
    clientSideInitialized = true
    
    // Add global error handler for Firebase
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.code === 'auth/network-request-failed') {
        console.error('🔧 Firebase Network Error Detected!')
        console.error('Please add authorized domains in Firebase Console')
        event.preventDefault()
      }
    })
  }
}

export default app
