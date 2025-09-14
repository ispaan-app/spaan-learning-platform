'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  Building2, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  User,
  FileText,
  MessageCircle,
  TrendingUp,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'

interface ClassSession {
  id: string
  title: string
  date: string
  time: string
  duration: string
  instructor: string
  location: string
  type: 'lecture' | 'workshop' | 'assessment'
}

interface PlacementDetails {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  role: string
  department: string
  supervisor: string
  status: 'active' | 'on-leave' | 'completed'
  startDate: string
  endDate?: string
  stipendAmount: number
  stipendStatus: 'paid' | 'pending' | 'overdue'
}

interface LearnerData {
  id: string
  firstName: string
  lastName: string
  email: string
  program: string
  monthlyHours: number
  targetHours: number
  stipendEligibility: 'full' | 'prorata' | 'none'
  placement: PlacementDetails
  upcomingClasses: ClassSession[]
  lastCheckIn?: string
  totalEarnings: number
}

interface LearnerDashboardProps {
  learnerData: LearnerData
}

export function LearnerDashboard({ learnerData }: LearnerDashboardProps) {
  const { 
    firstName, 
    lastName, 
    program, 
    monthlyHours, 
    targetHours, 
    stipendEligibility,
    placement,
    upcomingClasses,
    lastCheckIn,
    totalEarnings
  } = learnerData

  const hoursProgress = (monthlyHours / targetHours) * 100
  const remainingHours = Math.max(0, targetHours - monthlyHours)

  const getStipendStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'overdue':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStipendStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPlacementStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'on-leave':
        return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getClassTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return <Calendar className="w-4 h-4 text-blue-600" />
      case 'workshop':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'assessment':
        return <CheckCircle className="w-4 h-4 text-purple-600" />
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />
    }
  }

  const getClassTypeBadge = (type: string) => {
    switch (type) {
      case 'lecture':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Lecture</Badge>
      case 'workshop':
        return <Badge variant="outline" className="text-green-600 border-green-600">Workshop</Badge>
      case 'assessment':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Assessment</Badge>
      default:
        return <Badge variant="outline">Class</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Welcome back, {firstName} {lastName}!
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {program} Program • Active Learner
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  R{totalEarnings.toLocaleString()}
                </p>
              </div>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <Link href="/learner/mentor">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  AI Mentor
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Work-Integrated Learning Progress - Prominent Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Clock className="w-6 h-6" />
            <span>Work-Integrated Learning Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Monthly Hours Target
                </h3>
                <p className="text-blue-700">
                  {monthlyHours} of {targetHours} hours completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-900">
                  {Math.round(hoursProgress)}%
                </div>
                <p className="text-sm text-blue-700">
                  {remainingHours > 0 ? `${remainingHours} hours remaining` : 'Target achieved!'}
                </p>
              </div>
            </div>
            
            <Progress value={hoursProgress} className="h-3" />
            
            {remainingHours > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You need {remainingHours} more hours this month to qualify for your full stipend.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Stipend Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-gray-900">Stipend Eligibility</h4>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-600">
                  {stipendEligibility === 'full' ? 'Full Stipend' : 
                   stipendEligibility === 'prorata' ? 'Prorata' : 'No Stipend'}
                </p>
                <p className="text-sm text-gray-600">
                  R{placement.stipendAmount.toLocaleString()}/month
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Payment Status</h4>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {getStipendStatusBadge(placement.stipendStatus)}
                </div>
                <p className="text-sm text-gray-600">
                  Last check-in: {lastCheckIn ? new Date(lastCheckIn).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-gray-900">This Month</h4>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-purple-600">
                  {monthlyHours}h
                </p>
                <p className="text-sm text-gray-600">
                  Hours logged
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 flex-1">
              <Link href="/learner/check-in">
                <Clock className="w-4 h-4 mr-2" />
                Secure Check-In
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/learner/hours">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Hours History
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Placement Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Placement Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {placement.companyName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getPlacementStatusBadge(placement.status)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{placement.companyAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{placement.companyPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{placement.companyEmail}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Your Role</h4>
                  <p className="text-gray-600">{placement.role}</p>
                  <p className="text-sm text-gray-500">{placement.department}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Supervisor</h4>
                  <p className="text-gray-600">{placement.supervisor}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Duration</h4>
                  <p className="text-gray-600">
                    {new Date(placement.startDate).toLocaleDateString()} - 
                    {placement.endDate ? new Date(placement.endDate).toLocaleDateString() : 'Ongoing'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t">
              <Button asChild variant="outline">
                <Link href="/learner/placement">
                  <Building2 className="w-4 h-4 mr-2" />
                  View Full Details
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/learner/documents">
                  <FileText className="w-4 h-4 mr-2" />
                  Manage Documents
                </Link>
              </Button>
              <Button asChild variant="destructive">
                <Link href="/learner/report-stipend">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Stipend Issue
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Upcoming Classes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingClasses.length > 0 ? (
            <div className="space-y-4">
              {upcomingClasses.slice(0, 3).map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getClassTypeIcon(session.type)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {session.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {session.instructor} • {session.duration}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.location}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {getClassTypeBadge(session.type)}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {session.time}
                    </p>
                  </div>
                </div>
              ))}
              
              {upcomingClasses.length > 3 && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/learner/schedule">
                    View All Classes ({upcomingClasses.length - 3} more)
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Upcoming Classes
              </h3>
              <p className="text-gray-600">
                Your class schedule will appear here once it's available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
