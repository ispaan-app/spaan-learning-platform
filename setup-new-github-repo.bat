@echo off
echo 🚀 Setting up new GitHub repository for Firebase App Hosting...

echo.
echo 📝 STEP 1: Create New GitHub Repository
echo ======================================
echo 1. Go to https://github.com and create a new repository
echo 2. Name it: ispaan-learning-platform
echo 3. Make it PUBLIC (required for Firebase App Hosting)
echo 4. Don't initialize with README, .gitignore, or license
echo 5. Copy the repository URL (it will look like: https://github.com/YOUR_USERNAME/ispaan-learning-platform.git)
echo.

set /p NEW_REPO_URL="Enter your new GitHub repository URL: "

if "%NEW_REPO_URL%"=="" (
    echo ❌ Repository URL is required
    pause
    exit /b 1
)

echo.
echo 📦 STEP 2: Updating remote origin...
echo ====================================

echo Removing old remote...
git remote remove origin

echo Adding new remote...
git remote add origin %NEW_REPO_URL%

echo Pushing code to new repository...
git push -u origin main
if %errorlevel% neq 0 (
    echo ❌ Failed to push to GitHub
    pause
    exit /b 1
)

echo.
echo ✅ STEP 3: Connect to Firebase App Hosting
echo ==========================================
echo 1. Go to: https://console.firebase.google.com/project/ispaan-app/apphosting
echo 2. Click on your "studio" backend
echo 3. Click "Connect repository"
echo 4. Select your GitHub repository: ispaan-learning-platform
echo 5. Choose the branch: main
echo 6. Set build settings:
echo    - Build command: npm run build
echo    - Output directory: .next
echo    - Node.js version: 18
echo.
echo 🌐 Your full app will be available at: https://ispaan-app.web.app
echo.

echo ✅ Setup complete! Your full Next.js app is now on GitHub and ready for Firebase App Hosting.
pause
