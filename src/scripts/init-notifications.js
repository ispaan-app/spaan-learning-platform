// Script to initialize notifications collection with sample data
// Run this with: node src/scripts/init-notifications.js

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, collection, addDoc } = require('firebase-admin/firestore');

// Initialize Firebase Admin (you'll need to set up service account key)
const app = initializeApp({
  // Add your Firebase config here
});

const db = getFirestore(app);

async function initNotifications() {
  try {
    console.log('Initializing notifications collection...');
    
    // Sample notification data
    const sampleNotifications = [
      {
        userId: 'sample-user-id', // Replace with actual user ID
        type: 'welcome',
        title: 'Welcome to the Platform!',
        message: 'Welcome to the admin dashboard. You can now manage applications and learners.',
        data: {},
        read: false,
        priority: 'medium',
        category: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        senderName: 'System'
      },
      {
        userId: 'sample-user-id',
        type: 'announcement',
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance will occur on Sunday from 2-4 AM.',
        data: {},
        read: false,
        priority: 'high',
        category: 'announcements',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        senderName: 'System Admin'
      }
    ];

    // Add sample notifications
    for (const notification of sampleNotifications) {
      await addDoc(collection(db, 'notifications'), notification);
      console.log('Added notification:', notification.title);
    }

    console.log('Notifications collection initialized successfully!');
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

// Run the initialization
initNotifications();
