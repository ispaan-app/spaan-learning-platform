import { defineFlow } from '@genkit-ai/flow'
import { generate } from '@genkit-ai/ai'
import { gemini15Flash } from '@genkit-ai/googleai'
import { z } from 'zod'

// AI Service Configuration
interface AIConfig {
  model: string
  temperature: number
  maxTokens: number
  apiKey: string
  enabled: boolean
}

class AIService {
  private static instance: AIService
  private config: AIConfig
  private isInitialized: boolean = false

  constructor() {
    this.config = {
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      maxTokens: 2048,
      apiKey: process.env.GOOGLE_AI_API_KEY || '',
      enabled: process.env.AI_ENABLED === 'true'
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled || !this.config.apiKey) {
      console.warn('AI Service disabled or API key not configured')
      return
    }

    try {
      // Test the AI connection
      await this.testConnection()
      this.isInitialized = true
      console.log('AI Service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize AI Service:', error)
      this.isInitialized = false
    }
  }

  private async testConnection(): Promise<void> {
    // Simple test to verify AI connection
    const testPrompt = "Say 'AI Service is working' if you can read this."
    await generate({
      model: gemini15Flash,
      prompt: testPrompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 50
      }
    })
  }

  async generateResponse(prompt: string, options?: {
    temperature?: number
    maxTokens?: number
    context?: string
  }): Promise<string> {
    if (!this.isInitialized || !this.config.enabled) {
      return 'AI Service is currently unavailable. Please try again later.'
    }

    try {
      const fullPrompt = options?.context 
        ? `${options.context}\n\nUser: ${prompt}`
        : prompt

      const result = await generate({
        model: gemini15Flash,
        prompt: fullPrompt,
        config: {
          temperature: options?.temperature || this.config.temperature,
          maxOutputTokens: options?.maxTokens || this.config.maxTokens
        }
      })

      return result.text()
    } catch (error) {
      console.error('AI generation error:', error)
      return 'I apologize, but I encountered an error while processing your request. Please try again.'
    }
  }

  async analyzeText(text: string, analysisType: 'sentiment' | 'summary' | 'keywords' | 'classification'): Promise<any> {
    if (!this.isInitialized || !this.config.enabled) {
      return { error: 'AI Service unavailable' }
    }

    const prompts = {
      sentiment: `Analyze the sentiment of the following text and return a JSON object with sentiment (positive/negative/neutral) and confidence (0-1): ${text}`,
      summary: `Provide a concise summary of the following text: ${text}`,
      keywords: `Extract the main keywords from the following text and return them as a JSON array: ${text}`,
      classification: `Classify the following text into one of these categories: complaint, compliment, question, suggestion, other. Return a JSON object with category and confidence: ${text}`
    }

    try {
      const response = await this.generateResponse(prompts[analysisType], {
        temperature: 0.3,
        maxTokens: 500
      })

      // Try to parse JSON response
      try {
        return JSON.parse(response)
      } catch {
        return { result: response }
      }
    } catch (error) {
      console.error('AI analysis error:', error)
      return { error: 'Analysis failed' }
    }
  }

  async generateContent(type: 'announcement' | 'report' | 'email' | 'description', data: any): Promise<string> {
    if (!this.isInitialized || !this.config.enabled) {
      return 'AI content generation is currently unavailable.'
    }

    const prompts = {
      announcement: `Create a professional announcement about: ${JSON.stringify(data)}`,
      report: `Generate a comprehensive report based on: ${JSON.stringify(data)}`,
      email: `Write a professional email with the following details: ${JSON.stringify(data)}`,
      description: `Create a detailed description for: ${JSON.stringify(data)}`
    }

    try {
      return await this.generateResponse(prompts[type], {
        temperature: 0.5,
        maxTokens: 1000
      })
    } catch (error) {
      console.error('AI content generation error:', error)
      return 'Content generation failed. Please try again.'
    }
  }

  async predictRisk(data: any): Promise<{
    riskLevel: 'low' | 'medium' | 'high'
    confidence: number
    factors: string[]
    recommendations: string[]
  }> {
    if (!this.isInitialized || !this.config.enabled) {
      return {
        riskLevel: 'medium',
        confidence: 0,
        factors: ['AI Service unavailable'],
        recommendations: ['Enable AI Service for accurate risk assessment']
      }
    }

    const prompt = `Analyze the following data for potential risks and return a JSON object with riskLevel (low/medium/high), confidence (0-1), factors (array of risk factors), and recommendations (array of recommendations): ${JSON.stringify(data)}`

    try {
      const response = await this.generateResponse(prompt, {
        temperature: 0.3,
        maxTokens: 800
      })

      try {
        return JSON.parse(response)
      } catch {
        return {
          riskLevel: 'medium',
          confidence: 0.5,
          factors: ['Unable to parse AI response'],
          recommendations: ['Manual review recommended']
        }
      }
    } catch (error) {
      console.error('AI risk prediction error:', error)
      return {
        riskLevel: 'medium',
        confidence: 0,
        factors: ['AI analysis failed'],
        recommendations: ['Manual review required']
      }
    }
  }

  async matchPlacements(learnerProfile: any, availablePlacements: any[]): Promise<any[]> {
    if (!this.isInitialized || !this.config.enabled) {
      return availablePlacements.slice(0, 3) // Return first 3 as fallback
    }

    const prompt = `Match the following learner profile with available placements and return the top 3 matches as a JSON array with match scores (0-1): 
    
    Learner Profile: ${JSON.stringify(learnerProfile)}
    Available Placements: ${JSON.stringify(availablePlacements)}`

    try {
      const response = await this.generateResponse(prompt, {
        temperature: 0.4,
        maxTokens: 1000
      })

      try {
        return JSON.parse(response)
      } catch {
        return availablePlacements.slice(0, 3)
      }
    } catch (error) {
      console.error('AI placement matching error:', error)
      return availablePlacements.slice(0, 3)
    }
  }

  isEnabled(): boolean {
    return this.isInitialized && this.config.enabled
  }

  getConfig(): AIConfig {
    return { ...this.config }
  }
}

// AI Flows using Genkit
export const supportChatFlow = defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: z.object({
      userMessage: z.string(),
      userRole: z.string().optional(),
      conversationHistory: z.array(z.object({
        role: z.string(),
        content: z.string()
      })).optional()
    }),
    outputSchema: z.object({
      response: z.string(),
      helpful: z.boolean(),
      escalationNeeded: z.boolean()
    })
  },
  async (input) => {
    const aiService = AIService.getInstance()
    
    if (!aiService.isEnabled()) {
      return {
        response: 'AI support is currently unavailable. Please contact support directly.',
        helpful: false,
        escalationNeeded: true
      }
    }

    const context = `
You are an AI Support Assistant for the iSpaan App. You help users navigate the platform and answer their questions about features and functionality.

User Role: ${input.userRole || 'learner'}
${input.conversationHistory?.length ? `Conversation History:
${input.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}` : ''}

Platform Features You Can Help With:
1. Application Process
2. Learner Features (check-in, hours, leave requests)
3. Admin Features (applications, learners, placements)
4. General Platform navigation and support

Be helpful, clear, and concise. If you cannot help, suggest contacting human support.
`

    try {
      const response = await aiService.generateResponse(input.userMessage, {
        context,
        temperature: 0.7,
        maxTokens: 500
      })

      return {
        response,
        helpful: true,
        escalationNeeded: false
      }
    } catch (error) {
      return {
        response: 'I apologize, but I encountered an error. Please try again or contact support.',
        helpful: false,
        escalationNeeded: true
      }
    }
  }
)

export const careerMentorFlow = defineFlow(
  {
    name: 'careerMentorFlow',
    inputSchema: z.object({
      userMessage: z.string(),
      userProfile: z.object({
        role: z.string(),
        experience: z.string().optional(),
        goals: z.string().optional(),
        currentPlacement: z.string().optional()
      })
    }),
    outputSchema: z.object({
      response: z.string(),
      suggestions: z.array(z.string()),
      resources: z.array(z.string())
    })
  },
  async (input) => {
    const aiService = AIService.getInstance()
    
    if (!aiService.isEnabled()) {
      return {
        response: 'Career mentoring is currently unavailable. Please try again later.',
        suggestions: [],
        resources: []
      }
    }

    const context = `
You are an AI Career Mentor for the iSpaan platform. Help users with career guidance, skill development, and professional growth.

User Profile:
- Role: ${input.userProfile.role}
- Experience: ${input.userProfile.experience || 'Not specified'}
- Goals: ${input.userProfile.goals || 'Not specified'}
- Current Placement: ${input.userProfile.currentPlacement || 'Not specified'}

Provide personalized career advice, skill suggestions, and relevant resources.
`

    try {
      const response = await aiService.generateResponse(input.userMessage, {
        context,
        temperature: 0.8,
        maxTokens: 800
      })

      // Generate suggestions and resources
      const suggestions = await aiService.generateResponse(
        `Based on the conversation, provide 3 specific career suggestions as a JSON array: ${input.userMessage}`,
        { temperature: 0.6, maxTokens: 300 }
      )

      const resources = await aiService.generateResponse(
        `Based on the conversation, provide 3 relevant learning resources as a JSON array: ${input.userMessage}`,
        { temperature: 0.6, maxTokens: 300 }
      )

      let suggestionsArray: string[] = []
      let resourcesArray: string[] = []

      try {
        suggestionsArray = JSON.parse(suggestions)
        resourcesArray = JSON.parse(resources)
      } catch {
        suggestionsArray = ['Continue learning and gaining experience', 'Network with professionals in your field', 'Set clear career goals']
        resourcesArray = ['Online courses', 'Professional networking', 'Mentorship programs']
      }

      return {
        response,
        suggestions: suggestionsArray,
        resources: resourcesArray
      }
    } catch (error) {
      return {
        response: 'I apologize, but I encountered an error. Please try again.',
        suggestions: [],
        resources: []
      }
    }
  }
)

export const dropoutRiskAnalyzerFlow = defineFlow(
  {
    name: 'dropoutRiskAnalyzerFlow',
    inputSchema: z.object({
      learnerData: z.object({
        attendance: z.number(),
        performance: z.number(),
        engagement: z.number(),
        personalFactors: z.record(z.any()).optional()
      })
    }),
    outputSchema: z.object({
      riskLevel: z.enum(['low', 'medium', 'high']),
      confidence: z.number(),
      factors: z.array(z.string()),
      recommendations: z.array(z.string())
    })
  },
  async (input) => {
    const aiService = AIService.getInstance()
    
    if (!aiService.isEnabled()) {
      return {
        riskLevel: 'medium',
        confidence: 0,
        factors: ['AI Service unavailable'],
        recommendations: ['Manual review recommended']
      }
    }

    try {
      return await aiService.predictRisk(input.learnerData)
    } catch (error) {
      return {
        riskLevel: 'medium',
        confidence: 0,
        factors: ['Analysis failed'],
        recommendations: ['Manual review required']
      }
    }
  }
)

// Initialize AI Service
const aiService = AIService.getInstance()
aiService.initialize()

export { AIService, aiService }
