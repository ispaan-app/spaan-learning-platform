'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Building2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Placement {
  id: string
  companyName: string
  status: 'active' | 'inactive' | 'full' | 'suspended'
  assignedLearnerId?: string
  capacity: number
  currentLearners: number
  createdAt: string
}

interface ProgressSummary {
  summary: string
  keyInsights: string[]
  recommendations: string[]
  overallStatus: 'excellent' | 'good' | 'needs-attention' | 'critical'
  metrics: {
    totalPlacements: number
    activePlacements: number
    utilizationRate: number
    averageCapacity: number
  }
}

interface AiProgressSummaryProps {
  placements: Placement[]
}

export function AiProgressSummary({ placements }: AiProgressSummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  const generateSummary = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/placement-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placements })
      })

      const data = await response.json()
      setSummary(data.summary)
      setHasGenerated(true)
    } catch (error) {
      console.error('Error generating placement summary:', error)
    }
    
    setIsGenerating(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'good':
        return <TrendingUp className="w-5 h-5 text-blue-600" />
      case 'needs-attention':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Building2 className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
      case 'needs-attention':
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Attention</Badge>
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'needs-attention':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-blue-900">AI Placement Progress Summary</CardTitle>
          </div>
          <Button
            onClick={generateSummary}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Summary'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasGenerated ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              AI-Powered Placement Analysis
            </h3>
            <p className="text-blue-700 mb-4">
              Get intelligent insights into placement performance, capacity utilization, and strategic recommendations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-600">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Capacity analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Performance trends</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Risk identification</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Strategic recommendations</span>
              </div>
            </div>
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                {getStatusIcon(summary.overallStatus)}
                <div>
                  <h4 className="font-semibold text-gray-900">Overall Status</h4>
                  <p className="text-sm text-gray-600">Placement system health</p>
                </div>
              </div>
              {getStatusBadge(summary.overallStatus)}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{summary.metrics.totalPlacements}</div>
                <div className="text-sm text-gray-600">Total Placements</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-green-600">{summary.metrics.activePlacements}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-purple-600">{summary.metrics.utilizationRate}%</div>
                <div className="text-sm text-gray-600">Utilization</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-orange-600">{summary.metrics.averageCapacity}</div>
                <div className="text-sm text-gray-600">Avg Capacity</div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">AI Analysis Summary</h4>
              <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
            </div>

            {/* Key Insights */}
            {summary.keyInsights.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">Key Insights</h4>
                <ul className="space-y-2">
                  {summary.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {summary.recommendations.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">Strategic Recommendations</h4>
                <ul className="space-y-2">
                  {summary.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-blue-200">
              <Button variant="outline" className="w-full">
                <Building2 className="w-4 h-4 mr-2" />
                View Detailed Placement Report
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Generating Summary
            </h3>
            <p className="text-gray-600">
              There was an error generating the AI summary. Please try again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

