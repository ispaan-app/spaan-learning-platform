# Deploy Your Real Next.js Landing Page

## What You Want
Your actual Next.js landing page (the beautiful one you see in development) deployed to production, not the static HTML page.

## The Solution: Firebase App Hosting

Your Next.js app needs **Firebase App Hosting** because it has:
- ✅ Server-side rendering (fetching hero image from Firestore)
- ✅ Dynamic routing
- ✅ API routes
- ✅ User authentication
- ✅ Database operations

## Step-by-Step Deployment

### 1. Access Firebase Console
1. Go to: https://console.firebase.google.com/project/ispaan-app/overview
2. Click **"App Hosting"** in the left sidebar

### 2. Create Web App
1. Click **"Add app"** → **"Web app"** (</> icon)
2. Enter app name: `spaan-learning-platform`
3. **✅ Check "Also set up Firebase Hosting for this app"**
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
Add these in Firebase Console → App Hosting → Settings → Environment Variables:

```
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDJLTb_gzIHEshVJ821Zdx_WewHhMAmpsI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ispaan-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ispaan-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ispaan-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1044946444806
NEXT_PUBLIC_FIREBASE_APP_ID=1:1044946444806:web:91bef1984e842d6b1a9987
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
3. Your real Next.js app will be available at a Firebase-generated URL

## Expected Results

After deployment, you'll have:
- ✅ **Your actual Next.js landing page** with all features
- ✅ **Hero image** fetched from Firestore
- ✅ **Working navigation** to login/apply pages
- ✅ **All functionality** working in production
- ✅ **Beautiful design** exactly as in development

## Architecture After Deployment

```
User visits your domain
         │
         ▼
┌─────────────────────────────────────┐
│      Firebase App Hosting           │
│   (Your Real Next.js App)          │
│   • Server-side rendering           │
│   • Hero image from Firestore       │
│   • All your components             │
│   • Full functionality              │
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

## What Will Happen

1. **Your real landing page** will be deployed to Firebase App Hosting
2. **Static assets** (images, CSS, JS) will be served from Firebase Hosting CDN
3. **All features** will work exactly as in development
4. **Hero image** will be fetched from Firestore
5. **Navigation** will work perfectly
6. **User authentication** will be fully functional

## Next Steps

1. Set up Firebase App Hosting (follow steps above)
2. Add environment variables
3. Deploy your application
4. Your beautiful Next.js landing page will be live!

This will give you exactly what you want - your real development landing page running in production with all its dynamic features!
