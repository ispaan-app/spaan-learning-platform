'use server'

import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import bcrypt from 'bcryptjs'

export interface AttendanceRecord {
  id?: string
  userId: string
  checkInTime: Date
  checkOutTime?: Date | null
  placementId?: string
  sessionId?: string
  locationType: 'work' | 'class'
  selfieData?: string
  qrCodeData?: string
  verified: boolean
  createdAt: Date
}

export interface CheckInStatus {
  isCheckedIn: boolean
  lastRecord?: AttendanceRecord
  canCheckIn: boolean
}

export async function getCheckInStatus(userId: string): Promise<CheckInStatus> {
  try {
    const attendanceRef = collection(db, 'attendance')
    const q = query(
      attendanceRef,
      where('userId', '==', userId),
      orderBy('checkInTime', 'desc'),
      limit(1)
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return {
        isCheckedIn: false,
        canCheckIn: true
      }
    }
    
    const lastRecord = snapshot.docs[0].data() as AttendanceRecord
    const isCheckedIn = !lastRecord.checkOutTime
    
    return {
      isCheckedIn,
      lastRecord,
      canCheckIn: !isCheckedIn
    }
  } catch (error) {
    console.error('Error getting check-in status:', error)
    return {
      isCheckedIn: false,
      canCheckIn: true
    }
  }
}

export async function verifyPin(userId: string, pin: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return false
    }
    
    const userData = userDoc.data()
    const hashedPin = userData.pin
    
    if (!hashedPin) {
      return false
    }
    
    return await bcrypt.compare(pin, hashedPin)
  } catch (error) {
    console.error('Error verifying PIN:', error)
    return false
  }
}

export async function createAttendanceRecord(record: Omit<AttendanceRecord, 'id' | 'createdAt'>): Promise<string> {
  try {
    const attendanceRef = collection(db, 'attendance')
    const docRef = await addDoc(attendanceRef, {
      ...record,
      createdAt: new Date()
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error creating attendance record:', error)
    throw new Error('Failed to create attendance record')
  }
}

export async function checkOut(userId: string): Promise<boolean> {
  try {
    const attendanceRef = collection(db, 'attendance')
    const q = query(
      attendanceRef,
      where('userId', '==', userId),
      where('checkOutTime', '==', null),
      orderBy('checkInTime', 'desc'),
      limit(1)
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return false
    }
    
    const recordRef = doc(db, 'attendance', snapshot.docs[0].id)
    await updateDoc(recordRef, {
      checkOutTime: new Date()
    })
    
    return true
  } catch (error) {
    console.error('Error checking out:', error)
    return false
  }
}

export async function getTodaysLocations(userId: string): Promise<{
  workPlacement?: any
  classSessions: any[]
}> {
  try {
    // Get user's work placement
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    let workPlacement = null
    if (userDoc.exists()) {
      const userData = userDoc.data()
      if (userData.placementId) {
        const placementRef = doc(db, 'placements', userData.placementId)
        const placementDoc = await getDoc(placementRef)
        if (placementDoc.exists()) {
          workPlacement = { id: placementDoc.id, ...placementDoc.data() }
        }
      }
    }
    
    // Get today's class sessions for the user's program
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    const sessionsRef = collection(db, 'classSessions')
    const sessionsQuery = query(
      sessionsRef,
      where('date', '>=', startOfDay),
      where('date', '<', endOfDay),
      where('program', '==', userDoc?.data()?.program || '')
    )
    
    const sessionsSnapshot = await getDocs(sessionsQuery)
    const classSessions = sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return {
      workPlacement,
      classSessions
    }
  } catch (error) {
    console.error('Error getting today\'s locations:', error)
    return {
      classSessions: []
    }
  }
}

export async function verifyQRCode(qrCodeData: string, locationId: string, locationType: 'work' | 'class'): Promise<boolean> {
  try {
    if (locationType === 'work') {
      const placementRef = doc(db, 'placements', locationId)
      const placementDoc = await getDoc(placementRef)
      
      if (!placementDoc.exists()) {
        return false
      }
      
      const placementData = placementDoc.data()
      return placementData.qrCodeData === qrCodeData
    } else {
      const sessionRef = doc(db, 'classSessions', locationId)
      const sessionDoc = await getDoc(sessionRef)
      
      if (!sessionDoc.exists()) {
        return false
      }
      
      const sessionData = sessionDoc.data()
      return sessionData.qrCodeData === qrCodeData
    }
  } catch (error) {
    console.error('Error verifying QR code:', error)
    return false
  }
}



