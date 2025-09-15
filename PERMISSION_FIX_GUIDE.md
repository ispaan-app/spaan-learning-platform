# 🔧 Permission Fix Guide

This guide helps you fix all Firebase permission denied issues comprehensively.

## 🚨 Common Permission Issues

1. **"Missing or insufficient permissions"** - Firestore security rules too restrictive
2. **"Permission denied"** - User not authenticated or lacks proper role
3. **"Resource not found"** - Collection doesn't exist or user can't access it
4. **Firebase Admin SDK errors** - Service account not properly configured

## 🛠️ Quick Fix Commands

```bash
# 1. Set up environment variables
npm run setup:env

# 2. Validate Firestore rules
npm run validate:rules

# 3. Test Firebase permissions
npm run fix:permissions

# 4. Complete setup (runs all above)
npm run setup:firebase
```

## 📋 Step-by-Step Fix Process

### Step 1: Environment Setup

1. **Check if .env.local exists:**
   ```bash
   ls -la | grep env
   ```

2. **Set up environment variables:**
   ```bash
   npm run setup:env
   ```

3. **Update Firebase credentials:**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate a new private key
   - Update `.env.local` with real values
   - Update `credentials/service-account-key.json`

### Step 2: Firestore Rules Fix

1. **Validate current rules:**
   ```bash
   npm run validate:rules
   ```

2. **Deploy updated rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Test rules in Firebase Console:**
   - Go to Firebase Console > Firestore > Rules
   - Use the Rules Playground to test

### Step 3: Service Account Permissions

1. **Check IAM roles in Google Cloud Console:**
   - Go to Google Cloud Console > IAM & Admin > IAM
   - Find your service account
   - Ensure it has these roles:
     - Firebase Admin SDK Administrator Service Agent
     - Cloud Datastore User
     - Storage Object Admin
     - Service Account Token Creator

2. **Test permissions:**
   ```bash
   npm run fix:permissions
   ```

### Step 4: User Role Configuration

1. **Check user roles in Firestore:**
   ```javascript
   // In Firebase Console > Firestore
   // Check users collection for role field
   {
     "role": "super-admin" | "admin" | "learner" | "applicant"
   }
   ```

2. **Set user claims (if needed):**
   ```bash
   node scripts/set-user-claims.js
   ```

## 🔍 Troubleshooting Specific Errors

### Error: "Missing or insufficient permissions"

**Cause:** Firestore security rules too restrictive

**Fix:**
1. Check if collection has proper read permissions
2. Ensure authenticated users can read for dashboard stats
3. Update rules to include: `allow read: if isAuthenticated();`

### Error: "Permission denied"

**Cause:** User not authenticated or lacks proper role

**Fix:**
1. Check if user is logged in
2. Verify user has correct role in Firestore
3. Check if user claims are set properly

### Error: "Resource not found"

**Cause:** Collection doesn't exist or user can't access it

**Fix:**
1. Check if collection exists in Firestore
2. Verify collection name spelling
3. Check if user has read permissions for that collection

### Error: Firebase Admin SDK initialization failed

**Cause:** Service account not properly configured

**Fix:**
1. Check environment variables are set correctly
2. Verify service account key is valid
3. Ensure service account has proper IAM roles

## 📊 Permission Matrix

| Collection | Read (Auth) | Read (Admin) | Write (Auth) | Write (Admin) |
|------------|-------------|--------------|--------------|---------------|
| users | ✅ | ✅ | ✅ (own) | ✅ |
| applications | ✅ | ✅ | ✅ (own) | ✅ |
| programs | ✅ | ✅ | ❌ | ✅ |
| placements | ✅ | ✅ | ❌ | ✅ |
| stipendReports | ✅ | ✅ | ✅ (own) | ✅ |
| issueReports | ✅ | ✅ | ✅ (own) | ✅ |
| activities | ✅ | ✅ | ✅ | ✅ |
| documents | ✅ | ✅ | ✅ (own) | ✅ |
| notifications | ✅ | ✅ | ✅ (own) | ✅ |

## 🧪 Testing Permissions

### 1. Test Firestore Rules
```bash
npm run validate:rules
```

### 2. Test Firebase Admin SDK
```bash
npm run fix:permissions
```

### 3. Test User Authentication
```javascript
// In browser console
firebase.auth().currentUser
```

### 4. Test Collection Access
```javascript
// Test reading a collection
firebase.firestore().collection('users').limit(1).get()
  .then(snapshot => console.log('✅ Users collection accessible'))
  .catch(error => console.error('❌ Users collection error:', error));
```

## 🚀 Deployment Checklist

Before deploying, ensure:

- [ ] Environment variables are set correctly
- [ ] Service account has proper IAM roles
- [ ] Firestore rules are deployed and tested
- [ ] User roles are properly configured
- [ ] All collections have appropriate permissions
- [ ] Error handling is in place

## 📞 Support

If you're still experiencing permission issues:

1. Check the browser console for specific error messages
2. Check the server logs for Firebase Admin SDK errors
3. Verify your Firebase project is active and accessible
4. Ensure your service account key is not expired
5. Check if your Firebase project has billing enabled (required for some operations)

## 🔄 Regular Maintenance

To prevent permission issues:

1. **Weekly:** Run `npm run validate:rules`
2. **Monthly:** Check service account permissions
3. **Before major updates:** Test all permission scenarios
4. **After adding new collections:** Update Firestore rules

---

**Need help?** Check the logs, run the diagnostic scripts, and refer to the Firebase documentation for your specific error.
