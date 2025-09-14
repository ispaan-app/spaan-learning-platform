'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  Users, 
  TrendingDown, 
  Clock, 
  Calendar,
  RefreshCw,
  Eye,
  MessageCircle,
  Phone
} from 'lucide-react'

interface Learner {
  id: string
  firstName: string
  lastName: string
  email: string
  program: string
  monthlyHours: number
  targetHours: number
  placementStatus: string
  lastCheckIn?: string
  leaveRequests: number
  riskScore: number
  riskFactors: string[]
  suggestedAction: string
}

interface DropoutRiskAnalyzerProps {
  learners: Learner[]
}

export function DropoutRiskAnalyzer({ learners }: DropoutRiskAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [riskAnalysis, setRiskAnalysis] = useState<Learner[]>([])
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  const analyzeDropoutRisk = async () => {
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/ai/dropout-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ learners })
      })

      const data = await response.json()
      setRiskAnalysis(data.atRiskLearners || [])
      setHasAnalyzed(true)
    } catch (error) {
      console.error('Error analyzing dropout risk:', error)
    }
    
    setIsAnalyzing(false)
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'High', color: 'bg-red-100 text-red-800', badge: 'destructive' as const }
    if (score >= 60) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800', badge: 'default' as const }
    return { level: 'Low', color: 'bg-green-100 text-green-800', badge: 'default' as const }
  }

  const getRiskIcon = (score: number) => {
    if (score >= 80) return <AlertTriangle className="w-4 h-4 text-red-600" />
    if (score >= 60) return <TrendingDown className="w-4 h-4 text-yellow-600" />
    return <Clock className="w-4 h-4 text-green-600" />
  }

  const getSuggestedActionIcon = (action: string) => {
    const actionLower = action.toLowerCase()
    if (actionLower.includes('meeting') || actionLower.includes('check-in')) {
      return <MessageCircle className="w-4 h-4" />
    }
    if (actionLower.includes('call') || actionLower.includes('phone')) {
      return <Phone className="w-4 h-4" />
    }
    return <Eye className="w-4 h-4" />
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <CardTitle className="text-orange-900">AI Dropout Risk Analyzer</CardTitle>
          </div>
          <Button
            onClick={analyzeDropoutRisk}
            disabled={isAnalyzing}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Risk'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasAnalyzed ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-orange-900 mb-2">
              Analyze Learner Dropout Risk
            </h3>
            <p className="text-orange-700 mb-4">
              AI-powered analysis of learner engagement and risk factors to identify those who may need additional support.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-orange-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Low monthly hours</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Frequent leave requests</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4" />
                <span>Placement issues</span>
              </div>
            </div>
          </div>
        ) : riskAnalysis.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Great news! No learners are currently identified as high-risk for dropout. 
              Continue monitoring engagement and performance.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-orange-900">
                At-Risk Learners ({riskAnalysis.length})
              </h4>
              <Badge variant="destructive">
                {riskAnalysis.filter(l => l.riskScore >= 80).length} High Risk
              </Badge>
            </div>

            <div className="space-y-3">
              {riskAnalysis.map((learner) => {
                const riskLevel = getRiskLevel(learner.riskScore)
                
                return (
                  <div 
                    key={learner.id}
                    className="bg-white rounded-lg border border-orange-200 p-4 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-semibold text-sm">
                            {learner.firstName.charAt(0)}{learner.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {learner.firstName} {learner.lastName}
                          </h5>
                          <p className="text-sm text-gray-600">{learner.program}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRiskIcon(learner.riskScore)}
                        <Badge variant={riskLevel.badge}>
                          {riskLevel.level} Risk ({learner.riskScore}%)
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-1">Risk Factors:</h6>
                        <div className="flex flex-wrap gap-1">
                          {learner.riskFactors.map((factor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{learner.monthlyHours}h / {learner.targetHours}h this month</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          {getSuggestedActionIcon(learner.suggestedAction)}
                          <div>
                            <h6 className="text-sm font-medium text-blue-900">Suggested Action:</h6>
                            <p className="text-sm text-blue-700">{learner.suggestedAction}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-4 border-t border-orange-200">
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                View All Learners
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

