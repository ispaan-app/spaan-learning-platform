'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { CreatePlacementForm } from '@/components/admin/create-placement-form'
import { useState, useEffect } from 'react'
import { getProgramsAction } from '../actions'

export default function CreatePlacementPage() {
  const [programs, setPrograms] = useState<Array<{ id: string; name: string; description?: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const data = await getProgramsAction()
        setPrograms(data)
      } catch (error) {
        console.error('Error loading programs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPrograms()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout userRole="admin">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="admin">
      <CreatePlacementForm programs={programs} />
    </AdminLayout>
  )
}

















