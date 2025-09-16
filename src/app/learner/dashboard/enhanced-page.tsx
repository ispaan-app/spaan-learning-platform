'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { EnhancedDashboardLayout } from '@/components/ui/enhanced-dashboard-layout'
import { EnhancedLearnerDashboard } from '@/components/learner/EnhancedLearnerDashboard'
import { useAuth } from '@/contexts/AuthContext'

export default function EnhancedLearnerDashboardPage() {
  const { user } = useAuth()

  return (
    <AdminLayout userRole="learner">
      <EnhancedDashboardLayout
        userRole="learner"
        userName={user?.displayName || 'Learner'}
        userEmail={user?.email || 'learner@example.com'}
      >
        <EnhancedLearnerDashboard />
      </EnhancedDashboardLayout>
      
      {/* AI Support Chatbot */}
      <AiChatbot />
    </AdminLayout>
  )
}
