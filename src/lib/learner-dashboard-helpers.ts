import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'

export interface UpcomingSession {
  id: string
  title: string
  date: string
  time: string
  location?: string
  facilitator: string
  type: 'training' | 'workshop' | 'meeting'
  status: 'scheduled' | 'cancelled' | 'completed'
}

export interface PlacementInfo {
  id: string
  companyName: string
  position: string
  status: 'active' | 'inactive' | 'on_leave' | 'completed'
  startDate: string
  endDate?: string
  supervisorName?: string
  supervisorEmail?: string
  supervisorPhone?: string
}

export interface LearnerDashboardData {
  monthlyHours: number
  targetHours: number
  upcomingSessions: UpcomingSession[]
  placementInfo: PlacementInfo | null
  userProfile: {
    displayName: string
    email: string
    avatar?: string
  }
  learnerProfile: {
    id?: string
    userId: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    suburb: string
    city: string
    province: string
    postalCode: string
    dateOfBirth: string
    gender: 'male' | 'female'
    idNumber: string
    nationality: string
    program: string
    programStartDate: string
    programEndDate: string
    studentNumber: string
    profileImage?: string
    emergencyContact: {
      name: string
      phone: string
      relationship: string
      email?: string
    }
    skills: string[]
    interests: string[]
    languages: string[]
    workExperience: {
      company: string
      position: string
      startDate: string
      endDate?: string
      description: string
    }[]
    education: {
      institution: string
      qualification: string
      startDate: string
      endDate?: string
      status: 'completed' | 'in-progress' | 'cancelled'
    }[]
    preferences: {
      notifications: {
        email: boolean
        sms: boolean
        push: boolean
      }
      privacy: {
        showProfile: boolean
        showContact: boolean
        showSkills: boolean
      }
    }
    createdAt: Date
    updatedAt: Date
  } | null
}

export async function getLearnerDashboardData(userId: string): Promise<LearnerDashboardData> {
  try {
    // Get current month's hours
    const now = new Date()
    const monthlyHours = await getLearnerMonthlyHours(userId, now.getFullYear(), now.getMonth() + 1)
    
    // Get upcoming sessions
    const upcomingSessions = await getUpcomingSessions(userId)
    
    // Get placement information
    const placementInfo = await getPlacementInfo(userId)
    
    // Get user profile
    const userProfile = await getUserProfile(userId)
    
    // Get learner profile
    const learnerProfile = await getLearnerProfile(userId)
    
    return {
      monthlyHours,
      targetHours: 160, // Default target hours
      upcomingSessions,
      placementInfo,
      userProfile,
      learnerProfile
    }
  } catch (error) {
    console.error('Error fetching learner dashboard data:', error)
    throw new Error('Failed to fetch dashboard data')
  }
}

async function getLearnerMonthlyHours(learnerId: string, year: number, month: number): Promise<number> {
  try {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const attendanceRef = collection(db, 'attendance')
    const attendanceQuery = query(
      attendanceRef,
      where('userId', '==', learnerId),
      where('checkInTime', '>=', startDate),
      where('checkInTime', '<=', endDate),
      where('checkOutTime', '!=', null)
    )

    const attendanceSnapshot = await getDocs(attendanceQuery)
    
    let totalHours = 0
    attendanceSnapshot.forEach(doc => {
      const data = doc.data()
      if (data.checkInTime && data.checkOutTime) {
        const checkIn = data.checkInTime.toDate()
        const checkOut = data.checkOutTime.toDate()
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
        totalHours += hours
      }
    })

    return Math.round(totalHours * 10) / 10
  } catch (error) {
    console.error('Error getting monthly hours:', error)
    return 0
  }
}

async function getUpcomingSessions(userId: string): Promise<UpcomingSession[]> {
  try {
    const today = new Date()
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const sessionsQuery = query(
      collection(db, 'classSessions'),
      where('date', '>=', today),
      where('date', '<=', nextMonth),
      where('participants', 'array-contains', userId),
      orderBy('date', 'asc'),
      limit(10)
    )
    
    const snapshot = await getDocs(sessionsQuery)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      const sessionDate = data.date.toDate()
      
      return {
        id: doc.id,
        title: data.title,
        date: sessionDate.toLocaleDateString(),
        time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: data.location,
        facilitator: data.instructor || data.facilitator,
        type: data.type || 'training',
        status: data.status || 'scheduled'
      }
    })
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error)
    return []
  }
}

async function getPlacementInfo(userId: string): Promise<PlacementInfo | null> {
  try {
    const placementQuery = query(
      collection(db, 'placements'),
      where('learnerId', '==', userId),
      where('status', 'in', ['active', 'on_leave']),
      orderBy('startDate', 'desc'),
      limit(1)
    )
    
    const snapshot = await getDocs(placementQuery)
    
    if (snapshot.empty) {
      return null
    }
    
    const data = snapshot.docs[0].data()
    
    return {
      id: snapshot.docs[0].id,
      companyName: data.companyName,
      position: data.position,
      status: data.status,
      startDate: data.startDate.toDate().toLocaleDateString(),
      endDate: data.endDate?.toDate().toLocaleDateString(),
      supervisorName: data.supervisorName,
      supervisorEmail: data.supervisorEmail,
      supervisorPhone: data.supervisorPhone
    }
  } catch (error) {
    console.error('Error fetching placement info:', error)
    return null
  }
}

async function getLearnerProfile(userId: string): Promise<any> {
  try {
    const profileDoc = await getDoc(doc(db, 'learnerProfiles', userId))
    
    if (!profileDoc.exists()) {
      return null
    }

    const data = profileDoc.data()
    return {
      id: profileDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    }
  } catch (error) {
    console.error('Error fetching learner profile:', error)
    return null
  }
}

async function getUserProfile(userId: string): Promise<{ displayName: string; email: string; avatar?: string }> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (!userDoc.exists()) {
      throw new Error('User not found')
    }
    
    const userData = userDoc.data()
    
    // Try to get more detailed name from learner profile if it exists
    let displayName = userData.displayName || userData.name || 'Learner'
    
    try {
      const learnerProfileDoc = await getDoc(doc(db, 'learnerProfiles', userId))
      if (learnerProfileDoc.exists()) {
        const learnerData = learnerProfileDoc.data()
        if (learnerData.firstName && learnerData.lastName) {
          displayName = `${learnerData.firstName} ${learnerData.lastName}`
        } else if (learnerData.firstName) {
          displayName = learnerData.firstName
        }
      }
    } catch (profileError) {
      // If learner profile doesn't exist or has an error, continue with user data
      console.log('No learner profile found, using user data')
    }
    
    return {
      displayName,
      email: userData.email || '',
      avatar: userData.avatar || userData.photoURL
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return {
      displayName: 'Learner',
      email: '',
      avatar: undefined
    }
  }
}
