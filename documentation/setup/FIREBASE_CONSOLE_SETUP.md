# Firebase Console Setup for Super Admin Access

## 🔧 Manual Setup Required

Since we can't set custom claims locally, you need to set up the Super Admin role manually in the Firebase Console.

### **Step 1: Access Firebase Console**
1. Go to: https://console.firebase.google.com/project/ispaan-app/overview
2. Navigate to **Authentication** → **Users**
3. Find your Super Admin user (likely `sifiso@thegaselagroup.co.za` or `skitzoc9@gmail.com`)

### **Step 2: Set Custom Claims**
1. Click on the user's email
2. Scroll down to **Custom Claims** section
3. Click **Add Custom Claim**
4. Add the following claims:

```json
{
  "role": "super-admin",
  "admin": true,
  "email_verified": true
}
```

### **Step 3: Alternative - Use Firebase Console Functions**

You can also run this code in the Firebase Console Functions tab:

```javascript
// Run this in Firebase Console → Functions → Create Function
const admin = require('firebase-admin');

exports.setSuperAdminRole = functions.https.onCall(async (data, context) => {
  const { email } = data;
  
  try {
    const user = await admin.auth().getUserByEmail(email);
    
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'super-admin',
      admin: true,
      email_verified: true
    });
    
    return { success: true, message: 'Super Admin role set successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

### **Step 4: Test the Setup**

After setting the custom claims:
1. Log out of the Super Admin dashboard
2. Log back in
3. The "Database Access Restricted" error should be resolved

## 🚀 Current Status

The Firestore rules have been updated to allow access for these specific email addresses:
- `developer@ispaan.com`
- `sifiso@thegaselagroup.co.za`
- `skitzoc9@gmail.com`

If you're using a different email, please update the Firestore rules accordingly.

## 📞 Support

If you continue to have issues, the problem might be:
1. Wrong email address in the rules
2. User not authenticated properly
3. Browser cache issues

Try clearing your browser cache and logging in again.
