#!/usr/bin/env node

/**
 * Production Deployment Preparation Script
 * Removes test files and pages before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing application for production deployment...\n');

// Files and directories to remove for production
const testPaths = [
  // Test pages
  'src/app/test-activity-component',
  'src/app/test-audit-system',
  'src/app/test-auth-context',
  'src/app/test-avatar-header',
  'src/app/test-errors',
  'src/app/test-file-uploads',
  'src/app/test-firebase',
  'src/app/test-firestore-connection',
  'src/app/test-firestore-permissions',
  'src/app/test-form',
  'src/app/test-header',
  'src/app/test-login',
  'src/app/test-password-creation',
  'src/app/test-password-reset-popup',
  'src/app/test-profile',
  'src/app/test-profiles',
  'src/app/test-responsive-form',
  'src/app/test-responsive-modal',
  'src/app/test-sidebar',
  'src/app/test-super-admin-login',
  'src/app/test-super-admin-profile',
  'src/app/test-toast',
  'src/app/test-user-creation',
  'src/app/test-user-creation-fixed',
  'src/app/test-user-creation-with-auth',
  'src/app/test-user-management',
  'src/app/test-user-management-fix',
  'src/app/troubleshoot-user-creation',
  'src/app/design-system-demo',
  'src/app/fix-user-role',
  
  // Test API routes
  'src/app/api/test-firebase',
  'src/app/api/test-firebase-admin',
  'src/app/api/test/integration',
  'src/app/api/__tests__',
  
  // Test utilities
  'src/lib/__tests__',
  'src/lib/firebase-test.ts',
  'src/lib/integration-test.ts',
  
  // Test components
  'src/components/__tests__',
  'src/components/notifications/NotificationTestPanel.tsx',
  
  // Test scripts
  'scripts/test-firebase-config.js',
  'scripts/test-runner.js',
  
  // E2E tests
  'e2e',
  
  // Test configurations
  'jest.config.js',
  'jest.config.coverage.js',
  'jest.setup.js',
  'playwright.config.ts',
  
  // Test reports
  'coverage',
  'test-results',
  'playwright-report'
];

function removePath(targetPath) {
  try {
    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
        console.log(`🗑️  Removed directory: ${targetPath}`);
      } else {
        fs.unlinkSync(targetPath);
        console.log(`🗑️  Removed file: ${targetPath}`);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.warn(`⚠️  Could not remove ${targetPath}: ${error.message}`);
    return false;
  }
}

// Remove test files and directories
let removedCount = 0;
testPaths.forEach(testPath => {
  if (removePath(testPath)) {
    removedCount++;
  }
});

console.log(`\n✅ Production preparation complete!`);
console.log(`📊 Removed ${removedCount} test files/directories`);
console.log(`🚀 Your app is now ready for production deployment`);

// Create production-ready package.json script
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add production preparation script
  if (!packageJson.scripts['prepare-production']) {
    packageJson.scripts['prepare-production'] = 'node scripts/prepare-production.js';
  }
  
  if (!packageJson.scripts['build:production']) {
    packageJson.scripts['build:production'] = 'npm run prepare-production && npm run build';
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`📝 Updated package.json with production scripts`);
}

console.log(`\n🎯 Next steps:`);
console.log(`1. Run: npm run build:production`);
console.log(`2. Deploy the .next folder`);
console.log(`3. Set environment variables on your hosting platform`);
console.log(`4. Your production app will be clean and test-free!`);



