'use server'

import { adminDb } from '@/lib/firebase-admin'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'

export interface AttendanceRecord {
  id: string
  userId: string
  learnerName: string
  checkInTime: Date
  checkOutTime?: Date
  locationType: 'work' | 'class'
  locationName: string
  placementId?: string
  sessionId?: string
  selfieData?: string
  qrCodeData?: string
  verified: boolean
  totalHours?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface AttendanceStats {
  totalRecords: number
  totalHours: number
  averageHoursPerDay: number
  attendanceRate: number
  onTimeRate: number
  lateArrivals: number
  earlyDepartures: number
  perfectAttendance: number
}

export interface AttendanceFilter {
  learnerId?: string
  locationType?: 'work' | 'class'
  dateFrom?: Date
  dateTo?: Date
  verified?: boolean
  searchTerm?: string
}

export async function getAttendanceRecordsAction(
  page: number = 1,
  limit: number = 20,
  filters: AttendanceFilter = {}
): Promise<{ records: AttendanceRecord[], total: number, stats: AttendanceStats }> {
  try {
    const attendanceRef = adminDb.collection('attendance')
    let query = attendanceRef.orderBy('checkInTime', 'desc')

    // Apply filters
    if (filters.learnerId) {
      query = query.where('userId', '==', filters.learnerId)
    }
    if (filters.locationType) {
      query = query.where('locationType', '==', filters.locationType)
    }
    if (filters.verified !== undefined) {
      query = query.where('verified', '==', filters.verified)
    }

    const snapshot = await query.get()
    let records = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        checkInTime: data.checkInTime?.toDate() || new Date(),
        checkOutTime: data.checkOutTime?.toDate() || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      }
    }) as AttendanceRecord[]

    // Apply date filters
    if (filters.dateFrom) {
      records = records.filter(record => record.checkInTime >= filters.dateFrom!)
    }
    if (filters.dateTo) {
      records = records.filter(record => record.checkInTime <= filters.dateTo!)
    }

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      records = records.filter(record => 
        record.learnerName.toLowerCase().includes(searchTerm) ||
        record.locationName.toLowerCase().includes(searchTerm)
      )
    }

    // Get learner names
    const learnerIds = Array.from(new Set(records.map(r => r.userId)))
    const learnerNames: { [key: string]: string } = {}
    
    for (const learnerId of learnerIds) {
      try {
        const learnerDoc = await adminDb.collection('learnerProfiles').doc(learnerId).get()
        if (learnerDoc.exists) {
          const data = learnerDoc.data()
          learnerNames[learnerId] = `${data?.firstName || ''} ${data?.lastName || ''}`.trim()
        }
      } catch (error) {
        console.error('Error fetching learner name:', error)
      }
    }

    // Add learner names to records
    records = records.map(record => ({
      ...record,
      learnerName: learnerNames[record.userId] || 'Unknown Learner'
    }))

    // Calculate stats
    const stats = calculateAttendanceStats(records)

    // Pagination
    const total = records.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRecords = records.slice(startIndex, endIndex)

    return {
      records: paginatedRecords,
      total,
      stats
    }
  } catch (error) {
    console.error('Error fetching attendance records:', error)
    return {
      records: [],
      total: 0,
      stats: {
        totalRecords: 0,
        totalHours: 0,
        averageHoursPerDay: 0,
        attendanceRate: 0,
        onTimeRate: 0,
        lateArrivals: 0,
        earlyDepartures: 0,
        perfectAttendance: 0
      }
    }
  }
}

export async function getLearnerAttendanceHistoryAction(learnerId: string): Promise<AttendanceRecord[]> {
  try {
    const attendanceRef = adminDb.collection('attendance')
    const snapshot = await attendanceRef
      .where('userId', '==', learnerId)
      .orderBy('checkInTime', 'desc')
      .get()

    const records = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        checkInTime: data.checkInTime?.toDate() || new Date(),
        checkOutTime: data.checkOutTime?.toDate() || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      }
    }) as AttendanceRecord[]

    // Get learner name
    try {
      const learnerDoc = await adminDb.collection('learnerProfiles').doc(learnerId).get()
      if (learnerDoc.exists) {
        const data = learnerDoc.data()
        const learnerName = `${data?.firstName || ''} ${data?.lastName || ''}`.trim()
        return records.map(record => ({ ...record, learnerName }))
      }
    } catch (error) {
      console.error('Error fetching learner name:', error)
    }

    return records.map(record => ({ ...record, learnerName: 'Unknown Learner' }))
  } catch (error) {
    console.error('Error fetching learner attendance history:', error)
    return []
  }
}

export async function updateAttendanceRecordAction(
  recordId: string,
  updates: Partial<AttendanceRecord>
): Promise<{ success: boolean; error?: string }> {
  try {
    const recordRef = adminDb.collection('attendance').doc(recordId)
    
    // Calculate total hours if both check-in and check-out times are provided
    if (updates.checkInTime && updates.checkOutTime) {
      const checkIn = new Date(updates.checkInTime)
      const checkOut = new Date(updates.checkOutTime)
      const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
      updates.totalHours = Math.round(hours * 100) / 100
    }

    await recordRef.update({
      ...updates,
      updatedAt: new Date()
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating attendance record:', error)
    return { success: false, error: 'Failed to update attendance record' }
  }
}

export async function deleteAttendanceRecordAction(recordId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection('attendance').doc(recordId).delete()
    return { success: true }
  } catch (error) {
    console.error('Error deleting attendance record:', error)
    return { success: false, error: 'Failed to delete attendance record' }
  }
}

export async function getAttendanceAnalyticsAction(
  dateFrom: Date,
  dateTo: Date,
  learnerId?: string
): Promise<{
  dailyAttendance: { date: string; count: number; hours: number }[]
  locationStats: { location: string; count: number; hours: number }[]
  learnerStats: { learnerId: string; learnerName: string; totalHours: number; attendanceRate: number }[]
  overallStats: AttendanceStats
}> {
  try {
    const attendanceRef = adminDb.collection('attendance')
    let query = attendanceRef
      .where('checkInTime', '>=', dateFrom)
      .where('checkInTime', '<=', dateTo)

    if (learnerId) {
      query = query.where('userId', '==', learnerId)
    }

    const snapshot = await query.get()
    const records = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        checkInTime: data.checkInTime?.toDate() || new Date(),
        checkOutTime: data.checkOutTime?.toDate() || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      }
    }) as AttendanceRecord[]

    // Daily attendance
    const dailyMap = new Map<string, { count: number; hours: number }>()
    records.forEach(record => {
      const date = record.checkInTime.toISOString().split('T')[0]
      const existing = dailyMap.get(date) || { count: 0, hours: 0 }
      dailyMap.set(date, {
        count: existing.count + 1,
        hours: existing.hours + (record.totalHours || 0)
      })
    })

    const dailyAttendance = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      hours: data.hours
    })).sort((a, b) => a.date.localeCompare(b.date))

    // Location stats
    const locationMap = new Map<string, { count: number; hours: number }>()
    records.forEach(record => {
      const location = record.locationName
      const existing = locationMap.get(location) || { count: 0, hours: 0 }
      locationMap.set(location, {
        count: existing.count + 1,
        hours: existing.hours + (record.totalHours || 0)
      })
    })

    const locationStats = Array.from(locationMap.entries()).map(([location, data]) => ({
      location,
      count: data.count,
      hours: data.hours
    })).sort((a, b) => b.hours - a.hours)

    // Learner stats
    const learnerMap = new Map<string, { name: string; totalHours: number; count: number }>()
    records.forEach(record => {
      const existing = learnerMap.get(record.userId) || { name: record.learnerName, totalHours: 0, count: 0 }
      learnerMap.set(record.userId, {
        name: existing.name,
        totalHours: existing.totalHours + (record.totalHours || 0),
        count: existing.count + 1
      })
    })

    const learnerStats = Array.from(learnerMap.entries()).map(([learnerId, data]) => ({
      learnerId,
      learnerName: data.name,
      totalHours: data.totalHours,
      attendanceRate: Math.min((data.count / 20) * 100, 100) // Assuming 20 working days per month
    })).sort((a, b) => b.totalHours - a.totalHours)

    const overallStats = calculateAttendanceStats(records)

    return {
      dailyAttendance,
      locationStats,
      learnerStats,
      overallStats
    }
  } catch (error) {
    console.error('Error fetching attendance analytics:', error)
    return {
      dailyAttendance: [],
      locationStats: [],
      learnerStats: [],
      overallStats: {
        totalRecords: 0,
        totalHours: 0,
        averageHoursPerDay: 0,
        attendanceRate: 0,
        onTimeRate: 0,
        lateArrivals: 0,
        earlyDepartures: 0,
        perfectAttendance: 0
      }
    }
  }
}

function calculateAttendanceStats(records: AttendanceRecord[]): AttendanceStats {
  if (records.length === 0) {
    return {
      totalRecords: 0,
      totalHours: 0,
      averageHoursPerDay: 0,
      attendanceRate: 0,
      onTimeRate: 0,
      lateArrivals: 0,
      earlyDepartures: 0,
      perfectAttendance: 0
    }
  }

  const totalRecords = records.length
  const totalHours = records.reduce((sum, record) => sum + (record.totalHours || 0), 0)
  const averageHoursPerDay = totalHours / totalRecords

  // Calculate attendance rate (assuming 8 hours per day is full attendance)
  const expectedHours = records.length * 8
  const attendanceRate = expectedHours > 0 ? (totalHours / expectedHours) * 100 : 0

  // Calculate on-time rate (assuming check-in before 9 AM is on-time)
  const onTimeRecords = records.filter(record => {
    const checkInHour = record.checkInTime.getHours()
    return checkInHour < 9
  }).length
  const onTimeRate = (onTimeRecords / totalRecords) * 100

  // Calculate late arrivals (check-in after 9 AM)
  const lateArrivals = records.filter(record => {
    const checkInHour = record.checkInTime.getHours()
    return checkInHour >= 9
  }).length

  // Calculate early departures (check-out before 5 PM)
  const earlyDepartures = records.filter(record => {
    if (!record.checkOutTime) return false
    const checkOutHour = record.checkOutTime.getHours()
    return checkOutHour < 17
  }).length

  // Calculate perfect attendance (8+ hours per day)
  const perfectAttendance = records.filter(record => (record.totalHours || 0) >= 8).length

  return {
    totalRecords,
    totalHours: Math.round(totalHours * 100) / 100,
    averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
    onTimeRate: Math.round(onTimeRate * 100) / 100,
    lateArrivals,
    earlyDepartures,
    perfectAttendance
  }
}
