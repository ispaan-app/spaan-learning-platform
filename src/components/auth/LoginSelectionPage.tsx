'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Avatar from 'avataaars'
import { User, Shield, Crown, ArrowRight, Sparkles, Zap, Globe, Star, CheckCircle, Award, Target, Brain, Users, Clock, Check, Heart, Smile, ThumbsUp, Play, ChevronRight } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export function LoginSelectionPage() {
  const [isAnimating, setIsAnimating] = useState(false)

  React.useEffect(() => {
    setIsAnimating(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Mobile-First Header */}
          <div className="text-center mb-8 md:mb-12">
            {/* Avatar Section for Mobile */}
            <div className="flex justify-center mb-6 md:hidden">
              <div className={`relative transform transition-all duration-700 ${isAnimating ? 'scale-100 rotate-0' : 'scale-90 rotate-3'}`}>
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <Avatar
                      style={{ width: 90, height: 90 }}
                      avatarStyle="Circle"
                      topType="ShortHairShortCurly"
                      accessoriesType="Blank"
                      hairColor="BrownDark"
                      facialHairType="Blank"
                      clotheType="Hoodie"
                      clotheColor="Blue01"
                      eyeType="Happy"
                      eyebrowType="Default"
                      mouthType="Smile"
                      skinColor="Light"
                    />
                  </div>
                </div>
                {/* Floating Icons */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                  <Star className="w-3 h-3 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-bounce delay-300">
                  <Heart className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <div className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4 md:mb-6 shadow-lg border border-white/20">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-2 animate-pulse" />
              <span className="font-semibold text-blue-700 text-sm md:text-base">Welcome Back</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              <span className="block text-gray-900">Welcome to</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                iSpaan
              </span>
            </h1>
            
            <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-gray-600">
              Choose your login method to access your personalized learning experience
            </p>
          </div>

          {/* Mobile-First Login Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
            {/* User Login */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl md:rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <User className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Student / Applicant
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">For learners and applicants</p>
                </div>
                
                <div className="space-y-3 md:space-y-4 mb-6">
                  {[
                    {
                      icon: Shield,
                      text: "ID Number + PIN authentication"
                    },
                    {
                      icon: Target,
                      text: "Access to learner dashboard"
                    },
                    {
                      icon: CheckCircle,
                      text: "Application status tracking"
                    },
                    {
                      icon: Brain,
                      text: "AI-powered career guidance"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 group/item">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover/item:scale-110 transition-transform duration-300 bg-gradient-to-r from-blue-500 to-purple-500">
                        <feature.icon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                      <span className="text-xs md:text-sm font-medium group-hover/item:opacity-80 transition-opacity text-gray-700">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button asChild className="w-full group/btn inline-flex items-center justify-center px-4 py-3 md:px-6 text-white rounded-xl font-semibold text-sm md:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-blue-600 to-purple-600">
                  <Link href="/login/user" className="flex items-center justify-center">
                    Sign In as Student
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Admin Login */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl md:rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Admin Login
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">For administrators and super admins</p>
                </div>
                
                <div className="space-y-3 md:space-y-4 mb-6">
                  {[
                    {
                      icon: Globe,
                      text: "Email + Password authentication"
                    },
                    {
                      icon: Users,
                      text: "Role-based access control"
                    },
                    {
                      icon: Zap,
                      text: "Platform management tools"
                    },
                    {
                      icon: Award,
                      text: "Advanced analytics dashboard"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 group/item">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover/item:scale-110 transition-transform duration-300 bg-gradient-to-r from-purple-500 to-pink-500">
                        <feature.icon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                      <span className="text-xs md:text-sm font-medium group-hover/item:opacity-80 transition-opacity text-gray-700">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button asChild className="w-full group/btn inline-flex items-center justify-center px-4 py-3 md:px-6 text-white rounded-xl font-semibold text-sm md:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-purple-600 to-pink-600">
                  <Link href="/login/admin" className="flex items-center justify-center">
                    Sign In as Admin
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* New User Section */}
          <div className="text-center mt-8 md:mt-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl md:rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20">
                <div className="text-center mb-6">
                  {/* Avatar for New Users */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-1 shadow-2xl">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <Avatar
                          style={{ width: 60, height: 60 }}
                          avatarStyle="Circle"
                          topType="LongHairStraight"
                          accessoriesType="Blank"
                          hairColor="Blonde"
                          facialHairType="Blank"
                          clotheType="BlazerShirt"
                          clotheColor="Blue02"
                          eyeType="Happy"
                          eyebrowType="Default"
                          mouthType="Smile"
                          skinColor="Medium"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    New to iSpaan?
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">Join thousands of learners transforming their careers</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="group inline-flex items-center px-6 py-3 md:px-8 md:py-4 text-white rounded-xl font-semibold text-sm md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-green-600 to-emerald-600">
                    <Link href="/apply" className="flex items-center">
                      Start Your Application
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 md:ml-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="group inline-flex items-center px-6 py-3 md:px-8 md:py-4 border-2 border-green-600 text-green-600 rounded-xl font-semibold text-sm md:text-lg transition-all duration-300 transform hover:scale-105 hover:bg-green-50">
                    <Link href="/onboarding" className="flex items-center">
                      <Play className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                      Take a Tour
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <div className="flex items-center justify-center space-x-8 text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#FF6E40' }}></div>
                <span className="font-semibold">Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full animate-pulse delay-300" style={{ backgroundColor: '#FFC13B' }}></div>
                <span className="font-semibold">Reliable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full animate-pulse delay-500" style={{ backgroundColor: '#1E3D59' }}></div>
                <span className="font-semibold">Professional</span>
              </div>
            </div>
            <p className="text-sm mt-4" style={{ color: '#1E3D59', opacity: 0.5 }}>
              Professional Learning Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

