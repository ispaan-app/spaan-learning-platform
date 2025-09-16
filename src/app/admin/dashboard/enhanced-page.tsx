'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { EnhancedDashboardLayout } from '@/components/ui/enhanced-dashboard-layout'
import { EnhancedAdminDashboard } from '@/components/admin/EnhancedAdminDashboard'
import { useAuth } from '@/contexts/AuthContext'

export default function EnhancedAdminDashboardPage() {
  const { user } = useAuth()

  return (
    <AdminLayout userRole="admin">
      <EnhancedDashboardLayout
        userRole="admin"
        userName={user?.displayName || 'Administrator'}
        userEmail={user?.email || 'admin@example.com'}
      >
        <EnhancedAdminDashboard />
      </EnhancedDashboardLayout>
      
      {/* AI Support Chatbot */}
      <AiChatbot />
    </AdminLayout>
  )
}
