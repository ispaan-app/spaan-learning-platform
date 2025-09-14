# Firebase Setup Guide for Super Admin Creation

## Understanding the Permission System

The email `developer@ispaan.com` is just the **email address** for the super admin account that will be created. It doesn't grant permissions by itself. The actual permissions come from your **Firebase service account credentials**.

## What You Need

1. **Firebase Project** (you already have this)
2. **Service Account Key** (this is what grants the permissions)
3. **Proper Environment Configuration**

## Step 1: Get Your Firebase Service Account Key

### Option A: From Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon (⚙️) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate new private key"**
6. Download the JSON file
7. **Keep this file secure** - it contains your project's admin credentials

### Option B: From Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **IAM & Admin** → **Service Accounts**
4. Find your Firebase service account (usually ends with `@your-project.iam.gserviceaccount.com`)
5. Click **Actions** → **Manage Keys**
6. Click **Add Key** → **Create new key** → **JSON**
7. Download the JSON file

## Step 2: Extract the Required Values

Open the downloaded JSON file and extract these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",           ← FIREBASE_PROJECT_ID
  "private_key_id": "abc123...",             ← FIREBASE_PRIVATE_KEY_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",  ← FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com",  ← FIREBASE_CLIENT_EMAIL
  "client_id": "123456789...",               ← FIREBASE_CLIENT_ID
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Step 3: Create Environment File

Run this command to create the environment template:

```bash
npm run setup-env
```

This will create `.env.local` with the template.

## Step 4: Configure Environment Variables

Open `.env.local` and replace the placeholder values:

```env
# Firebase Service Account (for server-side operations)
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_PRIVATE_KEY_ID=your-actual-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-actual-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-actual-client-id
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/

# Firebase Client Configuration (for frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 5: Get Client Configuration

For the `NEXT_PUBLIC_*` variables, go to:

1. Firebase Console → Project Settings
2. Scroll down to **"Your apps"** section
3. If you don't have a web app, click **"Add app"** → **Web** (</>) 
4. Copy the config values from the Firebase SDK snippet

## Step 6: Test the Configuration

Run the super admin creation script:

```bash
npm run create-super-admin
```

## What This Will Create

The script will create:

1. **Firebase Auth User**: `developer@ispaan.com`
2. **Firestore Documents**: User profile with super-admin role
3. **Authentication PIN**: Default PIN `1234`
4. **Permissions**: Full platform access

## Troubleshooting

### "Invalid PEM formatted message"
- Make sure the private key is wrapped in quotes
- Ensure `\n` characters are preserved in the private key
- Check that the private key starts with `-----BEGIN PRIVATE KEY-----`

### "Permission denied"
- Verify your service account has the correct permissions
- Check that the project ID is correct
- Ensure the service account key is valid

### "Email already exists"
- The email `developer@ispaan.com` already exists in your Firebase project
- You can either delete it from Firebase Console or use a different email

## Security Notes

- **Never commit** `.env.local` to version control
- **Keep your service account key secure**
- **Change the default PIN** after first login
- **Regularly rotate** your service account keys

## Need Help?

If you're still having issues:

1. Check the console output for specific error messages
2. Verify all environment variables are correctly set
3. Ensure your Firebase project is properly configured
4. Make sure you have the necessary permissions in your Firebase project

The key point is: **The service account credentials are what grant the permissions to create users, not the email address itself.**





