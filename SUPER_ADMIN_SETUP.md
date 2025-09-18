# Super Admin Setup Guide

This guide will help you create a super admin account for the iSpaan platform.

## Prerequisites

1. **Firebase Project**: Ensure you have a Firebase project set up
2. **Service Account**: Download the Firebase service account key
3. **Environment Variables**: Configure the required environment variables

## Step 1: Firebase Service Account Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the following values from the JSON file:
   - `project_id`
   - `private_key_id`
   - `private_key`
   - `client_email`
   - `client_id`

## Step 2: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/

# App Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 3: Install Dependencies

Make sure you have the required dependencies installed:

```bash
npm install firebase-admin bcryptjs
```

## Step 4: Create Super Admin Account

Run the setup script:

```bash
npm run create-super-admin
```

## Step 5: Verify Account Creation

After running the script, you should see output similar to:

```
🎉 Super Admin Account Created Successfully!
==========================================
📧 Email: developer@ispaan.com
👤 Display Name: iSpaan Developer
🆔 User ID: [generated-user-id]
🔐 Default PIN: 1234
👑 Role: super-admin
==========================================
```

## Step 6: First Login

1. Go to your application login page
2. Use the email: `developer@ispaan.com`
3. Use the PIN: `1234`
4. **IMPORTANT**: Change the PIN immediately after first login

## Default Super Admin Account Details

- **Email**: developer@ispaan.com
- **Display Name**: iSpaan Developer
- **Default PIN**: 1234
- **Role**: super-admin
- **Permissions**: Full platform access

## Security Considerations

### Immediate Actions Required:

1. **Change Default PIN**: Change the PIN immediately after first login
2. **Update Profile**: Complete your profile information
3. **Review Permissions**: Ensure all permissions are correctly assigned
4. **Enable 2FA**: If two-factor authentication is available, enable it

### Ongoing Security:

1. **Regular Audits**: Regularly review user access and permissions
2. **Strong Authentication**: Use strong, unique PINs
3. **Access Monitoring**: Monitor login attempts and access patterns
4. **Backup Access**: Ensure you have alternative access methods

## Troubleshooting

### Common Issues:

1. **Firebase Admin SDK Error**: 
   - Check your environment variables
   - Ensure the private key is properly formatted with `\n` for newlines
   - Verify the service account has the correct permissions

2. **Email Already Exists**:
   - Delete the existing user from Firebase Console
   - Or use a different email address in the script
   - Or update the existing user's role to super-admin

3. **Permission Denied**:
   - Ensure your service account has the necessary permissions
   - Check Firebase Security Rules
   - Verify the project ID is correct

### Manual User Creation (Alternative Method):

If the script fails, you can manually create a super admin user:

1. Go to Firebase Console > Authentication
2. Add a new user with email: `developer@ispaan.com`
3. Go to Firestore Database
4. Create a document in the `users` collection with the user's UID
5. Set the role to `super-admin`
6. Add the necessary permissions

## Support

If you encounter any issues:

1. Check the console output for specific error messages
2. Verify all environment variables are correctly set
3. Ensure Firebase project permissions are properly configured
4. Contact the development team for assistance

## Next Steps

After creating the super admin account:

1. **Login and Change PIN**: Use the default credentials to login and change the PIN
2. **Configure System Settings**: Review and configure platform settings
3. **Create Additional Admins**: Set up additional admin users as needed
4. **Review Security Rules**: Ensure Firestore security rules are properly configured
5. **Test Platform Features**: Verify all super admin features are working correctly

---

**Important**: Keep the super admin credentials secure and never share them in plain text. Always use secure communication channels when sharing sensitive information.


















