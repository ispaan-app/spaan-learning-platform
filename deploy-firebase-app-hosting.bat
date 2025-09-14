@echo off
echo ========================================
echo Firebase App Hosting Deployment Script
echo ========================================
echo.

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding all changes...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "Deploy to Firebase App Hosting - %date% %time%"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo Next Steps:
echo ========================================
echo 1. Go to Firebase Console: https://console.firebase.google.com/
echo 2. Select your project: ispaan-app
echo 3. Click "App Hosting" in left sidebar
echo 4. Click "Add app" -> "Web app"
echo 5. Enter app name: spaan-learning-platform
echo 6. Click "Connect repository"
echo 7. Choose "GitHub" as Git provider
echo 8. Authorize Firebase to access GitHub
echo 9. Select repository: BoloBitz/ispaan-learning-platform
echo 10. Choose branch: main
echo 11. Add environment variables (see firebase-app-hosting-config.md)
echo 12. Click "Deploy"
echo.

echo ========================================
echo Environment Variables to Add:
echo ========================================
echo NODE_ENV=production
echo NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDJLTb_gzIHEshVJ821Zdx_WewHhMAmpsI
echo NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ispaan-app.firebaseapp.com
echo NEXT_PUBLIC_FIREBASE_PROJECT_ID=ispaan-app
echo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ispaan-app.firebasestorage.app
echo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1044946444806
echo NEXT_PUBLIC_FIREBASE_APP_ID=1:1044946444806:web:91bef1984e842d6b1a9987
echo.

pause
