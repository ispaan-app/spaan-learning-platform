'use client'

import { useAuth } from '@/hooks/useAuth'
import { Crown, Sun, Moon, Calendar, Star, Zap, Sparkles } from 'lucide-react'

export function SuperAdminWelcome() {
  const { user, userData } = useAuth()

  return (
    <div className="group relative mb-8">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 transform group-hover:scale-[1.02] overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-white rounded-full animate-pulse delay-700"></div>
        </div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.displayName?.split(' ')[0] || userData?.firstName || 'Super Admin'}!
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {new Date().getHours() < 12 ? 
                      <Sun className="h-5 w-5 text-yellow-300" /> : 
                      new Date().getHours() < 17 ? 
                      <Sun className="h-5 w-5 text-orange-300" /> : 
                      <Moon className="h-5 w-5 text-blue-300" />
                    }
                    <span className="text-white/90 text-lg">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-white/80" />
                    <span className="text-white/80 text-lg">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <span className="text-white font-semibold text-sm">SUPER ADMIN</span>
              </div>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Star className="w-5 h-5 text-yellow-300" />
              </div>
            </div>
          </div>
          
          <p className="text-white/90 text-xl mb-6 leading-relaxed">
            {[
              "Ready to oversee the entire platform today?",
              "Let's ensure everything runs at peak performance.",
              "Time to make strategic platform decisions.",
              "Ready to optimize our global operations?",
              "Let's elevate our platform to new heights."
            ][Math.floor(Math.random() * 5)]}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm">System Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="text-white/80 text-sm">Ready to go!</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              <span className="text-white/80 text-sm font-medium">Enhanced Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


