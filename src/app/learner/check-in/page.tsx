'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Stepper } from '@/components/ui/stepper'
import { CameraCapture } from '@/components/ui/camera-capture'
import { QRScanner } from '@/components/ui/qr-scanner'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Shield, 
  Camera, 
  QrCode,
  Key,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { 
  getCheckInStatus, 
  verifyPin, 
  createAttendanceRecord, 
  checkOut, 
  getTodaysLocations,
  verifyQRCode,
  CheckInStatus,
  AttendanceRecord
} from '@/lib/actions/attendance'
import { toast } from '@/lib/toast'

type CheckInStep = 'status' | 'location' | 'identity' | 'location-verify' | 'security' | 'complete'

interface LocationOption {
  id: string
  name: string
  type: 'work' | 'class'
  qrCodeData: string
}

export default function CheckInPage() {
  const { user, userRole } = useAuth()
  const [currentStep, setCurrentStep] = useState<CheckInStep>('status')
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus | null>(null)
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [selfieData, setSelfieData] = useState<string>('')
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [pin, setPin] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  const steps = [
    {
      title: 'Identity',
      description: 'Take a selfie'
    },
    {
      title: 'Location',
      description: 'Scan QR code'
    },
    {
      title: 'Security',
      description: 'Enter PIN'
    }
  ]

  useEffect(() => {
    loadCheckInStatus()
  }, [])

  const loadCheckInStatus = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const status = await getCheckInStatus(user.uid)
      setCheckInStatus(status)
      
      if (status.canCheckIn) {
        const todayLocations = await getTodaysLocations(user.uid)
        const locationOptions: LocationOption[] = []
        
        if (todayLocations.workPlacement) {
          locationOptions.push({
            id: todayLocations.workPlacement.id,
            name: `${todayLocations.workPlacement.companyName} (Work)`,
            type: 'work',
            qrCodeData: todayLocations.workPlacement.qrCodeData || ''
          })
        }
        
        todayLocations.classSessions.forEach(session => {
          locationOptions.push({
            id: session.id,
            name: `${session.title} (Class)`,
            type: 'class',
            qrCodeData: session.qrCodeData || ''
          })
        })
        
        setLocations(locationOptions)
      }
    } catch (err) {
      console.error('Error loading check-in status:', err)
      setError('Failed to load check-in status')
    } finally {
      setLoading(false)
    }
  }

  const handleStartCheckIn = () => {
    if (locations.length === 1) {
      setSelectedLocation(locations[0].id)
      setCurrentStep('identity')
    } else {
      setCurrentStep('location')
    }
  }

  const handleLocationSelect = () => {
    setCurrentStep('identity')
  }

  const handleSelfieCapture = (dataUrl: string) => {
    setSelfieData(dataUrl)
    setCurrentStep('location-verify')
  }

  const handleQRCodeScan = async (scannedData: string) => {
    setQrCodeData(scannedData)
    
    if (!selectedLocation || !user) return
    
    const selectedLocationData = locations.find(loc => loc.id === selectedLocation)
    if (!selectedLocationData) return
    
    try {
      const isValid = await verifyQRCode(
        scannedData, 
        selectedLocation, 
        selectedLocationData.type
      )
      
      if (isValid) {
        setCurrentStep('security')
      } else {
        setError('Invalid QR code. Please scan the correct code for your location.')
      }
    } catch (err) {
      console.error('Error verifying QR code:', err)
      setError('Failed to verify QR code. Please try again.')
    }
  }

  const handlePinSubmit = async () => {
    if (!user || !selectedLocation || !selfieData || !qrCodeData) return
    
    try {
      setProcessing(true)
      setError('')
      
      const isValidPin = await verifyPin(user.uid, pin)
      if (!isValidPin) {
        setError('Invalid PIN. Please try again.')
        return
      }
      
      const selectedLocationData = locations.find(loc => loc.id === selectedLocation)
      if (!selectedLocationData) return
      
      const attendanceRecord: Omit<AttendanceRecord, 'id' | 'createdAt'> = {
        userId: user.uid,
        checkInTime: new Date(),
        checkOutTime: null,
        locationType: selectedLocationData.type,
        selfieData,
        qrCodeData,
        verified: true
      }
      
      if (selectedLocationData.type === 'work') {
        attendanceRecord.placementId = selectedLocation
      } else {
        attendanceRecord.sessionId = selectedLocation
      }
      
      await createAttendanceRecord(attendanceRecord)
      
      setCurrentStep('complete')
      toast.success('Successfully checked in!')
      
      // Refresh status
      await loadCheckInStatus()
      
    } catch (err) {
      console.error('Error checking in:', err)
      setError('Failed to check in. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleCheckOut = async () => {
    if (!user) return
    
    try {
      setProcessing(true)
      const success = await checkOut(user.uid)
      
      if (success) {
        toast.success('Successfully checked out!')
        await loadCheckInStatus()
        setCurrentStep('status')
      } else {
        setError('Failed to check out. Please try again.')
      }
    } catch (err) {
      console.error('Error checking out:', err)
      setError('Failed to check out. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const resetFlow = () => {
    setCurrentStep('status')
    setSelectedLocation('')
    setSelfieData('')
    setQrCodeData('')
    setPin('')
    setError('')
  }

  if (loading) {
    return (
      <AdminLayout userRole="learner">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="learner">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">WIL Attendance Check-In</h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            {currentStep === 'status' 
              ? 'Secure attendance monitoring for Work-Integrated Learning and classroom sessions'
              : 'Complete verification to log your WIL attendance'
            }
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status Card */}
        {currentStep === 'status' && checkInStatus && (
          <Card className="shadow-lg">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                {checkInStatus.isCheckedIn ? (
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                )}
                <span className="truncate">
                  {checkInStatus.isCheckedIn ? 'WIL Attendance Active' : 'WIL Attendance Inactive'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {checkInStatus.isCheckedIn ? (
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium text-sm sm:text-base">
                      WIL attendance is currently active
                    </p>
                    {checkInStatus.lastRecord && (
                      <p className="text-xs sm:text-sm text-green-600 mt-1">
                        Since {checkInStatus.lastRecord.checkInTime.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleCheckOut}
                    disabled={processing}
                    className="w-full bg-red-600 hover:bg-red-700 text-sm sm:text-base"
                  >
                    {processing ? 'Processing...' : 'Secure Check-Out'}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium text-sm sm:text-base">
                      Ready for WIL attendance
                    </p>
                    <p className="text-xs sm:text-sm text-blue-600 mt-1">
                      Complete verification to start WIL attendance tracking
                    </p>
                  </div>
                  <Button
                    onClick={handleStartCheckIn}
                    disabled={locations.length === 0}
                    className="w-full text-sm sm:text-base"
                  >
                    {locations.length === 0 ? 'No WIL locations available' : 'Start WIL Attendance'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Check-In Flow */}
        {currentStep !== 'status' && (
          <Card className="shadow-lg">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                <ArrowLeft 
                  className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-blue-600 flex-shrink-0" 
                  onClick={resetFlow}
                />
                <span>WIL Attendance Process</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Stepper */}
              <Stepper
                currentStep={
                  currentStep === 'location' ? 1 :
                  currentStep === 'identity' ? 1 :
                  currentStep === 'location-verify' ? 2 :
                  currentStep === 'security' ? 3 : 3
                }
                totalSteps={3}
                steps={steps}
              />

              {/* Step 1: Location Selection */}
              {currentStep === 'location' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-center">
                    <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Select WIL Location</h3>
                    <p className="text-sm sm:text-base text-gray-600">Choose your work placement or training session location</p>
                  </div>
                  
                  <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation}>
                    {locations.map((location) => (
                      <div key={location.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={location.id} id={location.id} className="flex-shrink-0" />
                        <Label htmlFor={location.id} className="flex-1 cursor-pointer min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                            <span className="font-medium text-sm sm:text-base truncate">{location.name}</span>
                            <Badge variant="outline" className="w-fit text-xs">
                              {location.type === 'work' ? 'Work' : 'Class'}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <Button
                    onClick={handleLocationSelect}
                    disabled={!selectedLocation}
                    className="w-full text-sm sm:text-base"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 2: Identity Verification */}
              {currentStep === 'identity' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-center">
                    <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Identity Verification</h3>
                    <p className="text-sm sm:text-base text-gray-600">Take a selfie to verify your WIL attendance</p>
                  </div>
                  
                  <CameraCapture
                    onCapture={handleSelfieCapture}
                    onError={(error) => setError(error)}
                    className="w-full"
                  />
                </div>
              )}

              {/* Step 3: Location Verification */}
              {currentStep === 'location-verify' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-center">
                    <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Location Verification</h3>
                    <p className="text-sm sm:text-base text-gray-600">Scan the QR code at your WIL placement or training venue</p>
                  </div>
                  
                  <QRScanner
                    onScan={handleQRCodeScan}
                    onError={(error) => setError(error)}
                    className="w-full"
                  />
                </div>
              )}

              {/* Step 4: Security Verification */}
              {currentStep === 'security' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-center">
                    <Key className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Security Verification</h3>
                    <p className="text-sm sm:text-base text-gray-600">Enter your 6-digit PIN to complete WIL attendance</p>
                  </div>
                  
                  <div className="max-w-xs mx-auto">
                    <Input
                      type="password"
                      placeholder="Enter PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      maxLength={6}
                      className="text-center text-base sm:text-lg tracking-widest"
                    />
                  </div>
                  
                  <Button
                    onClick={handlePinSubmit}
                    disabled={pin.length !== 6 || processing}
                    className="w-full text-sm sm:text-base"
                  >
                    {processing ? 'Processing...' : 'Complete Check-In'}
                  </Button>
                </div>
              )}

              {/* Completion */}
              {currentStep === 'complete' && (
                <div className="text-center space-y-3 sm:space-y-4">
                  <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto" />
                  <h3 className="text-lg sm:text-xl font-semibold text-green-800">Check-In Complete!</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    You have successfully checked in with full verification.
                  </p>
                  <Button onClick={resetFlow} className="w-full text-sm sm:text-base">
                    Back to Status
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* AI Support Chatbot */}
      <AiChatbot />
    </AdminLayout>
  )
}
