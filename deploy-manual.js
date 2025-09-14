#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Creating manual deployment package...');

// Create a simple build without static export
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  // Disable static optimization for problematic pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Skip static generation for problematic pages
  generateStaticParams: false,
}

module.exports = nextConfig`;

fs.writeFileSync('next.config.deploy.js', nextConfig);

console.log('📦 Building application...');
try {
  // Use the deployment config
  execSync('cp next.config.deploy.js next.config.js', { stdio: 'inherit' });
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Create deployment package
const deployDir = path.join(__dirname, 'deploy-package');
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
  'tsconfig.json',
  'src'
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

// Create deployment instructions
const instructions = `# iSpaan Learning Platform - Deployment Instructions

## Quick Deploy Options

### Option 1: Railway (Recommended)
1. Go to https://railway.app
2. Connect your GitHub repository
3. Set environment variables:
   - NODE_ENV=production
   - FIREBASE_PROJECT_ID=your-project-id
   - FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
   - FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
   - JWT_SECRET=your-jwt-secret
   - NEXTAUTH_SECRET=your-nextauth-secret
   - NEXTAUTH_URL=https://your-app.railway.app
4. Deploy!

### Option 2: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect your GitHub repository
4. Use these settings:
   - Build Command: npm install && npm run build
   - Start Command: npm start
   - Environment: Node
5. Set environment variables (same as Railway)
6. Deploy!

### Option 3: Vercel
1. Go to https://vercel.com
2. Import your GitHub repository
3. Set environment variables
4. Deploy!

### Option 4: DigitalOcean App Platform
1. Go to https://cloud.digitalocean.com/apps
2. Create new app from GitHub
3. Set environment variables
4. Deploy!

### Option 5: Heroku
1. Install Heroku CLI
2. Run: heroku create your-app-name
3. Set environment variables: heroku config:set KEY=value
4. Deploy: git push heroku main

### Option 6: Manual VPS
1. Upload this folder to your server
2. Install Node.js 18+
3. Run: npm install && npm start
4. Set up reverse proxy (nginx)

## Environment Variables Required
- NODE_ENV=production
- FIREBASE_PROJECT_ID=your-firebase-project-id
- FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
- FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
- JWT_SECRET=your-jwt-secret
- NEXTAUTH_SECRET=your-nextauth-secret
- NEXTAUTH_URL=https://your-domain.com

## Files Included
${filesToCopy.join('\n')}

Generated: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(deployDir, 'DEPLOYMENT_INSTRUCTIONS.md'), instructions);

console.log('✅ Deployment package created successfully!');
console.log(`📁 Location: ${deployDir}`);
console.log('📖 Check DEPLOYMENT_INSTRUCTIONS.md for detailed instructions');
console.log('');
console.log('🌐 Ready for deployment to:');
console.log('   • Railway (railway.app)');
console.log('   • Render (render.com)');
console.log('   • Vercel (vercel.com)');
console.log('   • DigitalOcean App Platform');
console.log('   • Heroku');
console.log('   • Any VPS with Node.js');
