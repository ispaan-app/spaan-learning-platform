'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  MapPin, 
  User, 
  Users, 
  Sparkles, 
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { createPlacementAction } from '@/app/admin/placements/actions'
import { geocodeAddress } from '@/lib/ai/geocoding'
import { toast } from '@/lib/toast'

interface CreatePlacementFormProps {
  programs: Array<{
    id: string
    name: string
    description?: string
  }>
}

export function CreatePlacementForm({ programs }: CreatePlacementFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodingError, setGeocodingError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    companyName: '',
    programId: '',
    address: '',
    suburb: '',
    province: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    capacity: '',
    description: '',
    latitude: '',
    longitude: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (geocodingError) setGeocodingError(null)
  }

  const handleGeocodeAddress = async () => {
    if (!formData.address || !formData.suburb || !formData.province) {
      setGeocodingError('Please fill in address, suburb, and province before geocoding')
      return
    }

    try {
      setIsGeocoding(true)
      setGeocodingError(null)

      const fullAddress = `${formData.address}, ${formData.suburb}, ${formData.province}, South Africa`
      const result = await geocodeAddress(fullAddress)

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          latitude: result.latitude?.toString() || '',
          longitude: result.longitude?.toString() || ''
        }))
        toast.success('Address geocoded successfully!')
      } else {
        setGeocodingError(result.error || 'Failed to geocode address')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      setGeocodingError('Failed to geocode address. Please try again.')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please geocode the address before submitting')
      return
    }

    try {
      setIsSubmitting(true)
      
      const result = await createPlacementAction({
        companyName: formData.companyName,
        programId: formData.programId,
        address: formData.address,
        suburb: formData.suburb,
        province: formData.province,
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        capacity: parseInt(formData.capacity),
        description: formData.description,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      })

      if (result.success) {
        toast.success('Placement created successfully!')
        router.push('/admin/placements')
      } else {
        toast.error(result.error || 'Failed to create placement')
      }
    } catch (error) {
      console.error('Error creating placement:', error)
      toast.error('Failed to create placement')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Create New WIL Placement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="programId">Program *</Label>
                  <Select
                    value={formData.programId}
                    onValueChange={(value) => handleInputChange('programId', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suburb">Suburb *</Label>
                  <Input
                    id="suburb"
                    value={formData.suburb}
                    onChange={(e) => handleInputChange('suburb', e.target.value)}
                    placeholder="Suburb"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(value) => handleInputChange('province', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Western Cape">Western Cape</SelectItem>
                      <SelectItem value="Gauteng">Gauteng</SelectItem>
                      <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                      <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                      <SelectItem value="Free State">Free State</SelectItem>
                      <SelectItem value="Limpopo">Limpopo</SelectItem>
                      <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                      <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                      <SelectItem value="North West">North West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* AI Geocoding */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>AI Geocoding</Label>
                  <Button
                    type="button"
                    onClick={handleGeocodeAddress}
                    disabled={isGeocoding || !formData.address || !formData.suburb || !formData.province}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    {isGeocoding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    <span>AI Helper</span>
                  </Button>
                </div>
                
                {geocodingError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{geocodingError}</AlertDescription>
                  </Alert>
                )}

                {formData.latitude && formData.longitude && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Address geocoded successfully! Lat: {formData.latitude}, Lng: {formData.longitude}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      placeholder="Auto-generated"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      placeholder="Auto-generated"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="email@company.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone *</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="+27 XX XXX XXXX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Placement Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Placement Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Learner Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="Number of learners"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the placement opportunity"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.latitude || !formData.longitude}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
                <span>Create Placement</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



