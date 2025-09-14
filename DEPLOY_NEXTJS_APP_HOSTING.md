# Deploy Next.js App to Firebase App Hosting

## ✅ Current Status
- ✅ Static Firebase Hosting deployed: https://ispaan-app-1302b.web.app
- ✅ Authentication fixed
- 🔄 Next: Set up Firebase App Hosting for dynamic features

## 🚀 Step-by-Step App Hosting Setup

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/project/ispaan-app
2. Click **"App Hosting"** in the left sidebar

### Step 2: Create Backend
1. Click **"Create backend"**
2. Choose **"Connect repository"**
3. Select **"GitHub"**
4. Authorize Firebase to access your GitHub account
5. Select repository: `ispaan-app/ispaan-app`
6. Select branch: `main`

### Step 3: Configure Build Settings
```bash
Build command: npm run build
Output directory: .next
Node.js version: 20
```

### Step 4: Set Environment Variables
In the Firebase Console, add these environment variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ispaan-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ispaan-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ispaan-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1044946444806
NEXT_PUBLIC_FIREBASE_APP_ID=1:1044946444806:web:your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
FIREBASE_ADMIN_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@ispaan-app.iam.gserviceaccount.com
FIREBASE_ADMIN_CLIENT_ID=your_client_id
FIREBASE_ADMIN_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_ADMIN_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_ADMIN_CLIENT_X509_CERT_URL=your_client_x509_cert_url
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for the build to complete
3. Your dynamic Next.js app will be available at the provided URL

## 🔧 Alternative: CLI Deployment (If Console Doesn't Work)

```bash
# Install App Hosting CLI
npm install -g firebase-tools@latest

# Create backend
firebase apphosting:backends:create --backend spaan-app --service-account ./credentials/service-account-key.json

# Deploy
firebase deploy --only apphosting
```

## 🎯 Final Result
- **Static Site**: https://ispaan-app-1302b.web.app (placeholder)
- **Dynamic App**: [App Hosting URL] (your full Next.js application)

## 🆘 Troubleshooting
- If App Hosting creation fails, use the Firebase Console method
- Ensure all environment variables are set correctly
- Check that your service account has proper permissions
