'use client'

import React, { useState } from 'react'
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

interface Program {
  id: string
  name: string
  description: string
  duration: string
  level: string
  available: boolean
}

interface ApplyFormProps {
  programs: Program[]
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
  yearsOfExperience: z.number().min(0, 'Years of experience cannot be negative').max(50, 'Years of experience seems too high'),
})

type ApplyFormData = z.infer<typeof applyFormSchema>

export function ApplyForm({ programs }: ApplyFormProps) {
  const [error, setError] = useState('')
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
      yearsOfExperience: 0,
    },
  })

  const { handleSubmit, formState: { errors }, watch, setValue } = form

  const validateSection = (section: 'personal' | 'qualifications'): boolean => {
    const personalFields = ['firstName', 'lastName', 'email', 'phone', 'age', 'gender', 'idNumber', 'nationality', 'streetAddress', 'suburb', 'province']
    const qualificationFields = ['program', 'highestQualification', 'fieldOfStudy', 'yearsOfExperience']
    
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Card className="text-center shadow-lg">
            <CardHeader className="p-4 md:p-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Application Submitted Successfully!
              </CardTitle>
              <p className="text-sm md:text-base text-gray-600">
                Your application has been received and is being processed
              </p>
            </CardHeader>
            <CardContent className="space-y-6 md:space-y-8 p-4 md:p-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 md:p-8">
                <h3 className="text-lg md:text-xl font-semibold text-blue-900 mb-4">Your Login Credentials</h3>
            <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">ID Number (Username)</p>
                  <p className="text-base md:text-lg font-mono font-bold text-blue-900 break-all">{watch('idNumber')}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">Temporary PIN</p>
                  <p className="text-xl md:text-2xl font-mono font-bold text-blue-900">{userPin}</p>
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
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-base md:text-lg md:px-8 w-full sm:w-auto"
                >
                  Log In Now
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSuccess(false)
                    setUserPin('')
                    setCurrentSection('personal')
                    form.reset()
                  }}
                  className="px-6 py-3 text-base md:text-lg md:px-8 w-full sm:w-auto"
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              Apply to iSpaan
            </h1>
            <p className="text-base md:text-xl text-gray-600 mb-6">
              Complete the form below to start your learning journey
            </p>
            
            {/* Progress Indicator - Mobile Optimized */}
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className={`flex items-center space-x-1 md:space-x-2 ${currentSection === 'personal' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${currentSection === 'personal' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="font-medium text-sm md:text-base hidden sm:inline">Personal Details</span>
                </div>
                <div className="w-6 md:w-12 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center space-x-1 md:space-x-2 ${currentSection === 'qualifications' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${currentSection === 'qualifications' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="font-medium text-sm md:text-base hidden sm:inline">Qualifications & Experience</span>
                </div>
              </div>
            </div>
            
            {/* Mobile Progress Labels */}
            <div className="sm:hidden text-center mb-4">
              <p className="text-sm font-medium text-gray-600">
                Step {currentSection === 'personal' ? '1' : '2'} of 2: {currentSection === 'personal' ? 'Personal Details' : 'Qualifications & Experience'}
              </p>
            </div>
          </div>

      <Card className="shadow-lg">
        <CardContent className="p-4 md:p-8">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {currentSection === 'personal' && (
                <fieldset className="space-y-6 md:space-y-8">
                  <div className="border-b border-gray-200 pb-4 md:pb-6">
                    <legend className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Personal Details</legend>
                    <p className="text-sm md:text-base text-gray-600">Tell us about yourself and your contact information</p>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Age, Gender, and ID */}
                  <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter your age" 
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
                        <FormItem>
                          <FormLabel>Gender *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
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
                        <FormItem>
                          <FormLabel>ID Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your ID number" {...field} />
                          </FormControl>
                          <p className="text-sm text-gray-500 mt-1">
                            This will be your username for login
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Nationality */}
                  <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your nationality" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4 md:space-y-6">
                    <h3 className="text-base md:text-lg font-medium text-gray-900">Address Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                      <FormField
                        control={form.control}
                        name="streetAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your full street address" 
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="suburb"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Suburb / Township *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your suburb or township" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="province"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Province *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
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

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm md:text-base md:px-8 w-full sm:w-auto"
                    >
                      <span className="hidden sm:inline">Next: Qualifications & Experience</span>
                      <span className="sm:hidden">Next Step</span>
                    </Button>
                  </div>
                </fieldset>
              )}

              {currentSection === 'qualifications' && (
                <fieldset className="space-y-6 md:space-y-8">
                  <div className="border-b border-gray-200 pb-4 md:pb-6">
                    <legend className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Qualifications & Experience</legend>
                    <p className="text-sm md:text-base text-gray-600">Tell us about your educational background and experience</p>
                  </div>

                  {/* Program Selection */}
                  <FormField
                    control={form.control}
                    name="program"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program of Interest *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a program" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {programs.map((program) => (
                              <SelectItem key={program.id} value={program.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{program.name}</span>
                                  <span className="text-sm text-gray-500">
                                    {program.duration} • {program.level}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Educational Background */}
                  <div className="space-y-4 md:space-y-6">
                    <h3 className="text-base md:text-lg font-medium text-gray-900">Educational Background</h3>
                    <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="highestQualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Highest Qualification *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
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
                          <FormItem>
                            <FormLabel>Field of Study *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Computer Science, Graphic Design" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div className="space-y-4 md:space-y-6">
                    <h3 className="text-base md:text-lg font-medium text-gray-900">Work Experience</h3>
                    <FormField
                      control={form.control}
                      name="yearsOfExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="50"
                              placeholder="Enter years of relevant work experience" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>


                  <div className="flex flex-col sm:flex-row gap-4 sm:justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="px-6 py-3 text-sm md:text-base md:px-8 w-full sm:w-auto order-2 sm:order-1"
                    >
                      <span className="hidden sm:inline">Back: Personal Details</span>
                      <span className="sm:hidden">Back</span>
                    </Button>
                    <LoadingButton
                      type="submit"
                      loading={loading}
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm md:text-base md:px-8 w-full sm:w-auto order-1 sm:order-2"
                    >
                      Submit Application
                    </LoadingButton>
                  </div>
                </fieldset>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  )
}

