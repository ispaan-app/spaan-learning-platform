'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Camera, RotateCcw, Check, AlertCircle } from 'lucide-react'
import { Button } from './button'

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void
  onError?: (error: string) => void
  className?: string
}

export function CameraCapture({ onCapture, onError, className }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })
      
      streamRef.current = stream
      setHasPermission(true)
      setIsActive(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please check permissions.')
      onError?.('Camera access denied')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(dataUrl)
    stopCamera()
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  if (hasPermission === false) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-50 rounded-lg", className)}>
        <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
        <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">
          Camera access is required to take a selfie
        </p>
        <Button onClick={startCamera} variant="outline" className="text-xs sm:text-sm">
          <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Enable Camera
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4 sm:p-8 bg-red-50 rounded-lg", className)}>
        <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-400 mb-3 sm:mb-4" />
        <p className="text-red-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>
        <Button onClick={startCamera} variant="outline" className="text-xs sm:text-sm">
          <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (capturedImage) {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <div className="relative mb-3 sm:mb-4">
          <img
            src={capturedImage}
            alt="Captured selfie"
            className="w-48 h-36 sm:w-64 sm:h-48 object-cover rounded-lg border-2 border-gray-200"
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={retakePhoto} variant="outline" className="text-xs sm:text-sm">
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Retake
          </Button>
          <Button onClick={confirmPhoto} className="text-xs sm:text-sm">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Confirm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative bg-gray-900 rounded-lg overflow-hidden", className)}>
      {!isActive ? (
        <div className="flex flex-col items-center justify-center p-4 sm:p-8">
          <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
          <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">
            Click to start camera for selfie
          </p>
          <Button onClick={startCamera} className="text-xs sm:text-sm">
            <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Start Camera
          </Button>
        </div>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-48 sm:h-64 object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 sm:w-48 sm:h-48 border-2 border-white rounded-lg opacity-50" />
          </div>
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2">
            <Button
              onClick={capturePhoto}
              size="lg"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
            >
              <Camera className="w-4 h-4 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
