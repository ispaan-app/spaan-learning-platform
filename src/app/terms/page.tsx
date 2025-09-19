'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, Users } from 'lucide-react'

export default function TermsPage() {
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms carefully before using our platform and services.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 2025
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              These Terms of Service ("Terms") govern your use of iSpaan 
              ("Platform") operated by iSpaan Tech Solutions ("Company," "we," "our," or "us"). 
              By accessing or using our Platform, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-600 leading-relaxed">
              If you do not agree to these Terms, please do not use our Platform.
            </p>
          </div>
        </section>

        {/* Acceptance of Terms */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                By creating an account, accessing our Platform, or using our services, you acknowledge 
                that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800">
                  <strong>Important:</strong> These Terms constitute a legally binding agreement between 
                  you and iSpaan Tech Solutions. Please review them carefully.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* User Accounts */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">User Accounts</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Creation</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                  <li>You are responsible for all activities that occur under your account</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Types</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Students & Applicants</h4>
                    <p className="text-sm text-gray-600">
                      Access to learning materials, application tracking, and career guidance tools.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Administrators</h4>
                    <p className="text-sm text-gray-600">
                      Access to management tools, user oversight, and platform administration features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Usage */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Scale className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Platform Usage</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Permitted Use</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Access and use the Platform for educational purposes</li>
                  <li>Submit applications and participate in learning programs</li>
                  <li>Engage with AI-powered career guidance tools</li>
                  <li>Communicate with other users and administrators</li>
                  <li>Access and download your personal data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Activities</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Violating any applicable laws or regulations</li>
                  <li>Attempting to gain unauthorized access to the Platform</li>
                  <li>Interfering with or disrupting Platform operations</li>
                  <li>Sharing false or misleading information</li>
                  <li>Using the Platform for commercial purposes without permission</li>
                  <li>Harassing, threatening, or abusing other users</li>
                  <li>Uploading malicious code or harmful content</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Intellectual Property</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Platform Content</h3>
                <p className="text-gray-600 leading-relaxed">
                  All content, features, and functionality of the Platform, including but not limited to 
                  text, graphics, logos, images, and software, are owned by iSpaan Tech Solutions and 
                  are protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">User Content</h3>
                <p className="text-gray-600 leading-relaxed">
                  You retain ownership of content you submit to the Platform. By submitting content, 
                  you grant us a non-exclusive, royalty-free license to use, modify, and distribute 
                  your content for educational and platform improvement purposes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy and Data */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy and Data Protection</h2>
            
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Your privacy is important to us. Our collection and use of personal information is 
                governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-green-800">
                  <strong>Data Security:</strong> We implement appropriate security measures to protect 
                  your personal information and educational data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimers */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Disclaimers</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Availability</h3>
                <p className="text-gray-600">
                  We strive to maintain Platform availability but do not guarantee uninterrupted access. 
                  We may temporarily suspend services for maintenance or updates.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Outcomes</h3>
                <p className="text-gray-600">
                  While we provide educational tools and resources, we cannot guarantee specific learning 
                  outcomes or career results. Success depends on individual effort and circumstances.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Third-Party Content</h3>
                <p className="text-gray-600">
                  The Platform may contain links to third-party websites or content. We are not 
                  responsible for the content or practices of these third parties.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
            
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                To the maximum extent permitted by law, iSpaan Tech Solutions shall not be liable for 
                any indirect, incidental, special, consequential, or punitive damages, including but not 
                limited to loss of profits, data, or use, arising from your use of the Platform.
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800">
                  <strong>Important:</strong> Our total liability to you for any claims arising from 
                  these Terms or your use of the Platform shall not exceed the amount you paid us 
                  in the 12 months preceding the claim.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Termination</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Termination by You</h3>
                <p className="text-gray-600">
                  You may terminate your account at any time by contacting us or using the account 
                  deletion feature in your profile settings.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Termination by Us</h3>
                <p className="text-gray-600">
                  We may suspend or terminate your account if you violate these Terms, engage in 
                  prohibited activities, or for other legitimate reasons with appropriate notice.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Effect of Termination</h3>
                <p className="text-gray-600">
                  Upon termination, your right to use the Platform ceases immediately. We may retain 
                  certain information as required by law or for legitimate business purposes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to Terms</h2>
            
            <p className="text-gray-600 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of 
              significant changes through the Platform or via email. Your continued use of the 
              Platform after changes constitutes acceptance of the new Terms.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-blue-800">
                <strong>Notification:</strong> We will provide at least 30 days' notice before 
                implementing material changes to these Terms.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About Terms?</h2>
            <p className="text-xl text-blue-100 mb-6">
              Contact our legal team for any questions about these Terms of Service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Legal Team
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


