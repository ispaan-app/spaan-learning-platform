'use client'

import React from 'react'
import { CartoonCharacter } from '@/components/shared/CartoonCharacter'
import { ArrowLeft, Sparkles, Download, Share2, Heart, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CharacterBuilderPage() {
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
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-8 border border-white/20 shadow-lg">
              <Sparkles className="w-5 h-5 text-pink-600 mr-2 animate-pulse" />
              <span className="text-pink-700 font-semibold">Character Builder</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="block text-gray-900">Create Your</span>
              <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                Perfect Avatar
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Design your unique cartoon character and bring your personality to life in iSpaan
            </p>

            <div className="flex justify-center mb-8">
              <Link 
                href="/"
                className="group inline-flex items-center px-6 py-3 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Character Builder */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Character Display */}
            <div className="flex justify-center">
              <CartoonCharacter 
                size={400} 
                interactive={true}
                showControls={true}
                className="transform hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Features & Actions */}
            <div className="space-y-8">
              <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Character Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Unlimited Customization</div>
                        <div className="text-sm text-gray-600">Mix and match any style</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Professional Quality</div>
                        <div className="text-sm text-gray-600">High-resolution avatars</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                        <Download className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Download & Share</div>
                        <div className="text-sm text-gray-600">Export your creation</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Social Ready</div>
                        <div className="text-sm text-gray-600">Perfect for profiles</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button className="w-full group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold text-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                  <Download className="w-5 h-5 mr-3" />
                  Download Avatar
                </Button>

                <Button variant="outline" className="w-full group inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-bold text-lg hover:border-pink-600 hover:text-pink-600 transition-all duration-300 transform hover:scale-105">
                  <Share2 className="w-5 h-5 mr-3" />
                  Share Character
                </Button>

                <Button variant="outline" className="w-full group inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
                  <Heart className="w-5 h-5 mr-3" />
                  Save to Profile
                </Button>
              </div>

              {/* Tips */}
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Pro Tips
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-2">
                    <li>• Try different combinations to find your unique style</li>
                    <li>• Use the randomize button for inspiration</li>
                    <li>• Your avatar will be used across the iSpaan platform</li>
                    <li>• You can always come back and update your character</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            <p className="text-gray-500 text-sm">
              Create your perfect avatar and make your learning journey more personal
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


