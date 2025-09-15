import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Code, 
  Download, 
  ExternalLink, 
  FileText, 
  Globe, 
  Shield, 
  Zap 
} from 'lucide-react'

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            iSpaan API Documentation
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive API documentation for the iSpaan AI-Powered App
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              REST API
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              JWT Authentication
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Real-time Updates
            </Badge>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="w-6 h-6 mr-2" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Base URL</h3>
                <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                  https://api.ispaan.co.za
                </code>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Authentication</h3>
                <p className="text-gray-600 mb-2">
                  All API requests require authentication. Include your JWT token in the Authorization header:
                </p>
                <code className="bg-gray-100 px-3 py-1 rounded text-sm block">
                  Authorization: Bearer your-jwt-token
                </code>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Content Type</h3>
                <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                  Content-Type: application/json
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">POST /api/auth/login</span>
                  <Badge variant="outline">POST</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">POST /api/auth/signup</span>
                  <Badge variant="outline">POST</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">POST /api/auth/pin-login</span>
                  <Badge variant="outline">POST</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">POST /api/auth/logout</span>
                  <Badge variant="outline">POST</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">GET /api/users</span>
                  <Badge variant="outline">GET</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">GET /api/users/:id</span>
                  <Badge variant="outline">GET</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">PUT /api/users/:id</span>
                  <Badge variant="outline">PUT</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">DELETE /api/users/:id</span>
                  <Badge variant="outline">DELETE</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">GET /api/applications</span>
                  <Badge variant="outline">GET</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">GET /api/applications/:id</span>
                  <Badge variant="outline">GET</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">PUT /api/applications/:id/status</span>
                  <Badge variant="outline">PUT</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Learners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">GET /api/learners</span>
                  <Badge variant="outline">GET</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">GET /api/learners/:id/dashboard</span>
                  <Badge variant="outline">GET</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">POST /api/learners/:id/work-hours</span>
                  <Badge variant="outline">POST</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Placements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">GET /api/placements</span>
                  <Badge variant="outline">GET</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">POST /api/placements</span>
                  <Badge variant="outline">POST</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">PUT /api/placements/:id</span>
                  <Badge variant="outline">PUT</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                AI Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">POST /api/ai/chat</span>
                  <Badge variant="outline">POST</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">POST /api/ai/mentor</span>
                  <Badge variant="outline">POST</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">POST /api/ai/analyze</span>
                  <Badge variant="outline">POST</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Documentation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ExternalLink className="w-6 h-6 mr-2" />
              Interactive Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Explore our interactive API documentation with live examples and testing capabilities.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <a href="/api-docs/swagger" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Swagger UI
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/api-docs/postman" target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download Postman Collection
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/api-docs/openapi" target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    OpenAPI Specification
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Success Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "id": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "learner",
    "status": "active"
  },
  "message": "User retrieved successfully",
  "timestamp": "2024-01-15T10:00:00Z"
}`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS",
    "details": null,
    "timestamp": "2024-01-15T10:00:00Z"
  }
}`}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Rate Limiting */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                API requests are rate limited to ensure fair usage and system stability.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">100</div>
                  <div className="text-sm text-gray-600">Requests per 15 minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1000</div>
                  <div className="text-sm text-gray-600">Requests per hour</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">10000</div>
                  <div className="text-sm text-gray-600">Requests per day</div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Rate limit headers are included in all responses:
                  <code className="ml-2 bg-yellow-100 px-2 py-1 rounded text-xs">
                    X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
                  </code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>Support & Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Getting Help</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Check our FAQ section</li>
                  <li>• Contact support at dev@ispaan.co.za</li>
                  <li>• Join our developer community</li>
                  <li>• Review our changelog for updates</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Resources</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• API status page</li>
                  <li>• SDK downloads</li>
                  <li>• Code examples</li>
                  <li>• Integration guides</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
