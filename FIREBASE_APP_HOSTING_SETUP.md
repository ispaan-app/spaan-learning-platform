# Firebase App Hosting Setup for Next.js App

## Current Status
✅ **Firebase Hosting**: https://ispaan-app.web.app (Static landing page)  
🔄 **Firebase App Hosting**: Needs to be configured for your dynamic Next.js app

## Why You're Seeing "Page Not Found"

Your Next.js app is **dynamic** and requires **server-side rendering**, but Firebase Hosting only serves **static files**. That's why you saw the error.

## The Solution: Firebase App Hosting

Firebase App Hosting is specifically designed for dynamic applications like Next.js with:
- Server-side rendering
- API routes
- User authentication
- Database operations
- Real-time features

## Step-by-Step Setup

### 1. Access Firebase Console
1. Go to: https://console.firebase.google.com/project/ispaan-app/overview
2. Click **"App Hosting"** in the left sidebar

### 2. Create Web App
1. Click **"Add app"** → **"Web app"** (</> icon)
2. Enter app name: `spaan-learning-platform`
3. **✅ Check "Also set up Firebase Hosting for this app"** (you already have this!)
4. Click **"Create app"**

### 3. Connect GitHub Repository
1. Click **"Connect repository"**
2. Choose **"GitHub"** as Git provider
3. Authorize Firebase to access GitHub
4. Select repository: `BoloBitz/ispaan-learning-platform`
5. Choose branch: `main`
6. Click **"Connect"**

### 4. Configure Build Settings
Firebase will auto-detect your Next.js app. Verify:
```
Build Command: npm run build
Output Directory: .next
Root Directory: /
Node.js Version: 18
```

### 5. Environment Variables
In Firebase Console → App Hosting → Your App → Settings → Environment Variables, add:

#### Required Firebase Variables:
```
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDJLTb_gzIHEshVJ821Zdx_WewHhMAmpsI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ispaan-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ispaan-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ispaan-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1044946444806
NEXT_PUBLIC_FIREBASE_APP_ID=1:1044946444806:web:91bef1984e842d6b1a9987
```

#### Additional Required Variables:
```
FIREBASE_ADMIN_PROJECT_ID=ispaan-app
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@ispaan-app.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account-key.json
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-app-url.web.app
```

### 6. Deploy
1. Click **"Deploy"** in Firebase Console
2. Wait for build to complete (3-5 minutes)
3. Your dynamic app will be available at a Firebase-generated URL

## Architecture Overview

```
User Request
     │
     ▼
┌─────────────────────────────────────┐
│      Firebase App Hosting           │
│   (Dynamic Next.js App)             │
│   • Server-side rendering           │
│   • API routes                      │
│   • User authentication             │
│   • Database operations             │
│   • https://your-app-url.web.app    │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│        Firebase Hosting             │
│      (Static Assets CDN)            │
│   • Images, CSS, JS                 │
│   • Global distribution             │
│   • Optimized caching               │
│   • https://ispaan-app.web.app      │
└─────────────────────────────────────┘
```

## Expected Results

After setup, you'll have:
- **Dynamic App**: Full Next.js functionality at App Hosting URL
- **Static Assets**: Optimized delivery via Firebase Hosting CDN
- **Automatic Deployments**: Push to main branch triggers redeploy
- **Global Performance**: Fast loading worldwide
- **Integrated Services**: Auth, Firestore, Storage all connected

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify Node.js version (should be 18 or later)
- Check build logs in Firebase Console

### App Doesn't Load
- Verify NEXTAUTH_URL matches your actual app URL
- Check environment variables are properly set
- Ensure all Firebase services are enabled

### Authentication Issues
- Check Firebase Auth is enabled in Firebase Console
- Verify API keys are correct
- Ensure authorized domains include your app URL

## Next Steps

1. Set up Firebase App Hosting (follow steps above)
2. Add environment variables
3. Deploy your dynamic application
4. Test all functionality
5. Set up custom domain (optional)

Your Next.js app will then work perfectly with all dynamic features!
