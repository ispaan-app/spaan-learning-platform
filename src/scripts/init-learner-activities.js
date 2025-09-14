// Script to initialize learner activities with sample data
// Run this with: node src/scripts/init-learner-activities.js

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, collection, addDoc } = require('firebase-admin/firestore');

// Initialize Firebase Admin (you'll need to set up service account key)
const app = initializeApp({
  // Add your Firebase config here
});

const db = getFirestore(app);

async function initLearnerActivities() {
  try {
    console.log('Initializing learner activities...');
    
    // Sample learner activities
    const sampleActivities = [
      {
        learnerId: 'learner-1',
        learnerName: 'John Smith',
        learnerEmail: 'john.smith@example.com',
        learnerAvatar: '',
        action: 'check_in',
        details: 'Checked in at ABC Company',
        location: 'ABC Company, Cape Town',
        status: 'completed',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        metadata: { company: 'ABC Company', checkInTime: '09:00' }
      },
      {
        learnerId: 'learner-2',
        learnerName: 'Sarah Johnson',
        learnerEmail: 'sarah.johnson@example.com',
        learnerAvatar: '',
        action: 'hours_logged',
        details: 'Logged 8 hours for today',
        status: 'completed',
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        metadata: { hours: 8, date: new Date().toISOString().split('T')[0] }
      },
      {
        learnerId: 'learner-3',
        learnerName: 'Mike Wilson',
        learnerEmail: 'mike.wilson@example.com',
        learnerAvatar: '',
        action: 'leave_requested',
        details: 'Requested sick leave from 2024-01-15 to 2024-01-17',
        status: 'pending',
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        metadata: { 
          leaveType: 'sick', 
          startDate: '2024-01-15', 
          endDate: '2024-01-17' 
        }
      },
      {
        learnerId: 'learner-4',
        learnerName: 'Emma Davis',
        learnerEmail: 'emma.davis@example.com',
        learnerAvatar: '',
        action: 'placement_started',
        details: 'Started placement at XYZ Corporation as Software Developer',
        status: 'active',
        timestamp: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
        metadata: { 
          companyName: 'XYZ Corporation', 
          position: 'Software Developer' 
        }
      },
      {
        learnerId: 'learner-5',
        learnerName: 'David Brown',
        learnerEmail: 'david.brown@example.com',
        learnerAvatar: '',
        action: 'issue_reported',
        details: 'Reported technical issue: Computer not working properly',
        status: 'pending',
        timestamp: new Date(Date.now() - 1500000).toISOString(), // 25 minutes ago
        metadata: { 
          issueType: 'technical', 
          description: 'Computer not working properly' 
        }
      },
      {
        learnerId: 'learner-6',
        learnerName: 'Lisa Anderson',
        learnerEmail: 'lisa.anderson@example.com',
        learnerAvatar: '',
        action: 'document_uploaded',
        details: 'Uploaded CV: Lisa_Anderson_CV.pdf',
        status: 'completed',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        metadata: { 
          documentType: 'CV', 
          fileName: 'Lisa_Anderson_CV.pdf' 
        }
      },
      {
        learnerId: 'learner-7',
        learnerName: 'Tom Wilson',
        learnerEmail: 'tom.wilson@example.com',
        learnerAvatar: '',
        action: 'session_attended',
        details: 'Attended Professional Development session',
        status: 'completed',
        timestamp: new Date(Date.now() - 2100000).toISOString(), // 35 minutes ago
        metadata: { 
          sessionType: 'Professional Development', 
          attended: true 
        }
      },
      {
        learnerId: 'learner-8',
        learnerName: 'Anna Garcia',
        learnerEmail: 'anna.garcia@example.com',
        learnerAvatar: '',
        action: 'goal_achieved',
        details: 'Achieved goal: Complete React.js certification',
        status: 'completed',
        timestamp: new Date(Date.now() - 2400000).toISOString(), // 40 minutes ago
        metadata: { 
          goalDescription: 'Complete React.js certification' 
        }
      },
      {
        learnerId: 'learner-9',
        learnerName: 'Chris Lee',
        learnerEmail: 'chris.lee@example.com',
        learnerAvatar: '',
        action: 'profile_updated',
        details: 'Updated profile: contact information, skills',
        status: 'completed',
        timestamp: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
        metadata: { 
          updatedFields: ['contact information', 'skills'] 
        }
      },
      {
        learnerId: 'learner-10',
        learnerName: 'Maria Rodriguez',
        learnerEmail: 'maria.rodriguez@example.com',
        learnerAvatar: '',
        action: 'check_out',
        details: 'Checked out after 7.5 hours from DEF Industries',
        location: 'DEF Industries, Johannesburg',
        status: 'completed',
        timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
        metadata: { 
          company: 'DEF Industries', 
          hoursWorked: 7.5 
        }
      }
    ];

    // Add sample activities
    for (const activity of sampleActivities) {
      await addDoc(collection(db, 'learner-activities'), activity);
      console.log(`Added activity: ${activity.action} by ${activity.learnerName}`);
    }

    console.log('Learner activities initialized successfully!');
  } catch (error) {
    console.error('Error initializing learner activities:', error);
  }
}

// Run the initialization
initLearnerActivities();
