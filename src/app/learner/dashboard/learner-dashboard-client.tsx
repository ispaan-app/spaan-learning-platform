'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { WelcomeHeader } from '@/components/learner/welcome-header'
import { MonthlyHoursProgress } from '@/components/shared/monthly-hours-progress'
import { UpcomingSessions } from '@/components/learner/upcoming-sessions'
import { PlacementDetails } from '@/components/learner/placement-details'
import { AiChatbot } from '@/components/ai-chatbot'
import { ProfileCompletionCard } from '@/components/learner/profile-completion-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar, Building2, RefreshCw } from 'lucide-react'
import { LearnerDashboardData } from '@/lib/learner-dashboard-helpers'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LearnerDashboardClientProps {
  initialData: LearnerDashboardData
  user: {
    uid: string
    displayName?: string | null
    email?: string | null
  }
}

export function LearnerDashboardClient({ initialData, user }: LearnerDashboardClientProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // In a real implementation, you would refetch the data here
    // For now, we'll just simulate a refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleLogHours = () => {
    router.push('/learner/check-in')
  }

  return (
    <AdminLayout userRole="learner">
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F0E1 0%, #F5F0E1 50%, #F5F0E1 100%)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-48 translate-x-48" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)' }}></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full translate-y-40 -translate-x-40" style={{ background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full -translate-x-32 -translate-y-32" style={{ background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.15) 0%, rgba(251, 146, 60, 0.15) 100%)' }}></div>
        </div>
        
        <div className="relative space-y-8 p-6">
          {/* Header with Refresh Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back to your learning journey</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Welcome Header */}
          <WelcomeHeader 
            userName={initialData.userProfile.displayName}
            className="mb-6"
          />

          {/* Profile Completion Card */}
          <ProfileCompletionCard 
            profile={initialData.learnerProfile}
            className="mb-6"
          />

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Work Progress */}
            <div className="lg:col-span-2 space-y-8">
              {/* Work-Integrated Learning Progress Card */}
              <Card className="relative overflow-hidden border-0 shadow-2xl rounded-3xl" style={{ background: 'linear-gradient(135deg, #F5F0E1 0%, rgba(16, 185, 129, 0.1) 30%, rgba(6, 182, 212, 0.1) 70%, #F5F0E1 100%)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 backdrop-blur-sm"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full -translate-y-20 translate-x-20 backdrop-blur-sm border border-white/10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-full translate-y-16 -translate-x-16 backdrop-blur-sm border border-white/10"></div>
                
                <CardContent className="relative p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-6">
                      <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl backdrop-blur-sm shadow-lg border border-emerald-400/30">
                        <Clock className="h-12 w-12 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          Work-Integrated Learning Progress
                        </h3>
                        <p className="text-gray-700 text-lg font-medium">Track your hours and earn stipends!</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Display */}
                  <div className="mb-8">
                    <MonthlyHoursProgress 
                      loggedHours={initialData.monthlyHours}
                      targetHours={initialData.targetHours}
                      className="bg-white/80 backdrop-blur-sm border-emerald-200/50 shadow-lg"
                    />
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={handleLogHours}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 rounded-xl py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Clock className="h-5 w-5 mr-2" />
                      Log Hours / Check-In
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 bg-white/80 hover:bg-white/90 text-emerald-600 border-emerald-300 hover:border-emerald-400 rounded-xl py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      View History
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <UpcomingSessions 
                sessions={initialData.upcomingSessions}
                className="rounded-3xl"
              />
            </div>

            {/* Right Column - Placement Details */}
            <div className="space-y-8">
              <PlacementDetails 
                placementInfo={initialData.placementInfo}
                className="rounded-3xl"
              />

              {/* Quick Actions Card */}
              <Card className="shadow-lg rounded-3xl border" style={{ background: 'rgba(245, 240, 225, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(245, 240, 225, 0.3)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => router.push('/learner/documents')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage Documents
                  </Button>
                  <Button
                    onClick={() => router.push('/learner/leave')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Request Leave
                  </Button>
                  <Button
                    onClick={() => router.push('/learner/inbox')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    View Messages
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* AI Floating Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
          <AiChatbot className="shadow-2xl" />
        </div>
      </div>
    </AdminLayout>
  )
}
