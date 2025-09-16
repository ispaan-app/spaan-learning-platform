import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import SuperAdminDashboard from '@/components/super-admin/SuperAdminDashboard'

export default function SuperAdminDashboardPage() {
  return (
    <AdminLayout userRole="super-admin">
      <SuperAdminDashboard />
      
      {/* AI Support Chatbot */}
      <AiChatbot />
    </AdminLayout>
  )
}
