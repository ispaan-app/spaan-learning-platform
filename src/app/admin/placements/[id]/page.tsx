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
import { getPlacementByIdAction, Placement } from '../actions'
import { candidateMatcherFlow } from '@/lib/ai/candidate-matcher'
import { enrollLearnerAction } from './actions'
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !placement) {
    return (
      <AdminLayout userRole="admin">
        <div className="flex items-center justify-center min-h-96">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || 'Placement not found'}</AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    )
  }

  const progressPercentage = placement.capacity > 0 
    ? (placement.assignedLearners / placement.capacity) * 100 
    : 0

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{placement.companyName}</h1>
              <p className="text-gray-600">{placement.suburb}, {placement.province}</p>
            </div>
          </div>
          <Badge className={`${placement.status === 'active' ? 'bg-green-100 text-green-800' : 
                            placement.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                            'bg-blue-100 text-blue-800'}`}>
            {placement.status}
          </Badge>
        </div>

        {/* Placement Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Placement Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Company Name</h4>
                    <p className="text-lg">{placement.companyName}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Program</h4>
                    <p className="text-lg">{placement.programId}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Address</h4>
                    <p className="text-lg">{placement.address}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Location</h4>
                    <p className="text-lg">{placement.suburb}, {placement.province}</p>
                  </div>
                </div>

                {placement.description && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Description</h4>
                    <p className="text-gray-700">{placement.description}</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Coordinates: {placement.latitude.toFixed(6)}, {placement.longitude.toFixed(6)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{placement.contactPerson}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{placement.contactEmail}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{placement.contactPhone}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Capacity Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Capacity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Assigned Learners</span>
                    <span className="font-medium">
                      {placement.assignedLearners} / {placement.capacity}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>{placement.capacity}</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {placement.capacity - placement.assignedLearners}
                  </p>
                  <p className="text-sm text-gray-600">Spots Available</p>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>QR Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm font-mono text-gray-600 break-all">
                      {placement.qrCodeData}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use this code to generate the physical QR code for check-ins
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Candidate Matching */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>AI Candidate Matcher</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Find the best learners for this placement using AI-powered matching
                </p>
              </div>
              <Button
                onClick={handleFindCandidates}
                disabled={isMatching || placement.assignedLearners >= placement.capacity}
                className="flex items-center space-x-2"
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
              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  This placement is at full capacity. No more learners can be assigned.
                </AlertDescription>
              </Alert>
            )}

            {candidates.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Recommended Candidates</h4>
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h5 className="font-semibold text-lg">{candidate.name}</h5>
                            <p className="text-sm text-gray-600">{candidate.email}</p>
                            <p className="text-sm text-gray-500">{candidate.program}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {candidate.matchScore}% Match
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-gray-700">
                            <strong>Justification:</strong> {candidate.justification}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Skills:</strong> {candidate.skills.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Experience:</strong> {candidate.experience}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Availability:</strong> {candidate.availability}
                          </p>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button
                          onClick={() => handleEnrollLearner(candidate.id)}
                          disabled={isEnrolling === candidate.id || placement.assignedLearners >= placement.capacity}
                          className="flex items-center space-x-2"
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
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}








