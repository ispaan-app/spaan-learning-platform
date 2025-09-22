'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

export interface Program {
  id: string
  name: string
  description?: string
  duration?: string
  level?: string
  available?: boolean
  maxStudents?: number
  requirements?: string[]
  curriculum?: string[]
  createdAt?: string
  updatedAt?: string
}

// Cache for program names to avoid repeated API calls
const programCache = new Map<string, string>()
const programsCache = new Map<string, Program>()

export class ProgramService {
  /**
   * Get program name by ID with caching
   */
  static async getProgramName(programId: string): Promise<string> {
    if (!programId) return 'Unknown Program'
    
    // Check cache first
    if (programCache.has(programId)) {
      return programCache.get(programId)!
    }

    try {
      // Try to get from programs collection
      const programDoc = await getDoc(doc(db, 'programs', programId))
      if (programDoc.exists()) {
        const programData = programDoc.data()
        const programName = programData.name || programId
        programCache.set(programId, programName)
        return programName
      }
    } catch (error) {
      console.error(`Error fetching program ${programId}:`, error)
    }

    // Fallback: return the ID if no program found
    programCache.set(programId, programId)
    return programId
  }

  /**
   * Get multiple program names by IDs
   */
  static async getProgramNames(programIds: string[]): Promise<{ [key: string]: string }> {
    const programNames: { [key: string]: string } = {}
    const uncachedIds: string[] = []

    // Check cache for each ID
    for (const id of programIds) {
      if (programCache.has(id)) {
        programNames[id] = programCache.get(id)!
      } else {
        uncachedIds.push(id)
      }
    }

    // Fetch uncached programs in parallel
    if (uncachedIds.length > 0) {
      const promises = uncachedIds.map(async (id) => {
        try {
          const programDoc = await getDoc(doc(db, 'programs', id))
          if (programDoc.exists()) {
            const programData = programDoc.data()
            const programName = programData.name || id
            programCache.set(id, programName)
            programNames[id] = programName
          } else {
            programCache.set(id, id)
            programNames[id] = id
          }
        } catch (error) {
          console.error(`Error fetching program ${id}:`, error)
          programCache.set(id, id)
          programNames[id] = id
        }
      })

      await Promise.all(promises)
    }

    return programNames
  }

  /**
   * Get all programs
   */
  static async getAllPrograms(): Promise<Program[]> {
    try {
      const programsSnapshot = await getDocs(collection(db, 'programs'))
      const programs = programsSnapshot.docs.map(doc => {
        const data = doc.data()
        const program: Program = {
          id: doc.id,
          name: data.name || doc.id,
          description: data.description || '',
          duration: data.duration || '',
          level: data.level || '',
          available: data.available !== undefined ? data.available : true,
          maxStudents: data.maxStudents || 0,
          requirements: data.requirements || [],
          curriculum: data.curriculum || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
        
        // Cache the program
        programsCache.set(doc.id, program)
        programCache.set(doc.id, program.name)
        
        return program
      })

      return programs
    } catch (error) {
      console.error('Error fetching all programs:', error)
      return []
    }
  }

  /**
   * Get program by ID
   */
  static async getProgram(programId: string): Promise<Program | null> {
    if (!programId) return null

    // Check cache first
    if (programsCache.has(programId)) {
      return programsCache.get(programId)!
    }

    try {
      const programDoc = await getDoc(doc(db, 'programs', programId))
      if (programDoc.exists()) {
        const data = programDoc.data()
        const program: Program = {
          id: programDoc.id,
          name: data.name || programDoc.id,
          description: data.description || '',
          duration: data.duration || '',
          level: data.level || '',
          available: data.available !== undefined ? data.available : true,
          maxStudents: data.maxStudents || 0,
          requirements: data.requirements || [],
          curriculum: data.curriculum || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
        
        // Cache the program
        programsCache.set(programId, program)
        programCache.set(programId, program.name)
        
        return program
      }
    } catch (error) {
      console.error(`Error fetching program ${programId}:`, error)
    }

    return null
  }

  /**
   * Clear cache (useful for testing or when programs are updated)
   */
  static clearCache(): void {
    programCache.clear()
    programsCache.clear()
  }

  /**
   * Get cached program name (synchronous)
   */
  static getCachedProgramName(programId: string): string {
    return programCache.get(programId) || programId
  }
}

// Hook for React components
export function useProgramNames(programIds: string[]) {
  const [programNames, setProgramNames] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgramNames = async () => {
      setLoading(true)
      try {
        const names = await ProgramService.getProgramNames(programIds)
        setProgramNames(names)
      } catch (error) {
        console.error('Error fetching program names:', error)
        // Fallback to IDs
        const fallbackNames: { [key: string]: string } = {}
        programIds.forEach(id => {
          fallbackNames[id] = id
        })
        setProgramNames(fallbackNames)
      } finally {
        setLoading(false)
      }
    }

    if (programIds.length > 0) {
      fetchProgramNames()
    } else {
      setLoading(false)
    }
  }, [programIds.join(',')])

  return { programNames, loading }
}

// Hook for single program name
export function useProgramName(programId: string) {
  const [programName, setProgramName] = useState<string>(programId)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgramName = async () => {
      setLoading(true)
      try {
        const name = await ProgramService.getProgramName(programId)
        setProgramName(name)
      } catch (error) {
        console.error('Error fetching program name:', error)
        setProgramName(programId)
      } finally {
        setLoading(false)
      }
    }

    if (programId) {
      fetchProgramName()
    } else {
      setLoading(false)
    }
  }, [programId])

  return { programName, loading }
}
