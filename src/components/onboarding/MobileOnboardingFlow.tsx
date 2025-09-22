'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
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
  RotateCcw
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
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to iSpaan!',
    subtitle: 'Your Learning Journey Starts Here',
    description: 'We\'re excited to have you join our community of learners and innovators.',
    features: ['AI-Powered Learning', 'Real-time Progress Tracking', 'Industry Connections'],
    color: '#4A90E2',
    icon: Users
  }
]

export default function MobileOnboardingFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [showFeatures, setShowFeatures] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps)
  const [realData, setRealData] = useState({
    activeLearners: 0,
    industryPartners: 0,
    successRate: 0,
    totalPrograms: 0
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

      setRealData({
        activeLearners,
        industryPartners: totalPrograms,
        successRate,
        totalPrograms
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setShowFeatures(false)
      setCurrentStep(prev => prev + 1)
    } else {
      router.push('/apply')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setShowFeatures(false)
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    router.push('/apply')
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

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Mobile Container */}
      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">iSpaan</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
          {/* Avatar Container */}
          <div className="relative mb-8">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getColorClasses(step.color)} p-1 shadow-2xl transform transition-all duration-500 ${isAnimating ? 'scale-110 rotate-6' : 'scale-100 rotate-0'}`}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <step.icon className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            {/* Floating Icons */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center animate-pulse">
              <Heart className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {step.title}
              </h1>
            <h2 className="text-xl text-gray-600 mb-4">
                {step.subtitle}
              </h2>
            <p className="text-gray-500 leading-relaxed max-w-sm">
                {step.description}
              </p>
          </div>

              {/* Features */}
          {step.features && step.features.length > 0 && (
            <div className="w-full max-w-sm mb-8">
              <div className="grid grid-cols-1 gap-3">
                {step.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200"
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
          <div className="flex space-x-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? `bg-gradient-to-r ${getColorClasses(step.color)} w-8` 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            <Button
              variant="outline"
              size="lg"
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 rounded-full border-2 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePrevious}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <Button
              size="lg"
              className={`flex items-center space-x-2 px-6 py-3 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${getColorClasses(step.color)}`}
              onClick={handleNext}
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
