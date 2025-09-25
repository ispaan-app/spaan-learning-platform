'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createUser } from '@/app/actions/userActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingButton } from '@/components/ui/loading'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { useProgramNames } from '@/hooks/useProgramNames'
import { ArrowLeft, ArrowRight, CheckCircle, User, GraduationCap, MapPin, Phone, Mail, Calendar, FileText, Sparkles, Zap, Shield, Star, Award, Target, Globe, Brain, Users, Clock, Check, Key } from 'lucide-react'

interface Program {
  id: string
  name: string
  description: string
  duration?: string
  level?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  projectId?: string
  projectName?: string
}

interface ApplyFormProps {
  programs?: Program[]
}

// Zod schema for form validation - matching the blueprint exactly
const applyFormSchema = z.object({
  // Personal Details Section
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  age: z.number().min(16, 'Age must be at least 16').max(100, 'Age must be less than 100'),
  gender: z.string().min(1, 'Please select your gender'),
  idNumber: z.string().min(13, 'ID number must be at least 13 characters').max(13, 'ID number must be exactly 13 characters'),
  nationality: z.string().min(1, 'Nationality is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  suburb: z.string().min(1, 'Suburb/Township is required'),
  province: z.string().min(1, 'Please select your province'),
  
  // Qualifications & Experience Section
  program: z.string().min(1, 'Please select a program'),
  highestQualification: z.string().min(1, 'Please select your highest qualification'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  bio: z.string().min(20, 'Please provide a short bio (at least 20 characters)'),
  yearsOfExperience: z.union([z.number().min(0, 'Years of experience cannot be negative').max(50, 'Years of experience seems too high'), z.nan()]).optional(),
})

type ApplyFormData = z.infer<typeof applyFormSchema>

export function ApplyForm({ programs: initialPrograms }: ApplyFormProps) {
  const { programNamesList, loading: programNamesLoading, error: programNamesError } = useProgramNames()
  const [programs, setPrograms] = useState<Program[]>(initialPrograms || [])
  const [programsLoading, setProgramsLoading] = useState(!initialPrograms)
  const [error, setError] = useState('')
  const [programsError, setProgramsError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userPin, setUserPin] = useState('')
  const [currentSection, setCurrentSection] = useState<'personal' | 'qualifications'>('personal')
  const router = useRouter()

  const form = useForm<ApplyFormData>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      // Personal Details
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      age: 18,
      gender: '',
      idNumber: '',
      nationality: '',
      streetAddress: '',
      suburb: '',
      province: '',
      
  // Qualifications & Experience
  program: '',
  highestQualification: '',
  fieldOfStudy: '',
  bio: '',
  yearsOfExperience: undefined,
    },
  })

  const { handleSubmit, formState: { errors }, watch, setValue } = form

  // Fetch programs from Firestore
  useEffect(() => {
    if (!initialPrograms) {
      const fetchPrograms = async () => {
        try {
          setProgramsLoading(true)
          setProgramsError(null)
          const programsQuery = query(
            collection(db, 'programs'),
            orderBy('name', 'asc')
          )
          const snapshot = await getDocs(programsQuery)
          const programsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Program[]
          setPrograms(programsData)
        } catch (error: any) {
          console.error('Error fetching programs:', error)
          setProgramsError(
            error?.message ? `Failed to load programs: ${error.message}` : 'Failed to load programs from database.'
          )
          // No fallback programs - let the user know programs need to be created
          setPrograms([])
        } finally {
          setProgramsLoading(false)
        }
      }
      fetchPrograms()
    }
  }, [initialPrograms])

  const validateSection = (section: 'personal' | 'qualifications'): boolean => {
    const personalFields = ['firstName', 'lastName', 'email', 'phone', 'age', 'gender', 'idNumber', 'nationality', 'streetAddress', 'suburb', 'province']
  const qualificationFields = ['program', 'highestQualification', 'fieldOfStudy', 'bio', 'yearsOfExperience']
    
    const fieldsToValidate = section === 'personal' ? personalFields : qualificationFields
    let isValid = true

    fieldsToValidate.forEach(async (field) => {
      const result = await form.trigger(field as keyof ApplyFormData)
      if (!result) {
        isValid = false
      }
    })

    return isValid
  }

  const handleNext = async () => {
    const isValid = await validateSection('personal')
    if (isValid) {
      setCurrentSection('qualifications')
    }
  }

  const handleBack = () => {
    setCurrentSection('personal')
  }

  const onSubmit = async (data: ApplyFormData) => {
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const formDataObj = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formDataObj.append(key, String(value))
      })

      const result = await createUser(formDataObj)
      
      if (result.success) {
        setSuccess(true)
        setUserPin(result.pin || '')
        form.reset()
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-8 border border-white/20 shadow-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 animate-pulse" />
              <span className="text-green-700 font-semibold">Application Successful</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="block text-gray-900">Welcome to</span>
              <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                iSpaan!
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your application has been submitted successfully. You're now part of our learning community!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Login Credentials Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Your Login Credentials
                  </h2>
                  <p className="text-gray-600">Save these credentials securely for future logins</p>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-center mb-3">
                      <User className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-semibold text-blue-700">ID Number (Username)</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-blue-900 break-all">{watch('idNumber')}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <div className="flex items-center mb-3">
                      <Key className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-semibold text-green-700">Temporary PIN</span>
                    </div>
                    <p className="text-3xl font-mono font-bold text-green-900">{userPin}</p>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-2">Important Security Notice</h4>
                      <p className="text-sm text-yellow-700">
                        Please save these credentials securely. You'll need them to log in and complete your application process. 
                        Do not share these credentials with anyone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    What Happens Next?
                  </h2>
                  <p className="text-gray-600">Follow these steps to complete your journey</p>
                </div>
                
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Log in to your account",
                      description: "Use your ID Number and PIN to access your personal dashboard",
                      icon: User,
                      color: "blue"
                    },
                    {
                      step: 2,
                      title: "Upload required documents",
                      description: "Submit your certified ID, CV, qualifications, and references",
                      icon: FileText,
                      color: "green"
                    },
                    {
                      step: 3,
                      title: "Wait for review",
                      description: "Our team will review your application and documents",
                      icon: Clock,
                      color: "orange"
                    },
                    {
                      step: 4,
                      title: "Get approved",
                      description: "You'll be notified once your application is approved and can start learning",
                      icon: Award,
                      color: "purple"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 group/item">
                      <div className={`w-12 h-12 bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform duration-300`}>
                        <span className="text-white font-bold text-lg">{item.step}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover/item:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <Button 
              onClick={() => router.push('/login/user')}
              className="group inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <User className="w-5 h-5 mr-3" />
              Log In Now
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setSuccess(false)
                setUserPin('')
                setCurrentSection('personal')
                form.reset()
              }}
              className="group inline-flex items-center px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              <FileText className="w-5 h-5 mr-3" />
              Submit Another Application
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-8 border border-white/20 shadow-lg">
            <Sparkles className="w-5 h-5 text-blue-600 mr-2 animate-pulse" />
            <span className="text-blue-700 font-semibold">Join iSpaan</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="block text-gray-900">Apply to</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
              iSpaan
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Complete the form below to start your learning journey and transform your career
          </p>
          
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-white/20">
              <div className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-300 ${currentSection === 'personal' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentSection === 'personal' ? 'bg-white/20' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="font-semibold hidden sm:inline">Personal Details</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              <div className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-300 ${currentSection === 'qualifications' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentSection === 'qualifications' ? 'bg-white/20' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="font-semibold hidden sm:inline">Qualifications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {currentSection === 'personal' && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Personal Details
                      </h2>
                      <p className="text-gray-600">Tell us about yourself and your contact information</p>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <User className="w-4 h-4 mr-2 text-blue-600" />
                              First Name *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your first name" 
                                className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <User className="w-4 h-4 mr-2 text-blue-600" />
                              Last Name *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your last name" 
                                className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-green-600" />
                              Email Address *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-green-600" />
                              Phone Number *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="tel" 
                                placeholder="Enter your phone number" 
                                className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Age, Gender, and ID */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                              Age *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter your age" 
                                className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Users className="w-4 h-4 mr-2 text-orange-600" />
                              Gender *
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="idNumber"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Shield className="w-4 h-4 mr-2 text-orange-600" />
                              ID Number *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your ID number" 
                                className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                {...field} 
                              />
                            </FormControl>
                            <p className="text-sm text-gray-500 mt-2 flex items-center">
                              <Key className="w-3 h-3 mr-1" />
                              This will be your username for login
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Nationality */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Globe className="w-4 h-4 mr-2 text-purple-600" />
                              Nationality *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your nationality" 
                                className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address Information */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Address Information</h3>
                        <p className="text-gray-600 text-sm">Tell us where you're located</p>
                      </div>
                      
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="streetAddress"
                          render={({ field }) => (
                            <FormItem className="group">
                              <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                                Street Address *
                              </FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter your full street address" 
                                  rows={3}
                                  className="bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="suburb"
                            render={({ field }) => (
                              <FormItem className="group">
                                <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                                  Suburb / Township *
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your suburb or township" 
                                    className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="province"
                            render={({ field }) => (
                              <FormItem className="group">
                                <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                                  Province *
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300">
                                      <SelectValue placeholder="Select province" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                                    <SelectItem value="Free State">Free State</SelectItem>
                                    <SelectItem value="Gauteng">Gauteng</SelectItem>
                                    <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                                    <SelectItem value="Limpopo">Limpopo</SelectItem>
                                    <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                                    <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                                    <SelectItem value="North West">North West</SelectItem>
                                    <SelectItem value="Western Cape">Western Cape</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                      >
                        Next: Qualifications
                        <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                )}

                {currentSection === 'qualifications' && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <GraduationCap className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Qualifications & Experience
                      </h2>
                      <p className="text-gray-600">Tell us about your educational background and experience</p>
                    </div>

                    {/* Program Selection */}
                    {programsError && (
                      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                        <AlertDescription>{programsError}</AlertDescription>
                      </Alert>
                    )}
                    <FormField
                      control={form.control}
                      name="program"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <Target className="w-4 h-4 mr-2 text-purple-600" />
                            Program of Interest *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={programsLoading}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300">
                                <SelectValue placeholder={programsLoading ? "Loading programs..." : "Select a program"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {programsLoading ? (
                                <SelectItem value="" disabled>
                                  Loading programs...
                                </SelectItem>
                              ) : programs.length === 0 ? (
                                <SelectItem value="" disabled>
                                  No programs available
                                </SelectItem>
                              ) : (
                                programs.map((program) => (
                                  <SelectItem key={program.id} value={program.id}>
                                    {program.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          {programsLoading && (
                            <p className="text-sm text-gray-500 mt-2 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Loading programs from database...
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Bio/About You */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">About You</h3>
                        <p className="text-gray-600 text-sm">Tell us about yourself and your goals</p>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <FileText className="w-4 h-4 mr-2 text-pink-600" />
                              Short Bio *
                            </FormLabel>
                            <FormControl>
                              <textarea
                                className="w-full min-h-[120px] bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl p-4 text-base focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                                placeholder="Tell us a bit about yourself, your interests, and why you are applying."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Educational Background */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Educational Background</h3>
                        <p className="text-gray-600 text-sm">Tell us about your education</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="highestQualification"
                          render={({ field }) => (
                            <FormItem className="group">
                              <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <Award className="w-4 h-4 mr-2 text-indigo-600" />
                                Highest Qualification *
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300">
                                    <SelectValue placeholder="Select qualification level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="High School Certificate">High School Certificate</SelectItem>
                                  <SelectItem value="National Certificate">National Certificate (NQF 4)</SelectItem>
                                  <SelectItem value="Diploma">Diploma (NQF 5-6)</SelectItem>
                                  <SelectItem value="Bachelor Degree">Bachelor's Degree (NQF 7)</SelectItem>
                                  <SelectItem value="Honours Degree">Honours Degree (NQF 8)</SelectItem>
                                  <SelectItem value="Masters Degree">Master's Degree (NQF 9)</SelectItem>
                                  <SelectItem value="Doctorate">Doctorate (NQF 10)</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fieldOfStudy"
                          render={({ field }) => (
                            <FormItem className="group">
                              <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <Brain className="w-4 h-4 mr-2 text-indigo-600" />
                                Field of Study *
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., Computer Science, Graphic Design" 
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Work Experience (Optional) */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Work Experience <span className="text-gray-500 font-normal">(optional)</span></h3>
                        <p className="text-gray-600 text-sm">Tell us about your professional experience</p>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Star className="w-4 h-4 mr-2 text-green-600" />
                              Years of Experience
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                max="50"
                                placeholder="Enter years of relevant work experience (leave blank if none)" 
                                className="h-12 bg-white/50 backdrop-blur-sm border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 pt-8">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="group inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-bold text-lg hover:border-purple-600 hover:text-purple-600 transition-all duration-300 transform hover:scale-105 order-2 sm:order-1"
                      >
                        <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                        Back: Personal Details
                      </Button>
                      
                      <LoadingButton
                        type="submit"
                        loading={loading}
                        className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl order-1 sm:order-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Application
                            <Check className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </LoadingButton>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

