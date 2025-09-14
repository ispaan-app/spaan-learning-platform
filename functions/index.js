const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export a simple HTTP function as a placeholder
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase Functions!");
});

// Export a basic API function
exports.api = functions.https.onRequest((request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
  } else {
    response.json({ message: 'Firebase Functions API is working!' });
  }
});
