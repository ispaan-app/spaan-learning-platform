import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { gemini15Flash } from '@genkit-ai/googleai'

export const generateApplicantSummaryFlow = defineFlow(
  {
    name: 'generateApplicantSummaryFlow',
    inputSchema: z.object({
      applicantData: z.object({
        firstName: z.string(),
        lastName: z.string(),
        program: z.string(),
        qualifications: z.array(z.string()),
        experience: z.string(),
        skills: z.array(z.string()),
        location: z.string(),
        applicationDate: z.string()
      })
    }),
    outputSchema: z.object({
      summary: z.string()
    })
  },
  async (input) => {
    const { applicantData } = input

    const context = `
You are an AI Applicant Summary Generator for the iSpaan Learning Platform. Create a concise, professional 2-3 sentence summary of this applicant's profile.

Applicant Data:
- Name: ${applicantData.firstName} ${applicantData.lastName}
- Program Applied For: ${applicantData.program}
- Qualifications: ${applicantData.qualifications.join(', ')}
- Experience: ${applicantData.experience}
- Skills: ${applicantData.skills.join(', ')}
- Location: ${applicantData.location}
- Application Date: ${applicantData.applicationDate}

Create a summary that:
1. Highlights the applicant's key qualifications and experience
2. Mentions their program of interest
3. Provides a quick assessment of their suitability
4. Is professional and objective
5. Is 2-3 sentences maximum
6. Helps admins quickly screen candidates

Focus on the most relevant and impressive aspects of their profile that would make them a strong candidate for the program.
`

    // For now, return a mock response until we fix the AI integration
    const mockResponse = {
      output: {
        summary: `${applicantData.firstName} ${applicantData.lastName} is a qualified candidate for the ${applicantData.program} program with relevant experience in ${applicantData.experience} and skills in ${applicantData.skills.join(', ')}.`
      }
    }
    
    const result = mockResponse

    return {
      summary: result.output.summary
    }
  }
)
