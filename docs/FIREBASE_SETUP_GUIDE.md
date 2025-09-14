# Firebase Setup Guide - Step by Step

## Current Status
✅ **firebase.ts** - Correctly configured  
✅ **firebase-admin.ts** - Correctly configured  
❌ **.env.local** - Missing (needs to be created)  
❌ **Environment variables** - Using placeholder values  

## Step 1: Get Your Firebase Credentials

### 1.1 Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project (or create one if you don't have one)

### 1.2 Get Web App Configuration
1. Click the gear icon (⚙️) next to "Project Overview"
2. Scroll down to "Your apps" section
3. If you don't have a web app, click the web icon (</>) to add one
4. If you have a web app, click on it
5. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 1.3 Get Service Account Key
1. In the same Project Settings page, click on "Service accounts" tab
2. Click "Generate new private key"
3. Download the JSON file (keep it secure!)
4. Open the JSON file and copy these values:
   - `project_id`
   - `client_email`
   - `private_key`

## Step 2: Create .env.local File

### 2.1 Create the file
1. In your project root directory, create a new file called `.env.local`
2. Copy the following template:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-from-step-1.2
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-make-it-long-and-random
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here-make-it-long-and-random
NEXTAUTH_URL=http://localhost:3000

# Other Configuration
NODE_ENV=development
PORT=3000
```

### 2.2 Replace the placeholder values
Replace all the placeholder values with your actual Firebase credentials from Step 1.

**Important Notes:**
- Keep the `NEXT_PUBLIC_` prefix for client-side variables
- The private key should include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Make sure to escape newlines in the private key with `\n`
- Generate strong, random secrets for JWT_SECRET and NEXTAUTH_SECRET

## Step 3: Verify Your Configuration

### 3.1 Run the verification script
```bash
node scripts/verify-firebase-config.js
```

This will check:
- ✅ .env.local file exists
- ✅ All required environment variables are set
- ✅ Configuration files are properly set up

### 3.2 Test your connection
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit the test page:
   ```
   http://localhost:3000/test-firebase
   ```

3. Click "Run All Tests" to verify your Firebase connection

## Step 4: Common Issues and Solutions

### Issue 1: "Firebase: Error (auth/invalid-api-key)"
**Solution:** Check your API key in .env.local matches the one from Firebase Console

### Issue 2: "Firebase: Error (auth/project-not-found)"
**Solution:** Verify your project ID is correct in both client and admin configurations

### Issue 3: "Firebase: Error (permission-denied)"
**Solution:** Check your Firestore security rules and service account permissions

### Issue 4: "User data not found"
**Solution:** Ensure your users have corresponding documents in Firestore

## Step 5: Test with Your Existing Users

### 5.1 Check your users
1. Visit `http://localhost:3000/admin/users`
2. This will show all your existing Firebase users
3. You can see which users need Firestore documents

### 5.2 Migrate users if needed
1. Click "Create Missing Documents" if users don't have Firestore data
2. Click "Migrate to New Structure" to update user data format
3. Update user roles and statuses as needed

## Step 6: Security Checklist

- ✅ .env.local is in .gitignore (never commit to version control)
- ✅ Service account key is secure and not shared
- ✅ JWT secrets are strong and random
- ✅ Firestore security rules are properly configured
- ✅ Only necessary permissions are granted to service account

## Quick Reference

### Environment Variables Needed:
```env
# Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Admin (Private)
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

### Test URLs:
- Connection Test: `http://localhost:3000/test-firebase`
- User Management: `http://localhost:3000/admin/users`
- Login: `http://localhost:3000/login`

### Files to Check:
- ✅ `src/lib/firebase.ts` - Client configuration
- ✅ `src/lib/firebase-admin.ts` - Admin configuration
- ❌ `.env.local` - Environment variables (create this)

## Need Help?

1. Check the verification script output
2. Look at the test page results
3. Check browser console for errors
4. Verify Firebase Console settings
5. Review the integration guide: `docs/FIREBASE_INTEGRATION.md`







