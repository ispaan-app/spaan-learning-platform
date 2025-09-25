'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { EnhancedAdminSidebar } from './EnhancedAdminSidebar'
import { ConnectionStatus } from '@/components/ui/connection-status'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { BottomNavBar } from '@/components/learner/BottomNavBar'
import { Menu, X } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  userRole: 'super-admin' | 'admin' | 'applicant' | 'learner'
}

export function AdminLayout({ children, userRole }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user, loading, userRole: authUserRole } = useAuth()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E1' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E1' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          <Button asChild>
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F0E1' }}>
      {/* Connection Status */}
      <ConnectionStatus />
      
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'relative'
        }
      `}>
        <EnhancedAdminSidebar 
          userRole={userRole}
          isCollapsed={!sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only for learners on mobile */}
      {isMobile && userRole === 'learner' && (
        <BottomNavBar />
      )}
    </div>
  )
}
