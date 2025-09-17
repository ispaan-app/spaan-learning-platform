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
  Inbox,
  Home,
  Zap,
  Target,
  Shield,
  Star,
  Sparkles,
  TrendingUp,
  Globe,
  Award,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react'

interface EnhancedAdminSidebarProps {
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
      description: 'Platform-wide analytics',
      color: 'blue',
      badge: 'Pro'
    },
    {
      title: 'User Management',
      href: '/super-admin/users',
      icon: Users,
      description: 'Manage all users',
      color: 'green',
      badge: 'New'
    },
    {
      title: 'Stipend Reports',
      href: '/super-admin/stipend-reports',
      icon: DollarSign,
      description: 'Manage stipend payment issues',
      color: 'yellow',
      badge: null
    },
    {
      title: 'System Monitor',
      href: '/super-admin/system',
      icon: Activity,
      description: 'System performance & health',
      color: 'purple',
      badge: 'Live'
    },
    {
      title: 'Audit Logs',
      href: '/super-admin/audit',
      icon: FileText,
      description: 'System activities & security',
      color: 'red',
      badge: null
    },
    {
      title: 'Inbox',
      href: '/super-admin/inbox',
      icon: Inbox,
      description: 'Notifications & messages',
      color: 'indigo',
      badge: '3'
    },
    {
      title: 'Profile',
      href: '/super-admin/profile',
      icon: User,
      description: 'Your profile & settings',
      color: 'gray',
      badge: null
    }
  ],
  'admin': [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Admin overview',
      color: 'blue',
      badge: null
    },
    {
      title: 'Work Placements',
      href: '/admin/placements',
      icon: Building2,
      description: 'Manage WIL placements',
      color: 'green',
      badge: '12'
    },
    {
      title: 'Leave Requests',
      href: '/admin/leave-requests',
      icon: Calendar,
      description: 'Manage leave applications',
      color: 'orange',
      badge: '5'
    },
    {
      title: 'Issues',
      href: '/admin/issues',
      icon: AlertTriangle,
      description: 'Manage reported issues',
      color: 'red',
      badge: '2'
    },
    {
      title: 'Inbox',
      href: '/admin/inbox',
      icon: Inbox,
      description: 'Notifications & messages',
      color: 'indigo',
      badge: '8'
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'View analytics',
      color: 'purple',
      badge: null
    },
    {
      title: 'Reports',
      href: '/admin/reports',
      icon: FileText,
      description: 'Generate reports',
      color: 'teal',
      badge: null
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'Platform settings',
      color: 'gray',
      badge: null
    }
  ],
  'applicant': [
    {
      title: 'Dashboard',
      href: '/applicant/dashboard',
      icon: LayoutDashboard,
      description: 'Your applications',
      color: 'blue',
      badge: null
    }
  ],
  'learner': [
    {
      title: 'Dashboard',
      href: '/learner/dashboard',
      icon: LayoutDashboard,
      description: 'Learning overview',
      color: 'blue',
      badge: null
    },
    {
      title: 'Check-In',
      href: '/learner/check-in',
      icon: Timer,
      description: 'Log work hours',
      color: 'green',
      badge: null
    },
    {
      title: 'Leave',
      href: '/learner/leave',
      icon: Calendar,
      description: 'Apply for leave',
      color: 'orange',
      badge: null
    },
    {
      title: 'Profile',
      href: '/learner/profile',
      icon: User,
      description: 'Your profile',
      color: 'gray',
      badge: null
    }
  ]
}

const getColorClasses = (color: string, isActive: boolean) => {
  if (isActive) {
    return {
      background: '#FF6E40',
      textColor: '#F5F0E1',
      shadow: '0 4px 6px -1px rgba(255, 110, 64, 0.25)'
    }
  } else {
    return {
      background: 'transparent',
      textColor: '#F5F0E1',
      hoverBackground: 'rgba(255, 110, 64, 0.1)',
      hoverTextColor: '#FF6E40'
    }
  }
}

export function EnhancedAdminSidebar({ userRole, isCollapsed = false, onToggle }: EnhancedAdminSidebarProps) {
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
      "flex flex-col h-full border-r transition-all duration-300 ease-out relative overflow-hidden",
      collapsed ? "w-20" : "w-72"
    )} style={{ backgroundColor: '#1E3D59' }}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl animate-pulse" style={{ backgroundColor: '#FF6E40' }}></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl animate-pulse delay-1000" style={{ backgroundColor: '#FFC13B' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-2xl animate-pulse delay-500" style={{ backgroundColor: '#F5F0E1' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(245, 240, 225, 0.2)' }}>
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
              <LogoDark 
                size="sm" 
                showText={false}
                iconClassName="text-white"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#F5F0E1' }}>
                iSpaan
              </h1>
              <p className="text-xs" style={{ color: '#F5F0E1', opacity: 0.7 }}>Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center w-full">
            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
              <LogoDark 
                size="sm" 
                showText={false}
                iconClassName="text-white"
              />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="h-10 w-10 p-0 flex-shrink-0 rounded-xl transition-all duration-200 hover:scale-105"
          style={{ 
            color: '#F5F0E1',
            backgroundColor: 'transparent'
          }}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item, index) => {
          const IconComponent = item.icon
          const isActive = pathname === item.href
          const colorClasses = getColorClasses(item.color, isActive)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]",
                isActive && "transform scale-[1.02]"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                backgroundColor: colorClasses.background,
                color: colorClasses.textColor,
                boxShadow: isActive ? colorClasses.shadow : 'none'
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full" style={{ backgroundColor: '#FFC13B' }}></div>
              )}
              
              {/* Icon */}
              <div className={cn(
                "relative flex-shrink-0",
                isActive && "animate-pulse"
              )}>
                <IconComponent className="h-5 w-5" />
                {item.badge && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFC13B' }}>
                    <span className="text-xs text-white font-bold">{item.badge}</span>
                  </div>
                )}
              </div>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="truncate font-semibold">{item.title}</div>
                    {isActive && (
                      <ArrowRight className="h-4 w-4 opacity-70" />
                    )}
                  </div>
                  <div className="text-xs opacity-70 truncate mt-1">
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="relative z-10 p-4 border-t" style={{ borderColor: 'rgba(245, 240, 225, 0.2)' }}>
          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#F5F0E1', opacity: 0.7 }}>Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 rounded-xl transition-all duration-200 group" style={{ backgroundColor: 'rgba(255, 110, 64, 0.1)' }}>
                <Plus className="h-4 w-4 mx-auto mb-1 group-hover:opacity-80" style={{ color: '#FF6E40' }} />
                <span className="text-xs group-hover:opacity-80" style={{ color: '#F5F0E1' }}>New</span>
              </button>
              <button className="p-3 rounded-xl transition-all duration-200 group" style={{ backgroundColor: 'rgba(255, 192, 59, 0.1)' }}>
                <Zap className="h-4 w-4 mx-auto mb-1 group-hover:opacity-80" style={{ color: '#FFC13B' }} />
                <span className="text-xs group-hover:opacity-80" style={{ color: '#F5F0E1' }}>Quick</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 p-4 border-t" style={{ borderColor: 'rgba(245, 240, 225, 0.2)' }}>
        {!collapsed && user && (
          <div className="group">
            <div className="flex items-center space-x-3 p-3 rounded-2xl transition-all duration-200" style={{ backgroundColor: 'rgba(245, 240, 225, 0.1)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: '#F5F0E1' }}>
                  {user?.displayName || userData?.firstName || 'Admin User'}
                </div>
                <div className="text-xs truncate" style={{ color: '#F5F0E1', opacity: 0.7 }}>
                  {userRole.replace('-', ' ').toUpperCase()}
                </div>
              </div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FFC13B' }}></div>
            </div>
          </div>
        )}
        {collapsed && user && (
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
