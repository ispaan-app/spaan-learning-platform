'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Shield, Crown, ArrowRight, Sparkles, Zap, Globe, Star, CheckCircle, Award, Target, Brain, Users, Clock, Check } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export function LoginSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-8 border border-white/20 shadow-lg">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2 animate-pulse" />
              <span className="text-blue-700 font-semibold">Welcome Back</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="block text-gray-900">Welcome to</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                iSpaan
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose your login method to access your personalized learning experience
            </p>
          </div>

          {/* Login Options */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* User Login */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    User Login
                  </h2>
                  <p className="text-gray-600 text-lg">For learners and applicants</p>
                </div>
                
                <div className="space-y-6 mb-8">
                  {[
                    {
                      icon: Shield,
                      text: "ID Number + PIN authentication",
                      color: "blue"
                    },
                    {
                      icon: Target,
                      text: "Access to learner dashboard",
                      color: "blue"
                    },
                    {
                      icon: CheckCircle,
                      text: "Application status tracking",
                      color: "blue"
                    },
                    {
                      icon: Brain,
                      text: "AI-powered career guidance",
                      color: "blue"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-4 group/item">
                      <div className={`w-10 h-10 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium group-hover/item:text-blue-600 transition-colors">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button asChild className="w-full group/btn inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                  <Link href="/login/user" className="flex items-center justify-center">
                    Sign In as User
                    <ArrowRight className="w-5 h-5 ml-3 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Admin Login */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Admin Login
                  </h2>
                  <p className="text-gray-600 text-lg">For administrators and super admins</p>
                </div>
                
                <div className="space-y-6 mb-8">
                  {[
                    {
                      icon: Globe,
                      text: "Email + Password authentication",
                      color: "purple"
                    },
                    {
                      icon: Users,
                      text: "Role-based access control",
                      color: "purple"
                    },
                    {
                      icon: Zap,
                      text: "Platform management tools",
                      color: "purple"
                    },
                    {
                      icon: Award,
                      text: "Advanced analytics dashboard",
                      color: "purple"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-4 group/item">
                      <div className={`w-10 h-10 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium group-hover/item:text-purple-600 transition-colors">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button asChild className="w-full group/btn inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                  <Link href="/login/admin" className="flex items-center justify-center">
                    Sign In as Admin
                    <ArrowRight className="w-5 h-5 ml-3 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="text-center mt-16">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">New to iSpaan?</h3>
                  <p className="text-gray-600">Join thousands of learners transforming their careers</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
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
          <div className="text-center mt-16">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                <span className="font-semibold">Reliable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-500"></div>
                <span className="font-semibold">Professional</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Professional Learning Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

