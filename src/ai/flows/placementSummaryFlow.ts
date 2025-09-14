import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { gemini15Flash } from '@genkit-ai/googleai'

interface Placement {
  id: string
  companyName: string
  status: 'active' | 'inactive' | 'full' | 'suspended'
  assignedLearnerId?: string
  capacity: number
  currentLearners: number
  createdAt: string
}

export const placementSummaryFlow = defineFlow(
  {
    name: 'placementSummaryFlow',
    inputSchema: z.object({
      placements: z.array(z.object({
        id: z.string(),
        companyName: z.string(),
        status: z.enum(['active', 'inactive', 'full', 'suspended']),
        assignedLearnerId: z.string().optional(),
        capacity: z.number(),
        currentLearners: z.number(),
        createdAt: z.string()
      }))
    }),
    outputSchema: z.object({
      summary: z.object({
        summary: z.string(),
        keyInsights: z.array(z.string()),
        recommendations: z.array(z.string()),
        overallStatus: z.enum(['excellent', 'good', 'needs-attention', 'critical']),
        metrics: z.object({
          totalPlacements: z.number(),
          activePlacements: z.number(),
          utilizationRate: z.number(),
          averageCapacity: z.number()
        })
      })
    })
  },
  async (input) => {
    const { placements } = input

    // Calculate basic metrics
    const totalPlacements = placements.length
    const activePlacements = placements.filter(p => p.status === 'active').length
    const totalCapacity = placements.reduce((sum, p) => sum + p.capacity, 0)
    const totalCurrentLearners = placements.reduce((sum, p) => sum + p.currentLearners, 0)
    const utilizationRate = totalCapacity > 0 ? Math.round((totalCurrentLearners / totalCapacity) * 100) : 0
    const averageCapacity = totalPlacements > 0 ? Math.round(totalCapacity / totalPlacements) : 0

    // Create context for the AI
    const context = `
You are an AI Placement Analyst for the iSpaan Learning Platform. Analyze the following placement data and provide strategic insights.

Placement Data:
${placements.map(placement => `
- ${placement.companyName}
  - Status: ${placement.status}
  - Capacity: ${placement.currentLearners}/${placement.capacity}
  - Utilization: ${placement.capacity > 0 ? Math.round((placement.currentLearners / placement.capacity) * 100) : 0}%
`).join('\n')}

Key Metrics:
- Total Placements: ${totalPlacements}
- Active Placements: ${activePlacements}
- Overall Utilization Rate: ${utilizationRate}%
- Average Capacity: ${averageCapacity}

Provide a comprehensive analysis including:
1. Overall status assessment (excellent/good/needs-attention/critical)
2. Key insights about placement performance
3. Strategic recommendations for improvement
4. Focus on capacity utilization, placement distribution, and operational efficiency

Consider factors like:
- Capacity utilization rates
- Distribution of placements across companies
- Status distribution (active vs inactive)
- Growth opportunities
- Risk factors
- Resource allocation efficiency
`

    // For now, return a mock response until we fix the AI integration
    const mockResponse = {
      text: `Placement Analysis Summary:\n\nOverall Status: ${utilizationRate > 80 ? 'excellent' : utilizationRate > 60 ? 'good' : 'needs-attention'}\n\nKey Insights:\n- Total placements: ${totalPlacements}\n- Active placements: ${activePlacements}\n- Utilization rate: ${utilizationRate}%\n\nRecommendations:\n- Monitor capacity utilization\n- Consider expanding successful partnerships\n- Review inactive placements`
    }
    
    const result = mockResponse

    // Parse the response to extract structured data
    const responseText = result.text
    
    // Simple parsing - extract key information
    const lines = responseText.split('\n').filter(line => line.trim())
    
    let summary = responseText
    let keyInsights: string[] = []
    let recommendations: string[] = []
    let overallStatus: 'excellent' | 'good' | 'needs-attention' | 'critical' = 'good'
    
    // Basic parsing logic
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      if (line.includes('insight') || line.includes('finding')) {
        keyInsights.push(lines[i])
      } else if (line.includes('recommend') || line.includes('suggest')) {
        recommendations.push(lines[i])
      } else if (line.includes('status') || line.includes('assessment')) {
        if (line.includes('excellent') || line.includes('outstanding')) {
          overallStatus = 'excellent'
        } else if (line.includes('critical') || line.includes('urgent')) {
          overallStatus = 'critical'
        } else if (line.includes('attention') || line.includes('improve')) {
          overallStatus = 'needs-attention'
        }
      }
    }
    
    // If no insights found, create some basic ones
    if (keyInsights.length === 0) {
      keyInsights = [
        `Total placements: ${totalPlacements}`,
        `Active placements: ${activePlacements}`,
        `Utilization rate: ${utilizationRate}%`
      ]
    }
    
    // If no recommendations found, create some basic ones
    if (recommendations.length === 0) {
      recommendations = [
        'Monitor placement capacity utilization',
        'Consider expanding high-performing partnerships',
        'Review inactive placements for potential reactivation'
      ]
    }

    return {
      summary: {
        summary: summary,
        keyInsights: keyInsights,
        recommendations: recommendations,
        overallStatus: overallStatus,
        metrics: {
          totalPlacements,
          activePlacements,
          utilizationRate,
          averageCapacity
        }
      }
    }
  }
)
