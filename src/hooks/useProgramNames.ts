'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProgramService } from '@/lib/program-service'

interface UseProgramNamesReturn {
  programNames: Record<string, string>
  programNamesList: string[]
  loading: boolean
  error: string | null
  getProgramName: (programId: string) => string
  getProgramId: (programName: string) => Promise<string | null>
  refreshProgramNames: () => Promise<void>
}

export function useProgramNames(): UseProgramNamesReturn {
  const [programNames, setProgramNames] = useState<Record<string, string>>({})
  const [programNamesList, setProgramNamesList] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProgramNames = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [namesMap, namesList] = await Promise.all([
        ProgramService.getProgramNamesMap(),
        ProgramService.getProgramNames()
      ])
      
      setProgramNames(namesMap)
      setProgramNamesList(namesList)
    } catch (err) {
      console.error('Error loading program names:', err)
      setError(err instanceof Error ? err.message : 'Failed to load program names')
    } finally {
      setLoading(false)
    }
  }, [])

  const getProgramName = useCallback((programId: string): string => {
    return programNames[programId] || programId
  }, [programNames])

  const getProgramId = useCallback(async (programName: string): Promise<string | null> => {
    try {
      return await ProgramService.getProgramIdByName(programName)
    } catch (err) {
      console.error('Error getting program ID by name:', err)
      return null
    }
  }, [])

  const refreshProgramNames = useCallback(async () => {
    await loadProgramNames()
  }, [loadProgramNames])

  useEffect(() => {
    loadProgramNames()
  }, [loadProgramNames])

  return {
    programNames,
    programNamesList,
    loading,
    error,
    getProgramName,
    getProgramId,
    refreshProgramNames
  }
}
