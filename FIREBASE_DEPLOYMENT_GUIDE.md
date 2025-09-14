# 🚀 Firebase Deployment Guide for iSpaan Learning Platform

## Current Status

✅ **Firebase Hosting**: https://ispaan-app.web.app (Enhanced landing page)
✅ **Vercel (Full App)**: https://ispaan-j74l4egvu-sifisos-projects-ff41ac19.vercel.app

## Option 1: Deploy Full App to Firebase App Hosting (Recommended)

To deploy the complete iSpaan Learning Platform to Firebase App Hosting:

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it: `ispaan-learning-platform`
3. Make it **PUBLIC** (required for Firebase App Hosting)
4. Don't initialize with README, .gitignore, or license

### Step 2: Push Code to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/ispaan-learning-platform.git
git branch -M main
git push -u origin main
```

### Step 3: Connect to Firebase App Hosting
1. Go to [Firebase Console](https://console.firebase.google.com/project/ispaan-app/apphosting)
2. Click on your "studio" backend
3. Click "Connect repository"
4. Select your GitHub repository: `ispaan-learning-platform`
5. Choose the branch: `main`
6. Set build settings:
   - **Build command**: `npm run build`
   - **Output directory**: `.next`
   - **Node.js version**: `18`

### Step 4: Deploy
Firebase will automatically deploy your app whenever you push to the main branch.

## Option 2: Use Current Setup (Immediate)

Your current setup provides:
- **Firebase Hosting**: Professional landing page with auto-redirect
- **Vercel**: Full application with all features

## Features Available

### Full Application Features:
- ✅ Complete user authentication system
- ✅ Real-time data synchronization
- ✅ Advanced analytics and reporting
- ✅ File upload and management
- ✅ AI-powered features and chatbots
- ✅ Multi-role access control (Super Admin, Admin, Learner, Applicant)
- ✅ Responsive mobile interface
- ✅ Performance monitoring
- ✅ Real-time notifications
- ✅ Messaging system
- ✅ Document management
- ✅ Leave request system
- ✅ Placement management

## Deployment Commands

### Update Firebase Hosting:
```bash
firebase deploy --only hosting
```

### Update Full App (after GitHub setup):
```bash
git add .
git commit -m "Update application"
git push origin main
```

## Project Structure

```
ispaan/
├── src/                    # Source code
├── public/                 # Static assets
├── firebase-hosting/       # Landing page
├── firebase.json          # Firebase configuration
├── next.config.js         # Next.js configuration
└── credentials/           # Service account keys
```

## Environment Variables Required

For full functionality, ensure these are set in Firebase App Hosting:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`

## Support

- **Firebase Console**: https://console.firebase.google.com/project/ispaan-app
- **GitHub Repository**: (After setup)
- **Documentation**: See `docs/` folder for detailed guides
