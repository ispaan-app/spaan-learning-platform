'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  MapPin, 
  Shield, 
  Camera, 
  QrCode,
  CheckCircle,
  AlertTriangle,
  Building2,
  GraduationCap,
  Edit,
  Save,
  X,
  FileText
} from 'lucide-react'
import { AttendanceRecord } from '@/app/admin/attendance/actions'
import { format } from 'date-fns'

interface AttendanceDetailModalProps {
  record: AttendanceRecord | null
  isOpen: boolean
  onClose: () => void
  onSave: (recordId: string, updates: Partial<AttendanceRecord>) => Promise<void>
}

export function AttendanceDetailModal({ record, isOpen, onClose, onSave }: AttendanceDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({})

  if (!record) return null

  const handleEdit = () => {
    setFormData({
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      locationName: record.locationName,
      notes: record.notes || '',
      verified: record.verified
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      await onSave(record.id, formData)
      setIsEditing(false)
    } catch (err) {
      setError('Failed to update record')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
    setError('')
  }

  const calculateHours = () => {
    if (!formData.checkInTime || !formData.checkOutTime) return 0
    const checkIn = new Date(formData.checkInTime)
    const checkOut = new Date(formData.checkOutTime)
    const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
    return Math.round(hours * 100) / 100
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-2xl">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
              Attendance Record Details
            </span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Learner Information */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Learner Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Learner Name</Label>
                  <p className="text-lg font-semibold text-gray-900">{record.learnerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">User ID</Label>
                  <p className="text-sm text-gray-700 font-mono">{record.userId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Details */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span>Attendance Details</span>
                </div>
                {!isEditing && (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check-In Time */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Check-In Time</Label>
                  {isEditing ? (
                    <Input
                      type="datetime-local"
                      value={formData.checkInTime ? format(formData.checkInTime, "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {format(record.checkInTime, 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>

                {/* Check-Out Time */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Check-Out Time</Label>
                  {isEditing ? (
                    <Input
                      type="datetime-local"
                      value={formData.checkOutTime ? format(formData.checkOutTime, "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {record.checkOutTime ? format(record.checkOutTime, 'MMM dd, yyyy HH:mm') : 'Not checked out'}
                    </p>
                  )}
                </div>

                {/* Total Hours */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Total Hours</Label>
                  <p className="text-lg font-semibold text-gray-900">
                    {isEditing ? calculateHours() : (record.totalHours || 0)} hours
                  </p>
                </div>

                {/* Verification Status */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Verification Status</Label>
                  {isEditing ? (
                    <Select 
                      value={formData.verified ? 'verified' : 'unverified'} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, verified: value === 'verified' }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="unverified">Unverified</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge 
                      variant={record.verified ? 'default' : 'destructive'}
                      className={`mt-1 ${
                        record.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.verified ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Verified</>
                      ) : (
                        <><AlertTriangle className="h-3 w-3 mr-1" /> Unverified</>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                <span>Location Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.locationName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, locationName: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{record.locationName}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Location Type</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={record.locationType === 'work' ? 'default' : 'secondary'}
                      className={`${
                        record.locationType === 'work' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {record.locationType === 'work' ? (
                        <><Building2 className="h-3 w-3 mr-1" /> Work Placement</>
                      ) : (
                        <><GraduationCap className="h-3 w-3 mr-1" /> Class Session</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Data */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <span>Verification Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Selfie Verification</Label>
                  <div className="mt-2">
                    {record.selfieData ? (
                      <div className="flex items-center space-x-2">
                        <Camera className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Selfie captured</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">No selfie data</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">QR Code Verification</Label>
                  <div className="mt-2">
                    {record.qrCodeData ? (
                      <div className="flex items-center space-x-2">
                        <QrCode className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">QR code verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">No QR code data</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span>Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Add notes about this attendance record..."
                />
              ) : (
                <p className="text-gray-700">
                  {record.notes || 'No notes available'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
