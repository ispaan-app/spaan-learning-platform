'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Avatar from 'react-nice-avatar'
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

interface OnboardingStep {
  id: string
  title: string
  subtitle: string
  description: string
  avatarConfig: {
    sex: 'man' | 'woman'
    faceColor: string
    earSize: 'small' | 'big'
    eyeStyle: 'circle' | 'oval' | 'smile'
    noseStyle: 'short' | 'long' | 'round'
    mouthStyle: 'laugh' | 'smile' | 'peace'
    shirtStyle: 'hoody' | 'short' | 'polo'
    glassesStyle: 'none' | 'round' | 'square'
    hairColor: string
    hairStyle: 'normal' | 'thick' | 'mohawk' | 'womanLong' | 'womanShort'
    hatStyle: 'none' | 'beanie' | 'turban'
    shirtColor: string
    bgColor: string
  }
  features: string[]
  color: string
  icon: React.ComponentType<any>
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to iSpaan!',
    subtitle: 'Your Learning Journey Starts Here',
    description: 'We\'re excited to have you join our community of learners and innovators.',
    avatarConfig: {
      sex: 'man' as const,
      faceColor: '#F9C9B6',
      earSize: 'small' as const,
      eyeStyle: 'smile' as const,
      noseStyle: 'short' as const,
      mouthStyle: 'smile' as const,
      shirtStyle: 'hoody' as const,
      glassesStyle: 'none' as const,
      hairColor: '#8B4513',
      hairStyle: 'normal' as const,
      hatStyle: 'none' as const,
      shirtColor: '#4A90E2',
      bgColor: '#E8F4FD'
    },
    features: [
      'Personalized learning paths',
      'Expert mentorship',
      'Real-world projects',
      'Career guidance'
    ],
    color: 'blue',
    icon: Heart
  },
  {
    id: 'discover',
    title: 'Discover Your Path',
    subtitle: 'Find the Perfect Program',
    description: 'Explore our diverse range of programs designed to match your interests and career goals.',
    avatarConfig: {
      sex: 'woman' as const,
      faceColor: '#F9C9B6',
      earSize: 'small' as const,
      eyeStyle: 'circle' as const,
      noseStyle: 'short' as const,
      mouthStyle: 'smile' as const,
      shirtStyle: 'polo' as const,
      glassesStyle: 'none' as const,
      hairColor: '#D4AF37',
      hairStyle: 'womanLong' as const,
      hatStyle: 'none' as const,
      shirtColor: '#2E8B57',
      bgColor: '#F0F8F0'
    },
    features: [
      'Computer Science',
      'Data Science',
      'Web Development',
      'Digital Marketing'
    ],
    color: 'purple',
    icon: Target
  },
  {
    id: 'learn',
    title: 'Learn & Grow',
    subtitle: 'Interactive Learning Experience',
    description: 'Engage with hands-on projects, peer collaboration, and expert guidance.',
    avatarConfig: {
      sex: 'man' as const,
      faceColor: '#F9C9B6',
      earSize: 'small' as const,
      eyeStyle: 'smile' as const,
      noseStyle: 'short' as const,
      mouthStyle: 'smile' as const,
      shirtStyle: 'short' as const,
      glassesStyle: 'none' as const,
      hairColor: '#000000',
      hairStyle: 'normal' as const,
      hatStyle: 'none' as const,
      shirtColor: '#FF6B6B',
      bgColor: '#FFF0F0'
    },
    features: [
      'Interactive lessons',
      'Project-based learning',
      'Peer collaboration',
      'Expert mentorship'
    ],
    color: 'green',
    icon: Brain
  },
  {
    id: 'succeed',
    title: 'Achieve Success',
    subtitle: 'Transform Your Career',
    description: 'Graduate with industry-ready skills and a portfolio that opens doors.',
    avatarConfig: {
      sex: 'woman' as const,
      faceColor: '#F9C9B6',
      earSize: 'small' as const,
      eyeStyle: 'smile' as const,
      noseStyle: 'short' as const,
      mouthStyle: 'laugh' as const,
      shirtStyle: 'polo' as const,
      glassesStyle: 'none' as const,
      hairColor: '#8B4513',
      hairStyle: 'womanLong' as const,
      hatStyle: 'none' as const,
      shirtColor: '#9B59B6',
      bgColor: '#F3E5F5'
    },
    features: [
      'Industry certifications',
      'Portfolio development',
      'Job placement support',
      'Lifetime access'
    ],
    color: 'orange',
    icon: Award
  }
]

export function MobileOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)
  const router = useRouter()

  const step = onboardingSteps[currentStep]
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => {
      setIsAnimating(false)
      setShowFeatures(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
            <span className="text-sm font-medium text-gray-600">Step {currentStep + 1} of {onboardingSteps.length}</span>
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
                <Avatar
                  style={{ width: 120, height: 120 }}
                  {...step.avatarConfig}
                />
              </div>
            </div>
            
            {/* Floating Icons */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-bounce delay-300">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div className="absolute top-1/2 -right-6 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Content Card */}
          <Card className="w-full max-w-sm bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-6">
              {/* Step Icon */}
              <div className="flex justify-center mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${getColorClasses(step.color)} rounded-xl flex items-center justify-center shadow-lg`}>
                  <step.icon className={`w-6 h-6 ${getIconColor(step.color)}`} />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                {step.title}
              </h1>

              {/* Subtitle */}
              <h2 className="text-lg font-semibold text-center text-gray-600 mb-4">
                {step.subtitle}
              </h2>

              {/* Description */}
              <p className="text-center text-gray-600 mb-6 leading-relaxed">
                {step.description}
              </p>

              {/* Features */}
              <div className={`space-y-3 transition-all duration-500 ${showFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {step.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 group"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-6 h-6 bg-gradient-to-r ${getColorClasses(step.color)} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step Indicators */}
          <div className="flex space-x-2 mt-8">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
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
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 rounded-full border-2 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <Button
              onClick={handleNext}
              size="lg"
              className={`flex items-center space-x-2 px-8 py-3 bg-gradient-to-r ${getColorClasses(step.color)} text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
            >
              <span>
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </span>
              {currentStep === onboardingSteps.length - 1 ? (
                <Play className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
