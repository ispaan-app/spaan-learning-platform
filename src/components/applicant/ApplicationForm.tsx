'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/app/actions/userActions'
// Removed unused form imports
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingButton } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FormData {
  // Personal Details
  firstName: string
  lastName: string
  email: string
  phone: string
  idNumber: string
  dateOfBirth: string
  gender: string
  address: string
  city: string
  postalCode: string
  country: string
  
  // Qualifications & Experience
  program: string
  highestEducation: string
  institution: string
  graduationYear: string
  experience: string
  qualifications: string
  skills: string
  motivation: string
}

interface FormErrors {
  [key: string]: string
}

export function ApplicationForm() {
  const [formData, setFormData] = useState<FormData>({
    // Personal Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    
    // Qualifications & Experience
    program: '',
    highestEducation: '',
    institution: '',
    graduationYear: '',
    experience: '',
    qualifications: '',
    skills: '',
    motivation: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userPin, setUserPin] = useState('')
  const [currentSection, setCurrentSection] = useState<'personal' | 'qualifications'>('personal')
  const router = useRouter()

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim() ? '' : 'This field is required'
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return value.trim() ? (emailRegex.test(value) ? '' : 'Please enter a valid email address') : 'Email is required'
      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        return value.trim() ? (phoneRegex.test(value.replace(/\s/g, '')) ? '' : 'Please enter a valid phone number') : 'Phone number is required'
      case 'idNumber':
        return value.trim() ? (value.length >= 5 ? '' : 'ID number must be at least 5 characters') : 'ID number is required'
      case 'dateOfBirth':
        const age = new Date().getFullYear() - new Date(value).getFullYear()
        return value ? (age >= 16 ? '' : 'You must be at least 16 years old') : 'Date of birth is required'
      case 'program':
        return value ? '' : 'Please select a program'
      case 'highestEducation':
        return value ? '' : 'Please select your highest education level'
      case 'graduationYear':
        const year = parseInt(value)
        const currentYear = new Date().getFullYear()
        return value ? (year >= 1950 && year <= currentYear ? '' : 'Please enter a valid graduation year') : 'Graduation year is required'
      default:
        return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Real-time validation
    const fieldError = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: fieldError }))
  }

  const validateSection = (section: 'personal' | 'qualifications'): boolean => {
    const personalFields = ['firstName', 'lastName', 'email', 'phone', 'idNumber', 'dateOfBirth', 'gender', 'address', 'city', 'postalCode', 'country']
    const qualificationFields = ['program', 'highestEducation', 'institution', 'graduationYear']
    
    const fieldsToValidate = section === 'personal' ? personalFields : qualificationFields
    const newErrors: FormErrors = {}
    let isValid = true

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof FormData])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(prev => ({ ...prev, ...newErrors }))
    return isValid
  }

  const handleNext = () => {
    if (validateSection('personal')) {
      setCurrentSection('qualifications')
    }
  }

  const handleBack = () => {
    setCurrentSection('personal')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate all fields
    const isPersonalValid = validateSection('personal')
    const isQualificationValid = validateSection('qualifications')

    if (!isPersonalValid || !isQualificationValid) {
      setError('Please fix all errors before submitting')
      return
    }

    setLoading(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      const result = await createUser(formDataObj)
      
      if (result.success) {
        setSuccess(true)
        setUserPin(result.pin || '')
        // Reset form
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', idNumber: '',
          dateOfBirth: '', gender: '', address: '', city: '', postalCode: '', country: '',
          program: '', highestEducation: '', institution: '', graduationYear: '',
          experience: '', qualifications: '', skills: '', motivation: ''
        })
        setErrors({})
      } else {
        setError(result.error || 'Failed to submit application')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Application Submitted Successfully!
              </CardTitle>
              <p className="text-gray-600">
                Your application has been received and is being processed
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Your Login Credentials</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">ID Number (Username)</p>
                    <p className="text-lg font-mono font-bold text-blue-900">{formData.idNumber}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Temporary PIN</p>
                    <p className="text-2xl font-mono font-bold text-blue-900">{userPin}</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Important:</strong> Please save these credentials securely. You'll need them to log in and complete your application process.
                  </p>
                </div>
              </div>
              
              <div className="text-left space-y-6">
                <h4 className="text-xl font-semibold text-gray-900">What happens next?</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Log in to your account</h5>
                      <p className="text-sm text-gray-600">Use your ID Number and PIN to access your personal dashboard</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Upload required documents</h5>
                      <p className="text-sm text-gray-600">Submit your certified ID, CV, qualifications, and references</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Wait for review</h5>
                      <p className="text-sm text-gray-600">Our team will review your application and documents</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">4</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Get approved</h5>
                      <p className="text-sm text-gray-600">You'll be notified once your application is approved and can start learning</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => router.push('/login/user')}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                >
                  Log In Now
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSuccess(false)
                    setUserPin('')
                    setCurrentSection('personal')
                  }}
                  className="px-8 py-3 text-lg"
                >
                  Submit Another Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Apply to iSpaan
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Complete the form below to start your learning journey
          </p>
          
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentSection === 'personal' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentSection === 'personal' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="font-medium">Personal Details</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center space-x-2 ${currentSection === 'qualifications' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentSection === 'qualifications' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="font-medium">Qualifications & Experience</span>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {currentSection === 'personal' && (
                <div className="space-y-8">
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Personal Details</h2>
                    <p className="text-gray-600">Tell us about yourself and your contact information</p>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email">Email Address *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p>{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && <p>{errors.phone}</p>}
                    </div>
                  </div>

                  {/* ID and Demographics */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <label htmlFor="idNumber">ID Number *</label>
                      <input
                        id="idNumber"
                        name="idNumber"
                        type="text"
                        value={formData.idNumber}
                        onChange={handleChange}
                        placeholder="Enter your ID number"
                        className={errors.idNumber ? 'border-red-500' : ''}
                      />
                      {errors.idNumber && <p>{errors.idNumber}</p>}
                      <p className="text-sm text-gray-500 mt-1">
                        This will be your username for login
                      </p>
                    </div>

                    <div>
                      <label htmlFor="dateOfBirth">Date of Birth *</label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={errors.dateOfBirth ? 'border-red-500' : ''}
                      />
                      {errors.dateOfBirth && <p>{errors.dateOfBirth}</p>}
                    </div>

                    <div>
                      <label htmlFor="gender">Gender *</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${errors.gender ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                      {errors.gender && <p>{errors.gender}</p>}
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label htmlFor="address">Street Address *</label>
                        <input
                          id="address"
                          name="address"
                          type="text"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter your street address"
                          className={errors.address ? 'border-red-500' : ''}
                        />
                        {errors.address && <p>{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                          <label htmlFor="city">City *</label>
                          <input
                            id="city"
                            name="city"
                            type="text"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Enter your city"
                            className={errors.city ? 'border-red-500' : ''}
                          />
                          {errors.city && <p>{errors.city}</p>}
                        </div>

                        <div>
                          <label htmlFor="postalCode">Postal Code *</label>
                          <input
                            id="postalCode"
                            name="postalCode"
                            type="text"
                            value={formData.postalCode}
                            onChange={handleChange}
                            placeholder="Enter postal code"
                            className={errors.postalCode ? 'border-red-500' : ''}
                          />
                          {errors.postalCode && <p>{errors.postalCode}</p>}
                        </div>

                        <div>
                          <label htmlFor="country">Country *</label>
                          <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${errors.country ? 'border-red-500' : ''}`}
                          >
                            <option value="">Select country</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="IN">India</option>
                            <option value="BR">Brazil</option>
                            <option value="other">Other</option>
                          </select>
                          {errors.country && <p>{errors.country}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                    >
                      Next: Qualifications & Experience
                    </Button>
                  </div>
                </div>
              )}

              {currentSection === 'qualifications' && (
                <div className="space-y-8">
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Qualifications & Experience</h2>
                    <p className="text-gray-600">Tell us about your educational background and experience</p>
                  </div>

                  {/* Program Selection */}
                  <div>
                    <label htmlFor="program">Program of Interest *</label>
                    <select
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${errors.program ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select a program</option>
                      <option value="computer-science">Computer Science</option>
                      <option value="data-science">Data Science</option>
                      <option value="artificial-intelligence">Artificial Intelligence</option>
                      <option value="software-engineering">Software Engineering</option>
                      <option value="cybersecurity">Cybersecurity</option>
                      <option value="web-development">Web Development</option>
                      <option value="mobile-development">Mobile Development</option>
                      <option value="cloud-computing">Cloud Computing</option>
                      <option value="devops">DevOps</option>
                    </select>
                    {errors.program && <p>{errors.program}</p>}
                  </div>

                  {/* Educational Background */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Educational Background</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="highestEducation">Highest Education Level *</label>
                        <select
                          id="highestEducation"
                          name="highestEducation"
                          value={formData.highestEducation}
                          onChange={handleChange}
                          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${errors.highestEducation ? 'border-red-500' : ''}`}
                        >
                          <option value="">Select education level</option>
                          <option value="high-school">High School</option>
                          <option value="associate">Associate Degree</option>
                          <option value="bachelor">Bachelor's Degree</option>
                          <option value="master">Master's Degree</option>
                          <option value="phd">PhD/Doctorate</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.highestEducation && <p>{errors.highestEducation}</p>}
                      </div>

                      <div>
                        <label htmlFor="graduationYear">Graduation Year *</label>
                        <input
                          id="graduationYear"
                          name="graduationYear"
                          type="number"
                          min="1950"
                          max={new Date().getFullYear()}
                          value={formData.graduationYear}
                          onChange={handleChange}
                          placeholder="Enter graduation year"
                          className={errors.graduationYear ? 'border-red-500' : ''}
                        />
                        {errors.graduationYear && <p>{errors.graduationYear}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="institution">Institution Name *</label>
                      <input
                        id="institution"
                        name="institution"
                        type="text"
                        value={formData.institution}
                        onChange={handleChange}
                        placeholder="Enter the name of your institution"
                        className={errors.institution ? 'border-red-500' : ''}
                      />
                      {errors.institution && <p>{errors.institution}</p>}
                    </div>
                  </div>

                  {/* Experience and Skills */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Experience & Skills</h3>
                    
                    <div>
                      <label htmlFor="experience">Previous Work Experience</label>
                      <textarea
                        id="experience"
                        name="experience"
                        rows={4}
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="Tell us about your previous work experience in technology, programming, or related fields..."
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="qualifications">Educational Qualifications & Certifications</label>
                      <textarea
                        id="qualifications"
                        name="qualifications"
                        rows={3}
                        value={formData.qualifications}
                        onChange={handleChange}
                        placeholder="List your educational qualifications, certifications, or relevant courses..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="skills">Technical Skills</label>
                      <textarea
                        id="skills"
                        name="skills"
                        rows={3}
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="List your technical skills, programming languages, tools, or technologies you're familiar with..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="motivation">Motivation & Goals</label>
                      <textarea
                        id="motivation"
                        name="motivation"
                        rows={4}
                        value={formData.motivation}
                        onChange={handleChange}
                        placeholder="Tell us why you want to join this program and what you hope to achieve..."
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="px-8 py-3"
                    >
                      Back: Personal Details
                    </Button>
                    <LoadingButton
                      type="submit"
                      loading={loading}
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                    >
                      Submit Application
                    </LoadingButton>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
