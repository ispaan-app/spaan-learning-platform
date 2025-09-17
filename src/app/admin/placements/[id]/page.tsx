'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  ArrowLeft,
  Sparkles,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPlacementByIdAction, Placement, enrollLearnerAction } from '../actions'
import { candidateMatcherFlow } from '@/lib/ai/candidate-matcher'
import { toast } from '@/lib/toast'

interface Candidate {
  id: string
  name: string
  email: string
  program: string
  matchScore: number
  justification: string
  skills: string[]
  experience: string
  availability: string
}

export default function PlacementDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [placement, setPlacement] = useState<Placement | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMatching, setIsMatching] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPlacement = async () => {
    try {
      setIsLoading(true)
      const data = await getPlacementByIdAction(params.id)
      if (data) {
        setPlacement(data)
      } else {
        setError('Placement not found')
      }
    } catch (err) {
      console.error('Error loading placement:', err)
      setError('Failed to load placement details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFindCandidates = async () => {
    if (!placement) return

    try {
      setIsMatching(true)
      const result = await candidateMatcherFlow({
        placementId: placement.id!,
        programId: placement.programId,
        companyName: placement.companyName,
        requirements: placement.description || '',
        currentCapacity: placement.assignedLearners,
        maxCapacity: placement.capacity
      })

      if (result.success) {
        setCandidates(result.candidates || [])
        toast.success(`Found ${result.candidates?.length || 0} potential candidates`)
      } else {
        toast.error(result.error || 'Failed to find candidates')
      }
    } catch (error) {
      console.error('Error finding candidates:', error)
      toast.error('Failed to find candidates')
    } finally {
      setIsMatching(false)
    }
  }

  const handleEnrollLearner = async (candidateId: string) => {
    if (!placement) return

    try {
      setIsEnrolling(candidateId)
      const result = await enrollLearnerAction(placement.id!, candidateId)
      
      if (result.success) {
        toast.success('Learner enrolled successfully!')
        // Refresh placement data
        await loadPlacement()
        // Remove enrolled candidate from list
        setCandidates(prev => prev.filter(c => c.id !== candidateId))
      } else {
        toast.error(result.error || 'Failed to enroll learner')
      }
    } catch (error) {
      console.error('Error enrolling learner:', error)
      toast.error('Failed to enroll learner')
    } finally {
      setIsEnrolling(null)
    }
  }

  useEffect(() => {
    loadPlacement()
  }, [params.id])

  if (isLoading) {
    return (
      <AdminLayout userRole="admin">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#FF6E40' }}></div>
            <p className="text-lg font-medium" style={{ color: '#1E3D59' }}>Loading placement details...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !placement) {
    return (
      <AdminLayout userRole="admin">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
              <AlertTriangle className="h-8 w-8" style={{ color: '#FF6E40' }} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: '#1E3D59' }}>Placement Not Found</h3>
            <p style={{ color: '#1E3D59', opacity: 0.7 }}>{error || 'The requested placement could not be found'}</p>
            <Button
              onClick={() => router.back()}
              className="transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: '#FF6E40' }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const progressPercentage = placement.capacity > 0 
    ? (placement.assignedLearners / placement.capacity) * 100 
    : 0

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
                style={{ 
                  borderColor: 'rgba(30, 61, 89, 0.2)',
                  color: '#1E3D59'
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-4xl font-bold" style={{ color: '#1E3D59' }}>{placement.companyName}</h1>
                <p className="text-lg" style={{ color: '#1E3D59', opacity: 0.7 }}>{placement.suburb}, {placement.province}</p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-full text-sm font-semibold" style={{ 
              backgroundColor: placement.status === 'active' ? 'rgba(255, 110, 64, 0.1)' : 
                             placement.status === 'inactive' ? 'rgba(30, 61, 89, 0.1)' : 
                             'rgba(255, 192, 59, 0.1)',
              color: placement.status === 'active' ? '#FF6E40' : 
                     placement.status === 'inactive' ? '#1E3D59' : 
                     '#FFC13B'
            }}>
              {placement.status}
            </div>
          </div>
        </div>

        {/* Enhanced Placement Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative">
              <div className="rounded-2xl border shadow-lg" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="p-6 border-b" style={{ borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                      Placement Information
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-2" style={{ color: '#1E3D59', opacity: 0.7 }}>Company Name</h4>
                      <p className="text-lg font-medium" style={{ color: '#1E3D59' }}>{placement.companyName}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2" style={{ color: '#1E3D59', opacity: 0.7 }}>Program</h4>
                      <p className="text-lg font-medium" style={{ color: '#1E3D59' }}>{placement.programId}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2" style={{ color: '#1E3D59', opacity: 0.7 }}>Address</h4>
                      <p className="text-lg font-medium" style={{ color: '#1E3D59' }}>{placement.address}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2" style={{ color: '#1E3D59', opacity: 0.7 }}>Location</h4>
                      <p className="text-lg font-medium" style={{ color: '#1E3D59' }}>{placement.suburb}, {placement.province}</p>
                    </div>
                  </div>

                  {placement.description && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2" style={{ color: '#1E3D59', opacity: 0.7 }}>Description</h4>
                      <p style={{ color: '#1E3D59', opacity: 0.8 }}>{placement.description}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 p-3 rounded-xl" style={{ backgroundColor: 'rgba(30, 61, 89, 0.05)' }}>
                    <MapPin className="h-4 w-4" style={{ color: '#FF6E40' }} />
                    <span className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>
                      Coordinates: {placement.latitude.toFixed(6)}, {placement.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Contact Information */}
            <div className="relative">
              <div className="rounded-2xl border shadow-lg" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="p-6 border-b" style={{ borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                      Contact Information
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(30, 61, 89, 0.05)' }}>
                    <Users className="h-5 w-5" style={{ color: '#FF6E40' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1E3D59', opacity: 0.7 }}>Contact Person</p>
                      <p className="font-semibold" style={{ color: '#1E3D59' }}>{placement.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(30, 61, 89, 0.05)' }}>
                    <Mail className="h-5 w-5" style={{ color: '#FFC13B' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1E3D59', opacity: 0.7 }}>Email</p>
                      <p className="font-semibold" style={{ color: '#1E3D59' }}>{placement.contactEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(30, 61, 89, 0.05)' }}>
                    <Phone className="h-5 w-5" style={{ color: '#1E3D59' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1E3D59', opacity: 0.7 }}>Phone</p>
                      <p className="font-semibold" style={{ color: '#1E3D59' }}>{placement.contactPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Capacity Progress */}
            <div className="relative">
              <div className="rounded-2xl border shadow-lg" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="p-6 border-b" style={{ borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold" style={{ color: '#1E3D59' }}>
                      Capacity
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#1E3D59', opacity: 0.7 }}>Assigned Learners</span>
                      <span className="font-semibold" style={{ color: '#1E3D59' }}>
                        {placement.assignedLearners} / {placement.capacity}
                      </span>
                    </div>
                    <div className="w-full rounded-full h-4 overflow-hidden" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
                      <div
                        className="h-4 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progressPercentage}%`,
                          backgroundColor: progressPercentage > 80 ? '#FF6E40' : '#FFC13B'
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: '#1E3D59', opacity: 0.5 }}>
                      <span>0</span>
                      <span>{placement.capacity}</span>
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(30, 61, 89, 0.05)' }}>
                    <p className="text-3xl font-bold" style={{ color: '#FF6E40' }}>
                      {placement.capacity - placement.assignedLearners}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#1E3D59', opacity: 0.7 }}>Spots Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced QR Code Info */}
            <div className="relative">
              <div className="rounded-2xl border shadow-lg" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="p-6 border-b" style={{ borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold" style={{ color: '#1E3D59' }}>
                      QR Code
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center space-y-4">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(30, 61, 89, 0.05)' }}>
                      <p className="text-sm font-mono break-all" style={{ color: '#1E3D59', opacity: 0.8 }}>
                        {placement.qrCodeData}
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: '#1E3D59', opacity: 0.6 }}>
                      Use this code to generate the physical QR code for check-ins
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced AI Candidate Matching */}
        <div className="relative">
          <div className="rounded-2xl border shadow-lg" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'rgba(30, 61, 89, 0.1)' }}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                  AI Candidate Matcher
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg" style={{ color: '#1E3D59', opacity: 0.7 }}>
                    Find the best learners for this placement using AI-powered matching
                  </p>
                </div>
                <Button
                  onClick={handleFindCandidates}
                  disabled={isMatching || placement.assignedLearners >= placement.capacity}
                  className="flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  {isMatching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Find Top Candidates</span>
                </Button>
              </div>

              {placement.assignedLearners >= placement.capacity && (
                <div className="p-4 rounded-xl border" style={{ 
                  backgroundColor: 'rgba(255, 192, 59, 0.1)', 
                  borderColor: 'rgba(255, 192, 59, 0.3)' 
                }}>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5" style={{ color: '#FFC13B' }} />
                    <p className="font-medium" style={{ color: '#1E3D59' }}>
                      This placement is at full capacity. No more learners can be assigned.
                    </p>
                  </div>
                </div>
              )}

              {candidates.length > 0 && (
                <div className="space-y-6">
                  <h4 className="text-xl font-bold" style={{ color: '#1E3D59' }}>Recommended Candidates</h4>
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="group relative p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      style={{ backgroundColor: 'white', borderColor: 'rgba(30, 61, 89, 0.1)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h5 className="text-xl font-bold" style={{ color: '#1E3D59' }}>{candidate.name}</h5>
                              <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>{candidate.email}</p>
                              <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.6 }}>{candidate.program}</p>
                            </div>
                            <div className="px-3 py-1 rounded-full text-sm font-semibold" style={{ 
                              backgroundColor: 'rgba(255, 110, 64, 0.1)',
                              color: '#FF6E40'
                            }}>
                              {candidate.matchScore}% Match
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(30, 61, 89, 0.05)' }}>
                              <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59', opacity: 0.7 }}>Justification</p>
                              <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>{candidate.justification}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 110, 64, 0.05)' }}>
                                <p className="text-xs font-medium mb-1" style={{ color: '#1E3D59', opacity: 0.7 }}>Skills</p>
                                <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>{candidate.skills.join(', ')}</p>
                              </div>
                              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 192, 59, 0.05)' }}>
                                <p className="text-xs font-medium mb-1" style={{ color: '#1E3D59', opacity: 0.7 }}>Experience</p>
                                <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>{candidate.experience}</p>
                              </div>
                              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(30, 61, 89, 0.05)' }}>
                                <p className="text-xs font-medium mb-1" style={{ color: '#1E3D59', opacity: 0.7 }}>Availability</p>
                                <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.8 }}>{candidate.availability}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-6">
                          <Button
                            onClick={() => handleEnrollLearner(candidate.id)}
                            disabled={isEnrolling === candidate.id || placement.assignedLearners >= placement.capacity}
                            className="flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                            style={{ backgroundColor: '#FFC13B' }}
                          >
                            {isEnrolling === candidate.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                            <span>Enroll Learner</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}








