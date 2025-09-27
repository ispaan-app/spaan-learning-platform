# Learner Activity System

## Overview
The Learner Activity System provides real-time tracking and monitoring of learner activities across the platform. It replaces the generic "Recent Platform Activity" with a focused, learner-centric activity feed that provides administrators with live insights into learner engagement and progress.

## Features

### 🔄 **Real-time Activity Tracking**
- **Live Updates**: Activities appear instantly as learners perform actions
- **Connection Status**: Visual indicators for online/offline status
- **Auto-refresh**: Automatic data refresh with manual refresh option
- **Error Handling**: Graceful fallback for connection issues

### 📊 **Comprehensive Activity Types**
- **Check-in/Check-out**: Work attendance tracking
- **Hours Logging**: Time tracking and reporting
- **Leave Management**: Leave requests and approvals
- **Placement Activities**: Work placement start/completion
- **Issue Reporting**: Problem reporting and resolution
- **Profile Updates**: Learner profile modifications
- **Document Management**: File uploads and management
- **Session Attendance**: Training session participation
- **Goal Achievement**: Learning goal completion
- **Milestone Tracking**: Progress milestone achievements

### 🎯 **Activity Details**
- **Learner Information**: Name, email, avatar display
- **Action Context**: Detailed descriptions of activities
- **Location Data**: Geographic information when available
- **Metadata**: Additional structured data for each activity
- **Status Tracking**: Active, completed, pending, error states
- **Timestamps**: Precise time tracking with relative formatting

## Implementation

### File Structure
```
src/
├── components/admin/
│   └── LearnerActivityFeed.tsx      # Main activity feed component
├── services/
│   └── learnerActivityService.ts    # Activity tracking service
├── scripts/
│   └── init-learner-activities.js   # Sample data initialization
└── docs/
    └── LEARNER_ACTIVITY_SYSTEM.md   # This documentation
```

### Database Schema
**Collection**: `learner-activities`

```typescript
interface LearnerActivity {
  id: string
  learnerId: string
  learnerName: string
  learnerEmail: string
  learnerAvatar?: string
  action: LearnerActionType
  details: string
  timestamp: string
  location?: string
  metadata?: Record<string, any>
  status: 'active' | 'completed' | 'pending' | 'error'
}
```

### Activity Types
```typescript
type LearnerActionType = 
  | 'check_in'           // Work check-in
  | 'check_out'          // Work check-out
  | 'hours_logged'       // Hours logged
  | 'leave_requested'    // Leave request submitted
  | 'leave_approved'     // Leave request approved
  | 'leave_rejected'     // Leave request rejected
  | 'placement_started'  // Work placement started
  | 'placement_completed' // Work placement completed
  | 'issue_reported'     // Issue reported
  | 'issue_resolved'     // Issue resolved
  | 'profile_updated'    // Profile information updated
  | 'document_uploaded'  // Document uploaded
  | 'session_attended'   // Training session attended
  | 'session_missed'     // Training session missed
  | 'goal_achieved'      // Learning goal achieved
  | 'milestone_reached'  // Progress milestone reached
```

## Usage

### For Administrators
1. **View Live Feed**: Real-time learner activity updates
2. **Monitor Progress**: Track learner engagement and progress
3. **Identify Issues**: Spot problems or concerns early
4. **Track Attendance**: Monitor work attendance and participation
5. **Review Achievements**: Celebrate learner accomplishments

### For Developers
1. **Log Activities**: Use `learnerActivityService.logActivity()`
2. **Subscribe to Updates**: Real-time activity subscriptions
3. **Query Activities**: Filter by learner, action type, or date range
4. **Custom Actions**: Add new activity types as needed

## Service Methods

### Core Methods
```typescript
// Log a new activity
await learnerActivityService.logActivity({
  learnerId: 'learner-123',
  learnerName: 'John Doe',
  learnerEmail: 'john@example.com',
  action: 'check_in',
  details: 'Checked in at workplace',
  status: 'completed'
})

// Get recent activities
const activities = await learnerActivityService.getRecentActivities(20)

// Subscribe to real-time updates
const unsubscribe = learnerActivityService.subscribeToLearnerActivities(
  (activities) => {
    console.log('New activities:', activities)
  }
)
```

### Helper Methods
```typescript
// Common activity logging
await learnerActivityService.logCheckIn(learnerId, name, email, location)
await learnerActivityService.logHoursLogged(learnerId, name, email, hours, date)
await learnerActivityService.logLeaveRequest(learnerId, name, email, type, start, end)
await learnerActivityService.logPlacementStart(learnerId, name, email, company, position)
await learnerActivityService.logIssueReport(learnerId, name, email, type, description)
await learnerActivityService.logProfileUpdate(learnerId, name, email, fields)
await learnerActivityService.logDocumentUpload(learnerId, name, email, type, fileName)
await learnerActivityService.logSessionAttendance(learnerId, name, email, type, attended)
await learnerActivityService.logGoalAchievement(learnerId, name, email, description)
```

## UI Components

### LearnerActivityFeed
- **Real-time Display**: Live activity updates
- **Connection Status**: Online/offline indicators
- **Activity Icons**: Visual representation of action types
- **Status Badges**: Color-coded status indicators
- **Timestamps**: Relative time formatting
- **Learner Avatars**: Visual learner identification
- **Scrollable Feed**: Handle large numbers of activities
- **Refresh Controls**: Manual refresh capability

### Visual Indicators
- **Action Icons**: Unique icons for each activity type
- **Status Colors**: Green (completed), Blue (active), Yellow (pending), Red (error)
- **Connection Status**: Green dot (online), Red dot (offline)
- **Activity Badges**: Color-coded action type badges

## Integration Points

### Admin Dashboard
- **Replacement**: Replaces generic "Recent Platform Activity"
- **Focus**: Specifically on learner activities
- **Real-time**: Live updates without page refresh
- **Context**: Learner-centric information and actions

### Learner Management
- **Individual Tracking**: Per-learner activity history
- **Progress Monitoring**: Track learner development
- **Issue Identification**: Spot problems early
- **Achievement Recognition**: Celebrate successes

## Performance Considerations

### Real-time Updates
- **Efficient Subscriptions**: Only subscribe to necessary data
- **Connection Management**: Handle network issues gracefully
- **Data Limits**: Limit query results for performance
- **Cleanup**: Proper subscription cleanup on unmount

### Data Management
- **Pagination**: Handle large datasets efficiently
- **Filtering**: Client-side filtering for better UX
- **Caching**: Smart caching for frequently accessed data
- **Archiving**: Consider archiving old activities

## Security & Privacy

### Data Protection
- **Learner Privacy**: Respect learner data privacy
- **Access Control**: Role-based access to activity data
- **Data Retention**: Consider data retention policies
- **Audit Trail**: Track who accesses activity data

### Permissions
- **Admin Access**: Full access to all learner activities
- **Learner Access**: Limited access to own activities
- **Super Admin**: Enhanced monitoring capabilities

## Future Enhancements

### Planned Features
- **Activity Analytics**: Detailed analytics and reporting
- **Custom Filters**: Advanced filtering options
- **Export Functionality**: Export activity data
- **Notifications**: Real-time activity notifications
- **Activity Trends**: Trend analysis and insights
- **Integration**: Connect with other platform features

### Advanced Capabilities
- **Machine Learning**: Predictive analytics for learner success
- **Behavioral Insights**: Understanding learner patterns
- **Risk Assessment**: Early warning systems
- **Performance Metrics**: Comprehensive performance tracking

## Troubleshooting

### Common Issues
1. **Activities not updating**: Check Firestore permissions and network
2. **Connection issues**: Verify real-time subscription setup
3. **Performance problems**: Consider data limits and pagination
4. **Missing activities**: Ensure proper activity logging

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` for detailed troubleshooting information.

## Support
For technical support or feature requests, contact the development team or create an issue in the project repository.
