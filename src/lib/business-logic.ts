import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

// Business logic service for critical business rules
export class BusinessLogicService {
  // Stipend calculation business rules
  static calculateStipendEligibility(workHours: number, targetHours: number, program: string): {
    eligible: boolean
    percentage: number
    stipendAmount: number
    reason?: string
  } {
    const percentage = (workHours / targetHours) * 100
    
    // Minimum 50% of target hours required for any stipend
    if (percentage < 50) {
      return {
        eligible: false,
        percentage,
        stipendAmount: 0,
        reason: 'Minimum 50% of target hours required for stipend eligibility'
      }
    }
    
    // Get program-specific stipend amount (mock data - replace with actual program data)
    const programStipends: Record<string, number> = {
      'software-development': 5000,
      'data-science': 4500,
      'cybersecurity': 5500,
      'web-development': 4000,
      'mobile-development': 4500
    }
    
    const baseStipend = programStipends[program] || 4000
    
    // Calculate prorated stipend
    let stipendAmount = 0
    if (percentage >= 100) {
      stipendAmount = baseStipend // Full stipend
    } else if (percentage >= 75) {
      stipendAmount = baseStipend * 0.9 // 90% of full stipend
    } else if (percentage >= 50) {
      stipendAmount = baseStipend * 0.75 // 75% of full stipend
    }
    
    return {
      eligible: true,
      percentage,
      stipendAmount: Math.round(stipendAmount),
      reason: percentage >= 100 ? 'Full stipend eligible' : 'Prorated stipend eligible'
    }
  }

  // Leave request validation business rules
  static async validateLeaveRequest(data: {
    userId: string
    startDate: string
    endDate: string
    type: string
  }): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []
    
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    const today = new Date()
    
    // Basic date validation
    if (startDate < today) {
      errors.push('Leave start date cannot be in the past')
    }
    
    if (endDate <= startDate) {
      errors.push('Leave end date must be after start date')
    }
    
    // Maximum leave duration (30 days)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 30) {
      errors.push('Leave period cannot exceed 30 days')
    }
    
    // Check for overlapping leave requests
    try {
      const existingRequests = await adminDb
        .collection('leaveRequests')
        .where('userId', '==', data.userId)
        .where('status', 'in', ['pending', 'approved'])
        .get()
      
      for (const doc of existingRequests.docs) {
        const request = doc.data()
        const existingStart = request.startDate.toDate()
        const existingEnd = request.endDate.toDate()
        
        // Check for overlap
        if (
          (startDate >= existingStart && startDate <= existingEnd) ||
          (endDate >= existingStart && endDate <= existingEnd) ||
          (startDate <= existingStart && endDate >= existingEnd)
        ) {
          errors.push(`Overlapping leave request found: ${existingStart.toDateString()} - ${existingEnd.toDateString()}`)
        }
      }
    } catch (error) {
      console.error('Error checking overlapping leave requests:', error)
      warnings.push('Could not verify for overlapping leave requests')
    }
    
    // Check leave balance
    try {
      const userDoc = await adminDb.collection('users').doc(data.userId).get()
      if (userDoc.exists) {
        const userData = userDoc.data()
        const usedLeaveDays = userData?.usedLeaveDays || 0
        const totalLeaveDays = userData?.totalLeaveDays || 21 // Default 21 days per year
        
        if (usedLeaveDays + daysDiff > totalLeaveDays) {
          warnings.push(`This request would exceed your annual leave balance (${totalLeaveDays - usedLeaveDays} days remaining)`)
        }
      }
    } catch (error) {
      console.error('Error checking leave balance:', error)
      warnings.push('Could not verify leave balance')
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Attendance validation business rules
  static validateAttendance(data: {
    checkInTime: Date
    checkOutTime?: Date
    locationType: 'work' | 'class'
    userId: string
  }): {
    valid: boolean
    errors: string[]
    warnings: string[]
    workHours?: number
  } {
    const errors: string[] = []
    const warnings: string[] = []
    
    const now = new Date()
    const checkIn = new Date(data.checkInTime)
    
    // Check-in validation
    if (checkIn > now) {
      errors.push('Check-in time cannot be in the future')
    }
    
    // Check if check-in is within business hours (8 AM - 6 PM)
    const checkInHour = checkIn.getHours()
    if (checkInHour < 8 || checkInHour > 18) {
      warnings.push('Check-in is outside normal business hours (8 AM - 6 PM)')
    }
    
    // Check-out validation
    if (data.checkOutTime) {
      const checkOut = new Date(data.checkOutTime)
      
      if (checkOut <= checkIn) {
        errors.push('Check-out time must be after check-in time')
      }
      
      if (checkOut > now) {
        errors.push('Check-out time cannot be in the future')
      }
      
      // Calculate work hours
      const workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
      
      // Validate work hours
      if (workHours < 0.5) {
        warnings.push('Work session is less than 30 minutes')
      } else if (workHours > 12) {
        warnings.push('Work session exceeds 12 hours - please verify times')
      } else if (workHours > 8) {
        warnings.push('Work session exceeds 8 hours - overtime may apply')
      }
      
      return {
        valid: errors.length === 0,
        errors,
        warnings,
        workHours: Math.round(workHours * 10) / 10
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Program enrollment validation
  static async validateProgramEnrollment(data: {
    userId: string
    programId: string
  }): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Check if user exists and get their data
      const userDoc = await adminDb.collection('users').doc(data.userId).get()
      if (!userDoc.exists) {
        errors.push('User not found')
        return { valid: false, errors, warnings }
      }
      
      const userData = userDoc.data()
      
      // Check if user is already enrolled in a program
      if (userData?.program) {
        errors.push('User is already enrolled in a program')
      }
      
      // Check if user has completed required prerequisites
      const programDoc = await adminDb.collection('programs').doc(data.programId).get()
      if (!programDoc.exists) {
        errors.push('Program not found')
        return { valid: false, errors, warnings }
      }
      
      const programData = programDoc.data()
      
      // Check program capacity
      const enrolledLearners = await adminDb
        .collection('users')
        .where('program', '==', data.programId)
        .get()
      
      if (enrolledLearners.size >= (programData?.maxParticipants || 50)) {
        errors.push('Program is at maximum capacity')
      }
      
      // Check program start date
      if (programData?.startDate) {
        const startDate = programData.startDate.toDate()
        const today = new Date()
        
        if (startDate < today) {
          warnings.push('Program has already started')
        }
      }
      
      // Check if user meets minimum requirements
      if (programData?.requirements) {
        const userSkills = userData?.skills || []
        const missingRequirements = programData.requirements.filter(
          (req: string) => !userSkills.includes(req)
        )
        
        if (missingRequirements.length > 0) {
          warnings.push(`Missing requirements: ${missingRequirements.join(', ')}`)
        }
      }
      
    } catch (error) {
      console.error('Error validating program enrollment:', error)
      errors.push('Could not validate program enrollment')
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Issue priority calculation
  static calculateIssuePriority(data: {
    category: string
    description: string
    userId: string
    userRole: string
  }): 'low' | 'medium' | 'high' | 'urgent' {
    const { category, description, userRole } = data
    const descriptionLower = description.toLowerCase()
    
    // Urgent criteria
    if (
      category === 'stipend' ||
      descriptionLower.includes('payment') ||
      descriptionLower.includes('urgent') ||
      descriptionLower.includes('emergency') ||
      userRole === 'super-admin'
    ) {
      return 'urgent'
    }
    
    // High priority criteria
    if (
      category === 'technical' ||
      descriptionLower.includes('login') ||
      descriptionLower.includes('access') ||
      descriptionLower.includes('error') ||
      userRole === 'admin'
    ) {
      return 'high'
    }
    
    // Medium priority criteria
    if (
      category === 'placement' ||
      category === 'attendance' ||
      descriptionLower.includes('question') ||
      descriptionLower.includes('help')
    ) {
      return 'medium'
    }
    
    // Default to low priority
    return 'low'
  }

  // Data integrity checks
  static async validateDataIntegrity(): Promise<{
    valid: boolean
    issues: Array<{
      type: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      message: string
      affectedRecords: number
    }>
  }> {
    const issues: Array<{
      type: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      message: string
      affectedRecords: number
    }> = []
    
    try {
      // Check for orphaned records
      const usersSnapshot = await adminDb.collection('users').get()
      const learnerProfilesSnapshot = await adminDb.collection('learnerProfiles').get()
      
      // Check for users without learner profiles
      const usersWithoutProfiles = usersSnapshot.docs.filter(userDoc => {
        const userData = userDoc.data()
        return userData.role === 'learner' && !learnerProfilesSnapshot.docs.find(profileDoc => 
          profileDoc.id === userDoc.id
        )
      })
      
      if (usersWithoutProfiles.length > 0) {
        issues.push({
          type: 'orphaned_records',
          severity: 'high',
          message: 'Learners without corresponding profiles',
          affectedRecords: usersWithoutProfiles.length
        })
      }
      
      // Check for invalid program references
      const programsSnapshot = await adminDb.collection('programs').get()
      const programIds = programsSnapshot.docs.map(doc => doc.id)
      
      const invalidProgramRefs = usersSnapshot.docs.filter(userDoc => {
        const userData = userDoc.data()
        return userData.program && !programIds.includes(userData.program)
      })
      
      if (invalidProgramRefs.length > 0) {
        issues.push({
          type: 'invalid_references',
          severity: 'medium',
          message: 'Users with invalid program references',
          affectedRecords: invalidProgramRefs.length
        })
      }
      
      // Check for duplicate email addresses
      const emails = usersSnapshot.docs.map(doc => doc.data().email).filter(Boolean)
      const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index)
      
      if (duplicateEmails.length > 0) {
        issues.push({
          type: 'duplicate_data',
          severity: 'critical',
          message: 'Duplicate email addresses found',
          affectedRecords: duplicateEmails.length
        })
      }
      
    } catch (error) {
      console.error('Error validating data integrity:', error)
      issues.push({
        type: 'validation_error',
        severity: 'high',
        message: 'Could not complete data integrity check',
        affectedRecords: 0
      })
    }
    
    return {
      valid: issues.length === 0,
      issues
    }
  }

  // Performance optimization rules
  static getOptimizedQueryConfig(collection: string, filters: Record<string, any>): {
    useIndex: boolean
    limit: number
    orderBy: string[]
    where: Array<{ field: string; operator: string; value: any }>
  } {
    const config = {
      useIndex: false,
      limit: 50,
      orderBy: [] as string[],
      where: [] as Array<{ field: string; operator: string; value: any }>
    }
    
    // Collection-specific optimizations
    switch (collection) {
      case 'users':
        config.limit = 100
        config.orderBy = ['createdAt', 'desc']
        break
      case 'attendance':
        config.limit = 200
        config.orderBy = ['date', 'desc']
        break
      case 'leaveRequests':
        config.limit = 50
        config.orderBy = ['submittedAt', 'desc']
        break
    }
    
    // Add filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null) {
        config.where.push({
          field,
          operator: '==',
          value
        })
      }
    })
    
    return config
  }
}

// Export individual functions for easier testing
export const {
  calculateStipendEligibility,
  validateLeaveRequest,
  validateAttendance,
  validateProgramEnrollment,
  calculateIssuePriority,
  validateDataIntegrity,
  getOptimizedQueryConfig
} = BusinessLogicService
