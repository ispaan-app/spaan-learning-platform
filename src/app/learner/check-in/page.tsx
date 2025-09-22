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
  const { user, userRole, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState<CheckInStep>('status')
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus | null>(null)
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [selfieData, setSelfieData] = useState<string>('')
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [pin, setPin] = useState<string>('')
  const [loading, setLoading] = useState(false)
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
    if (authLoading) {
      // Still loading authentication, don't do anything yet
      return
    }
    
    if (user) {
    loadCheckInStatus()
    } else {
      setLoading(false)
    }
  }, [user, authLoading])

  const loadCheckInStatus = async () => {
    if (!user) {
      console.log('No user available for check-in status')
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError('')
      console.log('Loading check-in status for user:', user.uid)
      
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
      
      console.log('Check-in status loaded successfully')
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

  if (authLoading || loading) {
    return (
      <AdminLayout userRole="learner">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  // Check if user is authenticated and has correct role
  if (!user || userRole !== 'learner') {
    return (
      <AdminLayout userRole="learner">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in as a learner to access the check-in page.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="learner">
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F0E1 0%, #F5F0E1 50%, #F5F0E1 100%)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-48 translate-x-48" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)' }}></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full translate-y-40 -translate-x-40" style={{ background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full -translate-x-32 -translate-y-32" style={{ background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.15) 0%, rgba(251, 146, 60, 0.15) 100%)' }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto space-y-6 p-6">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg mb-4">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-semibold">Secure WIL Check-In</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Work-Integrated Learning
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {currentStep === 'status' 
              ? 'Secure attendance monitoring for Work-Integrated Learning and classroom sessions'
              : 'Complete verification to log your WIL attendance'
            }
          </p>
        </div>

          {/* Enhanced Error Alert */}
        {error && (
            <div className="relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-2xl border border-red-200">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-500/20 backdrop-blur-sm"></div>
              <div className="relative flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Verification Error</h3>
                  <p className="text-red-100">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Status Card */}
        {currentStep === 'status' && checkInStatus && (
            <Card className="relative overflow-hidden border-0 shadow-2xl rounded-3xl" style={{ background: 'rgba(245, 240, 225, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-100/30"></div>
              <CardHeader className="relative pb-6">
                <CardTitle className="flex items-center space-x-4 text-xl">
                  <div className={`p-4 rounded-2xl shadow-lg ${
                    checkInStatus.isCheckedIn 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  }`}>
                {checkInStatus.isCheckedIn ? (
                      <CheckCircle className="h-8 w-8 text-white" />
                ) : (
                      <Clock className="h-8 w-8 text-white" />
                )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {checkInStatus.isCheckedIn ? 'WIL Attendance Active' : 'WIL Attendance Inactive'}
                    </h2>
                    <p className="text-gray-600 font-medium">
                      {checkInStatus.isCheckedIn ? 'Currently logged in' : 'Ready to check in'}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                {checkInStatus.isCheckedIn ? (
                  <div className="text-center space-y-6">
                    <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm"></div>
                      <div className="relative">
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm w-fit mx-auto mb-4">
                          <CheckCircle className="h-12 w-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">WIL attendance is currently active</h3>
                    {checkInStatus.lastRecord && (
                          <p className="text-green-100 text-lg">
                        Since {checkInStatus.lastRecord.checkInTime.toLocaleTimeString()}
                      </p>
                    )}
                      </div>
                  </div>
                  <Button
                    onClick={handleCheckOut}
                    disabled={processing}
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
                  >
                    {processing ? 'Processing...' : 'Secure Check-Out'}
                  </Button>
                </div>
              ) : (
                  <div className="text-center space-y-6">
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 backdrop-blur-sm"></div>
                      <div className="relative">
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm w-fit mx-auto mb-4">
                          <Clock className="h-12 w-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Ready for WIL attendance</h3>
                        <p className="text-blue-100 text-lg">
                      Complete verification to start WIL attendance tracking
                    </p>
                      </div>
                  </div>
                  <Button
                    onClick={handleStartCheckIn}
                    disabled={locations.length === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
                  >
                    {locations.length === 0 ? 'No WIL locations available' : 'Start WIL Attendance'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

          {/* Enhanced Check-In Flow */}
        {currentStep !== 'status' && (
            <Card className="relative overflow-hidden border-0 shadow-2xl rounded-3xl" style={{ background: 'rgba(245, 240, 225, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(245, 240, 225, 0.3)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-pink-100/30"></div>
              <CardHeader className="relative pb-6">
                <CardTitle className="flex items-center space-x-4 text-xl">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <ArrowLeft 
                      className="h-6 w-6 text-white cursor-pointer hover:scale-110 transition-transform" 
                  onClick={resetFlow}
                />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      WIL Attendance Process
                    </h2>
                    <p className="text-gray-600 font-medium">Complete verification steps</p>
                  </div>
              </CardTitle>
            </CardHeader>
              <CardContent className="relative space-y-8">
                {/* Enhanced Stepper */}
                <div className="rounded-2xl p-6 border shadow-lg">
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
                </div>

                {/* Enhanced Step 1: Location Selection */}
              {currentStep === 'location' && (
                  <div className="space-y-8">
                    <div className="text-center space-y-4">
                      <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl w-fit mx-auto shadow-lg">
                        <MapPin className="h-16 w-16 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Select WIL Location
                      </h3>
                      <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Choose your work placement or training session location
                      </p>
                  </div>
                  
                    <div className="rounded-2xl p-6 border shadow-lg">
                      <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation} className="space-y-4">
                    {locations.map((location) => (
                          <div key={location.id} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                            <div className="flex items-center space-x-4">
                              <RadioGroupItem value={location.id} id={location.id} className="flex-shrink-0 w-6 h-6" />
                        <Label htmlFor={location.id} className="flex-1 cursor-pointer min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                  <span className="font-semibold text-lg text-gray-900 truncate">{location.name}</span>
                                  <Badge 
                                    className={`w-fit text-sm px-4 py-2 rounded-full font-semibold ${
                                      location.type === 'work' 
                                        ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200' 
                                        : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200'
                                    }`}
                                  >
                                    {location.type === 'work' ? 'Work Placement' : 'Training Session'}
                            </Badge>
                          </div>
                        </Label>
                            </div>
                      </div>
                    ))}
                  </RadioGroup>
                    </div>
                  
                  <Button
                    onClick={handleLocationSelect}
                    disabled={!selectedLocation}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
                  >
                      Continue to Verification
                  </Button>
                </div>
              )}

                {/* Enhanced Step 2: Identity Verification */}
              {currentStep === 'identity' && (
                  <div className="space-y-8">
                    <div className="text-center space-y-4">
                      <div className="p-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl w-fit mx-auto shadow-lg">
                        <Camera className="h-16 w-16 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Identity Verification
                      </h3>
                      <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Take a selfie to verify your WIL attendance
                      </p>
                  </div>
                  
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
                  <CameraCapture
                    onCapture={handleSelfieCapture}
                    onError={(error) => setError(error)}
                    className="w-full"
                  />
                </div>
                </div>
              )}

                {/* Enhanced Step 3: Location Verification */}
              {currentStep === 'location-verify' && (
                  <div className="space-y-8">
                    <div className="text-center space-y-4">
                      <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl w-fit mx-auto shadow-lg">
                        <QrCode className="h-16 w-16 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Location Verification
                      </h3>
                      <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Scan the QR code at your WIL placement or training venue
                      </p>
                  </div>
                  
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
                  <QRScanner
                    onScan={handleQRCodeScan}
                    onError={(error) => setError(error)}
                    className="w-full"
                  />
                </div>
                </div>
              )}

                {/* Enhanced Step 4: Security Verification */}
              {currentStep === 'security' && (
                  <div className="space-y-8">
                    <div className="text-center space-y-4">
                      <div className="p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl w-fit mx-auto shadow-lg">
                        <Key className="h-16 w-16 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Security Verification
                      </h3>
                      <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Enter your 6-digit PIN to complete WIL attendance
                      </p>
                  </div>
                  
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
                      <div className="max-w-sm mx-auto space-y-6">
                    <Input
                      type="password"
                          placeholder="Enter your 6-digit PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      maxLength={6}
                          className="text-center text-2xl tracking-widest py-4 rounded-2xl border-2 focus:border-blue-500"
                    />
                  <Button
                    onClick={handlePinSubmit}
                    disabled={pin.length !== 6 || processing}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
                  >
                    {processing ? 'Processing...' : 'Complete Check-In'}
                  </Button>
                      </div>
                    </div>
                </div>
              )}

                {/* Enhanced Completion */}
              {currentStep === 'complete' && (
                  <div className="text-center space-y-8">
                    <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-12 text-white shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm"></div>
                      <div className="relative">
                        <div className="p-6 bg-white/20 rounded-3xl w-fit mx-auto mb-6">
                          <CheckCircle className="h-20 w-20 text-white" />
                        </div>
                        <h3 className="text-4xl font-bold mb-4">Check-In Complete!</h3>
                        <p className="text-xl text-green-100 max-w-md mx-auto">
                          You have successfully checked in with full verification. Your WIL attendance is now being tracked.
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={resetFlow} 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
                    >
                    Back to Status
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
        {/* AI Floating Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
          <AiChatbot className="shadow-2xl" />
        </div>
      </div>
    </AdminLayout>
  )
}
