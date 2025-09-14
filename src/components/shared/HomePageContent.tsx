'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Users, Shield, Brain, CheckCircle, Star } from 'lucide-react'

interface HomePageContentProps {
  heroImageUrl: string
}

export function HomePageContent({ heroImageUrl }: HomePageContentProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">iS</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">iSpaan</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Login
              </Link>
              <Link 
                href="/apply" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 ease-out hover:shadow-md"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <div className="animate-in fade-in duration-1000">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                iSpaan
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              Empowering learners through work-integrated learning experiences. 
              Join thousands of students building their future with AI-powered education.
            </p>
          </div>
          
          <div className="animate-in fade-in duration-300 delay-100">
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link 
                href="/apply"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 ease-out hover:shadow-lg flex items-center justify-center"
              >
                Start Your Application
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                href="/login"
                className="border-2 border-white text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-900 transition-all duration-200 ease-out hover:shadow-lg flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Started Today</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose your path to join the iSpaan learning community
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* User Login */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200 hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Students & Applicants</h3>
                <p className="text-gray-600 mb-6">
                  Access your learning dashboard, track applications, and connect with our AI-powered career mentor.
                </p>
                <Link 
                  href="/login/user"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  User Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            {/* Admin Login */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-8 rounded-2xl border border-purple-200 hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Administrators</h3>
                <p className="text-gray-600 mb-6">
                  Manage learners, review applications, and access powerful AI tools for platform administration.
                </p>
                <Link 
                  href="/login/admin"
                  className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Admin Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes learning accessible, secure, and intelligent
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Seamless Application */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Seamless Application</h3>
              <p className="text-gray-600 leading-relaxed">
                Submit your application with ease. Our streamlined process guides you through 
                each step, with AI-powered validation to ensure completeness.
              </p>
            </div>

            {/* Secure Check-In */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure Check-In</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your work hours and attendance with our secure check-in system. 
                PIN-based authentication ensures your data stays protected.
              </p>
            </div>

            {/* AI-Powered Assistance */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Assistance</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized career guidance and support from our AI mentor. 
                Receive instant help and insights tailored to your learning journey.
              </p>
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
              Join thousands of learners who have transformed their careers with iSpaan
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">10K+</div>
              <div className="text-blue-100 text-lg">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">95%</div>
              <div className="text-blue-100 text-lg">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100 text-lg">AI Support</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-blue-100 text-lg">Programs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">iS</span>
                </div>
                <span className="text-2xl font-bold">iSpaan</span>
              </div>
              <p className="text-gray-400">
                Empowering learners through work-integrated learning experiences.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Students</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/apply" className="hover:text-white transition-colors">Apply Now</Link></li>
                <li><Link href="/login/user" className="hover:text-white transition-colors">Student Login</Link></li>
                <li><Link href="/programs" className="hover:text-white transition-colors">Programs</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Administrators</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login/admin" className="hover:text-white transition-colors">Admin Login</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 iSpaan Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

