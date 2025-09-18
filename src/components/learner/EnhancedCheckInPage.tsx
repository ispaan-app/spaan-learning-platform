'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  MapPin, 
  Camera, 
  QrCode, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Timer,
  Smartphone,
  Wifi,
  Battery,
  Signal,
  Sparkles,
  Zap,
  Star,
  Heart,
  Crown,
  Shield,
  Brain,
  Users,
  Award,
  Target,
  Activity,
  TrendingUp,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Settings,
  Bell,
  Eye,
  EyeOff,
  Plus,
  Minus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckInData {
  id: string
  checkInTime: string
  checkOutTime?: string
  location: string
  status: 'checked-in' | 'checked-out' | 'break'
  workHours: number
  breakTime: number
}

interface LocationData {
  name: string
  address: string
  coordinates: { lat: number; lng: number }
  distance: number
  isVerified: boolean
}

export function EnhancedCheckInPage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState<LocationData | null>(null)
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [workSession, setWorkSession] = useState({
    startTime: null as Date | null,
    totalHours: 0,
    breakTime: 0,
    isOnBreak: false
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleCheckIn = async () => {
    setIsLoading(true)
    
    // Simulate location verification
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const now = new Date()
    setWorkSession(prev => ({
      ...prev,
      startTime: now
    }))
    
    setCheckInData({
      id: '1',
      checkInTime: now.toISOString(),
      location: 'Main Office - Floor 3',
      status: 'checked-in',
      workHours: 0,
      breakTime: 0
    })
    
    setIsCheckedIn(true)
    setIsLoading(false)
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (workSession.startTime) {
      const endTime = new Date()
      const totalHours = (endTime.getTime() - workSession.startTime.getTime()) / (1000 * 60 * 60)
      
      setCheckInData(prev => prev ? {
        ...prev,
        checkOutTime: endTime.toISOString(),
        status: 'checked-out',
        workHours: totalHours
      } : null)
    }
    
    setIsCheckedIn(false)
    setWorkSession({
      startTime: null,
      totalHours: 0,
      breakTime: 0,
      isOnBreak: false
    })
    setIsLoading(false)
  }

  const handleBreak = () => {
    setWorkSession(prev => ({
      ...prev,
      isOnBreak: !prev.isOnBreak
    }))
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getCurrentWorkHours = () => {
    if (!workSession.startTime) return 0
    const now = new Date()
    return (now.getTime() - workSession.startTime.getTime()) / (1000 * 60 * 60)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Check In/Out</h1>
              <p className="text-xl text-gray-600">Track your work hours and attendance</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Check In/Out Card */}
          <div className="lg:col-span-2">
            <Card className="relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center space-x-2">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <span>Work Session</span>
                  </CardTitle>
                  <Badge variant={isCheckedIn ? "default" : "secondary"} className="text-sm">
                    {isCheckedIn ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="relative space-y-6">
                {/* Current Status */}
                <div className="text-center py-8">
                  {isCheckedIn ? (
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <CheckCircle className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-green-600 mb-2">Checked In</h3>
                        <p className="text-gray-600">You're currently working</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <Clock className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-600 mb-2">Not Checked In</h3>
                        <p className="text-gray-600">Ready to start your work day</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Work Hours Display */}
                {isCheckedIn && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {getCurrentWorkHours().toFixed(2)}h
                      </div>
                      <div className="text-sm text-gray-600">Current Work Hours</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {!isCheckedIn ? (
                    <Button
                      onClick={handleCheckIn}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      )}
                      Check In
                    </Button>
                  ) : (
                    <div className="flex space-x-4 w-full">
                      <Button
                        onClick={handleBreak}
                        variant="outline"
                        className="flex-1 py-4 text-lg font-semibold"
                      >
                        {workSession.isOnBreak ? (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            End Break
                          </>
                        ) : (
                          <>
                            <Pause className="w-5 h-5 mr-2" />
                            Take Break
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCheckOut}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <Clock className="w-5 h-5 mr-2" />
                        )}
                        Check Out
                      </Button>
                    </div>
                  )}
                </div>

                {/* QR Code Scanner Toggle */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowQRScanner(!showQRScanner)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {showQRScanner ? 'Hide' : 'Show'} QR Scanner
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Main Office</h4>
                      <p className="text-sm text-gray-600">Floor 3, Room 301</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Distance</span>
                      <span className="font-semibold">0.2 km</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Today's Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Work Hours</span>
                    <span className="font-semibold text-gray-900">
                      {getCurrentWorkHours().toFixed(2)}h
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Break Time</span>
                    <span className="font-semibold text-gray-900">
                      {workSession.breakTime.toFixed(2)}h
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant={isCheckedIn ? "default" : "secondary"}>
                      {isCheckedIn ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: '9:00 AM',
                    action: 'Checked In',
                    location: 'Main Office - Floor 3',
                    status: 'success'
                  },
                  {
                    time: '12:00 PM',
                    action: 'Took Break',
                    location: 'Main Office - Floor 3',
                    status: 'info'
                  },
                  {
                    time: '1:00 PM',
                    action: 'Ended Break',
                    location: 'Main Office - Floor 3',
                    status: 'success'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{activity.action}</h4>
                      <p className="text-sm text-gray-600">{activity.location}</p>
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
