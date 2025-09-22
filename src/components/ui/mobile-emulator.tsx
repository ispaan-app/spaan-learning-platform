'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react'

interface DevicePreset {
  name: string
  width: number
  height: number
  icon: React.ReactNode
  type: 'mobile' | 'tablet' | 'desktop'
  userAgent?: string
}

const DEVICE_PRESETS: DevicePreset[] = [
  {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    icon: <Smartphone className="w-4 h-4" />,
    type: 'mobile',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'iPhone SE',
    width: 375,
    height: 667,
    icon: <Smartphone className="w-4 h-4" />,
    type: 'mobile',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'Samsung Galaxy S21',
    width: 384,
    height: 854,
    icon: <Smartphone className="w-4 h-4" />,
    type: 'mobile',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36'
  },
  {
    name: 'iPad Pro',
    width: 1024,
    height: 1366,
    icon: <Tablet className="w-4 h-4" />,
    type: 'tablet',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'iPad Mini',
    width: 768,
    height: 1024,
    icon: <Tablet className="w-4 h-4" />,
    type: 'tablet',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'Desktop',
    width: 1200,
    height: 800,
    icon: <Monitor className="w-4 h-4" />,
    type: 'desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
]

interface MobileEmulatorProps {
  url?: string
  className?: string
  showControls?: boolean
  defaultDevice?: string
}

export function MobileEmulator({ 
  url = '/', 
  className = '', 
  showControls = true,
  defaultDevice = 'iPhone 14 Pro'
}: MobileEmulatorProps) {
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(
    DEVICE_PRESETS.find(d => d.name === defaultDevice) || DEVICE_PRESETS[0]
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRotated, setIsRotated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUrl, setCurrentUrl] = useState(url)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleDeviceChange = (device: DevicePreset) => {
    setSelectedDevice(device)
    setIsLoading(true)
  }

  const handleRotate = () => {
    setIsRotated(!isRotated)
  }

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true)
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const handleUrlChange = (newUrl: string) => {
    setCurrentUrl(newUrl)
    setIsLoading(true)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const getDeviceDimensions = () => {
    if (isRotated && selectedDevice.type !== 'desktop') {
      return {
        width: selectedDevice.height,
        height: selectedDevice.width
      }
    }
    return {
      width: selectedDevice.width,
      height: selectedDevice.height
    }
  }

  const dimensions = getDeviceDimensions()

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''} ${className}`}>
      {/* Controls */}
      {showControls && (
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mobile Emulator</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRotate}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Rotate Device"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Device Selection */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm font-medium text-gray-700">Device:</span>
            <div className="flex space-x-1">
              {DEVICE_PRESETS.map((device) => (
                <button
                  key={device.name}
                  onClick={() => handleDeviceChange(device)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDevice.name === device.name
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {device.icon}
                  <span className="hidden sm:inline">{device.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">URL:</span>
            <input
              type="text"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlChange(currentUrl)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter URL to test"
            />
            <button
              onClick={() => handleUrlChange(currentUrl)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      )}

      {/* Device Frame */}
      <div className="flex justify-center p-8 bg-gray-100 min-h-screen">
        <div className="relative">
          {/* Device Frame */}
          <div 
            className={`relative bg-black rounded-[2.5rem] p-2 shadow-2xl ${
              selectedDevice.type === 'mobile' ? 'rounded-[2.5rem]' : 
              selectedDevice.type === 'tablet' ? 'rounded-[1.5rem]' : 
              'rounded-lg'
            }`}
            style={{
              width: dimensions.width + 16,
              height: dimensions.height + 16,
            }}
          >
            {/* Screen */}
            <div className="relative bg-white rounded-[2rem] overflow-hidden" style={{
              width: dimensions.width,
              height: dimensions.height,
            }}>
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Loading...</span>
                  </div>
                </div>
              )}

              {/* Iframe */}
              <iframe
                ref={iframeRef}
                src={currentUrl}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                style={{
                  width: dimensions.width,
                  height: dimensions.height,
                }}
                title="Mobile Emulator"
              />
            </div>

            {/* Device Details */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className="bg-white px-3 py-1 rounded-lg shadow-lg text-xs text-gray-600">
                {selectedDevice.name} • {dimensions.width} × {dimensions.height}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact Mobile Emulator for smaller spaces
export function CompactMobileEmulator({ 
  url = '/', 
  className = '',
  defaultDevice = 'iPhone 14 Pro'
}: MobileEmulatorProps) {
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(
    DEVICE_PRESETS.find(d => d.name === defaultDevice) || DEVICE_PRESETS[0]
  )
  const [isRotated, setIsRotated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const dimensions = isRotated && selectedDevice.type !== 'desktop' 
    ? { width: selectedDevice.height, height: selectedDevice.width }
    : { width: selectedDevice.width, height: selectedDevice.height }

  const scale = Math.min(300 / dimensions.width, 400 / dimensions.height)
  const scaledWidth = dimensions.width * scale
  const scaledHeight = dimensions.height * scale

  return (
    <div className={`relative ${className}`}>
      {/* Device Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {DEVICE_PRESETS.slice(0, 3).map((device) => (
            <button
              key={device.name}
              onClick={() => setSelectedDevice(device)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedDevice.name === device.name
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {device.icon}
              <span className="hidden sm:inline">{device.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsRotated(!isRotated)}
          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          title="Rotate Device"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Device Frame */}
      <div className="flex justify-center">
        <div 
          className="relative bg-black rounded-[1.5rem] p-1 shadow-lg"
          style={{
            width: scaledWidth + 8,
            height: scaledHeight + 8,
          }}
        >
          <div className="relative bg-white rounded-[1.25rem] overflow-hidden" style={{
            width: scaledWidth,
            height: scaledHeight,
          }}>
            {isLoading && (
              <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={url}
              className="w-full h-full border-0 scale-100"
              onLoad={() => setIsLoading(false)}
              style={{
                width: dimensions.width,
                height: dimensions.height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
              title="Compact Mobile Emulator"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
