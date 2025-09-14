import { notificationService } from '@/services/notificationService'
import { NotificationType, NotificationPriority } from '@/types/notifications'

// Sample notification actions for different admin operations

export const notificationActions = {
  // Application-related notifications
  async notifyApplicationReceived(applicantId: string, applicantName: string, program: string) {
    await notificationService.notifyAdmins(
      'application_received',
      'New Application Received',
      `${applicantName} has submitted an application for ${program}`,
      {
        applicantId,
        applicantName,
        program,
        actionUrl: `/admin/applicants`
      },
      'medium'
    )
  },

  async notifyApplicationApproved(applicantId: string, applicantName: string) {
    await notificationService.notifyUser(
      applicantId,
      'application_approved',
      'Application Approved',
      `Congratulations! Your application has been approved. You are now a learner in the program.`,
      {
        actionUrl: `/learner/dashboard`
      },
      'high'
    )
  },

  async notifyApplicationRejected(applicantId: string, applicantName: string, reason?: string) {
    await notificationService.notifyUser(
      applicantId,
      'application_rejected',
      'Application Status Update',
      `Your application has been reviewed. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`,
      {
        reason,
        actionUrl: `/applicant/dashboard`
      },
      'medium'
    )
  },

  // Placement-related notifications
  async notifyPlacementAssigned(learnerId: string, learnerName: string, placementName: string) {
    await notificationService.notifyUser(
      learnerId,
      'placement_assigned',
      'Placement Assigned',
      `You have been assigned to ${placementName}. Check your dashboard for details.`,
      {
        placementName,
        actionUrl: `/learner/dashboard`
      },
      'high'
    )
  },

  async notifyPlacementUpdated(learnerId: string, learnerName: string, placementName: string, changes: string) {
    await notificationService.notifyUser(
      learnerId,
      'placement_updated',
      'Placement Updated',
      `Your placement at ${placementName} has been updated. ${changes}`,
      {
        placementName,
        changes,
        actionUrl: `/learner/dashboard`
      },
      'medium'
    )
  },

  // Session-related notifications
  async notifySessionScheduled(learnerId: string, learnerName: string, sessionTitle: string, sessionDate: string) {
    await notificationService.notifyUser(
      learnerId,
      'session_scheduled',
      'Class Session Scheduled',
      `A new class session "${sessionTitle}" has been scheduled for ${sessionDate}`,
      {
        sessionTitle,
        sessionDate,
        actionUrl: `/learner/dashboard`
      },
      'medium'
    )
  },

  async notifySessionReminder(learnerId: string, learnerName: string, sessionTitle: string, sessionTime: string) {
    await notificationService.notifyUser(
      learnerId,
      'session_reminder',
      'Session Reminder',
      `Reminder: You have a session "${sessionTitle}" at ${sessionTime}`,
      {
        sessionTitle,
        sessionTime,
        actionUrl: `/learner/dashboard`
      },
      'high'
    )
  },

  // Hours and progress notifications
  async notifyHoursLogged(learnerId: string, learnerName: string, hours: number, month: string) {
    await notificationService.notifyUser(
      learnerId,
      'hours_logged',
      'Hours Logged Successfully',
      `You have successfully logged ${hours} hours for ${month}. Keep up the great work!`,
      {
        hours,
        month,
        actionUrl: `/learner/dashboard`
      },
      'low'
    )
  },

  // Issue and support notifications
  async notifyIssueReported(issueId: string, reporterName: string, category: string, title: string, priority: string) {
    await notificationService.notifyAdmins(
      'issue_reported',
      'New Issue Reported',
      `${reporterName} reported a ${category} issue: ${title}`,
      {
        issueId,
        reporterName,
        category,
        title,
        priority,
        actionUrl: `/admin/issues`
      },
      priority === 'high' ? 'high' : 'medium'
    )
  },

  async notifyIssueResolved(learnerId: string, learnerName: string, issueTitle: string) {
    await notificationService.notifyUser(
      learnerId,
      'issue_resolved',
      'Issue Resolved',
      `Your issue "${issueTitle}" has been resolved. Thank you for your patience.`,
      {
        issueTitle,
        actionUrl: `/learner/dashboard`
      },
      'medium'
    )
  },

  // Announcement notifications
  async notifyAnnouncement(userIds: string[], title: string, message: string, senderName: string) {
    const promises = userIds.map(userId => 
      notificationService.notifyUser(
        userId,
        'announcement',
        title,
        message,
        {
          senderName,
          actionUrl: `/learner/dashboard`
        },
        'medium'
      )
    )
    await Promise.all(promises)
  },

  // System notifications
  async notifySystemMaintenance(scheduledTime: string, duration: string) {
    await notificationService.notifyAdmins(
      'system_maintenance',
      'System Maintenance Scheduled',
      `System maintenance is scheduled for ${scheduledTime} and will last approximately ${duration}`,
      {
        scheduledTime,
        duration,
        actionUrl: `/admin/dashboard`
      },
      'medium'
    )
  },

  // Security notifications
  async notifySecurityAlert(userId: string, alertType: string, description: string) {
    await notificationService.notifyUser(
      userId,
      'security_alert',
      'Security Alert',
      description,
      {
        alertType,
        actionUrl: `/admin/security`
      },
      'urgent'
    )
  },

  // Achievement notifications
  async notifyAchievement(learnerId: string, learnerName: string, achievement: string, description: string) {
    await notificationService.notifyUser(
      learnerId,
      'achievement',
      'Achievement Unlocked!',
      `Congratulations ${learnerName}! You have earned the "${achievement}" achievement. ${description}`,
      {
        achievement,
        description,
        actionUrl: `/learner/dashboard`
      },
      'medium'
    )
  },

  // Reminder notifications
  async notifyDeadlineApproaching(userId: string, userName: string, deadlineType: string, deadline: string) {
    await notificationService.notifyUser(
      userId,
      'deadline_approaching',
      'Deadline Reminder',
      `Reminder: Your ${deadlineType} deadline is approaching on ${deadline}`,
      {
        deadlineType,
        deadline,
        actionUrl: `/learner/dashboard`
      },
      'high'
    )
  },

  // Profile and account notifications
  async notifyProfileUpdated(userId: string, userName: string, changes: string[]) {
    await notificationService.notifyUser(
      userId,
      'profile_updated',
      'Profile Updated',
      `Your profile has been updated. Changes: ${changes.join(', ')}`,
      {
        changes,
        actionUrl: `/admin/profile`
      },
      'low'
    )
  },

  async notifyPasswordChanged(userId: string, userName: string) {
    await notificationService.notifyUser(
      userId,
      'password_changed',
      'Password Changed',
      `Your password has been successfully changed. If you did not make this change, please contact support immediately.`,
      {
        actionUrl: `/admin/security`
      },
      'high'
    )
  },

  // Welcome notifications
  async notifyWelcome(userId: string, userName: string, role: string) {
    await notificationService.notifyUser(
      userId,
      'welcome',
      'Welcome to iSpaan!',
      `Welcome ${userName}! Your ${role} account has been set up successfully. Explore the platform and get started.`,
      {
        role,
        actionUrl: `/${role}/dashboard`
      },
      'medium'
    )
  }
}

// Helper function to create custom notifications
export async function createCustomNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  priority: NotificationPriority = 'medium',
  data?: Record<string, any>
) {
  await notificationService.notifyUser(userId, type, title, message, data, priority)
}

// Helper function to create admin notifications
export async function createAdminNotification(
  type: NotificationType,
  title: string,
  message: string,
  priority: NotificationPriority = 'medium',
  data?: Record<string, any>
) {
  await notificationService.notifyAdmins(type, title, message, data, priority)
}


