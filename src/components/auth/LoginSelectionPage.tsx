'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Shield, Crown, ArrowRight, Sparkles, Zap, Globe, Star, CheckCircle, Award, Target, Brain, Users, Clock, Check } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export function LoginSelectionPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E1' }}>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full mb-6 shadow-lg" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
              <Sparkles className="w-5 h-5 mr-2" style={{ color: '#FF6E40' }} />
              <span className="font-semibold" style={{ color: '#1E3D59' }}>Welcome Back</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="block" style={{ color: '#1E3D59' }}>Welcome to</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                iSpaan
              </span>
            </h1>
            
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#1E3D59', opacity: 0.7 }}>
              Choose your login method to access your personalized learning experience
            </p>
          </div>

          {/* Login Options */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* User Login */}
            <div className="relative group">
              <div className="relative rounded-2xl shadow-xl p-8 border" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1E3D59' }}>
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#1E3D59' }}>
                    User Login
                  </h2>
                  <p className="text-lg" style={{ color: '#1E3D59', opacity: 0.7 }}>For learners and applicants</p>
                </div>
                
                <div className="space-y-4 mb-6">
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
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover/item:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FF6E40' }}>
                        <feature.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium group-hover/item:opacity-80 transition-opacity" style={{ color: '#1E3D59' }}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button asChild className="w-full group/btn inline-flex items-center justify-center px-6 py-3 text-white rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl" style={{ backgroundColor: '#FF6E40' }}>
                  <Link href="/login/user" className="flex items-center justify-center">
                    Sign In as User
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Admin Login */}
            <div className="relative group">
              <div className="relative rounded-2xl shadow-xl p-8 border" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FF6E40' }}>
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#1E3D59' }}>
                    Admin Login
                  </h2>
                  <p className="text-lg" style={{ color: '#1E3D59', opacity: 0.7 }}>For administrators and super admins</p>
                </div>
                
                <div className="space-y-4 mb-6">
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
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover/item:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FFC13B' }}>
                        <feature.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium group-hover/item:opacity-80 transition-opacity" style={{ color: '#1E3D59' }}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button asChild className="w-full group/btn inline-flex items-center justify-center px-6 py-3 text-white rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl" style={{ backgroundColor: '#FFC13B' }}>
                  <Link href="/login/admin" className="flex items-center justify-center">
                    Sign In as Admin
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="text-center mt-12">
            <div className="relative group">
              <div className="relative rounded-2xl shadow-xl p-8 border" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#1E3D59' }}>New to iSpaan?</h3>
                  <p style={{ color: '#1E3D59', opacity: 0.7 }}>Join thousands of learners transforming their careers</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="group inline-flex items-center px-8 py-4 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl" style={{ backgroundColor: '#FF6E40' }}>
                    <Link href="/apply" className="flex items-center">
                      Start Your Application
                      <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
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

