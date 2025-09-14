'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Sun, 
  Moon, 
  Coffee, 
  Heart, 
  Star,
  Sparkles,
  User,
  Calendar,
  Clock
} from 'lucide-react'

interface WelcomeCardProps {
  userName: string
  userRole: 'super-admin' | 'admin' | 'applicant' | 'learner'
  className?: string
}

const getWelcomeMessage = (role: string, userName: string) => {
  const messages = {
    'super-admin': [
      `Welcome back, ${userName}! Ready to oversee the entire platform?`,
      `Good to see you, ${userName}! Let's make some strategic decisions today.`,
      `Hello ${userName}! Time to manage and optimize our platform.`
    ],
    'admin': [
      `Welcome back, ${userName}! Ready to manage the platform today?`,
      `Good to see you, ${userName}! Let's keep everything running smoothly.`,
      `Hello ${userName}! Time to handle some administrative tasks.`
    ],
    'applicant': [
      `Welcome back, ${userName}! Ready to continue your application journey?`,
      `Good to see you, ${userName}! Let's work on your application today.`,
      `Hello ${userName}! Time to make progress on your application.`
    ],
    'learner': [
      `Welcome back, ${userName}! Ready to continue your learning journey?`,
      `Good to see you, ${userName}! Let's learn something new today.`,
      `Hello ${userName}! Time to expand your knowledge and skills.`
    ]
  }
  
  const roleMessages = messages[role as keyof typeof messages] || messages['learner']
  return roleMessages[Math.floor(Math.random() * roleMessages.length)]
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'super-admin':
      return <Star className="h-6 w-6" />
    case 'admin':
      return <User className="h-6 w-6" />
    case 'applicant':
      return <Coffee className="h-6 w-6" />
    case 'learner':
      return <Heart className="h-6 w-6" />
    default:
      return <Sparkles className="h-6 w-6" />
  }
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'super-admin':
      return 'default'
    case 'admin':
      return 'secondary'
    case 'applicant':
      return 'outline'
    case 'learner':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const getTimeOfDay = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

const getTimeIcon = () => {
  const timeOfDay = getTimeOfDay()
  switch (timeOfDay) {
    case 'morning':
      return <Sun className="h-5 w-5 text-yellow-500" />
    case 'afternoon':
      return <Sun className="h-5 w-5 text-orange-500" />
    case 'evening':
      return <Moon className="h-5 w-5 text-blue-500" />
    default:
      return <Clock className="h-5 w-5" />
  }
}

export function WelcomeCard({ userName, userRole, className }: WelcomeCardProps) {
  const welcomeMessage = getWelcomeMessage(userRole, userName)
  const timeOfDay = getTimeOfDay()
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <Card className={cn(
      "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-xl overflow-hidden relative",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full"></div>
      </div>
      
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              {getRoleIcon(userRole)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Good {timeOfDay}, {userName.split(' ')[0]}!
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                {getTimeIcon()}
                <span className="text-white/90 text-sm">{currentTime}</span>
              </div>
            </div>
          </div>
          <Badge 
            variant={getRoleBadgeVariant(userRole)} 
            className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            {userRole.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
        
        <p className="text-white/90 text-lg mb-4 leading-relaxed">
          {welcomeMessage}
        </p>
        
        <div className="flex items-center justify-between text-white/80 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{currentDate}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="h-4 w-4" />
            <span>Ready to go!</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
