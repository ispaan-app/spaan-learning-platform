'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { submitApplicationAction } from '@/app/actions/applications'
// Removed unused form imports
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingButton } from '@/components/ui/loading'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

interface Program {
  id: string
  name: string
  description?: string
  duration?: string
  level?: string
  status: 'active' | 'inactive'
}

export function ApplicationForm() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [programsLoading, setProgramsLoading] = useState(true)
  const [programsError, setProgramsError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    program: '',
    experience: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Fetch programs from Firestore
  useEffect(() => {
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
        setPrograms([])
      } finally {
        setProgramsLoading(false)
      }
    }
    fetchPrograms()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      const result = await submitApplicationAction(formDataObj)
      
      if (result.success) {
        setSuccess(true)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          program: '',
          experience: ''
        })
        // Redirect to applicant dashboard after successful submission
        setTimeout(() => {
          router.push('/applicant')
        }, 2000)
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in iSpaan. We have received your application and will review it shortly.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Apply to iSpaan
            </h1>
            
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="program">Program of interest</label>
                <select
                  id="program"
                  name="program"
                  required
                  value={formData.program}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select a program</option>
                  {programsLoading ? (
                    <option value="" disabled>Loading programs...</option>
                  ) : programsError ? (
                    <option value="" disabled>Error loading programs</option>
                  ) : programs.length === 0 ? (
                    <option value="" disabled>No programs available</option>
                  ) : (
                    programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="experience">Previous experience</label>
                <textarea
                  id="experience"
                  name="experience"
                  rows={4}
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Tell us about your previous experience in technology, programming, or related fields..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <LoadingButton
                type="submit"
                loading={loading}
                className="w-full"
              >
                Submit Application
              </LoadingButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
