'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react'

interface ProfileSettingsProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: 'super-admin' | 'admin' | 'applicant' | 'learner'
    preferences?: {
      notifications: boolean
      emailUpdates: boolean
      darkMode: boolean
      language: string
      timezone: string
    }
  }
  onSave?: (data: any) => void
}

export function ProfileSettings({ user, onSave }: ProfileSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    preferences: {
      notifications: user.preferences?.notifications ?? true,
      emailUpdates: user.preferences?.emailUpdates ?? true,
      darkMode: user.preferences?.darkMode ?? false,
      language: user.preferences?.language ?? 'en',
      timezone: user.preferences?.timezone ?? 'UTC'
    }
  })

  const handleSave = () => {
    onSave?.(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      preferences: {
        notifications: user.preferences?.notifications ?? true,
        emailUpdates: user.preferences?.emailUpdates ?? true,
        darkMode: user.preferences?.darkMode ?? false,
        language: user.preferences?.language ?? 'en',
        timezone: user.preferences?.timezone ?? 'UTC'
      }
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-[#6D9773]" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
                className="border-[#6D9773]/20 focus:border-[#6D9773]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
                className="border-[#6D9773]/20 focus:border-[#6D9773]"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              className="border-[#6D9773]/20 focus:border-[#6D9773]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                disabled={!isEditing}
                className="border-[#6D9773]/20 focus:border-[#6D9773] pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#B46617]" />
            <span>Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-600">Receive notifications for important updates</p>
            </div>
            <Switch
              checked={formData.preferences.notifications}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ 
                  ...prev, 
                  preferences: { ...prev.preferences, notifications: checked }
                }))
              }
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Updates</Label>
              <p className="text-sm text-gray-600">Receive email notifications and updates</p>
            </div>
            <Switch
              checked={formData.preferences.emailUpdates}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ 
                  ...prev, 
                  preferences: { ...prev.preferences, emailUpdates: checked }
                }))
              }
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Dark Mode</Label>
              <p className="text-sm text-gray-600">Use dark theme for the interface</p>
            </div>
            <Switch
              checked={formData.preferences.darkMode}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ 
                  ...prev, 
                  preferences: { ...prev.preferences, darkMode: checked }
                }))
              }
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={formData.preferences.language}
                onValueChange={(value) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, language: value }
                  }))
                }
                disabled={!isEditing}
              >
                <SelectTrigger className="border-[#6D9773]/20 focus:border-[#6D9773]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={formData.preferences.timezone}
                onValueChange={(value) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, timezone: value }
                  }))
                }
                disabled={!isEditing}
              >
                <SelectTrigger className="border-[#6D9773]/20 focus:border-[#6D9773]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#FFBA00]" />
            <span>Security Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Two-Factor Authentication</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Add an extra layer of security to your account
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              Enable 2FA
            </Button>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <Settings className="w-4 h-4" />
              <span className="font-medium">Login Activity</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              View recent login activity and active sessions
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              View Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-[#6D9773] hover:bg-[#5a7c5f]">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="bg-[#6D9773] hover:bg-[#5a7c5f]">
            <Settings className="w-4 h-4 mr-2" />
            Edit Settings
          </Button>
        )}
      </div>
    </div>
  )
}





