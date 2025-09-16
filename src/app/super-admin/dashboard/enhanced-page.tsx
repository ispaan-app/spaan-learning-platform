'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { EnhancedDashboardLayout } from '@/components/ui/enhanced-dashboard-layout'
import { EnhancedSuperAdminDashboard } from '@/components/super-admin/EnhancedSuperAdminDashboard'
import { useAuth } from '@/contexts/AuthContext'

export default function EnhancedSuperAdminDashboardPage() {
  const { user } = useAuth()

  return (
    <AdminLayout userRole="super-admin">
      <EnhancedDashboardLayout
        userRole="super-admin"
        userName={user?.displayName || 'Super Administrator'}
        userEmail={user?.email || 'superadmin@example.com'}
      >
        <EnhancedSuperAdminDashboard />
      </EnhancedDashboardLayout>
      
      {/* AI Support Chatbot */}
      <AiChatbot />
    </AdminLayout>
  )
}
