# Firebase App Hosting Configuration Guide

## Repository Setup
- **Repository URL**: https://github.com/BoloBitz/ispaan-learning-platform.git
- **Branch**: main
- **Build Command**: npm run build
- **Output Directory**: .next
- **Root Directory**: /
- **Node.js Version**: 18

## Environment Variables for Firebase Console

Add these in Firebase Console → App Hosting → Your App → Settings → Environment Variables:

```env
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

## Firebase Console Setup Steps

1. Go to https://console.firebase.google.com/
2. Select your project (ispaan-app)
3. Click "App Hosting" in left sidebar
4. Click "Add app" → "Web app"
5. Enter app name: "spaan-learning-platform"
6. Click "Connect repository"
7. Choose "GitHub" as Git provider
8. Authorize Firebase to access GitHub
9. Select repository: "BoloBitz/ispaan-learning-platform"
10. Choose branch: "main"
11. Add environment variables (see above)
12. Click "Deploy"

## Post-Deployment

1. Update NEXTAUTH_URL with your actual app URL
2. Test all features
3. Set up custom domain (optional)
