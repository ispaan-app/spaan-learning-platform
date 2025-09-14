'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  Calendar, 
  BookOpen, 
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface RecentApplicant {
  id: string
  firstName: string
  lastName: string
  email: string
  program: string
  applicationDate: string
  status: string
}

interface RecentApplicantsProps {
  applicants: RecentApplicant[]
}

export function RecentApplicants({ applicants }: RecentApplicantsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending-review':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case 'ready-for-review':
        return <Badge className="bg-blue-100 text-blue-800">Ready for Review</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending-review':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'ready-for-review':
        return <Eye className="w-4 h-4 text-blue-600" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const formatProgramName = (program: string) => {
    return program
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (applicants.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Recent Applicants
        </h3>
        <p className="text-gray-600">
          New applications will appear here once submitted.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applicants.map((applicant) => (
        <div 
          key={applicant.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {applicant.firstName.charAt(0)}{applicant.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {applicant.firstName} {applicant.lastName}
                </h3>
                {getStatusIcon(applicant.status)}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{formatProgramName(applicant.program)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(applicant.applicationDate)}</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-1 truncate">
                {applicant.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {getStatusBadge(applicant.status)}
            
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/applicants/${applicant.id}`}>
                <Eye className="w-4 h-4 mr-1" />
                Review
              </Link>
            </Button>
          </div>
        </div>
      ))}
      
      {applicants.length >= 4 && (
        <div className="pt-4 border-t border-gray-200">
          <Button asChild variant="outline" className="w-full">
            <Link href="/admin/applicants">
              View All Applicants
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

