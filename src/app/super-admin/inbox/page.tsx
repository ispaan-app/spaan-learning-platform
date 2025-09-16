'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import Inbox from '@/components/notifications/Inbox'
import { useAuth } from '@/hooks/useAuth'

export default function SuperAdminInboxPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <AdminLayout userRole="super-admin">
      <Inbox />
    </AdminLayout>
  )
}
