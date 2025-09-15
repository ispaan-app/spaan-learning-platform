import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { gemini15Flash } from '@genkit-ai/googleai'

export const generatePlacementSummaryFlow = defineFlow(
  {
    name: 'generatePlacementSummaryFlow',
    inputSchema: z.object({
      placements: z.array(z.object({
        id: z.string(),
        companyName: z.string(),
        role: z.string(),
        status: z.string(),
        capacity: z.number(),
        currentLearners: z.number(),
        location: z.string(),
        duration: z.string()
      }))
    }),
    outputSchema: z.object({
      summary: z.string()
    })
  },
  async (input) => {
    const { placements } = input

    // Calculate key metrics
    const totalPlacements = placements.length
    const activePlacements = placements.filter(p => p.status === 'active').length
    const fullPlacements = placements.filter(p => p.currentLearners >= p.capacity).length
    const underutilizedPlacements = placements.filter(p => p.currentLearners < p.capacity * 0.5).length
    const totalCapacity = placements.reduce((sum, p) => sum + p.capacity, 0)
    const totalCurrentLearners = placements.reduce((sum, p) => sum + p.currentLearners, 0)
    const utilizationRate = totalCapacity > 0 ? Math.round((totalCurrentLearners / totalCapacity) * 100) : 0

    const context = `
You are an AI Placement Summary Generator for the iSpaan App. Create a concise, high-level overview of the current placement status.

Placement Data:
${placements.map(placement => `
- ${placement.companyName} (${placement.role})
  - Status: ${placement.status}
  - Capacity: ${placement.currentLearners}/${placement.capacity}
  - Location: ${placement.location}
  - Duration: ${placement.duration}
`).join('\n')}

Key Metrics:
- Total Placements: ${totalPlacements}
- Active Placements: ${activePlacements}
- Full Placements: ${fullPlacements}
- Underutilized Placements: ${underutilizedPlacements}
- Overall Utilization Rate: ${utilizationRate}%

Create a 2-4 sentence summary that:
1. Highlights the overall placement status and utilization
2. Identifies key trends (which placements are full, which are underutilized)
3. Provides insights about capacity and demand
4. Mentions any notable patterns or concerns
5. Is professional and informative
6. Helps administrators understand the placement landscape at a glance

Focus on the most important insights that would help with strategic decision-making.
`

    // For now, return a mock response until we fix the AI integration
    const mockResponse = {
      output: {
        summary: `Placement summary: ${totalPlacements} total placements with ${activePlacements} active. Utilization rate is ${utilizationRate}% with ${fullPlacements} full and ${underutilizedPlacements} underutilized placements.`
      }
    }
    
    const result = mockResponse

    return {
      summary: result.output.summary
    }
  }
)
