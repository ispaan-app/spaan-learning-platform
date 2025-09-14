@echo off
echo 🚀 Setting up GitHub repository for Firebase App Hosting...

echo 📝 Please follow these steps:
echo.
echo 1. Go to https://github.com and create a new repository
echo 2. Name it: ispaan-learning-platform
echo 3. Make it PUBLIC (required for Firebase App Hosting)
echo 4. Don't initialize with README, .gitignore, or license
echo 5. Copy the repository URL (it will look like: https://github.com/YOUR_USERNAME/ispaan-learning-platform.git)
echo.
echo After creating the repository, run these commands with your repository URL:
echo.
echo git remote add origin YOUR_REPOSITORY_URL
echo git branch -M main
echo git push -u origin main
echo.
echo Then go to Firebase Console and connect the repository to your App Hosting backend.
echo.
echo 🌐 Firebase Console: https://console.firebase.google.com/project/ispaan-app/apphosting
echo.
pause
