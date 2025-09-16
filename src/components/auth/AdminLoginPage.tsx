'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminLoginForm } from './AdminLoginForm'
import { ArrowLeft, Shield, Crown, Sparkles, Globe, Users, Zap, Award, Target, Brain, CheckCircle, Star } from 'lucide-react'

type AdminRole = 'admin' | 'super-admin'

export function AdminLoginPage() {
  const [selectedRole, setSelectedRole] = useState<AdminRole>('admin')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Welcome Content */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-8 border border-white/20 shadow-lg">
                  <Sparkles className="w-5 h-5 text-purple-600 mr-2 animate-pulse" />
                  <span className="text-purple-700 font-semibold">Admin Portal</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                  <span className="block text-gray-900">Administrative</span>
                  <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-gradient-x">
                    Dashboard
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed mb-12">
                  Access powerful management tools and analytics for the iSpaan platform
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6">
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
                  <div key={index} className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-purple-600 transition-colors">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Administrator Login
                  </h2>
                  <p className="text-gray-600">Sign in to access administrative functions</p>
                </div>

                {/* Role Tabs */}
                <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
                  <button
                    onClick={() => setSelectedRole('admin')}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      selectedRole === 'admin'
                        ? 'bg-white text-purple-900 shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </button>
                  <button
                    onClick={() => setSelectedRole('super-admin')}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      selectedRole === 'super-admin'
                        ? 'bg-white text-purple-900 shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                    }`}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Super Admin
                  </button>
                </div>
                
                <AdminLoginForm selectedRole={selectedRole} />
                
                {/* Links */}
                <div className="space-y-6 pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <Link 
                      href="/login" 
                      className="group inline-flex items-center text-sm text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                      Back to Login Options
                    </Link>
                  </div>
                  
                  <div className="text-center">
                    <Link 
                      href="/login/forgot-password" 
                      className="text-sm text-purple-600 hover:text-purple-700 transition-colors font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-300"></div>
                <span>Reliable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-500"></div>
                <span>Professional</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Secure administrative access • iSpaan
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

