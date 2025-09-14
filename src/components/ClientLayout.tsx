'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardNav } from '@/components/dashboard-nav'
import { BottomNavBar } from '@/components/learner/BottomNavBar'
import { SupportChat } from '@/components/ai/SupportChat'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { user, userRole, loading } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <>{children}</>
  }

  const role = userRole as 'learner' | 'admin' | 'super-admin'

  // Show full layout for authenticated users
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Desktop Sidebar - Hidden on mobile */}
        {!isMobile && (
          <DashboardNav userRole={role} />
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only for learners on mobile */}
      {isMobile && role === 'learner' && (
        <BottomNavBar />
      )}

      {/* Support Chat - Available on most pages except AI Mentor */}
      {role === 'learner' && !window.location.pathname.includes('/mentor') && (
        <SupportChat />
      )}
    </div>
  )
}
