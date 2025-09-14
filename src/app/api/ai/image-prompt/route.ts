import { NextRequest, NextResponse } from 'next/server'
import { imagePromptFlow } from '@/ai/flows/imagePromptFlow'

export async function POST(request: NextRequest) {
  try {
    const { concept } = await request.json()

    if (!concept || typeof concept !== 'string') {
      return NextResponse.json(
        { error: 'Invalid concept provided' },
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
    console.error('Error generating image prompt:', error)
    return NextResponse.json(
      { error: 'Failed to generate image prompt' },
      { status: 500 }
    )
  }
}

