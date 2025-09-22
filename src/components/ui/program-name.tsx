'use client'

import { useProgramName } from '@/lib/program-service'

interface ProgramNameProps {
  programId: string
  fallback?: string
  className?: string
}

export function ProgramName({ programId, fallback, className }: ProgramNameProps) {
  const { programName, loading } = useProgramName(programId)

  if (loading) {
    return <span className={className}>Loading...</span>
  }

  return (
    <span className={className}>
      {programName || fallback || programId}
    </span>
  )
}

export default ProgramName
