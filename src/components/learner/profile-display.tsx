'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Building, 
  Edit,
  Camera,
  Globe,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  Star
} from 'lucide-react'
import { LearnerProfile } from '@/app/learner/profile/actions'

interface ProfileDisplayProps {
  profile: LearnerProfile
  onEdit?: () => void
  className?: string
}

export function ProfileDisplay({ profile, onEdit, className }: ProfileDisplayProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': 
        return 'Male'
      case 'female': 
        return 'Female'
      default: 
        return 'Not specified'
    }
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Profile Overview */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
        <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b border-gray-200">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
              Profile Overview
            </span>
            <Sparkles className="h-5 w-5 text-purple-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="relative">
                <Avatar className="h-32 w-32 mx-auto shadow-2xl border-4 border-white">
                  <AvatarImage src={profile.profileImage || undefined} />
                  <AvatarFallback className="text-3xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
              {profile.firstName} {profile.lastName}
            </h2>
            
            <p className="text-lg text-gray-600 mb-4 font-medium">{profile.program}</p>
            
            <Badge className="px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
              <Activity className="h-4 w-4 mr-2" />
              Active Learner
            </Badge>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
                <p className="font-semibold text-gray-800">Age</p>
                <p className="text-gray-600">{calculateAge(profile.dateOfBirth)} years</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
                <p className="font-semibold text-gray-800">Program Duration</p>
                <p className="text-gray-600">{formatDate(profile.programStartDate)} - {formatDate(profile.programEndDate)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Placement */}
      {profile.currentPlacement && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Building className="h-5 w-5" />
              <span>Current Placement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{profile.currentPlacement.companyName}</h3>
                  <p className="text-gray-600">{profile.currentPlacement.position}</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {profile.currentPlacement.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Start Date:</span>
                  <p className="font-medium">{formatDate(profile.currentPlacement.startDate)}</p>
                </div>
                <div>
                  <span className="text-gray-600">End Date:</span>
                  <p className="font-medium">
                    {profile.currentPlacement.endDate ? formatDate(profile.currentPlacement.endDate) : 'Not specified'}
                  </p>
                </div>
              </div>

              {profile.currentPlacement.supervisor && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Supervisor</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Name:</span> {profile.currentPlacement.supervisor.name}</p>
                    <p><span className="text-gray-600">Email:</span> {profile.currentPlacement.supervisor.email}</p>
                    <p><span className="text-gray-600">Phone:</span> {profile.currentPlacement.supervisor.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Mail className="h-5 w-5" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{profile.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">
                    {profile.address && profile.city ? 
                      `${profile.address}, ${profile.suburb ? profile.suburb + ', ' : ''}${profile.city}, ${profile.province}` : 
                      'Not provided'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">
                    {profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Not provided'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium">{getGenderLabel(profile.gender)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Nationality</p>
                  <p className="font-medium">{profile.nationality || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      {profile.emergencyContact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Shield className="h-5 w-5" />
              <span>Emergency Contact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{profile.emergencyContact.name || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Relationship</p>
                  <p className="font-medium">{profile.emergencyContact.relationship || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{profile.emergencyContact.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{profile.emergencyContact.email || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills & Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <BookOpen className="h-5 w-5" />
              <span>Skills</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No skills added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Activity className="h-5 w-5" />
              <span>Interests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.interests && profile.interests.length > 0 ? (
                profile.interests.map((interest, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                    {interest}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No interests added yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Shield className="h-5 w-5" />
            <span>Privacy & Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Notifications</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <div className="flex items-center space-x-2">
                    {profile.preferences?.notifications?.email ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={profile.preferences?.notifications?.email ? 'text-green-600' : 'text-gray-400'}>
                      {profile.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>SMS Notifications</span>
                  <div className="flex items-center space-x-2">
                    {profile.preferences?.notifications?.sms ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={profile.preferences?.notifications?.sms ? 'text-green-600' : 'text-gray-400'}>
                      {profile.preferences?.notifications?.sms ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Push Notifications</span>
                  <div className="flex items-center space-x-2">
                    {profile.preferences?.notifications?.push ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={profile.preferences?.notifications?.push ? 'text-green-600' : 'text-gray-400'}>
                      {profile.preferences?.notifications?.push ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Privacy</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Show Profile</span>
                  <div className="flex items-center space-x-2">
                    {profile.preferences?.privacy?.showProfile ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={profile.preferences?.privacy?.showProfile ? 'text-green-600' : 'text-gray-400'}>
                      {profile.preferences?.privacy?.showProfile ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Show Contact Info</span>
                  <div className="flex items-center space-x-2">
                    {profile.preferences?.privacy?.showContact ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={profile.preferences?.privacy?.showContact ? 'text-green-600' : 'text-gray-400'}>
                      {profile.preferences?.privacy?.showContact ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Show Skills</span>
                  <div className="flex items-center space-x-2">
                    {profile.preferences?.privacy?.showSkills ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={profile.preferences?.privacy?.showSkills ? 'text-green-600' : 'text-gray-400'}>
                      {profile.preferences?.privacy?.showSkills ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Button */}
      {onEdit && (
        <div className="flex justify-end">
          <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  )
}
