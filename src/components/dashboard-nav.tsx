'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  MessageCircle, 
  User,
  FileText,
  Building2,
  Settings,
  DollarSign,
  BookOpen,
  Palette,
  Brain,
  Activity,
  Shield
} from 'lucide-react'

interface DashboardNavProps {
  userRole: 'learner' | 'admin' | 'super-admin'
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname()

  const learnerMenuItems = [
    {
      name: 'Dashboard',
      href: '/learner/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Check-In',
      href: '/learner/check-in',
      icon: Clock
    },
    {
      name: 'Leave',
      href: '/learner/leave',
      icon: Calendar
    },
    {
      name: 'AI Mentor',
      href: '/learner/mentor',
      icon: MessageCircle
    },
    {
      name: 'Profile',
      href: '/learner/profile',
      icon: User
    }
  ]

  const adminMenuItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Applicants',
      href: '/admin/applicants',
      icon: FileText
    },
    {
      name: 'Manage Learners',
      href: '/admin/learners',
      icon: User
    },
    {
      name: 'Placements',
      href: '/admin/placements',
      icon: Building2
    },
    {
      name: 'Class Sessions',
      href: '/admin/classes',
      icon: Calendar
    },
    {
      name: 'Announcements',
      href: '/admin/announcements',
      icon: MessageCircle
    },
    {
      name: 'Manage Leave',
      href: '/admin/leave',
      icon: Clock
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: FileText
    },
    {
      name: 'Profile',
      href: '/admin/profile',
      icon: User
    }
  ]

  const superAdminMenuItems = [
    {
      name: 'Dashboard',
      href: '/super-admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Manage Users',
      href: '/super-admin/users',
      icon: User
    },
    {
      name: 'Security',
      href: '/super-admin/security',
      icon: Shield
    },
    {
      name: 'Performance',
      href: '/super-admin/performance',
      icon: Activity
    },
    {
      name: 'Stipend Reports',
      href: '/super-admin/stipend-reports',
      icon: DollarSign
    },
    {
      name: 'Projects & Programs',
      href: '/super-admin/projects-programs',
      icon: BookOpen
    },
    {
      name: 'Appearance',
      href: '/super-admin/appearance',
      icon: Palette
    },
    {
      name: 'AI Reports',
      href: '/super-admin/ai-reports',
      icon: Brain
    },
    {
      name: 'Audit Logs',
      href: '/super-admin/audit-logs',
      icon: FileText
    },
    {
      name: 'Genkit Performance',
      href: '/super-admin/genkit-performance',
      icon: Activity
    },
    {
      name: 'System Health',
      href: '/super-admin/system-health',
      icon: Shield
    },
    {
      name: 'Profile',
      href: '/super-admin/profile',
      icon: User
    }
  ]

  const getMenuItems = () => {
    switch (userRole) {
      case 'learner':
        return learnerMenuItems
      case 'admin':
        return adminMenuItems
      case 'super-admin':
        return superAdminMenuItems
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8 animate-in slide-in-from-left duration-700">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <span className="text-white font-bold text-sm">iS</span>
          </div>
          <span className="text-xl font-bold text-gray-900">iSpaan</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group hover:shadow-md hover:-translate-x-1',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <IconComponent className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-blue-700" : "text-gray-500 group-hover:text-gray-700"
                )} />
                <span className="animate-in slide-in-from-left duration-500" style={{ animationDelay: `${index * 50 + 200}ms` }}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-auto"></div>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
