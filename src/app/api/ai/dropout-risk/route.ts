import { NextRequest, NextResponse } from 'next/server'
import { dropoutRiskAnalyzerFlow } from '@/ai/flows/dropoutRiskAnalyzerFlow'

export async function POST(request: NextRequest) {
  try {
    const { learners } = await request.json()

    if (!learners || !Array.isArray(learners)) {
      return NextResponse.json(
        { error: 'Invalid learners data' },
        { status: 400 }
      )
    }

    const result = { 
        atRiskLearners: [],
        summary: { summary: 'Mock analysis', keyInsights: [], recommendations: [], overallStatus: 'good', metrics: { totalPlacements: 0, activePlacements: 0, utilizationRate: 0, averageCapacity: 0 } },
        report: '# Mock Report\n\nThis is a placeholder report.',
        prompt: 'Mock image prompt',
        text: 'Mock response'
      }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in dropout risk analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze dropout risk' },
      { status: 500 }
    )
  }
}

