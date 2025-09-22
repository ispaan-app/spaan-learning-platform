#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning Next.js development environment...');

try {
  // Remove .next directory
  if (fs.existsSync('.next')) {
    console.log('Removing .next directory...');
    execSync('rmdir /s /q .next', { stdio: 'inherit', shell: true });
  }

  // Remove node_modules/.cache
  if (fs.existsSync('node_modules/.cache')) {
    console.log('Removing node_modules/.cache...');
    execSync('rmdir /s /q node_modules\\.cache', { stdio: 'inherit', shell: true });
  }

  // Clear npm cache
  console.log('Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  console.log('✅ Cleanup complete! You can now run "npm run dev"');
} catch (error) {
  console.error('❌ Error during cleanup:', error.message);
  process.exit(1);
}
