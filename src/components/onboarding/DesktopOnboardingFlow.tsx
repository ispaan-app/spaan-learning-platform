'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles, 
  Star, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  Target, 
  Award, 
  Brain,
  Heart,
  Smile,
  ThumbsUp,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  X,
  SkipForward
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'

interface OnboardingStep {
  id: string
  title: string
  subtitle: string
  description: string
  features: string[]
  color: string
  icon: React.ComponentType<any>
  image?: string
  videoUrl?: string
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to iSpaan!',
    subtitle: 'Your Learning Journey Starts Here',
    description: 'We\'re excited to have you join our community of learners and innovators. Let\'s get you set up for success.',
    features: ['AI-Powered Learning', 'Real-time Progress Tracking', 'Industry Connections'],
    color: '#4A90E2',
    icon: Users
  },
  {
    id: 'features',
    title: 'Discover Powerful Features',
    subtitle: 'Everything You Need to Succeed',
    description: 'Explore our comprehensive platform designed to bridge the gap between academic learning and real-world experience.',
    features: ['GPS-based Attendance', 'AI Career Mentor', 'Industry Placements'],
    color: '#8B5CF6',
    icon: Zap
  },
  {
    id: 'community',
    title: 'Join Our Community',
    subtitle: 'Connect with Fellow Learners',
    description: 'Be part of a vibrant community of South African learners, mentors, and industry professionals.',
    features: ['2,500+ Active Learners', '150+ Industry Partners', '95% Success Rate'],
    color: '#10B981',
    icon: Globe
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    subtitle: 'Ready to Start Your Journey',
    description: 'Everything is configured and ready. Your learning adventure begins now!',
    features: ['Personalized Dashboard', 'Learning Paths', 'Progress Tracking'],
    color: '#F59E0B',
    icon: Target
  }
]

export default function DesktopOnboardingFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [showFeatures, setShowFeatures] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(5) // 5 seconds per step
  const [realData, setRealData] = useState({
    activeLearners: 0,
    industryPartners: 0,
    successRate: 0,
    totalPrograms: 0,
    recentApplications: 0
  })
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    setIsAnimating(true)
  }, [])

  // Fetch real data from Firebase
  const fetchRealData = async () => {
    try {
      setIsLoadingData(true)
      
      // Fetch active learners
      const learnersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'learner'),
        where('status', '==', 'active')
      )
      const learnersSnapshot = await getDocs(learnersQuery)
      const activeLearners = learnersSnapshot.size

      // Fetch total applications
      const applicationsSnapshot = await getDocs(collection(db, 'applications'))
      const totalApplications = applicationsSnapshot.size

      // Fetch programs (industry partners)
      const programsSnapshot = await getDocs(collection(db, 'programs'))
      const totalPrograms = programsSnapshot.size

      // Fetch completed placements
      const placementsQuery = query(
        collection(db, 'placements'),
        where('status', '==', 'completed')
      )
      const placementsSnapshot = await getDocs(placementsQuery)
      const completedPlacements = placementsSnapshot.size

      // Calculate success rate
      const successRate = totalApplications > 0 
        ? Math.round((completedPlacements / totalApplications) * 100)
        : 0

      // Fetch recent applications (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recentApplicationsQuery = query(
        collection(db, 'applications'),
        where('submittedAt', '>=', thirtyDaysAgo)
      )
      const recentApplicationsSnapshot = await getDocs(recentApplicationsQuery)
      const recentApplications = recentApplicationsSnapshot.size

      setRealData({
        activeLearners,
        industryPartners: totalPrograms,
        successRate,
        totalPrograms,
        recentApplications
      })

      // Update steps with real data
      const updatedSteps = [
        {
          ...defaultSteps[0],
          features: [
            `${activeLearners.toLocaleString()}+ Active Learners`,
            'AI-Powered Learning',
            'Real-time Progress Tracking'
          ]
        },
        {
          ...defaultSteps[1],
          features: [
            'GPS-based Attendance',
            'AI Career Mentor',
            'Industry Placements'
          ]
        },
        {
          ...defaultSteps[2],
          features: [
            `${activeLearners.toLocaleString()}+ Active Learners`,
            `${totalPrograms}+ Industry Partners`,
            `${successRate}% Success Rate`
          ]
        },
        {
          ...defaultSteps[3],
          features: [
            'Personalized Dashboard',
            'Learning Paths',
            'Progress Tracking'
          ]
        }
      ]
      
      setSteps(updatedSteps)
    } catch (error) {
      console.error('Error fetching real data:', error)
      // Keep default steps if data fetch fails
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    fetchRealData()
  }, [])

  // Ensure currentStep is within bounds
  useEffect(() => {
    if (steps.length > 0 && currentStep >= steps.length) {
      setCurrentStep(0)
    }
  }, [currentStep, steps.length])

  // Auto-advance functionality
  useEffect(() => {
    if (!isAutoPlaying || isMinimized || steps.length === 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-advance to next step
          if (currentStep < steps.length - 1) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
            return 5 // Reset timer for next step
          } else {
            // Auto-complete the tour
            router.push('/apply')
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, isMinimized, currentStep, steps.length, router])

  // Reset timer when step changes
  useEffect(() => {
    setTimeRemaining(5)
  }, [currentStep])

  const handleNext = () => {
    if (steps.length === 0) {
      router.push('/apply')
      return
    }
    
    if (currentStep < steps.length - 1) {
      setShowFeatures(false)
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    } else {
      router.push('/apply')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setShowFeatures(false)
      setCurrentStep(prev => Math.max(prev - 1, 0))
    }
  }

  const handleSkip = () => {
    router.push('/apply')
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      orange: 'text-orange-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const step = steps[currentStep] || steps[0] // Fallback to first step if currentStep is out of bounds
  const progress = ((currentStep + 1) / steps.length) * 100

  // Safety check - if no steps available, redirect to apply
  if (!step || steps.length === 0) {
    router.push('/apply')
    return null
  }

  // Show loading state while fetching real data
  if (isLoadingData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Tour Data</h3>
            <p className="text-gray-600">Fetching real-time platform statistics...</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleMinimize}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white shadow-2xl">
        {/* Header */}
        <CardHeader className="relative bg-gradient-to-r from-slate-50 to-blue-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Welcome to iSpaan</CardTitle>
                <p className="text-sm text-gray-600">Let's get you started</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Auto-play indicator and controls */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-white/50 rounded-full">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-xs font-medium text-gray-600">
                    {isAutoPlaying ? 'Auto' : 'Manual'}
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {timeRemaining}s
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAutoPlay}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                >
                  {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                <SkipForward className="w-4 h-4 mr-1" />
                Skip
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Step {currentStep + 1} of {steps.length}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
                {isAutoPlaying && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                  </div>
                )}
              </div>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200" />
            {isAutoPlaying && (
              <div className="mt-1 text-xs text-gray-500 text-center">
                Auto-advancing in {timeRemaining} seconds...
              </div>
            )}
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
            {/* Left Side - Content */}
            <div className="p-8 flex flex-col justify-center">
              <div className="space-y-6">
                {/* Icon and Title */}
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getColorClasses(step.color)} p-1 shadow-lg transform transition-all duration-500 ${isAnimating ? 'scale-110 rotate-6' : 'scale-100 rotate-0'}`}>
                    <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                      <step.icon className={`w-8 h-8 ${getIconColor(step.color)}`} />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h1>
                    <h2 className="text-xl text-gray-600">
                      {step.subtitle}
                    </h2>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed text-lg">
                  {step.description}
                </p>

                {/* Features */}
                {step.features && step.features.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Key Features:</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {step.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step Indicators */}
                <div className="flex space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? `bg-gradient-to-r ${getColorClasses(step.color)} w-8` 
                          : 'bg-gray-300 w-2'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 flex items-center justify-center relative overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
              </div>

              {/* Main Visual */}
              <div className="relative z-10 text-center">
                <div className={`w-48 h-48 mx-auto rounded-full bg-gradient-to-r ${getColorClasses(step.color)} p-1 shadow-2xl transform transition-all duration-500 ${isAnimating ? 'scale-110 rotate-6' : 'scale-100 rotate-0'}`}>
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <step.icon className={`w-24 h-24 ${getIconColor(step.color)}`} />
                  </div>
                </div>
                
                {/* Floating Icons */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center animate-pulse">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="absolute top-1/2 -right-8 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-ping">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Footer - Navigation */}
        <div className="bg-gray-50 border-t p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl border-2 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePrevious}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {steps.length}
              </span>
            </div>

            <Button
              size="lg"
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${getColorClasses(step.color)}`}
              onClick={handleNext}
            >
              <span>
                {currentStep === steps.length - 1 
                  ? (isAutoPlaying ? 'Get Started Now' : 'Get Started') 
                  : (isAutoPlaying ? 'Skip to Next' : 'Next')
                }
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
