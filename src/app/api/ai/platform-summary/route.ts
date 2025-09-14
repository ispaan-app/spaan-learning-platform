import { NextRequest, NextResponse } from 'next/server'
import { platformSummaryFlow } from '@/ai/flows/platformSummaryFlow'

export async function POST(request: NextRequest) {
  try {
    const { platformData, dateRange } = await request.json()

    if (!platformData || !dateRange) {
      return NextResponse.json(
        { error: 'Invalid platform data or date range' },
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
    console.error('Error generating platform summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate platform summary' },
      { status: 500 }
    )
  }
}

