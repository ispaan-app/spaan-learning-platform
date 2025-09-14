# Firebase Backend Integration Guide

## Overview
This guide will help you integrate your existing Firebase backend with the iSpaan Learning Platform app.

## Prerequisites
- Existing Firebase project with users and data
- Firebase Admin SDK service account key
- Firebase project configuration

## Step 1: Get Your Firebase Configuration

### 1.1 Get Project Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app icon (</>) or add a new web app if needed
6. Copy the configuration object

### 1.2 Get Service Account Key
1. In Firebase Console, go to Project Settings
2. Click on "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file (keep it secure!)

## Step 2: Update Environment Variables

Create a `.env.local` file in your project root with your actual Firebase configuration:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-actual-app-id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your-actual-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## Step 3: Update Firebase Configuration Files

The app will automatically use your environment variables. The configuration files are already set up to read from environment variables.

## Step 4: Verify Your Data Structure

### 4.1 Expected User Document Structure
Your Firestore `users` collection should have documents with this structure:

```typescript
interface UserDocument {
  id: string                    // Document ID (Firebase UID)
  firstName: string
  lastName: string
  email: string
  role: 'applicant' | 'learner' | 'admin' | 'super-admin'
  status: 'pending' | 'active' | 'inactive' | 'suspended'
  program?: string              // For learners/applicants
  placementId?: string          // For learners
  monthlyHours?: number         // For learners
  targetHours?: number          // For learners
  lastCheckIn?: string          // ISO date string
  pinHash?: string              // For PIN-based login
  idNumber?: string             // For PIN-based login
  createdAt: string             // ISO date string
  updatedAt: string             // ISO date string
}
```

### 4.2 Expected Collections
- `users` - User profiles and authentication data
- `placements` - Work placement information
- `documents` - User uploaded documents
- `audit-logs` - System activity logs
- `settings` - App configuration

## Step 5: Test the Integration

### 5.1 Test Authentication
1. Start your development server: `npm run dev`
2. Try logging in with existing user credentials
3. Check if user data loads correctly

### 5.2 Test Data Access
1. Verify that existing users can access their dashboards
2. Check if user roles are correctly mapped
3. Ensure data displays properly

## Step 6: Customize for Your Data

### 6.1 Update User Role Mapping
If your user roles are different, update the role mapping in:
- `src/lib/auth.ts` (line 14)
- `src/contexts/AuthContext.tsx` (line 76-80)

### 6.2 Update Data Queries
If your Firestore structure is different, update the queries in:
- `src/app/admin/dashboard/page.tsx`
- `src/app/applicant/dashboard/page.tsx`
- Other dashboard components

## Step 7: Security Considerations

### 7.1 Firestore Security Rules
Ensure your Firestore security rules allow the app to read/write data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can read all user data
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super-admin'];
    }
    
    // Add more rules as needed
  }
}
```

### 7.2 Authentication Methods
The app supports both:
- Email/password authentication
- PIN-based authentication (ID number + PIN)

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Check your API key in environment variables
   - Ensure the key is correct and not expired

2. **"Firebase: Error (auth/user-not-found)"**
   - Verify the user exists in your Firebase Auth
   - Check if the user has a corresponding Firestore document

3. **"Firebase: Error (permission-denied)"**
   - Check your Firestore security rules
   - Ensure the user has proper permissions

4. **"User data not found"**
   - Verify the user document exists in Firestore
   - Check the document structure matches expected format

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test Firebase connection in Firebase Console
4. Check Firestore data structure
5. Verify security rules

## Migration from Existing System

If you're migrating from another system:

1. **Export existing user data**
2. **Transform data to match expected structure**
3. **Import users to Firebase Auth**
4. **Import user data to Firestore**
5. **Test authentication and data access**

## Support

If you encounter issues:
1. Check the Firebase Console for errors
2. Review the browser console for client-side errors
3. Check the server logs for backend errors
4. Verify your Firebase project configuration

## Next Steps

After successful integration:
1. Customize the UI to match your brand
2. Add any additional user fields
3. Implement custom business logic
4. Set up monitoring and analytics
5. Deploy to production









