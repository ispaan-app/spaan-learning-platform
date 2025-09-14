'use client'

import React, { useEffect, useRef } from 'react'
// Simple API documentation without swagger-jsdoc

export default function SwaggerPage() {
  const swaggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadSwaggerUI = async () => {
      try {
        // Simple API documentation without Swagger UI
        if (swaggerRef.current) {
          swaggerRef.current.innerHTML = `
            <div class="p-8 text-center">
              <h2 class="text-2xl font-bold text-blue-600 mb-4">API Documentation</h2>
              <p class="text-gray-600 mb-4">
                The interactive API documentation is temporarily unavailable.
              </p>
              <p class="text-sm text-gray-500 mb-6">
                Please use the API endpoints directly or contact support for assistance.
              </p>
              <div class="space-y-4">
                <h3 class="text-lg font-semibold">Available Endpoints:</h3>
                <div class="text-left max-w-2xl mx-auto">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium">Authentication</h4>
                    <ul class="text-sm text-gray-600 mt-2 space-y-1">
                      <li>POST /api/auth/login - User login</li>
                      <li>POST /api/auth/signup - User registration</li>
                    </ul>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg mt-4">
                    <h4 class="font-medium">AI Features</h4>
                    <ul class="text-sm text-gray-600 mt-2 space-y-1">
                      <li>POST /api/ai/chat - AI chat</li>
                      <li>POST /api/ai/dropout-risk - Dropout risk analysis</li>
                      <li>POST /api/ai/placement-summary - Placement summary</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          `
        }
      } catch (error) {
        console.error('Failed to load Swagger UI:', error)
        
        // Fallback: Show error message
        if (swaggerRef.current) {
          swaggerRef.current.innerHTML = `
            <div class="p-8 text-center">
              <h2 class="text-2xl font-bold text-red-600 mb-4">Failed to Load Swagger UI</h2>
              <p class="text-gray-600 mb-4">
                There was an error loading the interactive API documentation.
              </p>
              <p class="text-sm text-gray-500">
                Please try refreshing the page or contact support if the issue persists.
              </p>
            </div>
          `
        }
      }
    }

    loadSwaggerUI()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interactive API Documentation
          </h1>
          <p className="text-gray-600">
            Explore and test the iSpaan API endpoints with our interactive documentation.
          </p>
        </div>
        
        <div ref={swaggerRef} className="swagger-ui-container" />
      </div>
    </div>
  )
}
