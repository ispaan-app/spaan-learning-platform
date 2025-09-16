'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import SuperAdminInbox from '@/components/super-admin/SuperAdminInbox'
import { useAuth } from '@/hooks/useAuth'

export default function SuperAdminInboxPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <AdminLayout userRole="super-admin">
      <SuperAdminInbox />
    </AdminLayout>
  )
}
