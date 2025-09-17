'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Target, Award, Heart, Sparkles, Zap, Globe, Shield, Star, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E1' }}>

      {/* Header */}
      <header className="relative shadow-lg border-b" style={{ backgroundColor: '#1E3D59', borderColor: 'rgba(245, 240, 225, 0.2)' }}>
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
              className="group inline-flex items-center px-6 py-3 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: '#FF6E40' }}
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
        <div className="text-center mb-16 relative">
          <div className="relative z-10">
            <div className="inline-flex items-center px-6 py-3 rounded-full mb-6 shadow-lg" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
              <Sparkles className="w-5 h-5 mr-2" style={{ color: '#FF6E40' }} />
              <span className="font-semibold" style={{ color: '#1E3D59' }}>Innovation in Education</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="block" style={{ color: '#1E3D59' }}>About</span>
              <span className="block" style={{ color: '#FF6E40' }}>
                iSpaan
              </span>
            </h1>
            
            <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-8" style={{ color: '#1E3D59' }}>
              Empowering South African learners through 
              <span className="relative inline-block mx-2">
                <span className="font-semibold" style={{ color: '#FF6E40' }}>
                  innovative
                </span>
                <div className="absolute -bottom-1 left-0 w-full h-1 rounded-full" style={{ backgroundColor: '#FF6E40' }}></div>
              </span>
              work-integrated learning experiences
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <div className="flex items-center px-4 py-2 rounded-full shadow-lg" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
                <Zap className="w-4 h-4 mr-2" style={{ color: '#FFC13B' }} />
                <span style={{ color: '#1E3D59' }}>AI-Powered Learning</span>
              </div>
              <div className="flex items-center px-4 py-2 rounded-full shadow-lg" style={{ backgroundColor: 'rgba(255, 110, 64, 0.1)' }}>
                <Users className="w-4 h-4 mr-2" style={{ color: '#FF6E40' }} />
                <span style={{ color: '#1E3D59' }}>South African Focus</span>
              </div>
              <div className="flex items-center px-4 py-2 rounded-full shadow-lg" style={{ backgroundColor: 'rgba(255, 192, 59, 0.1)' }}>
                <Shield className="w-4 h-4 mr-2" style={{ color: '#FFC13B' }} />
                <span style={{ color: '#1E3D59' }}>Secure Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="relative group">
            <div className="relative rounded-2xl shadow-xl p-8 border" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1E3D59' }}>
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFC13B' }}>
                    <Star className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold" style={{ color: '#1E3D59' }}>
                    Our Mission
                  </h2>
                  <div className="w-16 h-1 rounded-full mt-1" style={{ backgroundColor: '#FF6E40' }}></div>
                </div>
              </div>
              
              <div className="relative">
                <p className="text-xl leading-relaxed mb-6" style={{ color: '#1E3D59' }}>
                  At <span className="font-bold" style={{ color: '#FF6E40' }}>iSpaan</span>, we believe that education should be 
                  <span className="relative inline-block mx-2">
                    <span className="font-semibold" style={{ color: '#FF6E40' }}>practical</span>
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#FF6E40' }}></div>
                  </span>, 
                  <span className="relative inline-block mx-2">
                    <span className="font-semibold" style={{ color: '#FFC13B' }}>accessible</span>
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#FFC13B' }}></div>
                  </span>, and 
                  <span className="relative inline-block mx-2">
                    <span className="font-semibold" style={{ color: '#FF6E40' }}>transformative</span>
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#FF6E40' }}></div>
                  </span>.
                </p>
                
                <p className="text-lg leading-relaxed" style={{ color: '#1E3D59', opacity: 0.8 }}>
                  Our mission is to bridge the gap between academic learning and real-world application by 
                  providing work-integrated learning experiences that prepare South African students for successful careers 
                  in today's dynamic job market, with a special focus on empowering township communities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-16">
          <div className="relative group">
            <div className="relative rounded-2xl shadow-xl p-8 border" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FF6E40' }}>
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFC13B' }}>
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold" style={{ color: '#1E3D59' }}>
                    Our Vision
                  </h2>
                  <div className="w-16 h-1 rounded-full mt-1" style={{ backgroundColor: '#FFC13B' }}></div>
                </div>
              </div>
              
              <div className="relative">
                <p className="text-xl leading-relaxed" style={{ color: '#1E3D59' }}>
                  To become the 
                  <span className="relative inline-block mx-2">
                    <span className="font-bold" style={{ color: '#FFC13B' }}>leading platform</span>
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#FFC13B' }}></div>
                  </span>
                  for work-integrated learning in South Africa, where every student has access to meaningful industry experiences, 
                  AI-powered career guidance, and the tools they need to build successful, fulfilling careers in their chosen fields.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-6 py-3 rounded-full mb-4 shadow-lg" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
              <Heart className="w-5 h-5 mr-2" style={{ color: '#FF6E40' }} />
              <span className="font-semibold" style={{ color: '#1E3D59' }}>Our Core Values</span>
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>
              What Drives Us
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#1E3D59', opacity: 0.7 }}>
              The principles that guide everything we do
            </p>
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
                <div className="relative rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 border" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 shadow-md transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: value.title === 'Excellence' ? '#FFC13B' : value.title === 'Innovation' ? '#1E3D59' : value.title === 'Accessibility' ? '#FF6E40' : '#FF6E40' }}>
                      <value.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: '#1E3D59' }}>
                      {value.title}
                    </h3>
                  </div>
                  <p className="leading-relaxed text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-6 py-3 rounded-full mb-4 shadow-lg" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
              <Users className="w-5 h-5 mr-2" style={{ color: '#FF6E40' }} />
              <span className="font-semibold" style={{ color: '#1E3D59' }}>Meet Our Team</span>
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>
              The People Behind iSpaan
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#1E3D59', opacity: 0.7 }}>
              Passionate educators, technologists, and industry experts committed to revolutionizing education
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Education Experts",
                description: "Experienced educators who design our curriculum and learning experiences",
                icon: Users,
                color: '#1E3D59'
              },
              {
                title: "Technology Team",
                description: "Skilled developers and AI specialists building our platform",
                icon: Award,
                color: '#FF6E40'
              },
              {
                title: "Industry Partners",
                description: "Leading companies providing real-world learning opportunities",
                icon: Target,
                color: '#FFC13B'
              }
            ].map((team, index) => (
              <div key={index} className="group relative">
                <div className="relative rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 border" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: team.color }}>
                      <team.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-3" style={{ color: '#1E3D59' }}>
                      {team.title}
                    </h3>
                    <p className="leading-relaxed text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>
                      {team.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <div className="relative group">
            <div className="relative rounded-2xl p-10 text-center overflow-hidden" style={{ backgroundColor: '#1E3D59' }}>
              <div className="relative z-10">
                <div className="inline-flex items-center px-6 py-3 rounded-full mb-6" style={{ backgroundColor: 'rgba(255, 110, 64, 0.2)' }}>
                  <Sparkles className="w-5 h-5 text-white mr-2" />
                  <span className="text-white font-semibold">Ready to Get Started?</span>
                </div>
                
                <h2 className="text-4xl font-bold mb-4 text-white">
                  Get in Touch
                </h2>
                
                <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: '#F5F0E1' }}>
                  Have questions about <span className="font-bold text-white">iSpaan</span>? We'd love to hear from you!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/contact"
                    className="group relative inline-flex items-center px-8 py-3 rounded-full font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    style={{ backgroundColor: '#FF6E40', color: 'white' }}
                  >
                    <span className="relative z-10">Contact Us</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link 
                    href="/apply"
                    className="group relative inline-flex items-center px-8 py-3 rounded-full font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    style={{ backgroundColor: '#FFC13B', color: 'white' }}
                  >
                    <span className="relative z-10">Start Learning</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8" style={{ backgroundColor: '#1E3D59' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white" style={{ opacity: 0.8 }}>
            © 2025 iSpaan Tech Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
