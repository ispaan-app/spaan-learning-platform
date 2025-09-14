'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { AvatarUpload } from '@/components/ui/file-upload'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { uploadAvatar } from '@/lib/fileUpload'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { 
  User, 
  Settings, 
  LogOut, 
  UserCircle,
  Shield,
  FileText,
  Bell,
  Camera,
  ChevronDown,
  Edit,
  Home,
  BarChart3
} from 'lucide-react'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: string
  status: string
  updatedAt: string
}

export function AvatarHeader() {
  const { user, userRole, logout } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user?.uid) return
    
    setLoading(true)
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile
        setProfile(userData)
      } else {
        // Create a default profile
        const defaultProfile: UserProfile = {
          id: user.uid,
          firstName: user.displayName?.split(' ')[0] || 'User',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          role: userRole || 'learner',
          status: 'active',
          updatedAt: new Date().toISOString()
        }
        setProfile(defaultProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Set fallback profile
      setProfile({
        id: user.uid,
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        role: userRole || 'learner',
        status: 'active',
        updatedAt: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' }
    
    setAvatarUploading(true)
    try {
      const result = await uploadAvatar(file, user.uid)
      
      if (result.success && result.url) {
        await updateDoc(doc(db, 'users', user.uid), { 
          avatar: result.url,
          updatedAt: new Date().toISOString()
        })
        
        setProfile(prev => prev ? {
          ...prev,
          avatar: result.url,
          updatedAt: new Date().toISOString()
        } : null)
        
        toast.success('Avatar updated successfully')
        setShowAvatarUpload(false)
        return { success: true, url: result.url }
      } else {
        toast.error(result.error || 'Failed to upload avatar')
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload avatar')
      return { success: false, error: error.message }
    } finally {
      setAvatarUploading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super-admin':
        return <Shield className="w-4 h-4 text-red-600" />
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />
      case 'learner':
        return <User className="w-4 h-4 text-green-600" />
      case 'applicant':
        return <UserCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'text-red-600'
      case 'admin':
        return 'text-blue-600'
      case 'learner':
        return 'text-green-600'
      case 'applicant':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getProfileUrl = (role: string) => {
    switch (role) {
      case 'super-admin':
        return '/super-admin/profile'
      case 'admin':
        return '/admin/profile'
      default:
        return '/profile'
    }
  }

  const getDashboardUrl = (role: string) => {
    switch (role) {
      case 'super-admin':
        return '/super-admin/dashboard'
      case 'admin':
        return '/admin/dashboard'
      default:
        return '/dashboard'
    }
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/login">
          <Button variant="outline">Sign In</Button>
        </Link>
        <Link href="/apply">
          <Button>Apply Now</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Update Avatar</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAvatarUpload(false)}
              >
                ×
              </Button>
            </div>
            <AvatarUpload
              onUpload={handleAvatarUpload}
              currentAvatar={profile.avatar}
              disabled={avatarUploading}
              label="Upload New Avatar"
              description="Choose a new profile picture (max 5MB)"
            />
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="hidden md:block text-right">
        <div className="text-sm font-medium text-gray-900">
          {profile.firstName} {profile.lastName}
        </div>
        <div className="flex items-center space-x-1">
          {getRoleIcon(profile.role)}
          <span className={`text-xs ${getRoleColor(profile.role)}`}>
            {profile.role.replace('-', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Avatar Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <ChevronDown className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full p-0.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile.email}
              </p>
              <div className="flex items-center space-x-1 pt-1">
                {getRoleIcon(profile.role)}
                <span className={`text-xs ${getRoleColor(profile.role)}`}>
                  {profile.role.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Navigation Links */}
          <DropdownMenuItem asChild>
            <Link href={getDashboardUrl(profile.role)} className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href={getProfileUrl(profile.role)} className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>

          {/* Role-specific navigation */}
          {profile.role === 'super-admin' && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/super-admin/users" className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>User Management</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/super-admin/appearance" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Appearance</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {profile.role === 'admin' && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin/users" className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>User Management</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {/* Documents */}
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              <span>Documents</span>
            </Link>
          </DropdownMenuItem>

          {/* Notifications */}
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          {/* Avatar Upload */}
          <DropdownMenuItem onClick={() => setShowAvatarUpload(true)}>
            <Camera className="mr-2 h-4 w-4" />
            <span>Update Avatar</span>
          </DropdownMenuItem>

          {/* Settings */}
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          {/* Sign Out */}
          <DropdownMenuItem onClick={logout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


