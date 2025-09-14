import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProjectsProgramsManagement } from '@/components/super-admin/ProjectsProgramsManagement'

export default function ProjectsProgramsPage() {
  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects & Programs</h1>
          <p className="text-gray-600 mt-2">
            Define the core organizational structure and educational programs
          </p>
        </div>

        <ProjectsProgramsManagement />
      </div>
    </AdminLayout>
  )
}




