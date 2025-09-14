import { AdminLayout } from '@/components/admin/AdminLayout'
import { AppearanceManagement } from '@/components/super-admin/AppearanceManagement'

export default function AppearancePage() {
  return (
    <AdminLayout userRole="super-admin">
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -m-6 mb-8 rounded-b-3xl">
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">iS</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Platform <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Appearance</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Customize platform branding, logos, colors, and visual identity to create a unique experience for your users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <AppearanceManagement />
      </div>
    </AdminLayout>
  )
}