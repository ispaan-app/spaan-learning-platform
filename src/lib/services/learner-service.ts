import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore'

export interface LearnerStats {
  workHours: number
  targetHours: number
  completedCourses: number
  certificates: number
  upcomingClasses: number
  leaveRequests: number
  pendingDocuments: number
  placementStatus: 'active' | 'inactive' | 'pending'
}

export interface RecentActivity {
  id: string
  type: 'checkin' | 'checkout' | 'leave_request' | 'document_upload' | 'course_completion' | 'placement_update'
  title: string
  description: string
  timestamp: Date
  status: 'success' | 'pending' | 'warning' | 'error'
}

export interface UpcomingClass {
  id: string
  title: string
  date: string
  time: string
  location: string
  instructor: string
  type: 'training' | 'workshop' | 'assessment'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

export interface PlacementInfo {
  id: string
  companyName: string
  position: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'suspended'
  supervisor: string
  contactEmail: string
  address: string
  qrCodeData: string
}

export interface LeaveRequest {
  id: string
  type: 'sick' | 'personal' | 'emergency' | 'other'
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface Document {
  id: string
  name: string
  type: 'id' | 'certificate' | 'contract' | 'medical' | 'other'
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
  fileUrl: string
  notes?: string
}

export class LearnerService {
  static async getLearnerStats(userId: string): Promise<LearnerStats> {
    try {
      // Get work hours from attendance records
      const attendanceRef = collection(db, 'attendance')
      const attendanceQuery = query(
        attendanceRef,
        where('userId', '==', userId),
        where('checkOutTime', '!=', null)
      )
      const attendanceSnapshot = await getDocs(attendanceQuery)
      
      let totalWorkHours = 0
      attendanceSnapshot.forEach(doc => {
        const data = doc.data()
        if (data.checkInTime && data.checkOutTime) {
          const checkIn = data.checkInTime.toDate()
          const checkOut = data.checkOutTime.toDate()
          const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
          totalWorkHours += hours
        }
      })

      // Get user profile for target hours
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      const targetHours = userData?.targetHours || 160 // Default 160 hours

      // Get completed courses
      const coursesRef = collection(db, 'learnerCourses')
      const coursesQuery = query(
        coursesRef,
        where('userId', '==', userId),
        where('status', '==', 'completed')
      )
      const coursesSnapshot = await getDocs(coursesQuery)
      const completedCourses = coursesSnapshot.size

      // Get certificates
      const certificatesRef = collection(db, 'certificates')
      const certificatesQuery = query(
        certificatesRef,
        where('userId', '==', userId),
        where('status', '==', 'issued')
      )
      const certificatesSnapshot = await getDocs(certificatesQuery)
      const certificates = certificatesSnapshot.size

      // Get upcoming classes
      const classesRef = collection(db, 'classSessions')
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const classesQuery = query(
        classesRef,
        where('date', '>=', today),
        where('date', '<=', nextWeek),
        where('participants', 'array-contains', userId)
      )
      const classesSnapshot = await getDocs(classesQuery)
      const upcomingClasses = classesSnapshot.size

      // Get leave requests
      const leaveRef = collection(db, 'leaveRequests')
      const leaveQuery = query(
        leaveRef,
        where('userId', '==', userId)
      )
      const leaveSnapshot = await getDocs(leaveQuery)
      const leaveRequests = leaveSnapshot.size

      // Get pending documents
      const documentsRef = collection(db, 'documents')
      const documentsQuery = query(
        documentsRef,
        where('userId', '==', userId),
        where('status', '==', 'pending')
      )
      const documentsSnapshot = await getDocs(documentsQuery)
      const pendingDocuments = documentsSnapshot.size

      // Get placement status
      let placementStatus: 'active' | 'inactive' | 'pending' = 'inactive'
      if (userData?.placementId) {
        const placementRef = doc(db, 'placements', userData.placementId)
        const placementDoc = await getDoc(placementRef)
        if (placementDoc.exists()) {
          const placementData = placementDoc.data()
          placementStatus = placementData.status || 'active'
        }
      }

      return {
        workHours: Math.round(totalWorkHours * 10) / 10,
        targetHours,
        completedCourses,
        certificates,
        upcomingClasses,
        leaveRequests,
        pendingDocuments,
        placementStatus
      }
    } catch (error) {
      console.error('Error fetching learner stats:', error)
      // Return default values if there's an error
      return {
        workHours: 0,
        targetHours: 160,
        completedCourses: 0,
        certificates: 0,
        upcomingClasses: 0,
        leaveRequests: 0,
        pendingDocuments: 0,
        placementStatus: 'inactive'
      }
    }
  }

  static async getRecentActivity(userId: string): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = []

      // Get recent check-ins
      const attendanceRef = collection(db, 'attendance')
      const attendanceQuery = query(
        attendanceRef,
        where('userId', '==', userId),
        orderBy('checkInTime', 'desc'),
        limit(5)
      )
      const attendanceSnapshot = await getDocs(attendanceQuery)
      
      attendanceSnapshot.forEach(doc => {
        const data = doc.data()
        const checkInTime = data.checkInTime.toDate()
        const isCheckedOut = data.checkOutTime !== null
        
        activities.push({
          id: doc.id,
          type: isCheckedOut ? 'checkout' : 'checkin',
          title: isCheckedOut ? 'Checked out from work' : 'Checked in to work',
          description: isCheckedOut 
            ? `Completed work session at ${data.placementId ? 'work placement' : 'training session'}`
            : `Started work session at ${data.placementId ? 'work placement' : 'training session'}`,
          timestamp: checkInTime,
          status: 'success'
        })
      })

      // Get recent leave requests
      const leaveRef = collection(db, 'leaveRequests')
      const leaveQuery = query(
        leaveRef,
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc'),
        limit(3)
      )
      const leaveSnapshot = await getDocs(leaveQuery)
      
      leaveSnapshot.forEach(doc => {
        const data = doc.data()
        const submittedAt = data.submittedAt.toDate()
        
        activities.push({
          id: doc.id,
          type: 'leave_request',
          title: `Leave request ${data.status}`,
          description: `${data.type} leave for ${data.days} day(s) - ${data.reason}`,
          timestamp: submittedAt,
          status: data.status === 'approved' ? 'success' : 
                 data.status === 'rejected' ? 'error' : 'pending'
        })
      })

      // Get recent document uploads
      const documentsRef = collection(db, 'documents')
      const documentsQuery = query(
        documentsRef,
        where('userId', '==', userId),
        orderBy('uploadedAt', 'desc'),
        limit(3)
      )
      const documentsSnapshot = await getDocs(documentsQuery)
      
      documentsSnapshot.forEach(doc => {
        const data = doc.data()
        const uploadedAt = data.uploadedAt.toDate()
        
        activities.push({
          id: doc.id,
          type: 'document_upload',
          title: `Document ${data.status}`,
          description: `Uploaded ${data.name} - ${data.status}`,
          timestamp: uploadedAt,
          status: data.status === 'approved' ? 'success' : 
                 data.status === 'rejected' ? 'error' : 'pending'
        })
      })

      // Sort by timestamp and return latest 10
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  static async getUpcomingClasses(userId: string): Promise<UpcomingClass[]> {
    try {
      const classesRef = collection(db, 'classSessions')
      const today = new Date()
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      const classesQuery = query(
        classesRef,
        where('date', '>=', today),
        where('date', '<=', nextMonth),
        where('participants', 'array-contains', userId),
        orderBy('date', 'asc')
      )
      const classesSnapshot = await getDocs(classesQuery)
      
      return classesSnapshot.docs.map(doc => {
        const data = doc.data()
        const classDate = data.date.toDate()
        
        return {
          id: doc.id,
          title: data.title,
          date: classDate.toLocaleDateString(),
          time: classDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: data.location,
          instructor: data.instructor,
          type: data.type || 'training',
          status: data.status || 'scheduled'
        }
      })
    } catch (error) {
      console.error('Error fetching upcoming classes:', error)
      return []
    }
  }

  static async getPlacementInfo(userId: string): Promise<PlacementInfo | null> {
    try {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      
      if (!userData?.placementId) {
        return null
      }

      const placementRef = doc(db, 'placements', userData.placementId)
      const placementDoc = await getDoc(placementRef)
      
      if (!placementDoc.exists()) {
        return null
      }

      const placementData = placementDoc.data()
      const startDate = placementData.startDate.toDate()
      const endDate = placementData.endDate.toDate()

      return {
        id: placementDoc.id,
        companyName: placementData.companyName,
        position: placementData.position,
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString(),
        status: placementData.status || 'active',
        supervisor: placementData.supervisor,
        contactEmail: placementData.contactEmail,
        address: placementData.address,
        qrCodeData: placementData.qrCodeData || ''
      }
    } catch (error) {
      console.error('Error fetching placement info:', error)
      return null
    }
  }

  static async getLeaveRequests(userId: string): Promise<LeaveRequest[]> {
    try {
      const leaveRef = collection(db, 'leaveRequests')
      const leaveQuery = query(
        leaveRef,
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
      )
      const leaveSnapshot = await getDocs(leaveQuery)
      
      return leaveSnapshot.docs.map(doc => {
        const data = doc.data()
        const submittedAt = data.submittedAt.toDate()
        const reviewedAt = data.reviewedAt?.toDate()

        return {
          id: doc.id,
          type: data.type,
          startDate: data.startDate,
          endDate: data.endDate,
          days: data.days,
          reason: data.reason,
          status: data.status,
          submittedAt: submittedAt.toLocaleDateString(),
          reviewedAt: reviewedAt?.toLocaleDateString(),
          reviewedBy: data.reviewedBy
        }
      })
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      return []
    }
  }

  static async getDocuments(userId: string): Promise<Document[]> {
    try {
      const documentsRef = collection(db, 'documents')
      const documentsQuery = query(
        documentsRef,
        where('userId', '==', userId),
        orderBy('uploadedAt', 'desc')
      )
      const documentsSnapshot = await getDocs(documentsQuery)
      
      return documentsSnapshot.docs.map(doc => {
        const data = doc.data()
        const uploadedAt = data.uploadedAt.toDate()

        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          status: data.status,
          uploadedAt: uploadedAt.toLocaleDateString(),
          fileUrl: data.fileUrl,
          notes: data.notes
        }
      })
    } catch (error) {
      console.error('Error fetching documents:', error)
      return []
    }
  }

  static async submitLeaveRequest(userId: string, leaveData: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>): Promise<string> {
    try {
      const leaveRef = collection(db, 'leaveRequests')
      const docRef = await addDoc(leaveRef, {
        ...leaveData,
        userId,
        submittedAt: Timestamp.now(),
        status: 'pending'
      })
      return docRef.id
    } catch (error) {
      console.error('Error submitting leave request:', error)
      throw new Error('Failed to submit leave request')
    }
  }

  static async uploadDocument(userId: string, documentData: Omit<Document, 'id' | 'uploadedAt' | 'status'>): Promise<string> {
    try {
      const documentsRef = collection(db, 'documents')
      const docRef = await addDoc(documentsRef, {
        ...documentData,
        userId,
        uploadedAt: Timestamp.now(),
        status: 'pending'
      })
      return docRef.id
    } catch (error) {
      console.error('Error uploading document:', error)
      throw new Error('Failed to upload document')
    }
  }
}



