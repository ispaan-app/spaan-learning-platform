@echo off
echo 🚀 Setting up GitHub repository for Firebase App Hosting...

echo.
echo 📝 STEP 1: Create GitHub Repository
echo ===================================
echo 1. Go to https://github.com and create a new repository
echo 2. Name it: ispaan-learning-platform
echo 3. Make it PUBLIC (required for Firebase App Hosting)
echo 4. Don't initialize with README, .gitignore, or license
echo 5. Copy the repository URL (it will look like: https://github.com/YOUR_USERNAME/ispaan-learning-platform.git)
echo.

set /p REPO_URL="Enter your GitHub repository URL: "

if "%REPO_URL%"=="" (
    echo ❌ Repository URL is required
    pause
    exit /b 1
)

echo.
echo 📦 STEP 2: Pushing code to GitHub...
echo ====================================

echo Adding remote origin...
git remote add origin %REPO_URL%
if %errorlevel% neq 0 (
    echo ⚠️  Remote already exists, updating...
    git remote set-url origin %REPO_URL%
)

echo Renaming branch to main...
git branch -M main

echo Pushing code to GitHub...
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
echo 🌐 Your app will be available at: https://ispaan-app.web.app
echo.

echo ✅ Setup complete! Your code is now on GitHub and ready for Firebase App Hosting.
pause
