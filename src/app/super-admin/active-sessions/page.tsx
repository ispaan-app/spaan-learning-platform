import { AdminLayout } from '@/components/admin/AdminLayout'
import { ActiveSessionsManagement } from '@/components/super-admin/ActiveSessionsManagement'

export default function ActiveSessionsPage() {
  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active Sessions</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage currently active user sessions for security
          </p>
        </div>

        <ActiveSessionsManagement />
      </div>
    </AdminLayout>
  )
}



