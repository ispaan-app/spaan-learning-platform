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
  const colorMap = {
    blue: isActive 
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
      : 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300',
    green: isActive 
      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25' 
      : 'text-green-400 hover:bg-green-500/10 hover:text-green-300',
    orange: isActive 
      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
      : 'text-orange-400 hover:bg-orange-500/10 hover:text-orange-300',
    red: isActive 
      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25' 
      : 'text-red-400 hover:bg-red-500/10 hover:text-red-300',
    purple: isActive 
      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25' 
      : 'text-purple-400 hover:bg-purple-500/10 hover:text-purple-300',
    indigo: isActive 
      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
      : 'text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300',
    teal: isActive 
      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25' 
      : 'text-teal-400 hover:bg-teal-500/10 hover:text-teal-300',
    yellow: isActive 
      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/25' 
      : 'text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300',
    gray: isActive 
      ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25' 
      : 'text-gray-400 hover:bg-gray-500/10 hover:text-gray-300'
  }
  return colorMap[color as keyof typeof colorMap] || colorMap.gray
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
      "flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 ease-out relative overflow-hidden",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <LogoDark 
                size="sm" 
                showText={false}
                iconClassName="text-white"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                iSpaan
              </h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center w-full">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
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
          className="h-10 w-10 p-0 hover:bg-slate-700/50 text-slate-300 hover:text-white flex-shrink-0 rounded-xl transition-all duration-200 hover:scale-105"
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

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                getColorClasses(item.color, isActive),
                isActive && "transform scale-[1.02] shadow-lg"
              )}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full"></div>
              )}
              
              {/* Icon */}
              <div className={cn(
                "relative flex-shrink-0",
                isActive && "animate-pulse"
              )}>
                <IconComponent className="h-5 w-5" />
                {item.badge && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
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
        <div className="relative z-10 p-4 border-t border-slate-700/50">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200 group">
                <Plus className="h-4 w-4 text-blue-400 group-hover:text-blue-300 mx-auto mb-1" />
                <span className="text-xs text-slate-300 group-hover:text-white">New</span>
              </button>
              <button className="p-3 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-xl hover:from-green-500/30 hover:to-teal-500/30 transition-all duration-200 group">
                <Zap className="h-4 w-4 text-green-400 group-hover:text-green-300 mx-auto mb-1" />
                <span className="text-xs text-slate-300 group-hover:text-white">Quick</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 p-4 border-t border-slate-700/50">
        {!collapsed && user && (
          <div className="group">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-600/50 hover:to-slate-500/50 transition-all duration-200">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {user?.displayName || userData?.firstName || 'Admin User'}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {userRole.replace('-', ' ').toUpperCase()}
                </div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
        {collapsed && user && (
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
