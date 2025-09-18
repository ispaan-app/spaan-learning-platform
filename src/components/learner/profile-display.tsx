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
  EyeOff
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
      case 'male': return 'Male'
      case 'female': return 'Female'
      case 'other': return 'Other'
      case 'prefer-not-to-say': return 'Prefer not to say'
      default: return 'Not specified'
    }
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Profile Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile.profileImage || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h2>
              
              <p className="text-gray-600 mb-2">{profile.program}</p>
              
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active Learner
              </Badge>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>Age: {calculateAge(profile.dateOfBirth)} years</p>
                <p>Program Duration: {formatDate(profile.programStartDate)} - {formatDate(profile.programEndDate)}</p>
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
              <div className="space-y-2">
                <p className="font-semibold">{profile.currentPlacement.companyName}</p>
                <p className="text-sm text-gray-600">{profile.currentPlacement.position}</p>
                <p className="text-xs text-gray-500">
                  Since {formatDate(profile.currentPlacement.startDate)}
                </p>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {profile.currentPlacement.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">
                  {profile.address}, {profile.city}, {profile.province} {profile.postalCode}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">{formatDate(profile.dateOfBirth)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium">{getGenderLabel(profile.gender)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID Number</p>
                <p className="font-medium">{profile.idNumber || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Nationality</p>
                <p className="font-medium">{profile.nationality}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Student Number</p>
              <p className="font-medium">{profile.studentNumber || 'Not assigned'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Program Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Program Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Program</p>
              <p className="font-medium text-lg">{profile.program}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{formatDate(profile.programStartDate)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">{formatDate(profile.programEndDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Contact Name</p>
                <p className="font-medium">{profile.emergencyContact.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium">{profile.emergencyContact.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Relationship</p>
                <p className="font-medium">{profile.emergencyContact.relationship}</p>
              </div>

              {profile.emergencyContact.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{profile.emergencyContact.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills and Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Interests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            {profile.languages && profile.languages.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Experience */}
        {profile.workExperience && profile.workExperience.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.workExperience.map((experience, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  <h4 className="font-semibold">{experience.position}</h4>
                  <p className="text-sm text-gray-600">{experience.company}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : 'Present'}
                  </p>
                  {experience.description && (
                    <p className="text-sm text-gray-700 mt-2">{experience.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-green-200 pl-4">
                  <h4 className="font-semibold">{edu.qualification}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={`mt-1 ${
                      edu.status === 'completed' ? 'bg-green-50 text-green-700' :
                      edu.status === 'in-progress' ? 'bg-blue-50 text-blue-700' :
                      'bg-red-50 text-red-700'
                    }`}
                  >
                    {edu.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Notifications</span>
                  <Badge variant="outline" className={profile.preferences?.notifications?.email ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}>
                    {profile.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS Notifications</span>
                  <Badge variant="outline" className={profile.preferences?.notifications?.sms ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}>
                    {profile.preferences?.notifications?.sms ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push Notifications</span>
                  <Badge variant="outline" className={profile.preferences?.notifications?.push ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}>
                    {profile.preferences?.notifications?.push ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Privacy</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Profile to Others</span>
                  <Badge variant="outline" className={profile.preferences?.privacy?.showProfile ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}>
                    {profile.preferences?.privacy?.showProfile ? 'Public' : 'Private'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Contact Information</span>
                  <Badge variant="outline" className={profile.preferences?.privacy?.showContact ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}>
                    {profile.preferences?.privacy?.showContact ? 'Visible' : 'Hidden'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Skills & Interests</span>
                  <Badge variant="outline" className={profile.preferences?.privacy?.showSkills ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}>
                    {profile.preferences?.privacy?.showSkills ? 'Visible' : 'Hidden'}
                  </Badge>
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
    </div>
  )
}


















