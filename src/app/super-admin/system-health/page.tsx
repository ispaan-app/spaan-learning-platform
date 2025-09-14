'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { SystemHealthMonitoring } from '@/components/super-admin/SystemHealthMonitoring'

export default function SystemHealthPage() {
  return (
    <AdminLayout userRole="super-admin">
      <SystemHealthMonitoring />
    </AdminLayout>
  )
}
