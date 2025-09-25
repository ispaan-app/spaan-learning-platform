'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import AdminInbox from '@/components/admin/AdminInbox'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminInboxPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <AdminLayout userRole="admin">
      <AdminInbox />
    </AdminLayout>
  )
}








