'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Target, Award, Heart, Sparkles, Zap, Globe, Shield, Star, ArrowRight } from 'lucide-react'

export default function AboutPage() {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-xl">iS</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">iSpaan</span>
            </div>
            <Link 
              href="/"
              className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 relative">
          {/* Floating Elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl animate-bounce delay-300"></div>
          <div className="absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-xl animate-bounce delay-700"></div>
          <div className="absolute top-10 left-1/4 w-12 h-12 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full blur-lg animate-pulse delay-1000"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-8 border border-white/20 shadow-lg">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2 animate-pulse" />
              <span className="text-blue-700 font-semibold">Innovation in Education</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="block text-gray-900">About</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                iSpaan
              </span>
            </h1>
            
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-12">
              Empowering South African learners through 
              <span className="relative inline-block mx-2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  innovative
                </span>
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </span>
              work-integrated learning experiences
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center px-4 py-2 bg-white/50 rounded-full backdrop-blur-sm">
                <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                AI-Powered Learning
              </div>
              <div className="flex items-center px-4 py-2 bg-white/50 rounded-full backdrop-blur-sm">
                <Users className="w-4 h-4 text-green-500 mr-2" />
                South African Focus
              </div>
              <div className="flex items-center px-4 py-2 bg-white/50 rounded-full backdrop-blur-sm">
                <Shield className="w-4 h-4 text-blue-500 mr-2" />
                Secure Platform
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="relative group">
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
              <div className="flex items-center mb-8">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Our Mission
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mt-2"></div>
                </div>
              </div>
              
              <div className="relative">
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  At <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">iSpaan</span>, we believe that education should be 
                  <span className="relative inline-block mx-2">
                    <span className="font-semibold text-blue-600">practical</span>
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  </span>, 
                  <span className="relative inline-block mx-2">
                    <span className="font-semibold text-purple-600">accessible</span>
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                  </span>, and 
                  <span className="relative inline-block mx-2">
                    <span className="font-semibold text-pink-600">transformative</span>
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-600 to-red-600 rounded-full"></div>
                  </span>.
                </p>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our mission is to bridge the gap between academic learning and real-world application by 
                  providing work-integrated learning experiences that prepare South African students for successful careers 
                  in today's dynamic job market, with a special focus on empowering township communities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-20">
          <div className="relative group">
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
              <div className="flex items-center mb-8">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Our Vision
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mt-2"></div>
                </div>
              </div>
              
              <div className="relative">
                <p className="text-xl text-gray-700 leading-relaxed">
                  To become the 
                  <span className="relative inline-block mx-2">
                    <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">leading platform</span>
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                  </span>
                  for work-integrated learning in South Africa, where every student has access to meaningful industry experiences, 
                  AI-powered career guidance, and the tools they need to build successful, fulfilling careers in their chosen fields.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6 border border-white/20 shadow-lg">
              <Heart className="w-5 h-5 text-green-600 mr-2 animate-pulse" />
              <span className="text-green-700 font-semibold">Our Core Values</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              What Drives Us
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Excellence",
                description: "We strive for the highest quality in everything we do, from our educational content to our platform features and user experience.",
                icon: Star,
                gradient: "from-yellow-500 to-orange-500",
                bgGradient: "from-yellow-100 to-orange-100",
                textGradient: "from-yellow-600 to-orange-600"
              },
              {
                title: "Innovation",
                description: "We embrace cutting-edge technology, including AI-powered tools, to enhance learning outcomes and career development.",
                icon: Zap,
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-100 to-cyan-100",
                textGradient: "from-blue-600 to-cyan-600"
              },
              {
                title: "Accessibility",
                description: "We believe quality education should be accessible to all South Africans, especially those in township communities, regardless of background or circumstances.",
                icon: Users,
                gradient: "from-green-500 to-emerald-500",
                bgGradient: "from-green-100 to-emerald-100",
                textGradient: "from-green-600 to-emerald-600"
              },
              {
                title: "Community",
                description: "We foster a supportive learning community where South African students, educators, and industry professionals collaborate and grow together, building stronger communities across the nation.",
                icon: Users,
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-100 to-pink-100",
                textGradient: "from-purple-600 to-pink-600"
              }
            ].map((value, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition duration-500 rounded-2xl blur"></div>
                <div className={`relative bg-gradient-to-br ${value.bgGradient} rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105`}>
                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${value.gradient} rounded-xl flex items-center justify-center mr-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${value.textGradient} bg-clip-text text-transparent`}>
                      {value.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-6 border border-white/20 shadow-lg">
              <Users className="w-5 h-5 text-orange-600 mr-2 animate-pulse" />
              <span className="text-orange-700 font-semibold">Meet Our Team</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              The People Behind iSpaan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6">
              iSpaan is built by a passionate team of educators, technologists, and industry experts 
              who are committed to revolutionizing how students learn and prepare for their careers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Education Experts",
                description: "Experienced educators who design our curriculum and learning experiences",
                icon: Users,
                gradient: "from-blue-500 to-purple-500",
                bgGradient: "from-blue-50 to-purple-50",
                textGradient: "from-blue-600 to-purple-600"
              },
              {
                title: "Technology Team",
                description: "Skilled developers and AI specialists building our platform",
                icon: Award,
                gradient: "from-green-500 to-cyan-500",
                bgGradient: "from-green-50 to-cyan-50",
                textGradient: "from-green-600 to-cyan-600"
              },
              {
                title: "Industry Partners",
                description: "Leading companies providing real-world learning opportunities",
                icon: Target,
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-50 to-pink-50",
                textGradient: "from-purple-600 to-pink-600"
              }
            ].map((team, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-30 transition duration-500 rounded-3xl blur"></div>
                <div className={`relative bg-gradient-to-br ${team.bgGradient} rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105`}>
                  <div className="text-center">
                    <div className={`w-24 h-24 bg-gradient-to-r ${team.gradient} rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300`}>
                      <team.icon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${team.textGradient} bg-clip-text text-transparent mb-4`}>
                      {team.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {team.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-20">
          <div className="relative group">
            {/* Animated Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-1000 delay-300"></div>
            
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white text-center overflow-hidden">
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>
              <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full blur-lg animate-bounce delay-1000"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full mb-8 backdrop-blur-sm border border-white/30">
                  <Sparkles className="w-5 h-5 text-white mr-2 animate-pulse" />
                  <span className="text-white font-semibold">Ready to Get Started?</span>
                </div>
                
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Get in Touch
                </h2>
                
                <p className="text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Have questions about <span className="font-bold text-white">iSpaan</span>? We'd love to hear from you!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link 
                    href="/contact"
                    className="group relative inline-flex items-center px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    <span className="relative z-10">Contact Us</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </Link>
                  
                  <Link 
                    href="/apply"
                    className="group relative inline-flex items-center px-10 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    <span className="relative z-10">Start Learning</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2025 iSpaan Tech Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
