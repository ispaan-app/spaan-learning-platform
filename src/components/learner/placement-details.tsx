'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, User, Mail, Phone, FileText, AlertTriangle, ExternalLink } from 'lucide-react'
import { PlacementInfo } from '@/lib/learner-dashboard-helpers'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface PlacementDetailsProps {
  placementInfo: PlacementInfo | null
  className?: string
}

export function PlacementDetails({ placementInfo, className }: PlacementDetailsProps) {
  const router = useRouter()

  if (!placementInfo) {
    return (
      <Card className={cn("shadow-lg border", className)} style={{ background: 'rgba(245, 240, 225, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(245, 240, 225, 0.3)' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span>Placement Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No placement assigned</p>
            <p className="text-sm text-gray-500 mt-2">
              You will be notified when a work placement becomes available
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'on_leave':
        return 'On Leave'
      case 'inactive':
        return 'Inactive'
      case 'completed':
        return 'Completed'
      default:
        return status
    }
  }

  return (
    <Card className={cn("shadow-lg border", className)} style={{ background: 'rgba(245, 240, 225, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(245, 240, 225, 0.3)' }}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span>Placement Details</span>
          </div>
          <Badge
            variant="outline"
            className={cn("font-semibold", getStatusColor(placementInfo.status))}
          >
            {getStatusText(placementInfo.status)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Information */}
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{placementInfo.companyName}</h4>
            <p className="text-gray-600">{placementInfo.position}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Start Date:</span>
              <p className="font-medium">{placementInfo.startDate}</p>
            </div>
            {placementInfo.endDate && (
              <div>
                <span className="text-gray-500">End Date:</span>
                <p className="font-medium">{placementInfo.endDate}</p>
              </div>
            )}
          </div>
        </div>

        {/* Supervisor Information */}
        {placementInfo.supervisorName && (
          <div className="border-t border-gray-200 pt-4">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Supervisor Information</span>
            </h5>
            <div className="space-y-2">
              <p className="font-medium">{placementInfo.supervisorName}</p>
              {placementInfo.supervisorEmail && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{placementInfo.supervisorEmail}</span>
                </div>
              )}
              {placementInfo.supervisorPhone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{placementInfo.supervisorPhone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <Button
            onClick={() => router.push('/learner/documents')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Manage Documents
          </Button>
          
          {placementInfo.status === 'active' && (
            <Button
              onClick={() => router.push('/learner/report-issue')}
              variant="outline"
              className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Stipend Issue
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
