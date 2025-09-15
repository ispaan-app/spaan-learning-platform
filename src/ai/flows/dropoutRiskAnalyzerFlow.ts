import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { gemini15Flash } from '@genkit-ai/googleai'

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
}

interface AtRiskLearner {
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

export const dropoutRiskAnalyzerFlow = defineFlow(
  {
    name: 'dropoutRiskAnalyzerFlow',
    inputSchema: z.object({
      learners: z.array(z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        program: z.string(),
        monthlyHours: z.number(),
        targetHours: z.number(),
        placementStatus: z.string(),
        lastCheckIn: z.string().optional(),
        leaveRequests: z.number()
      }))
    }),
    outputSchema: z.object({
      atRiskLearners: z.array(z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        program: z.string(),
        monthlyHours: z.number(),
        targetHours: z.number(),
        placementStatus: z.string(),
        lastCheckIn: z.string().optional(),
        leaveRequests: z.number(),
        riskScore: z.number(),
        riskFactors: z.array(z.string()),
        suggestedAction: z.string()
      }))
    })
  },
  async (input) => {
    const { learners } = input

    // Create context for the AI
    const context = `
You are an AI Dropout Risk Analyzer for the iSpaan App. Analyze the following learners to identify those at risk of dropping out.

Learner Data:
${learners.map(learner => `
- ${learner.firstName} ${learner.lastName} (${learner.program})
  - Monthly Hours: ${learner.monthlyHours}/${learner.targetHours}
  - Placement Status: ${learner.placementStatus}
  - Leave Requests: ${learner.leaveRequests}
  - Last Check-in: ${learner.lastCheckIn || 'Never'}
`).join('\n')}

Risk Factors to Consider:
1. Low monthly hours (less than 50% of target)
2. No recent check-ins (more than 7 days ago)
3. High number of leave requests (more than 2 in current month)
4. Placement issues (inactive, suspended, or no placement)
5. Program engagement patterns
6. Overall attendance consistency

For each at-risk learner, provide:
- Risk Score (0-100, where 80+ is high risk)
- Specific risk factors identified
- Suggested action for the administrator

Only include learners with a risk score of 60 or higher in the results.
`

    // For now, return a mock response until we fix the AI integration
    const mockResponse = {
      text: `Dropout Risk Analysis:\n\nAnalyzed ${learners.length} learners for dropout risk factors.`
    }
    
    const result = mockResponse

    // Parse the response to extract structured data
    const responseText = result.text
    
    // Simple parsing - extract at-risk learners
    const atRiskLearners: AtRiskLearner[] = []
    
    // Basic risk analysis based on data
    learners.forEach(learner => {
      let riskScore = 0
      const riskFactors: string[] = []
      
      // Calculate risk score based on various factors
      const hoursRatio = learner.monthlyHours / learner.targetHours
      if (hoursRatio < 0.5) {
        riskScore += 30
        riskFactors.push('Low monthly hours')
      }
      
      if (learner.leaveRequests > 2) {
        riskScore += 25
        riskFactors.push('High leave requests')
      }
      
      if (learner.placementStatus === 'inactive' || learner.placementStatus === 'suspended') {
        riskScore += 20
        riskFactors.push('Placement issues')
      }
      
      if (!learner.lastCheckIn) {
        riskScore += 15
        riskFactors.push('No recent check-ins')
      } else {
        const daysSinceCheckIn = Math.floor((Date.now() - new Date(learner.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceCheckIn > 7) {
          riskScore += 10
          riskFactors.push('Stale check-in data')
        }
      }
      
      // Only include learners with risk score >= 60
      if (riskScore >= 60) {
        atRiskLearners.push({
          ...learner,
          riskScore: Math.min(riskScore, 100),
          riskFactors,
          suggestedAction: riskFactors.includes('Low monthly hours') 
            ? 'Schedule check-in meeting to discuss progress'
            : riskFactors.includes('Placement issues')
            ? 'Review placement status and find alternative'
            : 'Follow up with learner to understand challenges'
        })
      }
    })

    return {
      atRiskLearners
    }
  }
)
