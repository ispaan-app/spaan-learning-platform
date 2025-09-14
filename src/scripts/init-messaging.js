// Script to initialize messaging collections with sample data
// Run this with: node src/scripts/init-messaging.js

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, collection, addDoc } = require('firebase-admin/firestore');

// Initialize Firebase Admin (you'll need to set up service account key)
const app = initializeApp({
  // Add your Firebase config here
});

const db = getFirestore(app);

async function initMessaging() {
  try {
    console.log('Initializing messaging collections...');
    
    // Sample conversation data
    const sampleConversation = {
      participants: ['sample-user-1', 'sample-user-2'],
      participantNames: {
        'sample-user-1': 'Admin User',
        'sample-user-2': 'Test User'
      },
      participantAvatars: {},
      type: 'direct',
      isGroup: false,
      title: 'Admin User & Test User',
      unreadCount: {
        'sample-user-1': 0,
        'sample-user-2': 1
      },
      isArchived: {
        'sample-user-1': false,
        'sample-user-2': false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    };

    // Add sample conversation
    const conversationRef = await addDoc(collection(db, 'conversations'), sampleConversation);
    console.log('Added conversation:', conversationRef.id);

    // Sample message data
    const sampleMessages = [
      {
        conversationId: conversationRef.id,
        senderId: 'sample-user-1',
        senderName: 'Admin User',
        senderAvatar: '',
        recipientId: 'sample-user-2',
        recipientName: 'Test User',
        content: 'Hello! Welcome to the messaging system.',
        type: 'text',
        read: false,
        createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        updatedAt: new Date(Date.now() - 300000).toISOString()
      },
      {
        conversationId: conversationRef.id,
        senderId: 'sample-user-2',
        senderName: 'Test User',
        senderAvatar: '',
        recipientId: 'sample-user-1',
        recipientName: 'Admin User',
        content: 'Hi! Thanks for setting this up. The messaging system looks great!',
        type: 'text',
        read: true,
        readAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Add sample messages
    for (const message of sampleMessages) {
      await addDoc(collection(db, 'messages'), message);
      console.log('Added message:', message.content.substring(0, 30) + '...');
    }

    console.log('Messaging collections initialized successfully!');
  } catch (error) {
    console.error('Error initializing messaging:', error);
  }
}

// Run the initialization
initMessaging();
