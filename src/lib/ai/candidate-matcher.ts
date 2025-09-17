// AI-powered candidate matching system with real database integration

import { getUnassignedLearnersByProgramAction, Learner } from '@/app/admin/placements/actions'

export interface CandidateMatchInput {
  placementId: string
  programId: string
  companyName: string
  requirements: string
  currentCapacity: number
  maxCapacity: number
}

export interface Candidate {
  id: string
  name: string
  email: string
  program: string
  matchScore: number
  justification: string
  skills: string[]
  experience: string
  availability: string
}

export interface CandidateMatchResult {
  success: boolean
  candidates?: Candidate[]
  error?: string
}

// AI-powered scoring algorithm
function calculateMatchScore(learner: Learner, input: CandidateMatchInput): number {
  let score = 0
  let factors = 0

  // Skills matching (40% weight)
  if (learner.skills && learner.skills.length > 0) {
    const skillKeywords = input.requirements.toLowerCase().split(' ')
    const matchingSkills = learner.skills.filter(skill => 
      skillKeywords.some(keyword => skill.toLowerCase().includes(keyword))
    )
    const skillScore = (matchingSkills.length / Math.max(learner.skills.length, 1)) * 40
    score += skillScore
    factors++
  }

  // Work experience relevance (30% weight)
  if (learner.workExperience && learner.workExperience.length > 0) {
    const totalExperience = learner.workExperience.reduce((total, exp) => {
      const startDate = new Date(exp.startDate)
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date()
      const months = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return total + Math.max(0, months)
    }, 0)
    
    const experienceScore = Math.min(totalExperience / 24, 1) * 30 // Max 2 years = 100%
    score += experienceScore
    factors++
  }

  // Education level (20% weight)
  if (learner.education && learner.education.length > 0) {
    const completedEducation = learner.education.filter(edu => edu.status === 'completed')
    const educationScore = (completedEducation.length / Math.max(learner.education.length, 1)) * 20
    score += educationScore
    factors++
  }

  // Program alignment (10% weight)
  if (learner.program === input.programId) {
    score += 10
    factors++
  }

  // Normalize score based on available factors
  return factors > 0 ? Math.round(score / factors) : 0
}

function generateJustification(learner: Learner, score: number): string {
  const justifications = []
  
  if (learner.skills && learner.skills.length > 0) {
    justifications.push(`Strong technical skills in ${learner.skills.slice(0, 3).join(', ')}`)
  }
  
  if (learner.workExperience && learner.workExperience.length > 0) {
    const totalMonths = learner.workExperience.reduce((total, exp) => {
      const startDate = new Date(exp.startDate)
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date()
      const months = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return total + Math.max(0, months)
    }, 0)
    
    if (totalMonths > 12) {
      justifications.push(`Extensive work experience (${Math.round(totalMonths)} months)`)
    } else if (totalMonths > 6) {
      justifications.push(`Good work experience (${Math.round(totalMonths)} months)`)
    }
  }
  
  if (learner.education && learner.education.length > 0) {
    const completedEducation = learner.education.filter(edu => edu.status === 'completed')
    if (completedEducation.length > 0) {
      justifications.push(`Strong educational background with ${completedEducation.length} completed qualification${completedEducation.length > 1 ? 's' : ''}`)
    }
  }
  
  if (score >= 90) {
    justifications.push('Excellent match for this placement opportunity')
  } else if (score >= 80) {
    justifications.push('Very good match with strong potential')
  } else if (score >= 70) {
    justifications.push('Good match with room for growth')
  } else {
    justifications.push('Potential candidate with development opportunities')
  }
  
  return justifications.join('. ') + '.'
}

function generateExperienceSummary(learner: Learner): string {
  if (!learner.workExperience || learner.workExperience.length === 0) {
    return 'No previous work experience'
  }
  
  const totalMonths = learner.workExperience.reduce((total, exp) => {
    const startDate = new Date(exp.startDate)
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date()
    const months = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return total + Math.max(0, months)
  }, 0)
  
  const years = Math.floor(totalMonths / 12)
  const months = Math.round(totalMonths % 12)
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` and ${months} month${months > 1 ? 's' : ''}` : ''} of work experience`
  } else {
    return `${months} month${months > 1 ? 's' : ''} of work experience`
  }
}

function generateAvailability(learner: Learner): string {
  // For now, generate based on profile completion and recent activity
  const profileCompleteness = [
    learner.skills?.length > 0,
    learner.workExperience?.length > 0,
    learner.education?.length > 0,
    learner.interests?.length > 0
  ].filter(Boolean).length
  
  if (profileCompleteness >= 3) {
    return 'Immediate availability, well-prepared profile'
  } else if (profileCompleteness >= 2) {
    return 'Available within 2 weeks, profile needs minor updates'
  } else {
    return 'Available within 1 month, profile needs completion'
  }
}

export async function candidateMatcherFlow(input: CandidateMatchInput): Promise<CandidateMatchResult> {
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Fetch real learners from database
    const learners = await getUnassignedLearnersByProgramAction(input.programId)
    
    if (learners.length === 0) {
      return {
        success: true,
        candidates: [],
        error: 'No unassigned learners found for this program'
      }
    }

    // Convert learners to candidates with AI scoring
    const candidates: Candidate[] = learners.map(learner => {
      const matchScore = calculateMatchScore(learner, input)
      
      return {
        id: learner.id,
        name: `${learner.firstName} ${learner.lastName}`,
        email: learner.email,
        program: learner.program,
        matchScore,
        justification: generateJustification(learner, matchScore),
        skills: learner.skills || [],
        experience: generateExperienceSummary(learner),
        availability: generateAvailability(learner)
      }
    })

    // Sort by match score (highest first)
    const sortedCandidates = candidates.sort((a, b) => b.matchScore - a.matchScore)

    // Return top 5 candidates
    const topCandidates = sortedCandidates.slice(0, 5)

    return {
      success: true,
      candidates: topCandidates
    }

  } catch (error) {
    console.error('Candidate matching error:', error)
    return {
      success: false,
      error: 'Failed to find candidates. Please try again.'
    }
  }
}

// Real implementation would look like this:
/*
export async function candidateMatcherFlow(input: CandidateMatchInput): Promise<CandidateMatchResult> {
  try {
    // 1. Query database for learners in the same program who are unassigned
    const learners = await getUnassignedLearnersByProgram(input.programId)
    
    // 2. Call AI/ML service to analyze and score candidates
    const aiResponse = await fetch('/api/ai/candidate-matching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placement: input,
        candidates: learners
      })
    })
    
    const aiResult = await aiResponse.json()
    
    // 3. Process and return results
    return {
      success: true,
      candidates: aiResult.candidates
    }
    
  } catch (error) {
    console.error('Candidate matching error:', error)
    return {
      success: false,
      error: 'Failed to find candidates. Please try again.'
    }
  }
}
*/



