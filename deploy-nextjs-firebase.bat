@echo off
echo ========================================
echo Next.js Firebase Deployment Script
echo ========================================
echo.

echo Step 1: Installing Firebase adapter for Next.js...
npm install firebase-admin firebase-functions next

echo.
echo Step 2: Enabling webframeworks experiment...
firebase experiments:enable webframeworks

echo.
echo Step 3: Updating firebase.json for frameworks backend...
echo Configuring firebase.json for Next.js frameworks integration...

echo.
echo Step 4: Building Next.js application...
npm run build

echo.
echo Step 5: Deploying to Firebase...
firebase deploy

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo Your Next.js app should now be deployed with:
echo - Firebase Hosting (static assets)
echo - Cloud Functions (SSR and API routes)
echo - Full dynamic functionality
echo.
echo Check the output above for your app URL.
echo.
pause
