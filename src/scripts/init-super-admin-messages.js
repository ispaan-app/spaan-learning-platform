const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample super admin messages
const sampleMessages = [
  {
    senderId: 'admin1',
    senderName: 'System Administrator',
    senderRole: 'admin',
    recipientId: 'super-admin-id', // Replace with actual super admin ID
    recipientName: 'Super Admin',
    subject: 'System Health Report',
    content: 'The system is running smoothly with 99.9% uptime. All services are operational and no critical issues have been detected.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    isStarred: false,
    priority: 'normal',
    category: 'system',
    status: 'sent',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    senderId: 'admin2',
    senderName: 'Security Officer',
    senderRole: 'admin',
    recipientId: 'super-admin-id',
    recipientName: 'Super Admin',
    subject: 'Security Alert: Unusual Login Activity',
    content: 'We detected unusual login activity from multiple IP addresses. Please review the security logs and consider implementing additional authentication measures.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: false,
    isStarred: true,
    priority: 'urgent',
    category: 'security',
    status: 'sent',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    senderId: 'admin3',
    senderName: 'Support Manager',
    senderRole: 'admin',
    recipientId: 'super-admin-id',
    recipientName: 'Super Admin',
    subject: 'Escalation: Critical User Issue',
    content: 'A critical issue has been escalated to your attention. User reports complete inability to access their dashboard. This affects their ability to complete required tasks.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: true,
    isStarred: false,
    priority: 'high',
    category: 'escalation',
    status: 'sent',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  {
    senderId: 'admin4',
    senderName: 'Database Administrator',
    senderRole: 'admin',
    recipientId: 'super-admin-id',
    recipientName: 'Super Admin',
    subject: 'Database Maintenance Scheduled',
    content: 'Scheduled database maintenance is planned for this weekend. The system will be unavailable for approximately 2 hours. Please approve this maintenance window.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    isStarred: false,
    priority: 'normal',
    category: 'system',
    status: 'sent',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    senderId: 'admin5',
    senderName: 'Platform Manager',
    senderRole: 'admin',
    recipientId: 'super-admin-id',
    recipientName: 'Super Admin',
    subject: 'Feature Request: Advanced Analytics',
    content: 'Users are requesting advanced analytics features for their dashboards. This would include custom date ranges, export functionality, and more detailed reporting options.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: true,
    isStarred: true,
    priority: 'low',
    category: 'general',
    status: 'sent',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

async function initializeSuperAdminMessages() {
  try {
    console.log('Initializing super admin messages...');
    
    for (const message of sampleMessages) {
      await addDoc(collection(db, 'superAdminMessages'), {
        ...message,
        timestamp: Timestamp.fromDate(message.timestamp),
        createdAt: Timestamp.fromDate(message.createdAt),
        updatedAt: Timestamp.fromDate(message.updatedAt)
      });
    }
    
    console.log('Super admin messages initialized successfully!');
  } catch (error) {
    console.error('Error initializing super admin messages:', error);
  }
}

// Run the initialization
initializeSuperAdminMessages();
