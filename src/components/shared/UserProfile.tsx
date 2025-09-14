'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UserProfileProps {
  user: {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
  }
  userData?: {
    firstName?: string
    lastName?: string
    role?: string
    profileImage?: string
    avatar?: string
    email?: string
  }
  size?: 'sm' | 'md' | 'lg'
  showEmail?: boolean
  showRole?: boolean
  className?: string
  fallbackText?: string
}

export function UserProfile({
  user,
  userData,
  size = 'md',
  showEmail = true,
  showRole = true,
  className,
  fallbackText
}: UserProfileProps) {
  // Get user initials from displayName or userData
  const getInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase()
    }
    if (user.displayName) {
      const names = user.displayName.split(' ')
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
      }
      return user.displayName.charAt(0).toUpperCase()
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return fallbackText || 'U'
  }

  // Get display name
  const getDisplayName = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName} ${userData.lastName}`
    }
    return user.displayName || user.email?.split('@')[0] || 'User'
  }

  // Get avatar source (prioritize userData profileImage, then Firebase photoURL)
  const getAvatarSrc = () => {
    const profileImage = userData?.profileImage
    const firebasePhoto = user.photoURL
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('UserProfile Debug:', {
        profileImage,
        avatar: userData?.avatar,
        firebasePhoto,
        userData
      })
    }
    
    // Check if profileImage is a base64 data URL (learner profiles)
    if (profileImage && profileImage.startsWith('data:image/')) {
      return profileImage
    }
    
    // Check if profileImage is a Firebase Storage URL (admin profiles)
    if (profileImage && (profileImage.startsWith('https://') || profileImage.startsWith('http://'))) {
      return profileImage
    }
    
    // Check if userData has an avatar field (admin profiles)
    if (userData?.avatar && (userData.avatar.startsWith('https://') || userData.avatar.startsWith('http://'))) {
      return userData.avatar
    }
    
    // Fallback to Firebase photoURL
    return firebasePhoto || undefined
  }

  // Get role display text
  const getRoleText = () => {
    if (!userData?.role) return null
    
    switch (userData.role) {
      case 'super-admin':
        return 'Super Admin'
      case 'admin':
        return 'Admin'
      case 'learner':
        return 'Learner'
      case 'applicant':
        return 'Applicant'
      default:
        return userData.role
    }
  }

  // Get role badge variant
  const getRoleBadgeVariant = () => {
    switch (userData?.role) {
      case 'super-admin':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'learner':
        return 'outline'
      case 'applicant':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Size configurations
  const sizeConfig = {
    sm: {
      avatar: 'h-6 w-6',
      text: 'text-xs',
      name: 'text-sm',
      email: 'text-xs'
    },
    md: {
      avatar: 'h-8 w-8',
      text: 'text-sm',
      name: 'text-sm',
      email: 'text-xs'
    },
    lg: {
      avatar: 'h-10 w-10',
      text: 'text-base',
      name: 'text-base',
      email: 'text-sm'
    }
  }

  const config = sizeConfig[size]

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <Avatar className={config.avatar}>
        <AvatarImage src={getAvatarSrc()} alt={getDisplayName()} />
        <AvatarFallback className={config.text}>
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className={cn('font-medium truncate', config.name)}>
            {getDisplayName()}
          </p>
          {showRole && userData?.role && (
            <Badge variant={getRoleBadgeVariant()} className="text-xs">
              {getRoleText()}
            </Badge>
          )}
        </div>
        {showEmail && user.email && (
          <p className={cn('text-muted-foreground truncate', config.email)}>
            {user.email}
          </p>
        )}
      </div>
    </div>
  )
}

// Compact version for sidebars
export function UserProfileCompact({
  user,
  userData,
  className
}: Omit<UserProfileProps, 'size' | 'showEmail' | 'showRole'>) {
  return (
    <UserProfile
      user={user}
      userData={userData}
      size="sm"
      showEmail={false}
      showRole={false}
      className={className}
    />
  )
}

// Full version for headers
export function UserProfileFull({
  user,
  userData,
  className
}: Omit<UserProfileProps, 'size' | 'showEmail' | 'showRole'>) {
  return (
    <UserProfile
      user={user}
      userData={userData}
      size="md"
      showEmail={true}
      showRole={true}
      className={className}
    />
  )
}
