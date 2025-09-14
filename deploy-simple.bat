@echo off
echo 🚀 Creating simple deployment package...

echo 📦 Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully

echo 📁 Creating deployment package...
if exist deploy-package rmdir /s /q deploy-package
mkdir deploy-package

echo Copying files...
xcopy /E /I .next deploy-package\.next
xcopy /E /I public deploy-package\public
copy package.json deploy-package\
copy package-lock.json deploy-package\
copy next.config.js deploy-package\
copy tailwind.config.ts deploy-package\
copy postcss.config.js deploy-package\
copy tsconfig.json deploy-package\
xcopy /E /I src deploy-package\src

echo Creating start script...
echo @echo off > deploy-package\start.bat
echo echo 🚀 Starting iSpaan Learning Platform... >> deploy-package\start.bat
echo npm install --production >> deploy-package\start.bat
echo npm start >> deploy-package\start.bat

echo Creating README...
echo # iSpaan Learning Platform - Deployment Package > deploy-package\README.md
echo. >> deploy-package\README.md
echo ## Quick Deploy Options >> deploy-package\README.md
echo. >> deploy-package\README.md
echo ### Option 1: Railway >> deploy-package\README.md
echo 1. Go to https://railway.app >> deploy-package\README.md
echo 2. Create new project >> deploy-package\README.md
echo 3. Upload this folder >> deploy-package\README.md
echo 4. Set environment variables >> deploy-package\README.md
echo 5. Deploy! >> deploy-package\README.md
echo. >> deploy-package\README.md
echo ### Option 2: Render >> deploy-package\README.md
echo 1. Go to https://render.com >> deploy-package\README.md
echo 2. Create new Web Service >> deploy-package\README.md
echo 3. Connect GitHub or upload this folder >> deploy-package\README.md
echo 4. Set environment variables >> deploy-package\README.md
echo 5. Deploy! >> deploy-package\README.md
echo. >> deploy-package\README.md
echo ### Option 3: Vercel >> deploy-package\README.md
echo 1. Go to https://vercel.com >> deploy-package\README.md
echo 2. Import project >> deploy-package\README.md
echo 3. Set environment variables >> deploy-package\README.md
echo 4. Deploy! >> deploy-package\README.md
echo. >> deploy-package\README.md
echo ## Environment Variables Required >> deploy-package\README.md
echo - NODE_ENV=production >> deploy-package\README.md
echo - FIREBASE_PROJECT_ID=your-firebase-project-id >> deploy-package\README.md
echo - FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email >> deploy-package\README.md
echo - FIREBASE_ADMIN_PRIVATE_KEY=your-private-key >> deploy-package\README.md
echo - JWT_SECRET=your-jwt-secret >> deploy-package\README.md
echo - NEXTAUTH_SECRET=your-nextauth-secret >> deploy-package\README.md
echo - NEXTAUTH_URL=https://your-domain.com >> deploy-package\README.md

echo ✅ Deployment package created successfully!
echo 📁 Location: deploy-package
echo 📖 Check README.md for deployment instructions
echo.
echo 🌐 Ready for deployment to:
echo    • Railway (railway.app)
echo    • Render (render.com)
echo    • Vercel (vercel.com)
echo    • DigitalOcean App Platform
echo    • Heroku
echo    • Any VPS with Node.js
echo.
pause
