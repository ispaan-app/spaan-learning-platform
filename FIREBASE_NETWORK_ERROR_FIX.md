# 🔧 Firebase Network Error Fix Guide

## The Problem
You're getting `Firebase: Error (auth/network-request-failed)` which typically occurs due to:

1. **Missing authorized domains** in Firebase Console
2. **Network connectivity issues**
3. **Incorrect Firebase configuration**
4. **Development environment setup problems**

## 🚀 Quick Fix (Most Common Solution)

### Step 1: Add Authorized Domains
1. Go to [Firebase Console](https://console.firebase.google.com/project/ispaan-app)
2. Navigate to **Authentication** → **Settings** → **Authorized domains**
3. Add these domains:
   - `localhost`
   - `127.0.0.1`
   - `localhost:3000`
   - `localhost:3001`
   - `localhost:3002`
   - `127.0.0.1:3000`
4. Click **Save**
5. Refresh your application

### Step 2: Create Environment File
Create a `.env.local` file in your project root with:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDJLTb_gzIHEshVJ821Zdx_WewHhMAmpsI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ispaan-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ispaan-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ispaan-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1044946444806
NEXT_PUBLIC_FIREBASE_APP_ID=1:1044946444806:web:87ec5547139f34511a9987
```

## 🔍 Detailed Troubleshooting

### 1. Network Issues
- ✅ Check your internet connection
- ✅ Try disabling VPN/proxy if active
- ✅ Clear browser cache and cookies
- ✅ Try incognito/private browsing mode
- ✅ Check if firewall is blocking Firebase requests

### 2. Firebase Project Issues
- ✅ Verify project is active: [Firebase Console](https://console.firebase.google.com/project/ispaan-app)
- ✅ Check if billing is enabled (required for some features)
- ✅ Ensure Authentication is enabled
- ✅ Verify API keys are correct

### 3. Development Environment
- ✅ Restart your development server: `npm run dev`
- ✅ Check if `.env.local` file exists and has correct values
- ✅ Verify Node.js and npm versions are compatible
- ✅ Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

### 4. Code Issues
- ✅ Check browser console for detailed error messages
- ✅ Verify Firebase imports are correct
- ✅ Ensure you're not using Firebase emulator in production
- ✅ Check if CORS is properly configured

## 🛠️ Automated Fixes

### Option 1: Use Setup Scripts
```bash
# Run comprehensive Firebase setup
npm run setup:firebase

# Or run complete setup with all features
npm run setup:complete

# Or run optimized setup
npm run setup:optimized
```

### Option 2: Manual Environment Setup
```bash
# Create environment file
cp env.template .env.local

# Edit .env.local with your actual Firebase values
# Then restart the development server
npm run dev
```

## 🔧 Advanced Solutions

### 1. Firebase Emulator (Development)
If you want to use Firebase emulator for development:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulator
firebase emulators:start
```

### 2. Network Configuration
If you're behind a corporate firewall:

```javascript
// Add to your Firebase config
const firebaseConfig = {
  // ... your config
  // Add these for network issues
  experimentalForceLongPolling: true,
  useFetchStreams: false
}
```

### 3. CORS Configuration
If you're getting CORS errors, add to your `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
}
```

## 🚨 Emergency Fixes

### If Nothing Works:
1. **Reset Firebase Project:**
   - Go to Firebase Console → Project Settings
   - Regenerate API keys
   - Update your `.env.local` file

2. **Clean Development Environment:**
   ```bash
   rm -rf node_modules
   rm -rf .next
   npm install
   npm run dev
   ```

3. **Use Firebase Emulator:**
   ```bash
   firebase emulators:start --only auth,firestore
   ```

## 📞 Getting Help

If the issue persists:
1. Check the browser console for detailed error messages
2. Check the Network tab in browser dev tools
3. Verify your Firebase project status
4. Contact Firebase support if needed

## ✅ Verification

After applying fixes, verify by:
1. Opening browser console
2. Looking for "✅ Firebase app initialized successfully"
3. Testing authentication functionality
4. Checking for any remaining error messages

---

**Note:** This guide is specifically for the `ispaan-app` Firebase project. Adjust domain names and project IDs if using a different project.
