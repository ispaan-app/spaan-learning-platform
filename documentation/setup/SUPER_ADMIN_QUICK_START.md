# 🚀 Super Admin Quick Start Guide

This guide will help you quickly create a super admin account for the iSpaan platform.

## ⚡ Quick Setup (5 minutes)

### Step 1: Setup Environment
```bash
npm run setup-env
```

### Step 2: Configure Firebase
1. Open `.env.local` (created in step 1)
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select your project → Project Settings → Service Accounts
4. Click "Generate new private key" and download the JSON file
5. Copy the values from the JSON file to `.env.local`

### Step 3: Create Super Admin
```bash
npm run create-super-admin
```

### Step 4: Login
- **Email**: `developer@ispaan.com`
- **Password**: `SuperAdmin123!`
- **⚠️ Change password immediately after first login!**

## 🔧 Detailed Setup

### Prerequisites
- Node.js installed
- Firebase project created
- Firebase service account key

### Environment Variables Required

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
```

### Firebase Service Account Setup

1. **Go to Firebase Console**
   - Visit [console.firebase.google.com](https://console.firebase.google.com/)
   - Select your project

2. **Generate Service Account Key**
   - Go to Project Settings (gear icon)
   - Click "Service Accounts" tab
   - Click "Generate new private key"
   - Download the JSON file

3. **Extract Values**
   - Open the downloaded JSON file
   - Copy the values to your `.env.local` file
   - **Important**: Keep the private key in quotes and preserve `\n` characters

## 🎯 What Gets Created

The script creates:

- ✅ **Firebase Auth User**: `developer@ispaan.com`
- ✅ **Firestore User Document**: With super-admin role and permissions
- ✅ **Super Admin Profile**: Complete profile with preferences
- ✅ **Authentication PIN**: Default PIN `1234` (change immediately!)
- ✅ **System Settings**: Initial platform configuration
- ✅ **Welcome Notification**: First-time login notification

## 🔐 Default Credentials

| Field | Value |
|-------|-------|
| Email | developer@ispaan.com |
| Display Name | iSpaan Developer |
| Default Password | SuperAdmin123! |
| Role | super-admin |
| Permissions | Full platform access |

## ⚠️ Security Checklist

### Immediate Actions (Required)
- [ ] Change default password after first login
- [ ] Update profile information
- [ ] Review system settings
- [ ] Enable two-factor authentication (if available)

### Ongoing Security
- [ ] Regular security audits
- [ ] Monitor login attempts
- [ ] Review user permissions
- [ ] Keep credentials secure
- [ ] Use strong, unique passwords

## 🛠️ Troubleshooting

### Common Issues

**1. "Firebase Admin initialization error"**
- Check your environment variables
- Ensure private key is properly formatted
- Verify service account permissions

**2. "Email already exists"**
- Delete existing user from Firebase Console
- Or use a different email in the script
- Or update existing user's role

**3. "Permission denied"**
- Check Firebase Security Rules
- Verify service account permissions
- Ensure project ID is correct

### Manual Setup (Alternative)

If the script fails, you can manually create the super admin:

1. **Firebase Console → Authentication**
   - Add user: `developer@ispaan.com`

2. **Firestore Database**
   - Create document in `users` collection
   - Set role: `super-admin`
   - Add permissions array

3. **User Authentication**
   - Create document in `userAuth` collection
   - Set PIN (hashed with bcrypt)

## 📞 Support

If you need help:

1. Check the console output for specific errors
2. Verify all environment variables are set correctly
3. Ensure Firebase project is properly configured
4. Contact the development team

## 🎉 Success!

Once the super admin account is created, you can:

- Access all platform features
- Manage users and permissions
- Configure system settings
- Monitor platform activity
- Create additional admin accounts

---

**Remember**: Keep your super admin credentials secure and never share them in plain text!
