'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  FileText,
  Award,
  Clock,
  Wifi,
  WifiOff,
  Star,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Globe,
  Heart,
  Crown,
  MessageCircle,
  BarChart3,
  Settings,
  Bell,
  Eye,
  Download,
  Plus,
  Minus,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  dateOfBirth?: string
  gender?: string
  idNumber?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  skills?: string[]
  experience?: string
  education?: string
  createdAt: any
  updatedAt: any
  status: string
  role: string
}

export default function ApplicantProfilePage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [newSkill, setNewSkill] = useState('')
  const [newEmergencyContact, setNewEmergencyContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  })
  
  // Real-time data states
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [realTimeStats, setRealTimeStats] = useState({
    profileCompleteness: 0,
    lastLogin: '',
    totalUpdates: 0,
    systemHealth: 'excellent'
  })
  
  // Refs for real-time subscriptions
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login/user')
    }
  }, [user, authLoading, router])

  // Real-time profile data subscription
  useEffect(() => {
    if (!user) return

    const setupRealTimeProfile = () => {
      try {
        setLoading(true)
        
        // Set up real-time subscription to user profile
        const userRef = doc(db, 'users', user.uid)
        const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data()
            setProfile(userData as UserProfile)
            setFormData(userData as UserProfile)
            
            // Calculate profile completeness
            const completeness = calculateProfileCompleteness(userData)
            setRealTimeStats(prev => ({
              ...prev,
              profileCompleteness: completeness,
              lastLogin: userData.lastLogin?.toDate?.()?.toLocaleString() || 'Unknown',
              totalUpdates: (prev.totalUpdates || 0) + 1
            }))
            
            setLastUpdate(new Date().toLocaleTimeString())
            setIsOnline(true)
          }
        }, (error) => {
          console.error('Real-time profile subscription error:', error)
          setIsOnline(false)
          toast.error('Connection lost. Retrying...')
        })

        unsubscribeRef.current = unsubscribe
      } catch (error) {
        console.error('Error setting up real-time profile:', error)
        toast.error('Failed to load profile data')
        setIsOnline(false)
      } finally {
        setLoading(false)
      }
    }

    setupRealTimeProfile()

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [user])

  // Calculate profile completeness
  const calculateProfileCompleteness = (userData: any) => {
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 
      'dateOfBirth', 'gender', 'idNumber', 'emergencyContact',
      'skills', 'experience', 'education'
    ]
    
    const completedFields = fields.filter(field => {
      if (field === 'emergencyContact') {
        return userData[field]?.name && userData[field]?.phone && userData[field]?.relationship
      }
      if (field === 'skills') {
        return userData[field] && userData[field].length > 0
      }
      return userData[field] && userData[field] !== ''
    }).length
    
    return Math.round((completedFields / fields.length) * 100)
  }

  const handleEdit = () => {
    setEditing(true)
    setFormData(profile || {})
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData(profile || {})
    setNewSkill('')
    setNewEmergencyContact({ name: '', phone: '', relationship: '' })
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      
      const updateData = {
        ...formData,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: user.uid,
        updateSource: 'profile_page'
      }

      await updateDoc(doc(db, 'users', user.uid), updateData)
      
      // Update real-time stats
      setRealTimeStats(prev => ({
        ...prev,
        totalUpdates: prev.totalUpdates + 1
      }))
      
      setProfile(formData as UserProfile)
      setEditing(false)
      toast.success('Profile updated successfully!', {
        description: 'Your changes have been saved and synced across all devices.',
        action: {
          label: 'View Changes',
          onClick: () => window.location.reload()
        }
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile', {
        description: 'Please check your connection and try again.',
        action: {
          label: 'Retry',
          onClick: handleSave
        }
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Force refresh by re-fetching the document
      const userDoc = await getDoc(doc(db, 'users', user!.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setProfile(userData as UserProfile)
        setFormData(userData as UserProfile)
        setLastUpdate(new Date().toLocaleTimeString())
        toast.success('Profile refreshed successfully!')
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
      toast.error('Failed to refresh profile')
    } finally {
      setRefreshing(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && formData.skills) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (index: number) => {
    if (formData.skills) {
      setFormData(prev => ({
        ...prev,
        skills: prev.skills?.filter((_, i) => i !== index)
      }))
    }
  }

  const handleUpdateEmergencyContact = () => {
    if (newEmergencyContact.name && newEmergencyContact.phone && newEmergencyContact.relationship) {
      setFormData(prev => ({
        ...prev,
        emergencyContact: newEmergencyContact
      }))
      setNewEmergencyContact({ name: '', phone: '', relationship: '' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'pending_review': return <Clock className="h-4 w-4" />
      case 'under_review': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (authLoading || loading) {
    return (
      <AdminLayout userRole="applicant">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Loading Your Profile</h3>
              <p className="text-gray-600">Setting up real-time data connection...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!user || !profile) {
    return null // Will redirect to login
  }

  return (
    <AdminLayout userRole="applicant">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative space-y-6 p-6 animate-in fade-in duration-500">
          {/* Enhanced Header with Real-time Status */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Profile Management
                    </h1>
                    <p className="text-gray-600">Manage your personal information and settings</p>
                  </div>
                </div>
                
                {/* Real-time Status Indicators */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                      {isOnline ? 'Live Data' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Last Update: {lastUpdate || 'Never'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Updates: {realTimeStats.totalUpdates}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-gray-600">Completeness: {realTimeStats.profileCompleteness}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                  className="shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                {!editing ? (
                  <Button 
                    onClick={handleEdit} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={handleCancel} 
                      variant="outline"
                      disabled={saving}
                      className="shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced Profile Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white/90 backdrop-blur-md shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="text-center pb-4 relative">
                  {/* Floating Elements */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center animate-pulse">
                    <Heart className="h-2 w-2 text-white" />
                  </div>
                  
                  <div className="relative inline-block">
                    <div className="relative">
                      <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-white shadow-xl">
                        <AvatarImage src={user.photoURL || ''} alt="Profile" />
                        <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {profile.firstName?.[0]}{profile.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {editing && (
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Online Status Indicator */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {profile.firstName} {profile.lastName}
                  </CardTitle>
                  <p className="text-gray-600 flex items-center justify-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </p>
                  <Badge className={`mt-2 ${getStatusColor(profile.status)} shadow-lg`}>
                    {getStatusIcon(profile.status)}
                    <span className="ml-1 capitalize">{profile.status.replace('_', ' ')}</span>
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 flex items-center justify-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Member since</span>
                    </p>
                    <p className="font-semibold text-gray-900">
                      {profile.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                    </p>
                  </div>
                  
                  <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                  
                  {/* Enhanced Profile Completion */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>Profile Completion</span>
                      </span>
                      <span className="font-semibold text-gray-900">{realTimeStats.profileCompleteness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${realTimeStats.profileCompleteness}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      {realTimeStats.profileCompleteness < 50 ? 'Complete more fields to improve your profile' :
                       realTimeStats.profileCompleteness < 80 ? 'Great progress! Keep going' :
                       'Excellent! Your profile is almost complete'}
                    </p>
                  </div>
                  
                  {/* Real-time Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 text-blue-600">
                        <Activity className="h-4 w-4" />
                        <span className="text-xs font-medium">Updates</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900">{realTimeStats.totalUpdates}</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 text-green-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-medium">Last Login</span>
                      </div>
                      <p className="text-xs font-bold text-green-900 truncate">{realTimeStats.lastLogin || 'Unknown'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="bg-white/90 backdrop-blur-md shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Personal Information
                      </span>
                      <p className="text-sm text-gray-600">Your basic profile details</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>First Name</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!editing}
                        className={`transition-all duration-300 ${editing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'} group-hover:shadow-md`}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Last Name</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!editing}
                        className={`transition-all duration-300 ${editing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'} group-hover:shadow-md`}
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email Address</span>
                      </Label>
                      <Input
                        id="email"
                        value={formData.email || ''}
                        disabled
                        className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Phone Number</span>
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!editing}
                        className={`transition-all duration-300 ${editing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'} group-hover:shadow-md`}
                        placeholder="+27 XX XXX XXXX"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="idNumber" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>ID Number</span>
                      </Label>
                      <Input
                        id="idNumber"
                        value={formData.idNumber || ''}
                        onChange={(e) => handleInputChange('idNumber', e.target.value)}
                        disabled={!editing}
                        className={`transition-all duration-300 ${editing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'} group-hover:shadow-md`}
                        placeholder="XXXXXXXXXXXXX"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Date of Birth</span>
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth || ''}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        disabled={!editing}
                        className={`transition-all duration-300 ${editing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'} group-hover:shadow-md`}
                      />
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Gender</span>
                      </Label>
                      <select
                        id="gender"
                        value={formData.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        disabled={!editing}
                        className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 ${
                          editing 
                            ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300' 
                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                        } group-hover:shadow-md`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 group">
                    <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Address</span>
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!editing}
                      placeholder="Enter your full address"
                      rows={3}
                      className={`transition-all duration-300 ${editing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'} group-hover:shadow-md resize-none`}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="bg-white/90 backdrop-blur-md shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Emergency Contact
                      </span>
                      <p className="text-sm text-gray-600">Your emergency contact information</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName">Name</Label>
                        <Input
                          id="emergencyName"
                          value={newEmergencyContact.name}
                          onChange={(e) => setNewEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Phone</Label>
                        <Input
                          id="emergencyPhone"
                          value={newEmergencyContact.phone}
                          onChange={(e) => setNewEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+27 XX XXX XXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyRelationship">Relationship</Label>
                        <Input
                          id="emergencyRelationship"
                          value={newEmergencyContact.relationship}
                          onChange={(e) => setNewEmergencyContact(prev => ({ ...prev, relationship: e.target.value }))}
                          placeholder="e.g., Parent, Spouse"
                        />
                      </div>
                    </div>
                    <Button onClick={handleUpdateEmergencyContact} size="sm">
                      Update Emergency Contact
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {profile.emergencyContact?.name || 'Not provided'}</p>
                    <p><strong>Phone:</strong> {profile.emergencyContact?.phone || 'Not provided'}</p>
                    <p><strong>Relationship:</strong> {profile.emergencyContact?.relationship || 'Not provided'}</p>
                  </div>
                )}
                </CardContent>
              </Card>

              {/* Skills & Experience */}
              <Card className="bg-white/90 backdrop-blur-md shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Skills & Experience
                      </span>
                      <p className="text-sm text-gray-600">Your professional skills and background</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                {/* Skills */}
                <div className="space-y-2">
                  <Label>Skills</Label>
                  {editing ? (
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        />
                        <Button onClick={handleAddSkill} size="sm">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills?.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                            <span>{skill}</span>
                            <button
                              onClick={() => handleRemoveSkill(index)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                      {(!profile.skills || profile.skills.length === 0) && (
                        <p className="text-gray-500 text-sm">No skills added yet</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Work Experience</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience || ''}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    disabled={!editing}
                    placeholder="Describe your work experience"
                    rows={4}
                  />
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    value={formData.education || ''}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    disabled={!editing}
                    placeholder="Describe your educational background"
                    rows={3}
                  />
                </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="bg-white/90 backdrop-blur-md shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
                        Account Information
                      </span>
                      <p className="text-sm text-gray-600">Your account details and status</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Account Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(profile.status)}>
                        {getStatusIcon(profile.status)}
                        <span className="ml-1 capitalize">{profile.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <p className="mt-1 text-sm text-gray-600 capitalize">{profile.role}</p>
                  </div>
                  <div>
                    <Label>Member Since</Label>
                    <p className="mt-1 text-sm text-gray-600">
                      {profile.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <Label>Last Updated</Label>
                    <p className="mt-1 text-sm text-gray-600">
                      {profile.updatedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                    </p>
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
