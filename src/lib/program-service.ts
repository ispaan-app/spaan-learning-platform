'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'

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
  static async getProgramNamesByIds(programIds: string[]): Promise<{ [key: string]: string }> {
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
   * Create a new program
   */
  static async createProgram(programData: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'programs'), {
        ...programData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      // Clear cache to force refresh
      this.clearCache()
      
      return docRef.id
    } catch (error) {
      console.error('Error creating program:', error)
      throw error
    }
  }

  /**
   * Update a program
   */
  static async updateProgram(programId: string, programData: Partial<Program>): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'programs', programId), {
        ...programData,
        updatedAt: new Date()
      })
      
      // Clear cache to force refresh
      this.clearCache()
      
      return true
    } catch (error) {
      console.error('Error updating program:', error)
      throw error
    }
  }

  /**
   * Delete a program
   */
  static async deleteProgram(programId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'programs', programId))
      
      // Clear cache to force refresh
      this.clearCache()
      
      return true
    } catch (error) {
      console.error('Error deleting program:', error)
      throw error
    }
  }

  /**
   * Get program by name (case-insensitive search)
   */
  static async getProgramByName(name: string): Promise<Program | null> {
    if (!name || name.trim() === '') return null
    
    try {
      const programs = await this.getAllPrograms()
      const normalizedName = name.toLowerCase().trim()
      
      return programs.find(program => 
        program.name.toLowerCase().trim() === normalizedName
      ) || null
    } catch (error) {
      console.error('Error fetching program by name:', error)
      return null
    }
  }

  /**
   * Search programs by name (partial match)
   */
  static async searchProgramsByName(searchTerm: string): Promise<Program[]> {
    if (!searchTerm || searchTerm.trim() === '') {
      return await this.getAllPrograms()
    }
    
    try {
      const programs = await this.getAllPrograms()
      const normalizedSearch = searchTerm.toLowerCase().trim()
      
      return programs.filter(program => 
        program.name.toLowerCase().includes(normalizedSearch) ||
        program.description?.toLowerCase().includes(normalizedSearch)
      )
    } catch (error) {
      console.error('Error searching programs by name:', error)
      return []
    }
  }

  /**
   * Get program ID by name
   */
  static async getProgramIdByName(name: string): Promise<string | null> {
    const program = await this.getProgramByName(name)
    return program?.id || null
  }

  /**
   * Get program names map (ID -> Name)
   */
  static async getProgramNamesMap(): Promise<Record<string, string>> {
    try {
      const programs = await this.getAllPrograms()
      const namesMap: Record<string, string> = {}
      
      programs.forEach(program => {
        namesMap[program.id] = program.name
      })
      
      return namesMap
    } catch (error) {
      console.error('Error getting program names map:', error)
      return {}
    }
  }

  /**
   * Get program names only (for dropdowns, etc.)
   */
  static async getProgramNames(): Promise<string[]> {
    try {
      const programs = await this.getAllPrograms()
      return programs.map(program => program.name).sort()
    } catch (error) {
      console.error('Error getting program names:', error)
      return []
    }
  }

  /**
   * Validate if program name exists
   */
  static async validateProgramName(name: string): Promise<boolean> {
    const program = await this.getProgramByName(name)
    return program !== null
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
        const names = await ProgramService.getProgramNamesByIds(programIds)
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
