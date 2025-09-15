import { db } from './firebase'
import { 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  writeBatch
} from 'firebase/firestore'

export interface SessionData {
  userId: string
  userEmail: string
  userName: string
  userRole: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  operatingSystem: string
  ipAddress: string
  location?: string
  sessionToken: string
  userAgent: string
  isActive: boolean
  sessionStart: any
  lastActivity: any
  createdAt: any
  updatedAt: any
}

class SessionTracker {
  private sessionId: string | null = null
  private userId: string | null = null
  private userEmail: string | null = null
  private userName: string | null = null
  private userRole: string | null = null
  private activityInterval: NodeJS.Timeout | null = null

  // Initialize session tracking
  async initializeSession(userData: {
    userId: string
    userEmail: string
    userName: string
    userRole: string
  }) {
    this.userId = userData.userId
    this.userEmail = userData.userEmail
    this.userName = userData.userName
    this.userRole = userData.userRole

    // Clean up any existing sessions for this user
    await this.cleanupExistingSessions()

    // Create new session
    await this.createSession()
    
    // Start activity tracking
    this.startActivityTracking()
  }

  private async cleanupExistingSessions() {
    if (!this.userId) return

    try {
      const q = query(
        collection(db, 'active-sessions'),
        where('userId', '==', this.userId),
        where('isActive', '==', true)
      )

      const snapshot = await getDocs(q)
      const batch = writeBatch(db)

      snapshot.docs.forEach(docSnapshot => {
        batch.update(docSnapshot.ref, {
          isActive: false,
          endedAt: serverTimestamp(),
          endedBy: 'new-session'
        })
      })

      await batch.commit()
    } catch (error) {
      console.error('Error cleaning up existing sessions:', error)
    }
  }

  private async createSession() {
    if (!this.userId) return

    try {
      this.sessionId = `session_${this.userId}_${Date.now()}`
      
      const sessionData: SessionData = {
        userId: this.userId,
        userEmail: this.userEmail!,
        userName: this.userName!,
        userRole: this.userRole!,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        operatingSystem: this.getOperatingSystem(),
        ipAddress: await this.getIPAddress(),
        sessionToken: this.generateSessionToken(),
        userAgent: navigator.userAgent,
        isActive: true,
        sessionStart: serverTimestamp(),
        lastActivity: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const sessionRef = doc(db, 'active-sessions', this.sessionId)
      await setDoc(sessionRef, sessionData)
      
      console.log('Session created:', this.sessionId)
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  private startActivityTracking() {
    // Update activity every 2 minutes
    this.activityInterval = setInterval(async () => {
      await this.updateActivity()
    }, 2 * 60 * 1000)

    // Also update on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateActivity()
      }
    })

    // Update on page unload
    window.addEventListener('beforeunload', () => {
      this.endSession()
    })
  }

  private async updateActivity() {
    if (!this.sessionId) return

    try {
      const sessionRef = doc(db, 'active-sessions', this.sessionId)
      await updateDoc(sessionRef, {
        lastActivity: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating activity:', error)
    }
  }

  async endSession() {
    if (!this.sessionId) return

    try {
      const sessionRef = doc(db, 'active-sessions', this.sessionId)
      await updateDoc(sessionRef, {
        isActive: false,
        endedAt: serverTimestamp(),
        endedBy: 'user-logout'
      })

      if (this.activityInterval) {
        clearInterval(this.activityInterval)
        this.activityInterval = null
      }

      this.sessionId = null
      console.log('Session ended')
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/tablet|ipad/.test(userAgent)) return 'tablet'
    if (/mobile|android|iphone/.test(userAgent)) return 'mobile'
    if (/desktop|windows|macintosh|linux/.test(userAgent)) return 'desktop'
    
    return 'unknown'
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent
    
    if (userAgent.includes('Chrome')) {
      const version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
      return `Chrome ${version}`
    }
    if (userAgent.includes('Firefox')) {
      const version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
      return `Firefox ${version}`
    }
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown'
      return `Safari ${version}`
    }
    if (userAgent.includes('Edge')) {
      const version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown'
      return `Edge ${version}`
    }
    
    return 'Unknown Browser'
  }

  private getOperatingSystem(): string {
    const userAgent = navigator.userAgent
    
    if (userAgent.includes('Windows NT 10')) return 'Windows 11'
    if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1'
    if (userAgent.includes('Windows NT 6.2')) return 'Windows 8'
    if (userAgent.includes('Windows NT 6.1')) return 'Windows 7'
    if (userAgent.includes('Windows NT 6.0')) return 'Windows Vista'
    if (userAgent.includes('Windows NT 5.1')) return 'Windows XP'
    if (userAgent.includes('Windows NT')) return 'Windows'
    
    if (userAgent.includes('Mac OS X')) {
      const version = userAgent.match(/Mac OS X (\d+_\d+)/)?.[1]?.replace('_', '.') || 'Unknown'
      return `macOS ${version}`
    }
    
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) {
      const version = userAgent.match(/Android (\d+\.?\d*)/)?.[1] || 'Unknown'
      return `Android ${version}`
    }
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      const version = userAgent.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.') || 'Unknown'
      return `iOS ${version}`
    }
    
    return 'Unknown OS'
  }

  private async getIPAddress(): Promise<string> {
    try {
      // Use a simple IP detection service
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || 'Unknown'
    } catch (error) {
      console.error('Error getting IP address:', error)
      return 'Unknown'
    }
  }

  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }
}

// Export singleton instance
export const sessionTracker = new SessionTracker()
