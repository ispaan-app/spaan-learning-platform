'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Timer, 
  Calendar, 
  User 
} from 'lucide-react'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/learner/dashboard',
    icon: LayoutDashboard,
    description: 'Overview'
  },
  {
    name: 'Check-In',
    href: '/learner/check-in',
    icon: Timer,
    description: 'Log Hours'
  },
  {
    name: 'Leave',
    href: '/learner/leave',
    icon: Calendar,
    description: 'Apply Leave'
  },
  {
    name: 'Profile',
    href: '/learner/profile',
    icon: User,
    description: 'My Profile'
  }
]

export function LearnerBottomNavBar() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item) => {
          const IconComponent = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 px-2 py-2 transition-colors",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              )}
            >
              <IconComponent className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-blue-600" : "text-gray-500"
              )} />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive ? "text-blue-600" : "text-gray-500"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
