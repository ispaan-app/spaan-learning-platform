@echo off
echo 🚀 Deploying to Firebase App Hosting...

echo.
echo 📝 STEP 1: Create GitHub Repository
echo ===================================
echo 1. Go to https://github.com and create a new repository
echo 2. Name it: ispaan-learning-platform
echo 3. Owner: BoloBitz (your account)
echo 4. Make it PUBLIC
echo 5. Don't initialize with README, .gitignore, or license
echo 6. Copy the repository URL
echo.

set /p REPO_URL="Enter your GitHub repository URL (https://github.com/BoloBitz/ispaan-learning-platform.git): "

if "%REPO_URL%"=="" (
    echo ❌ Repository URL is required
    pause
    exit /b 1
)

echo.
echo 📦 STEP 2: Pushing to GitHub...
echo ===============================

echo Updating remote origin...
git remote remove origin
git remote add origin %REPO_URL%

echo Pushing code...
git push -u origin main
if %errorlevel% neq 0 (
    echo ❌ Failed to push to GitHub
    echo Please check your repository URL and try again
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
echo 🌐 Your full Next.js app will be available at: https://ispaan-app.web.app
echo.

echo ✅ Code pushed successfully! Now connect to Firebase App Hosting.
pause
