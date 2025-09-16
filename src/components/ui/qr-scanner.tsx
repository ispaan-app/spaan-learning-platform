'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Camera, CameraOff, AlertCircle } from 'lucide-react'
import { Button } from './button'

interface QRScannerProps {
  onScan?: (data: string) => void
  onError?: (error: string) => void
  className?: string
}

export function QRScanner({ onScan, onError, className }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const startScanning = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      streamRef.current = stream
      setHasPermission(true)
      setIsScanning(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please check permissions.')
      onError?.('Camera access denied')
    }
  }, [onError])

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])

  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Simple QR code detection (in a real app, you'd use a library like jsQR)
    // For now, we'll simulate QR code detection
    // In production, integrate with jsQR or similar library
    try {
      // This is a placeholder - replace with actual QR code detection
      const qrData = detectQRCode(imageData)
      if (qrData) {
        onScan?.(qrData)
        stopScanning()
      }
    } catch (err) {
      console.error('QR code detection error:', err)
    }
  }, [onScan, stopScanning])

  // Placeholder QR code detection function
  const detectQRCode = (imageData: ImageData): string | null => {
    // In a real implementation, you would use a library like jsQR
    // For now, we'll return null to simulate no QR code found
    return null
  }

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(scanQRCode, 100)
      return () => clearInterval(interval)
    }
  }, [isScanning])

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  if (hasPermission === false) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-50 rounded-lg", className)}>
        <CameraOff className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
        <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">
          Camera access is required to scan QR codes
        </p>
        <Button onClick={startScanning} variant="outline" className="text-xs sm:text-sm">
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
        <Button onClick={startScanning} variant="outline" className="text-xs sm:text-sm">
          <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("relative bg-gray-900 rounded-lg overflow-hidden", className)}>
      {!isScanning ? (
        <div className="flex flex-col items-center justify-center p-4 sm:p-8">
          <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
          <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">
            Click to start scanning QR code
          </p>
          <Button onClick={startScanning} className="text-xs sm:text-sm">
            <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Start Scanning
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
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <Button
              onClick={stopScanning}
              variant="destructive"
              size="sm"
              className="w-8 h-8 sm:w-10 sm:h-10"
            >
              <CameraOff className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
