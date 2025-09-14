'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  textClassName?: string
  iconClassName?: string
}

const sizeClasses = {
  sm: {
    icon: 'w-6 h-6',
    text: 'text-lg',
    textSize: 'text-sm'
  },
  md: {
    icon: 'w-8 h-8',
    text: 'text-xl',
    textSize: 'text-base'
  },
  lg: {
    icon: 'w-10 h-10',
    text: 'text-2xl',
    textSize: 'text-lg'
  },
  xl: {
    icon: 'w-12 h-12',
    text: 'text-3xl',
    textSize: 'text-xl'
  }
}

export function Logo({ 
  size = 'md', 
  showText = true, 
  className = '',
  textClassName = '',
  iconClassName = ''
}: LogoProps) {
  const { icon, text, textSize } = sizeClasses[size]

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* Logo Icon */}
      <div className={cn(
        "bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm",
        icon,
        iconClassName
      )}>
        <span className={cn("text-white font-bold", text)}>iS</span>
      </div>
      
      {/* Brand Text */}
      {showText && (
        <span className={cn(
          "font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
          textSize,
          textClassName
        )}>
          iSpaan
        </span>
      )}
    </div>
  )
}

// Dark mode variant for dark backgrounds
export function LogoDark({ 
  size = 'md', 
  showText = true, 
  className = '',
  textClassName = '',
  iconClassName = ''
}: LogoProps) {
  const { icon, text, textSize } = sizeClasses[size]

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* Logo Icon */}
      <div className={cn(
        "bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow-sm",
        icon,
        iconClassName
      )}>
        <span className={cn("text-white font-bold", text)}>iS</span>
      </div>
      
      {/* Brand Text */}
      {showText && (
        <span className={cn(
          "font-bold text-white",
          textSize,
          textClassName
        )}>
          iSpaan
        </span>
      )}
    </div>
  )
}



