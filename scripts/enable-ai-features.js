#!/usr/bin/env node

/**
 * Enable AI Features Script
 * This script enables all AI features in the environment configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🤖 Enabling AI Features...');
console.log('========================');

const envLocalPath = path.join(process.cwd(), '.env.local');
let envContent = '';

// Read existing .env.local file
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('📄 Found existing .env.local file');
} else {
  console.log('📄 Creating new .env.local file');
  envContent = '';
}

// AI Feature Configuration
const aiFeatures = {
  // Core AI Features
  'ENABLE_AI_FEATURES': 'true',
  'AI_MODEL': 'gemini-1.5-flash',
  'AI_MAX_TOKENS': '4096',
  'AI_TEMPERATURE': '0.7',
  'AI_TOP_P': '0.9',
  'AI_TOP_K': '40',
  
  // Google AI Configuration
  'GOOGLE_APPLICATION_CREDENTIALS': './credentials/service-account-key.json',
  'GOOGLE_AI_API_KEY': 'your-google-ai-api-key',
  
  // Feature Flags
  'ENABLE_AI_CHAT': 'true',
  'ENABLE_AI_ANNOUNCEMENTS': 'true',
  'ENABLE_AI_PLACEMENT_MATCHING': 'true',
  'ENABLE_AI_DROPOUT_ANALYSIS': 'true',
  'ENABLE_AI_CAREER_MENTORING': 'true',
  'ENABLE_AI_IMAGE_GENERATION': 'true',
  'ENABLE_AI_DOCUMENT_ANALYSIS': 'true',
  'ENABLE_AI_SUPPORT_CHAT': 'true',
  
  // AI Service Configuration
  'AI_SERVICE_ENABLED': 'true',
  'AI_RESPONSE_CACHE_TTL': '3600',
  'AI_MAX_CONCURRENT_REQUESTS': '10',
  'AI_RATE_LIMIT_PER_MINUTE': '60',
  
  // Development AI Settings
  'MOCK_AI_RESPONSES': 'false',
  'AI_DEBUG_MODE': 'true',
  'AI_LOG_LEVEL': 'info',
  
  // AI Security
  'AI_CONTENT_FILTERING': 'true',
  'AI_SAFETY_THRESHOLD': '0.8',
  'AI_TOXICITY_THRESHOLD': '0.7'
};

// Update or add AI features to the environment
let updated = false;
let addedFeatures = [];

Object.entries(aiFeatures).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    // Update existing feature
    envContent = envContent.replace(regex, `${key}=${value}`);
    console.log(`✅ Updated ${key}=${value}`);
    updated = true;
  } else {
    // Add new feature
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += `\n# AI Features\n${key}=${value}`;
    addedFeatures.push(key);
  }
});

// Add AI features section if we added new ones
if (addedFeatures.length > 0) {
  // Remove the duplicate # AI Features comment
  envContent = envContent.replace(/\n# AI Features\n/g, '\n');
  
  // Add proper AI features section
  const aiSection = `
# ===========================================
# AI FEATURES CONFIGURATION
# ===========================================

# Core AI Features
ENABLE_AI_FEATURES=true
AI_MODEL=gemini-1.5-flash
AI_MAX_TOKENS=4096
AI_TEMPERATURE=0.7
AI_TOP_P=0.9
AI_TOP_K=40

# Google AI Configuration
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account-key.json
GOOGLE_AI_API_KEY=your-google-ai-api-key

# AI Feature Flags
ENABLE_AI_CHAT=true
ENABLE_AI_ANNOUNCEMENTS=true
ENABLE_AI_PLACEMENT_MATCHING=true
ENABLE_AI_DROPOUT_ANALYSIS=true
ENABLE_AI_CAREER_MENTORING=true
ENABLE_AI_IMAGE_GENERATION=true
ENABLE_AI_DOCUMENT_ANALYSIS=true
ENABLE_AI_SUPPORT_CHAT=true

# AI Service Configuration
AI_SERVICE_ENABLED=true
AI_RESPONSE_CACHE_TTL=3600
AI_MAX_CONCURRENT_REQUESTS=10
AI_RATE_LIMIT_PER_MINUTE=60

# Development AI Settings
MOCK_AI_RESPONSES=false
AI_DEBUG_MODE=true
AI_LOG_LEVEL=info

# AI Security
AI_CONTENT_FILTERING=true
AI_SAFETY_THRESHOLD=0.8
AI_TOXICITY_THRESHOLD=0.7
`;

  // Insert AI section after Firebase configuration
  const firebaseEndIndex = envContent.lastIndexOf('FIREBASE_CLIENT_X509_CERT_URL');
  if (firebaseEndIndex !== -1) {
    const lineEnd = envContent.indexOf('\n', firebaseEndIndex);
    if (lineEnd !== -1) {
      envContent = envContent.slice(0, lineEnd + 1) + aiSection + envContent.slice(lineEnd + 1);
    }
  } else {
    envContent += aiSection;
  }
  
  console.log(`✅ Added ${addedFeatures.length} new AI features`);
}

// Write the updated content
fs.writeFileSync(envLocalPath, envContent);
console.log('✅ .env.local file updated with AI features');

// Create a summary of enabled features
console.log('\n🎉 AI Features Successfully Enabled!');
console.log('=====================================');
console.log('✅ AI Chat System');
console.log('✅ AI Announcement Generation');
console.log('✅ AI Placement Matching');
console.log('✅ AI Dropout Risk Analysis');
console.log('✅ AI Career Mentoring');
console.log('✅ AI Image Generation');
console.log('✅ AI Document Analysis');
console.log('✅ AI Support Chat');

console.log('\n📋 Next Steps:');
console.log('1. Get your Google AI API key from: https://makersuite.google.com/app/apikey');
console.log('2. Replace "your-google-ai-api-key" in .env.local with your actual API key');
console.log('3. Restart your development server: npm run dev');
console.log('4. Test AI features in your application');

console.log('\n🔧 Available AI Commands:');
console.log('- npm run dev (start with AI features)');
console.log('- Check AI features in the application dashboard');
console.log('- Test AI chat functionality');
console.log('- Generate AI-powered announcements');

console.log('\n⚠️  Important Notes:');
console.log('- Make sure you have a valid Google AI API key');
console.log('- AI features require internet connection');
console.log('- Some features may have usage limits');
console.log('- Check the console for AI-related logs');

console.log('\n🎯 AI Features Now Available:');
console.log('• Intelligent chat assistance');
console.log('• Automated announcement generation');
console.log('• Smart placement matching');
console.log('• Dropout risk prediction');
console.log('• Career guidance and mentoring');
console.log('• AI-powered image generation');
console.log('• Document analysis and insights');
console.log('• Support chat automation');






















