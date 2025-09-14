import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface LearnerActivity {
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

export type LearnerActionType = 
  | 'check_in'
  | 'check_out'
  | 'hours_logged'
  | 'leave_requested'
  | 'leave_approved'
  | 'leave_rejected'
  | 'placement_started'
  | 'placement_completed'
  | 'issue_reported'
  | 'issue_resolved'
  | 'profile_updated'
  | 'document_uploaded'
  | 'session_attended'
  | 'session_missed'
  | 'goal_achieved'
  | 'milestone_reached'

export class LearnerActivityService {
  private static instance: LearnerActivityService
  private unsubscribeCallbacks: Map<string, () => void> = new Map()

  static getInstance(): LearnerActivityService {
    if (!LearnerActivityService.instance) {
      LearnerActivityService.instance = new LearnerActivityService()
    }
    return LearnerActivityService.instance
  }

  // Log a new learner activity
  async logActivity(activity: Omit<LearnerActivity, 'id' | 'timestamp'>): Promise<string> {
    try {
      const activityData = {
        ...activity,
        timestamp: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'learner-activities'), activityData)
      return docRef.id
    } catch (error) {
      console.error('Error logging learner activity:', error)
      throw error
    }
  }

  // Get recent learner activities
  async getRecentActivities(limitCount: number = 20): Promise<LearnerActivity[]> {
    try {
      const activitiesRef = collection(db, 'learner-activities')
      const q = query(
        activitiesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LearnerActivity))
    } catch (error) {
      console.error('Error fetching learner activities:', error)
      return []
    }
  }

  // Get activities for a specific learner
  async getLearnerActivities(learnerId: string, limitCount: number = 50): Promise<LearnerActivity[]> {
    try {
      const activitiesRef = collection(db, 'learner-activities')
      const q = query(
        activitiesRef,
        where('learnerId', '==', learnerId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LearnerActivity))
    } catch (error) {
      console.error('Error fetching learner activities:', error)
      return []
    }
  }

  // Get activities by action type
  async getActivitiesByAction(action: LearnerActionType, limitCount: number = 50): Promise<LearnerActivity[]> {
    try {
      const activitiesRef = collection(db, 'learner-activities')
      const q = query(
        activitiesRef,
        where('action', '==', action),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LearnerActivity))
    } catch (error) {
      console.error('Error fetching activities by action:', error)
      return []
    }
  }

  // Subscribe to real-time learner activities
  subscribeToLearnerActivities(
    callback: (activities: LearnerActivity[]) => void,
    errorCallback?: (error: Error) => void,
    limitCount: number = 20
  ): () => void {
    const activitiesRef = collection(db, 'learner-activities')
    const q = query(
      activitiesRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const activities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as LearnerActivity))
        callback(activities)
      },
      (error) => {
        console.error('Error subscribing to learner activities:', error)
        if (errorCallback) {
          errorCallback(error)
        }
      }
    )

    this.unsubscribeCallbacks.set('learner-activities', unsubscribe)
    return unsubscribe
  }

  // Subscribe to activities for a specific learner
  subscribeToLearnerActivitiesById(
    learnerId: string,
    callback: (activities: LearnerActivity[]) => void,
    errorCallback?: (error: Error) => void,
    limitCount: number = 50
  ): () => void {
    const activitiesRef = collection(db, 'learner-activities')
    const q = query(
      activitiesRef,
      where('learnerId', '==', learnerId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const activities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as LearnerActivity))
        callback(activities)
      },
      (error) => {
        console.error('Error subscribing to learner activities:', error)
        if (errorCallback) {
          errorCallback(error)
        }
      }
    )

    this.unsubscribeCallbacks.set(`learner-activities-${learnerId}`, unsubscribe)
    return unsubscribe
  }

  // Helper methods for common activities
  async logCheckIn(learnerId: string, learnerName: string, learnerEmail: string, location?: string): Promise<string> {
    return this.logActivity({
      learnerId,
      learnerName,
      learnerEmail,
      action: 'check_in',
      details: `Checked in at ${location || 'workplace'}`,
      location,
      status: 'completed'
    })
  }

  async logCheckOut(learnerId: string, learnerName: string, learnerEmail: string, hoursWorked?: number, location?: string): Promise<string> {
    return this.logActivity({
      learnerId,
      learnerName,
      learnerEmail,
      action: 'check_out',
      details: `Checked out${hoursWorked ? ` after ${hoursWorked} hours` : ''} from ${location || 'workplace'}`,
      location,
      metadata: { hoursWorked },
      status: 'completed'
    })
  }

  async logHoursLogged(learnerId: string, learnerName: string, learnerEmail: string, hours: number, date: string): Promise<string> {
    return this.logActivity({
      learnerId,
      learnerName,
      learnerEmail,
      action: 'hours_logged',
      details: `Logged ${hours} hours for ${date}`,
      metadata: { hours, date },
      status: 'completed'
    })
  }

  async logLeaveRequest(learnerId: string, learnerName: string, learnerEmail: string, leaveType: string, startDate: string, endDate: string): Promise<string> {
    return this.logActivity({
      learnerId,
      learnerName,
      learnerEmail,
      action: 'leave_requested',
      details: `Requested ${leaveType} leave from ${startDate} to ${endDate}`,
      metadata: { leaveType, startDate, endDate },
      status: 'pending'
    })
  }

  async logPlacementStart(learnerId: string, learnerName: string, learnerEmail: string, companyName: string, position: string): Promise<string> {
    return this.logActivity({
      learnerId,
      learnerName,
      learnerEmail,
      action: 'placement_started',
      details: `Started placement at ${companyName} as ${position}`,
      metadata: { companyName, position },
      status: 'active'
    })
  }

  async logIssueReport(learnerId: string, learnerName: string, learnerEmail: string, issueType: string, description: string): Promise<string> {
    return this.logActivity({
      learnerId,
      learnerName,
      learnerEmail,
      action: 'issue_reported',
      details: `Reported ${issueType}: ${description}`,
      metadata: { issueType, description },
      status: 'pending'
    })
  }

  async logProfileUpdate(learnerId: string, learnerName: string, learnerEmail: string, updatedFields: string[]): Promise<string> {
    return this.logActivity({
      learnerId,
      learnerName,
      learnerEmail,
      action: 'profile_updated',
      details: `Updated profile: ${updatedFields.join(', ')}`,
      metadata: { updatedFields },
      status: 'completed'
    })
  }

  async logDocumentUpload(learnerId: string, learnerName: string, learnerEmail: string, documentType: string, fileName: string): Promise<string> {
    return this.logActivity({
      learnerId,
      learnerName,
      learnerEmail,
      action: 'document_uploaded',
      details: `Uploaded ${documentType}: ${fileName}`,
      metadata: { documentType, fileName },
      status: 'completed'
    })
  }

  async logSessionAttendance(learnerId: string, learnerName: string, learnerEmail: string, sessionType: string, attended: boolean): Promise<string> {
    return this.logActivity({
      learnerId,
      learnerName,
      learnerEmail,
      action: attended ? 'session_attended' : 'session_missed',
      details: `${attended ? 'Attended' : 'Missed'} ${sessionType} session`,
      metadata: { sessionType, attended },
      status: attended ? 'completed' : 'error'
    })
  }

  async logGoalAchievement(learnerId: string, learnerName: string, learnerEmail: string, goalDescription: string): Promise<string> {
    return this.logActivity({
      learnerId,
      learnerName,
      learnerEmail,
      action: 'goal_achieved',
      details: `Achieved goal: ${goalDescription}`,
      metadata: { goalDescription },
      status: 'completed'
    })
  }

  // Cleanup method
  cleanup(): void {
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe())
    this.unsubscribeCallbacks.clear()
  }
}

export const learnerActivityService = LearnerActivityService.getInstance()
