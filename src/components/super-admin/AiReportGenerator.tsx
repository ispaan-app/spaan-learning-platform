'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  RefreshCw, 
  Download, 
  Copy,
  Check,
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Building2
} from 'lucide-react'

interface PlatformData {
  totalUsers: number
  totalLearners: number
  totalApplicants: number
  activePlacements: number
  learnerDistribution: Array<{ program: string; count: number }>
  learnerProvince: Array<{ province: string; count: number }>
  recentActivity: Array<{ action: string; adminName: string; timestamp: string }>
}

interface AiReportGeneratorProps {
  platformData: PlatformData
}

export function AiReportGenerator({ platformData }: AiReportGeneratorProps) {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generateReport = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/platform-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platformData,
          dateRange
        })
      })

      const data = await response.json()
      setReport(data.report)
    } catch (error) {
      console.error('Error generating report:', error)
    }
    
    setIsGenerating(false)
  }

  const handleCopy = async () => {
    if (report) {
      await navigator.clipboard.writeText(report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (report) {
      const blob = new Blob([report], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `platform-summary-${dateRange.startDate}-to-${dateRange.endDate}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <CardTitle className="text-purple-900">AI Report Generator</CardTitle>
          </div>
          <Badge className="bg-purple-100 text-purple-800">Executive Summary</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!report ? (
          <div className="space-y-6">
            {/* Date Range Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Platform Overview */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{platformData.totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{platformData.totalLearners}</div>
                  <div className="text-sm text-gray-600">Active Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{platformData.totalApplicants}</div>
                  <div className="text-sm text-gray-600">Pending Applicants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{platformData.activePlacements}</div>
                  <div className="text-sm text-gray-600">Active Placements</div>
                </div>
              </div>
            </div>

            {/* Report Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-600">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Executive summary format</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Performance insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>User analytics</span>
              </div>
            </div>

            <Button
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generating Report...' : 'Generate Executive Summary'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Report Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">Generated</Badge>
                <Badge variant="outline">
                  {dateRange.startDate} to {dateRange.endDate}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-1" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            {/* Report Content */}
            <div className="bg-white rounded-lg border border-purple-200 p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                  {report}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={() => setReport(null)}
                variant="outline"
                className="flex-1"
              >
                Generate New Report
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

