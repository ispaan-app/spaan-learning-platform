'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageCircle, Users, Star, CheckCircle, Sparkles, Zap, Globe, Shield } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

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
      <main className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 relative">
          {/* Floating Elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl animate-bounce delay-300"></div>
          <div className="absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-xl animate-bounce delay-700"></div>
          <div className="absolute top-10 left-1/4 w-12 h-12 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full blur-lg animate-pulse delay-1000"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-8 border border-white/20 shadow-lg">
              <MessageCircle className="w-5 h-5 text-green-600 mr-2 animate-pulse" />
              <span className="text-green-700 font-semibold">Get in Touch</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="block text-gray-900">Contact</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                iSpaan
              </span>
            </h1>
            
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-12">
              Ready to start your learning journey? We're here to help you every step of the way.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
                  Get in Touch
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center group">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">Email Us</h3>
                      <p className="text-gray-600">support@ispaan.com</p>
                      <p className="text-gray-600">info@ispaan.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center group">
                    <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">Call Us</h3>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-gray-600">+1 (555) 987-6543</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center group">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">Visit Us</h3>
                      <p className="text-gray-600">123 Education Street</p>
                      <p className="text-gray-600">Learning City, LC 12345</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center group">
                    <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">Office Hours</h3>
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
                Send us a Message
              </h2>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for contacting us. We'll get back to you soon!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="group">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <div className="group">
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-6 border border-white/20 shadow-lg">
              <Users className="w-5 h-5 text-yellow-600 mr-2 animate-pulse" />
              <span className="text-yellow-700 font-semibold">Frequently Asked Questions</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Common Questions
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "How do I get started with iSpaan?",
                answer: "Simply create an account, complete your profile, and browse available programs. Our AI will match you with the best opportunities based on your interests and skills."
              },
              {
                question: "What types of programs are available?",
                answer: "We offer work-integrated learning programs across various industries including technology, healthcare, finance, marketing, and more. Each program is designed with real industry partners."
              },
              {
                question: "Is there any cost to use iSpaan?",
                answer: "Basic access to iSpaan is free. Premium features and specialized programs may have associated costs, but we offer scholarships and financial aid options."
              },
              {
                question: "How does the AI career guidance work?",
                answer: "Our AI analyzes your profile, skills, and interests to provide personalized career recommendations, skill development paths, and program suggestions tailored to your goals."
              },
              {
                question: "Can I get academic credit for my work?",
                answer: "Yes! Many of our programs are designed to provide academic credit. We work with educational institutions to ensure your learning experience counts toward your degree."
              },
              {
                question: "What support is available during my program?",
                answer: "You'll have access to mentors, career counselors, technical support, and a community of fellow learners. We're here to support you throughout your journey."
              }
            ].map((faq, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition duration-500 rounded-2xl blur"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
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
                  <span className="text-white font-semibold">Ready to Start Learning?</span>
                </div>
                
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Join iSpaan Today
                </h2>
                
                <p className="text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Transform your career with our innovative work-integrated monitoring platform
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link 
                    href="/apply"
                    className="group relative inline-flex items-center px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    <span className="relative z-10">Apply Now</span>
                    <Zap className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </Link>
                  
                  <Link 
                    href="/about"
                    className="group relative inline-flex items-center px-10 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    <span className="relative z-10">Learn More</span>
                    <Globe className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">iS</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">iSpaan</span>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering learners through innovative work-integrated learning experiences
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 iSpaan Tech Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


