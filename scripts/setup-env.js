const fs = require('fs');
const path = require('path');

console.log('🔧 iSpaan Environment Setup Helper\n');

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('   If you want to recreate it, please delete the existing file first.\n');
  process.exit(0);
}

// Read the template
const templatePath = path.join(process.cwd(), 'env.template');
if (!fs.existsSync(templatePath)) {
  console.log('❌ env.template file not found!');
  console.log('   Please make sure the template file exists in the project root.\n');
  process.exit(1);
}

// Copy template to .env.local
try {
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  fs.writeFileSync(envPath, templateContent);
  
  console.log('✅ Environment template created successfully!');
  console.log('📄 File created: .env.local');
  console.log('\n📝 Next steps:');
  console.log('1. Open .env.local in your editor');
  console.log('2. Replace all placeholder values with your actual Firebase configuration');
  console.log('3. Get your Firebase config from: Firebase Console > Project Settings > Service Accounts');
  console.log('4. Run: npm run create-super-admin');
  console.log('\n🔐 Security Note:');
  console.log('   The .env.local file is already in .gitignore and will not be committed to version control.');
  
} catch (error) {
  console.error('❌ Error creating environment file:', error.message);
  process.exit(1);
}




































