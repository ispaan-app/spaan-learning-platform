'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { Inbox } from '@/components/notifications/Inbox'
import { useAuth } from '@/hooks/useAuth'

export default function AdminInboxPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <AdminLayout userRole="admin">
      <Inbox />
    </AdminLayout>
  )
}







