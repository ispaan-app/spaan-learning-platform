'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import LearnerInbox from '@/components/learner/LearnerInbox'
import { useAuth } from '@/hooks/useAuth'

export default function LearnerInboxPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <AdminLayout userRole="learner">
      <LearnerInbox />
    </AdminLayout>
  )
}






