'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogoDark } from '@/components/ui/logo'
import { UserProfileCompact } from '@/components/shared/UserProfile'
import { useAuth } from '@/hooks/useAuth'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Upload,
  User,
  Activity,
  UserCheck,
  Timer,
  Calendar,
  AlertCircle,
  DollarSign,
  Building2,
  AlertTriangle,
  Bell,
  Inbox
} from 'lucide-react'

interface AdminSidebarProps {
  userRole: 'super-admin' | 'admin' | 'applicant' | 'learner'
  isCollapsed?: boolean
  onToggle?: () => void
}

const navigationItems = {
  'super-admin': [
    {
      title: 'Overview',
      href: '/super-admin/dashboard',
      icon: LayoutDashboard,
      description: 'Platform-wide analytics'
    },
    {
      title: 'User Management',
      href: '/super-admin/users',
      icon: Users,
      description: 'Manage all users'
    },
    {
      title: 'Stipend Reports',
      href: '/super-admin/stipend-reports',
      icon: DollarSign,
      description: 'Manage stipend payment issues'
    },
    {
      title: 'System Monitor',
      href: '/super-admin/system',
      icon: Activity,
      description: 'System performance & health'
    },
    {
      title: 'Audit Logs',
      href: '/super-admin/audit',
      icon: FileText,
      description: 'System activities & security'
    },
    {
      title: 'Inbox',
      href: '/super-admin/inbox',
      icon: Inbox,
      description: 'Notifications & messages'
    },
    {
      title: 'Profile',
      href: '/super-admin/profile',
      icon: User,
      description: 'Your profile & settings'
    }
  ],
  'admin': [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Admin overview'
    },
    {
      title: 'Work Placements',
      href: '/admin/placements',
      icon: Building2,
      description: 'Manage WIL placements'
    },
    {
      title: 'Leave Requests',
      href: '/admin/leave-requests',
      icon: Calendar,
      description: 'Manage leave applications'
    },
    {
      title: 'Issues',
      href: '/admin/issues',
      icon: AlertTriangle,
      description: 'Manage reported issues'
    },
    {
      title: 'Inbox',
      href: '/admin/inbox',
      icon: Inbox,
      description: 'Notifications & messages'
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'View analytics'
    },
    {
      title: 'Reports',
      href: '/admin/reports',
      icon: FileText,
      description: 'Generate reports'
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'Platform settings'
    }
  ],
  'applicant': [
    {
      title: 'Dashboard',
      href: '/applicant/dashboard',
      icon: LayoutDashboard,
      description: 'Your applications'
    }
  ],
  'learner': [
    {
      title: 'Dashboard',
      href: '/learner/dashboard',
      icon: LayoutDashboard,
      description: 'Learning overview'
    },
    {
      title: 'Check-In',
      href: '/learner/check-in',
      icon: Timer,
      description: 'Log work hours'
    },
    {
      title: 'Leave',
      href: '/learner/leave',
      icon: Calendar,
      description: 'Apply for leave'
    },
    {
      title: 'Profile',
      href: '/learner/profile',
      icon: User,
      description: 'Your profile'
    }
  ]
}

export function AdminSidebar({ userRole, isCollapsed = false, onToggle }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(isCollapsed)
  const pathname = usePathname()
  const { user, userData } = useAuth()

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
    onToggle?.()
  }

  const items = navigationItems[userRole] || []

  return (
    <div className={cn(
      "flex flex-col h-full bg-slate-800 border-r border-slate-700 transition-all duration-200 ease-out",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <LogoDark 
            size="md" 
            showText={true}
            className="flex-shrink-0"
          />
        )}
        {collapsed && (
          <div className="flex justify-center w-full">
            <LogoDark 
              size="sm" 
              showText={false}
              iconClassName="mx-auto"
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="h-8 w-8 p-0 hover:bg-slate-700 text-slate-300 hover:text-white flex-shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const IconComponent = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-coral text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              )}
            >
              <IconComponent className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-white" : "text-slate-400 group-hover:text-coral"
              )} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.title}</div>
                  {!collapsed && (
                    <div className="text-xs text-slate-400 truncate">
                      {item.description}
                    </div>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        {!collapsed && user && (
          <UserProfileCompact
            user={user}
            userData={userData || undefined}
            className="text-white"
          />
        )}
        {collapsed && user && (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-slate-300" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}