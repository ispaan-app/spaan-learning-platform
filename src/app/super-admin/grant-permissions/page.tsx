import { AdminLayout } from '@/components/admin/AdminLayout'
import { GrantPermissionsManagement } from '@/components/super-admin/GrantPermissionsManagement'

export default function GrantPermissionsPage() {
  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grant Permissions</h1>
          <p className="text-gray-600 mt-2">
            Elevate user privileges and create new admin accounts
          </p>
        </div>

        <GrantPermissionsManagement />
      </div>
    </AdminLayout>
  )
}





