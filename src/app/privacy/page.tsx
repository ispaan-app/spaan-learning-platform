'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, Database, Users } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">iS</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">iSpaan</span>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 2025
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              iSpaan Tech Solutions ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our monitoring platform and services.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By using our platform, you agree to the collection and use of information in accordance 
              with this policy.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Database className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Name, email address, and contact information</li>
                  <li>Student ID numbers and academic information</li>
                  <li>Profile information and preferences</li>
                  <li>Application and placement data</li>
                  <li>Learning progress and assessment results</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Platform usage patterns and interactions</li>
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Communication logs and support interactions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Educational Data</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Course progress and completion status</li>
                  <li>Assignment submissions and grades</li>
                  <li>Attendance and check-in records</li>
                  <li>Feedback and evaluation data</li>
                  <li>AI-powered learning analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Educational Services</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                  <li>Provide personalized learning experiences</li>
                  <li>Track academic progress and performance</li>
                  <li>Facilitate work-integrated learning placements</li>
                  <li>Generate reports and analytics</li>
                  <li>Enable AI-powered career guidance</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Operations</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                  <li>Maintain and improve our services</li>
                  <li>Process applications and placements</li>
                  <li>Communicate with users and stakeholders</li>
                  <li>Ensure platform security and integrity</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Protection */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Data Protection & Security</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Security Measures</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                    <li>End-to-end encryption for sensitive data</li>
                    <li>Secure cloud infrastructure (Firebase)</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication</li>
                    <li>Data backup and recovery procedures</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Controls</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                    <li>Granular privacy settings</li>
                    <li>Data retention policies</li>
                    <li>Right to access and correction</li>
                    <li>Data portability options</li>
                    <li>Right to deletion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information only in the following circumstances:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>With your explicit consent</li>
              <li>With educational institutions and placement partners for legitimate educational purposes</li>
              <li>With service providers who assist in platform operations (under strict confidentiality agreements)</li>
              <li>When required by law or to protect our rights and safety</li>
              <li>In connection with a business transfer or merger (with prior notice)</li>
            </ul>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Privacy Rights</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Access & Control</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Update your preferences</li>
                  <li>Download your data</li>
                  <li>Delete your account</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Communication</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                  <li>Opt-out of marketing communications</li>
                  <li>Control notification preferences</li>
                  <li>Manage data sharing settings</li>
                  <li>Request data processing restrictions</li>
                  <li>File privacy complaints</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About Privacy?</h2>
            <p className="text-xl text-blue-100 mb-6">
              Contact our privacy team for any questions or concerns about your data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Privacy Team
              </Link>
              <Link 
                href="/"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Back to Home
              </Link>
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


