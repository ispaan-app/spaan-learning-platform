'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Sun, Cloud, CloudRain, CloudSnow, Wind, Thermometer, Clock, Shield, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface SuperAdminWelcomeHeaderProps {
  userName: string
  className?: string
}

interface WeatherData {
  temperature: number
  condition: string
  description: string
  icon: string
}

export function SuperAdminWelcomeHeader({ userName, className }: SuperAdminWelcomeHeaderProps) {
  const router = useRouter()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Fetch weather data (mock for now - in production, use a real weather API)
    const fetchWeather = async () => {
      // Mock weather data - replace with actual API call
      setWeather({
        temperature: 22,
        condition: 'partly-cloudy',
        description: 'Partly Cloudy',
        icon: 'cloud'
      })
    }

    fetchWeather()

    return () => clearInterval(timer)
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="h-6 w-6 text-yellow-500" />
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-gray-500" />
      case 'partly-cloudy':
        return <Cloud className="h-6 w-6 text-blue-400" />
      case 'rainy':
        return <CloudRain className="h-6 w-6 text-blue-600" />
      case 'snowy':
        return <CloudSnow className="h-6 w-6 text-blue-300" />
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getAdminMessage = () => {
    const hour = currentTime.getHours()
    const dayOfWeek = currentTime.getDay()
    
    if (dayOfWeek === 1) { // Monday
      return "Ready to oversee another week of platform excellence?"
    } else if (dayOfWeek === 5) { // Friday
      return "Great week of platform management! Let's finish strong!"
    } else if (hour < 9) {
      return "Early start! Your platform oversight is building success!"
    } else if (hour > 18) {
      return "Evening admin session - dedication to platform excellence!"
    } else {
      return "Ready to manage and optimize the platform?"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <Card className={cn(
        "relative overflow-hidden border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700",
        className
      )}>
        <CardContent className="relative p-8 text-white">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "relative overflow-hidden border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700",
      className
    )}>
      {/* Background Pattern with Glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-sm"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full -translate-y-8 -translate-x-8"></div>
      <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-white/5 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-white/10 rounded-full animate-bounce"></div>
      
      <CardContent className="relative p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          {/* Welcome Message */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg border border-white/20">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {getGreeting()}, {userName}!
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  {getAdminMessage()}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-blue-100 text-lg">
                "Empowering learners through comprehensive platform management and oversight"
              </p>
              <div className="flex items-center space-x-4 text-sm text-blue-200">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(currentTime)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{formatDate(currentTime)}</span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  Super Admin
                </Badge>
              </div>
            </div>
          </div>

          {/* Weather and System Status Section */}
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row space-y-4 sm:space-y-0 sm:space-x-4 lg:space-y-4 lg:space-x-0 xl:space-y-0 xl:space-x-4">
            {/* Weather Card */}
            {weather && (
              <div className="bg-white/15 rounded-2xl p-6 backdrop-blur-sm border border-white/20 shadow-lg min-w-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-white">Weather</h3>
                  <div className="p-2 bg-white/20 rounded-lg shadow-md">
                    {getWeatherIcon(weather.condition)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-blue-200" />
                    <span className="text-2xl font-bold text-white">{weather.temperature}°C</span>
                  </div>
                  <p className="text-blue-100 text-sm">{weather.description}</p>
                </div>
              </div>
            )}

            {/* System Status Card */}
            <div className="bg-white/15 rounded-2xl p-6 backdrop-blur-sm border border-white/20 shadow-lg min-w-[200px]">
              <div className="text-center">
                <div className="p-3 bg-white/20 rounded-xl mb-4 mx-auto w-fit shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">System Status</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Platform running optimally
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-200 text-sm font-medium">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
