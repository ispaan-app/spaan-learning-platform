#!/usr/bin/env node

/**
 * Build script for static export to Firebase hosting
 * Removes API routes that can't be statically exported
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Preparing for static export...\n');

// Create a temporary directory for API routes
const tempDir = path.join(__dirname, 'temp-api-routes');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Move API routes to temp directory
const apiDir = path.join(__dirname, 'src', 'app', 'api');
if (fs.existsSync(apiDir)) {
  console.log('📁 Moving API routes to temporary directory...');
  const apiFiles = fs.readdirSync(apiDir, { recursive: true });
  
  apiFiles.forEach(file => {
    if (typeof file === 'string' && file.includes('.')) {
      const sourcePath = path.join(apiDir, file);
      const destPath = path.join(tempDir, file);
      
      if (fs.statSync(sourcePath).isFile()) {
        // Create directory structure
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(sourcePath, destPath);
        fs.unlinkSync(sourcePath);
      }
    }
  });
  
  // Remove empty directories
  const removeEmptyDirs = (dir) => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      if (files.length === 0) {
        fs.rmdirSync(dir);
      } else {
        files.forEach(file => {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isDirectory()) {
            removeEmptyDirs(filePath);
          }
        });
        // Check again after processing subdirectories
        const remainingFiles = fs.readdirSync(dir);
        if (remainingFiles.length === 0) {
          fs.rmdirSync(dir);
        }
      }
    }
  };
  
  removeEmptyDirs(apiDir);
}

console.log('✅ API routes moved to temporary directory\n');

// Build the application
console.log('📦 Building static export...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Restore API routes
console.log('🔄 Restoring API routes...');
if (fs.existsSync(tempDir)) {
  const tempFiles = fs.readdirSync(tempDir, { recursive: true });
  
  tempFiles.forEach(file => {
    if (typeof file === 'string' && file.includes('.')) {
      const sourcePath = path.join(tempDir, file);
      const destPath = path.join(apiDir, file);
      
      if (fs.statSync(sourcePath).isFile()) {
        // Create directory structure
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  });
  
  // Clean up temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log('✅ API routes restored\n');
console.log('🎉 Static export ready for deployment!');
console.log('📁 Output directory: ./out');
console.log('🚀 Run: firebase deploy --only hosting');
