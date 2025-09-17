'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Users, Shield, Brain, CheckCircle, Star, Play, Smartphone, Laptop, Tablet, Zap, Globe, Award, Target, MessageCircle, Sparkles } from 'lucide-react'
import { RealtimeStats } from './RealtimeStats'
import { CharacterShowcase } from './CartoonCharacter'

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

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-xl">iS</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{platformName}</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                href="/apply" 
                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-8 border border-white/20 shadow-lg">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2 animate-pulse" />
              <span className="text-blue-700 font-semibold">AI-Powered Career Development Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="block text-gray-900">Revolutionary</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                Work-Integrated Learning
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
              Bridge the gap between academic education and real-world industry experience. 
              Our AI-powered platform connects South African students with meaningful work placements, 
              providing personalized career guidance and practical skills for today's job market.
            </p>
            
            <div className="flex justify-start">
              <Link 
                href="/apply"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <Play className="w-5 h-5 mr-3" />
                Start Learning
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Stats */}
            <RealtimeStats variant="hero" />
          </div>
          
          {/* Right Content - App Showcase */}
          <div className="relative">
            {/* Floating App Screens */}
            <div className="relative z-10">
              {/* Main Phone Screen */}
              <div className="relative mx-auto w-80 h-[600px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Phone Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">iS</span>
                        </div>
                        <span className="font-bold text-lg">iSpaan</span>
                      </div>
                      <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Welcome back, Sipho!</h3>
                    <p className="text-blue-100">Ready to continue your learning journey?</p>
                  </div>
                  
                  {/* Phone Content */}
                  <div className="p-6 space-y-4">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-800">Today's Progress</span>
                        <span className="text-2xl font-bold text-green-600">85%</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-sm text-blue-800">Goals</div>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-purple-600">8</div>
                        <div className="text-sm text-purple-800">Achievements</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-orange-800">AI Mentor</div>
                          <div className="text-sm text-orange-600">New career advice available</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl animate-pulse delay-500"></div>
              
              {/* Secondary Phone Screen */}
              <div className="absolute -top-8 -right-8 w-32 h-56 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-1 shadow-xl transform -rotate-12 hover:rotate-0 transition-transform duration-500">
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
              
              {/* Tablet Screen */}
              <div className="absolute -bottom-8 -left-8 w-48 h-32 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-1 shadow-xl transform rotate-6 hover:rotate-0 transition-transform duration-500">
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

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6 border border-white/20 shadow-lg">
              <Zap className="w-5 h-5 text-green-600 mr-2 animate-pulse" />
              <span className="text-green-700 font-semibold">Powerful Features</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Complete Work-Integrated Learning Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Everything South African students need to bridge academic education with real-world industry experience through AI-powered career guidance and practical work placements
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Attendance</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  GPS-based check-in/out system with QR code scanning for accurate work hour tracking and placement monitoring across South African workplaces.
                </p>
                <div className="flex items-center text-blue-600 font-semibold">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Career Mentor</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Personalized career guidance and learning recommendations powered by advanced AI technology for intelligent career development and growth.
                </p>
                <div className="flex items-center text-purple-600 font-semibold">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Industry Placements</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Connect with South African industry partners for meaningful work-integrated learning experiences and real work opportunities that build practical skills.
                </p>
                <div className="flex items-center text-green-600 font-semibold">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6 border border-white/20 shadow-lg">
              <Zap className="w-5 h-5 text-blue-600 mr-2 animate-pulse" />
              <span className="text-blue-700 font-semibold">Powered by Modern Technology</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Built with Cutting-Edge Technology
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Our platform is built on modern, scalable technology stack ensuring reliability, security, and performance
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-6 border border-white/20 shadow-lg">
              <Target className="w-5 h-5 text-orange-600 mr-2 animate-pulse" />
              <span className="text-orange-700 font-semibold">Simple Process</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in just three simple steps and begin your learning journey today
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Apply & Get Matched</h3>
                <p className="text-gray-600 leading-relaxed">
                  Submit your application and let our AI match you with the perfect learning opportunity based on your skills and interests.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Learning</h3>
                <p className="text-gray-600 leading-relaxed">
                  Begin your work-integrated learning experience with secure check-ins, progress tracking, and real-time feedback.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics Dashboard</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track your progress with comprehensive analytics, performance insights, and detailed reports to monitor your learning journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Platform Statistics</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of learners who have transformed their careers with <span className="font-bold">iSpaan</span>
            </p>
          </div>
          
          <RealtimeStats />
        </div>
      </section>

      {/* Character Showcase Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-8 border border-white/20 shadow-lg">
              <Users className="w-5 h-5 text-pink-600 mr-2 animate-pulse" />
              <span className="text-pink-700 font-semibold">Meet Our Community</span>
            </div>
            
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              <span className="block text-gray-900">Join South African</span>
              <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                Learners & Mentors
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Connect with fellow South African learners, mentors, and administrators who are transforming their communities through work-integrated learning. 
              See how our platform empowers South Africans across the nation!
            </p>
            
            <Link 
              href="/apply"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold text-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <Users className="w-5 h-5 mr-3" />
              Join Our Community
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Character Showcase */}
          <div className="flex justify-center">
            <CharacterShowcase />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">iS</span>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{platformName}</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
                Empowering learners through innovative work-integrated learning experiences. 
                Transform your career with AI-powered education.
              </p>
              <div className="flex space-x-4">
                <Link 
                  href="/apply"
                  className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Get Started
                </Link>
                <Link 
                  href="/login"
                  className="group inline-flex items-center px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-full font-semibold hover:border-blue-600 hover:text-blue-400 transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Access Platform
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">For Students</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/apply" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Apply Now
                </Link></li>
                <li><Link href="/login/user" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Student Login
                </Link></li>
                <li><Link href="/programs" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Programs
                </Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Platform</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  About Us
                </Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Contact
                </Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Privacy Policy
                </Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Terms of Service
                </Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2025 <span className="font-bold">iSpaan</span> Tech Solutions. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>Made with ❤️ for learners worldwide</span>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
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

