'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Users, Shield, Brain, CheckCircle, Star, Play, Smartphone, Laptop, Tablet, Zap, Globe, Award, Target, MessageCircle, Sparkles, BarChart3 } from 'lucide-react'
import { RealtimeStats } from './RealtimeStats'

interface HomePageContentProps {
  heroImageUrl: string
  platformName?: string
  primaryColor?: string
  secondaryColor?: string
}

export function HomePageContent({ 
  heroImageUrl, 
  platformName = 'iSpaan',
  primaryColor = '#4F46E5',
  secondaryColor = '#7C3AED'
}: HomePageContentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Mobile-First Header */}
      <header className="relative bg-white/90 backdrop-blur-md shadow-lg border-b" style={{ borderColor: 'rgba(30, 61, 89, 0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-sm sm:text-xl">iS</span>
              </div>
              <span className="text-xl sm:text-3xl font-bold" style={{ color: '#1E3D59' }}>{platformName}</span>
            </div>
            <div className="flex items-center">
              <Link 
                href="/apply" 
                className="group inline-flex items-center px-3 py-2 sm:px-6 sm:py-3 text-white rounded-full font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: '#FF6E40' }}
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-First Hero Section */}
      <section className="relative min-h-screen flex items-center py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-4 sm:mb-6 shadow-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-white" />
              <span className="font-semibold text-white text-sm sm:text-base">AI-Powered Career Development Platform</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Revolutionary</span>
              <span className="block" style={{ color: '#FF6E40' }}>
                Work-Integrated Learning
              </span>
            </h1>
            
            <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0" style={{ color: '#1E3D59', opacity: 0.8 }}>
              Bridge the gap between academic education and real-world industry experience. 
              Our AI-powered platform connects South African students with meaningful work placements, 
              providing personalized career guidance and practical skills for today's job market.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/apply"
                className="group inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 text-white rounded-full font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: '#FF6E40' }}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Start Learning
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/onboarding"
                className="group inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 border-2 text-gray-700 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                style={{ borderColor: '#1E3D59', color: '#1E3D59' }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Take a Tour
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-6 sm:mt-8">
              <RealtimeStats variant="hero" />
            </div>
          </div>
          
          {/* Right Content - Mobile App Showcase */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Floating App Screens */}
            <div className="relative z-10">
              {/* Main Phone Screen */}
              <div className="relative mx-auto w-64 sm:w-80 h-[480px] sm:h-[600px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] sm:rounded-[3rem] p-1.5 sm:p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-white rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden relative">
                  {/* Phone Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs sm:text-sm">iS</span>
                        </div>
                        <span className="font-bold text-sm sm:text-lg">iSpaan</span>
                      </div>
                      <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white/20 rounded-full"></div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Welcome back, Sipho!</h3>
                    <p className="text-blue-100 text-sm sm:text-base">Ready to continue your learning journey?</p>
                  </div>
                  
                  {/* Phone Content */}
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-800 text-sm sm:text-base">Today's Progress</span>
                        <span className="text-xl sm:text-2xl font-bold text-green-600">85%</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-1.5 sm:h-2">
                        <div className="bg-green-500 h-1.5 sm:h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                          <Target className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-lg sm:text-2xl font-bold text-blue-600">12</div>
                        <div className="text-xs sm:text-sm text-blue-800">Goals</div>
                      </div>
                      
                      <div className="bg-purple-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                          <Award className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-lg sm:text-2xl font-bold text-purple-600">8</div>
                        <div className="text-xs sm:text-sm text-purple-800">Achievements</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-100 to-red-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-orange-800 text-sm sm:text-base">AI Mentor</div>
                          <div className="text-xs sm:text-sm text-orange-600">New career advice available</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl animate-pulse delay-500"></div>
              
              {/* Secondary Phone Screen - Hidden on mobile */}
              <div className="hidden sm:block absolute -top-16 -right-16 w-32 h-56 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-1 shadow-xl transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-white rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 text-white text-center">
                    <div className="text-xs font-bold">Learning Path</div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                    <div className="h-2 bg-green-400 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
              
              {/* Tablet Screen - Hidden on mobile */}
              <div className="hidden sm:block absolute -bottom-16 -left-16 w-48 h-32 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-1 shadow-xl transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 text-white text-center">
                    <div className="text-xs font-bold">Dashboard</div>
                  </div>
                  <div className="p-2 grid grid-cols-3 gap-1">
                    <div className="h-4 bg-purple-200 rounded"></div>
                    <div className="h-4 bg-purple-200 rounded"></div>
                    <div className="h-4 bg-purple-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-First Features Section */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: '#F5F0E1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-4 shadow-lg" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" style={{ color: '#FF6E40' }} />
              <span className="font-semibold text-sm sm:text-base" style={{ color: '#1E3D59' }}>Powerful Features</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>
              Complete Work-Integrated Monitoring Platform
            </h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto" style={{ color: '#1E3D59', opacity: 0.7 }}>
              Everything South African students need to bridge academic education with real-world industry experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="relative rounded-xl p-4 sm:p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1E3D59' }}>
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: '#1E3D59' }}>Real-Time Attendance</h3>
                <p className="leading-relaxed text-xs sm:text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>
                  GPS-based check-in/out system with QR code scanning for accurate work hour tracking and placement monitoring across South African workplaces.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="relative rounded-xl p-4 sm:p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FF6E40' }}>
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: '#1E3D59' }}>AI Career Mentor</h3>
                <p className="leading-relaxed text-xs sm:text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>
                  Personalized career guidance and learning recommendations powered by advanced AI technology for intelligent career development and growth.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative sm:col-span-2 lg:col-span-1">
              <div className="relative rounded-xl p-4 sm:p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FFC13B' }}>
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: '#1E3D59' }}>Industry Placements</h3>
                <p className="leading-relaxed text-xs sm:text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>
                  Connect with South African industry partners for meaningful work-integrated learning experiences and real work opportunities that build practical skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-First Technology Stack Section */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: '#1E3D59' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-4 shadow-lg" style={{ backgroundColor: 'rgba(255, 110, 64, 0.2)' }}>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white mr-2" />
              <span className="text-white font-semibold text-sm sm:text-base">Powered by Modern Technology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Built with Cutting-Edge Technology
            </h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto" style={{ color: '#F5F0E1', opacity: 0.8 }}>
              Our platform is built on modern, scalable technology stack ensuring reliability, security, and performance
            </p>
          </div>
        </div>
      </section>

      {/* Mobile-First How It Works Section */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: '#F5F0E1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-4 shadow-lg" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
              <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" style={{ color: '#FF6E40' }} />
              <span className="font-semibold text-sm sm:text-base" style={{ color: '#1E3D59' }}>Simple Process</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>
              How It Works
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: '#1E3D59', opacity: 0.7 }}>
              Get started in just three simple steps and begin your learning journey today
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="group relative">
              <div className="relative rounded-xl p-4 sm:p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                    <span className="text-white font-bold text-sm sm:text-lg">1</span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1E3D59' }}>
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: '#1E3D59' }}>Apply & Get Matched</h3>
                <p className="leading-relaxed text-xs sm:text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>
                  Submit your application and let our AI match you with the perfect learning opportunity based on your skills and interests.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              <div className="relative rounded-xl p-4 sm:p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                    <span className="text-white font-bold text-sm sm:text-lg">2</span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FF6E40' }}>
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: '#1E3D59' }}>Start Learning</h3>
                <p className="leading-relaxed text-xs sm:text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>
                  Begin your work-integrated learning experience with secure check-ins, progress tracking, and real-time feedback.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              <div className="relative rounded-xl p-4 sm:p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                    <span className="text-white font-bold text-sm sm:text-lg">3</span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FFC13B' }}>
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: '#1E3D59' }}>Advanced Analytics Dashboard</h3>
                <p className="leading-relaxed text-xs sm:text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>
                  Track your progress with comprehensive analytics, performance insights, and detailed reports to monitor your learning journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Mobile-First Community Section with Background Image */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        {/* Background Image - Two women using smartphone with Check In app */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/ai-generated-branding-image.png")'
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-purple-900/60 to-orange-900/70"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-4 shadow-lg bg-white/20 backdrop-blur-sm">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-white" />
              <span className="font-semibold text-sm sm:text-base text-white">Meet Our Community</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight text-white">
              <span className="block">Join South African</span>
              <span className="block" style={{ color: '#FF6E40' }}>
                Learners & Mentors
              </span>
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-6 text-white/90">
              Connect with fellow South African learners, mentors, and administrators who are transforming their communities through work-integrated learning.
            </p>
            <div className="flex justify-center">
              <Link 
                href="/apply"
                className="group inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 text-white rounded-full font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: '#FF6E40' }}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Join Our Community
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          {/* Community Stats with Real Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                <RealtimeStats variant="community" />
              </h3>
              <p className="text-sm sm:text-base text-white/80">Active Learners</p>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                <RealtimeStats variant="partners" />
              </h3>
              <p className="text-sm sm:text-base text-white/80">Industry Partners</p>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                <RealtimeStats variant="success" />
              </h3>
              <p className="text-sm sm:text-base text-white/80">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-First Footer */}
      <footer className="relative py-12 sm:py-16 overflow-hidden" style={{ backgroundColor: '#1E3D59' }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm sm:text-xl">iS</span>
                </div>
                <span className="text-xl sm:text-3xl font-bold text-white">{platformName}</span>
              </div>
              <p className="text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 max-w-md" style={{ color: '#F5F0E1', opacity: 0.8 }}>
                Empowering learners through innovative work-integrated learning experiences. 
                Transform your career with AI-powered education.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link 
                  href="/apply"
                  className="group inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-white rounded-full font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Get Started
                </Link>
                <Link 
                  href="/login"
                  className="group inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 border-2 text-white rounded-full font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105"
                  style={{ borderColor: '#F5F0E1', color: '#F5F0E1' }}
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Access Platform
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white">Platform</h4>
              <ul className="space-y-2 sm:space-y-3" style={{ color: '#F5F0E1', opacity: 0.8 }}>
                <li><Link href="/about" className="hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  About Us
                </Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Contact
                </Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Privacy Policy
                </Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Terms of Service
                </Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-6 sm:pt-8" style={{ borderTop: '1px solid rgba(245, 240, 225, 0.2)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <p className="text-sm sm:text-base" style={{ color: '#F5F0E1', opacity: 0.8 }}>
                &copy; 2025 <span className="font-bold">iSpaan</span> Tech Solutions. All rights reserved.
              </p>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm" style={{ color: '#F5F0E1', opacity: 0.8 }}>
                <span>Made with ❤️ for learners nationwide</span>
                <div className="flex items-center space-x-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#FFC13B' }} />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

