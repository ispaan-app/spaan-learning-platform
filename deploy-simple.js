#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting simple deployment process...');

// Step 1: Build the application
console.log('📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Create deployment package
console.log('📁 Creating deployment package...');
const deployDir = path.join(__dirname, 'deploy-package');
const publicDir = path.join(__dirname, 'public');

// Create deploy directory
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir);

// Copy necessary files
const filesToCopy = [
  '.next',
  'public',
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'tsconfig.json'
];

filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(deployDir, file);
  
  if (fs.existsSync(srcPath)) {
    if (fs.statSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
    console.log(`✅ Copied ${file}`);
  }
});

// Create start script
const startScript = `#!/bin/bash
echo "🚀 Starting iSpaan Learning Platform..."
npm install --production
npm start
`;

fs.writeFileSync(path.join(deployDir, 'start.sh'), startScript);
fs.chmodSync(path.join(deployDir, 'start.sh'), '755');

// Create README for deployment
const readme = `# iSpaan Learning Platform - Deployment Package

## Quick Start

1. Upload this entire folder to your server
2. Run: \`chmod +x start.sh && ./start.sh\`
3. Or manually: \`npm install && npm start\`

## Environment Variables

Make sure to set these environment variables:
- NODE_ENV=production
- PORT=3000
- FIREBASE_PROJECT_ID=your-project-id
- FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
- FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
- JWT_SECRET=your-jwt-secret
- NEXTAUTH_SECRET=your-nextauth-secret
- NEXTAUTH_URL=https://your-domain.com

## Deployment Options

### Option A: VPS/Cloud Server
1. Upload this folder to your server
2. Install Node.js 18+
3. Run the start script

### Option B: Heroku
1. Create a new Heroku app
2. Upload this folder as a Git repository
3. Set environment variables in Heroku dashboard
4. Deploy

### Option C: Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Option D: DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

## Files Included
${filesToCopy.join('\n')}

Generated on: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(deployDir, 'DEPLOYMENT_README.md'), readme);

console.log('✅ Deployment package created successfully!');
console.log(`📁 Location: ${deployDir}`);
console.log('📖 Check DEPLOYMENT_README.md for deployment instructions');
console.log('');
console.log('🌐 Ready for deployment to:');
console.log('   • Vercel (vercel --prod)');
console.log('   • Netlify (netlify deploy --prod)');
console.log('   • Heroku (git push heroku main)');
console.log('   • Railway (railway deploy)');
console.log('   • DigitalOcean App Platform');
console.log('   • Any VPS with Node.js');
