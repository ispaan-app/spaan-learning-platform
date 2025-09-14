'use client'

import { useAuth } from '@/hooks/useAuth'
import { WelcomeCard } from '@/components/ui/welcome-card'

export function SuperAdminWelcome() {
  const { user, userData } = useAuth()

  return (
    <WelcomeCard 
      userName={user?.displayName || userData?.firstName || "Super Admin"} 
      userRole="super-admin" 
      className="mb-6"
    />
  )
}


