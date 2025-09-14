'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  Edit, 
  Settings, 
  Star, 
  MapPin, 
  Calendar,
  Award,
  Shield,
  GraduationCap,
  User
} from 'lucide-react'

interface ProfileHeaderProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: 'super-admin' | 'admin' | 'applicant' | 'learner'
    profileImage?: string
    location?: string
    joinDate?: string
    status?: string
    rating?: number
    achievements?: string[]
  }
  onEdit?: () => void
  onBack?: () => void
}

const roleConfig = {
  'super-admin': {
    icon: Shield,
    color: 'bg-red-500',
    badgeColor: 'bg-red-100 text-red-800',
    title: 'Super Administrator'
  },
  'admin': {
    icon: Settings,
    color: 'bg-blue-500',
    badgeColor: 'bg-blue-100 text-blue-800',
    title: 'Administrator'
  },
  'applicant': {
    icon: User,
    color: 'bg-green-500',
    badgeColor: 'bg-green-100 text-green-800',
    title: 'Applicant'
  },
  'learner': {
    icon: GraduationCap,
    color: 'bg-purple-500',
    badgeColor: 'bg-purple-100 text-purple-800',
    title: 'Learner'
  }
}

export function ProfileHeader({ user, onEdit, onBack }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const config = roleConfig[user.role]
  const Icon = config.icon

  const handleEdit = () => {
    setIsEditing(true)
    onEdit?.()
  }

  return (
    <div className="relative">
      {/* Background Image/Pattern */}
      <div className="h-64 bg-gradient-to-br from-[#0C3B2E] via-[#6D9773] to-[#B46617] relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 bg-[#FFBA00] rounded-full blur-3xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        </div>
        
        {/* Header Content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          {/* Top Navigation */}
          <div className="flex items-center justify-between">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-white hover:bg-white/20"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Profile Info */}
          <div className="flex items-end space-x-4">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-2xl bg-white text-[#0C3B2E]">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <Badge className={`${config.badgeColor} border-0`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {config.title}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm opacity-90">
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.joinDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="relative -mt-8 mx-6">
        <div className="bg-white rounded-t-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {user.rating && (
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(user.rating || 0) 
                            ? 'text-[#FFBA00] fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {user.rating.toFixed(1)}
                  </span>
                </div>
              )}
              
              {user.status && (
                <Badge 
                  variant="outline" 
                  className={`${
                    user.status === 'active' ? 'border-green-200 text-green-800 bg-green-50' :
                    user.status === 'pending' ? 'border-yellow-200 text-yellow-800 bg-yellow-50' :
                    'border-red-200 text-red-800 bg-red-50'
                  }`}
                >
                  {user.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-8 h-8 bg-[#6D9773] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">@</span>
              </div>
              <span className="font-medium">{user.email}</span>
            </div>

            {user.achievements && user.achievements.length > 0 && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#B46617] rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.achievements.map((achievement, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}





