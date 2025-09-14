import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { gemini15Flash } from '@genkit-ai/googleai'

interface Learner {
  id: string
  firstName: string
  lastName: string
  program: string
  qualifications: string[]
  experience: string
  skills: string[]
  location: string
  availability: string
}

interface Placement {
  id: string
  companyName: string
  role: string
  requirements: string[]
  location: string
  duration: string
  description: string
}

interface CandidateMatch {
  learnerId: string
  firstName: string
  lastName: string
  matchScore: number
  justification: string
  strengths: string[]
  considerations: string[]
}

export const candidateMatcherFlow = defineFlow(
  {
    name: 'candidateMatcherFlow',
    inputSchema: z.object({
      placement: z.object({
        id: z.string(),
        companyName: z.string(),
        role: z.string(),
        requirements: z.array(z.string()),
        location: z.string(),
        duration: z.string(),
        description: z.string()
      }),
      learners: z.array(z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        program: z.string(),
        qualifications: z.array(z.string()),
        experience: z.string(),
        skills: z.array(z.string()),
        location: z.string(),
        availability: z.string()
      }))
    }),
    outputSchema: z.object({
      matches: z.array(z.object({
        learnerId: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        matchScore: z.number().min(0).max(100),
        justification: z.string(),
        strengths: z.array(z.string()),
        considerations: z.array(z.string())
      }))
    })
  },
  async (input) => {
    const { placement, learners } = input

    const context = `
You are an AI Candidate Matcher for the iSpaan Learning Platform. Analyze the placement opportunity and available learners to find the best matches.

Placement Details:
- Company: ${placement.companyName}
- Role: ${placement.role}
- Requirements: ${placement.requirements.join(', ')}
- Location: ${placement.location}
- Duration: ${placement.duration}
- Description: ${placement.description}

Available Learners:
${learners.map(learner => `
- ${learner.firstName} ${learner.lastName} (ID: ${learner.id})
  - Program: ${learner.program}
  - Qualifications: ${learner.qualifications.join(', ')}
  - Experience: ${learner.experience}
  - Skills: ${learner.skills.join(', ')}
  - Location: ${learner.location}
  - Availability: ${learner.availability}
`).join('\n')}

Analyze each learner against the placement requirements and rank them by suitability. For each match, provide:

1. Match Score (0-100): Overall compatibility percentage
2. Justification: Brief explanation of why this learner is a good fit
3. Strengths: Key qualifications and skills that align with the role
4. Considerations: Any potential concerns or areas for development

Return the top 3-5 candidates ranked by match score (highest first).
Consider factors like:
- Program relevance to the role
- Required skills and qualifications
- Location compatibility
- Experience level appropriateness
- Availability alignment
- Growth potential

Focus on finding learners who would benefit most from this placement opportunity.
`

    // For now, return a mock response until we fix the AI integration
    const mockMatches = learners.slice(0, 3).map((learner, index) => ({
      learnerId: learner.id,
      firstName: learner.firstName,
      lastName: learner.lastName,
      matchScore: 85 - (index * 10), // Mock decreasing scores
      justification: `Good match based on ${learner.program} program and relevant skills`,
      strengths: learner.skills.slice(0, 3),
      considerations: ['Verify availability', 'Check location compatibility']
    }))
    
    const result = {
      output: {
        matches: mockMatches
      }
    }

    return {
      matches: result.output.matches
    }
  }
)
