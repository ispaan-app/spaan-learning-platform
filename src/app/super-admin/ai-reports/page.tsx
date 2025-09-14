import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiReportsManagement } from '@/components/super-admin/AiReportsManagement'

export default function AiReportsPage() {
  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Reports</h1>
          <p className="text-gray-600 mt-2">
            Generate AI-powered summaries and insights from platform data
          </p>
        </div>

        <AiReportsManagement />
      </div>
    </AdminLayout>
  )
}





