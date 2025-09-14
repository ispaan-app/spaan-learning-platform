'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserProfileCompact } from '@/components/shared/UserProfile'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Upload,
  Bell,
  HelpCircle,
  UserCheck,
  Timer,
  Calendar,
  AlertCircle,
  Inbox
} from 'lucide-react'

interface AdminSidebarProps {
  userRole: 'super-admin' | 'admin' | 'applicant' | 'learner'
  isCollapsed: boolean
  onToggle: () => void
}

export function AdminSidebarSimple({ userRole, isCollapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, userData } = useAuth()

  const navigationItems = {
    'super-admin': [
      { title: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
      { title: 'Users', href: '/super-admin/users', icon: Users },
      { title: 'Analytics', href: '/super-admin/analytics', icon: BarChart3 },
      { title: 'Reports', href: '/super-admin/reports', icon: FileText },
      { title: 'Inbox', href: '/super-admin/inbox', icon: Inbox },
      { title: 'Settings', href: '/super-admin/settings', icon: Settings },
      { title: 'Profile', href: '/super-admin/profile', icon: User }
    ],
    'admin': [
      { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { title: 'Settings', href: '/admin/settings', icon: Settings },
      { title: 'Profile', href: '/admin/profile', icon: User }
    ],
    'applicant': [
      { title: 'Dashboard', href: '/applicant/dashboard', icon: LayoutDashboard },
      { title: 'Applications', href: '/applicant/applications', icon: FileText },
      { title: 'Documents', href: '/applicant/documents', icon: Upload },
      { title: 'Profile', href: '/profile', icon: User }
    ],
    'learner': [
      { title: 'Dashboard', href: '/learner/dashboard', icon: LayoutDashboard },
      { title: 'Check-In', href: '/learner/check-in', icon: Timer },
      { title: 'Leave', href: '/learner/leave', icon: Calendar },
      { title: 'Profile', href: '/learner/profile', icon: User }
    ]
  }

  const items = navigationItems[userRole] || []

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-text-primary capitalize">
              {userRole.replace('-', ' ')} Panel
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href
          const IconComponent = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-100 text-primary-700"
                  : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
              )}
            >
              <IconComponent className="h-5 w-5" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && user && (
          <UserProfileCompact
            user={user}
            userData={userData || undefined}
          />
        )}
        {!isCollapsed && !user && (
          <div className="text-xs text-text-muted">
            iSpaan Platform v1.0
          </div>
        )}
        {isCollapsed && user && (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
