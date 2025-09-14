// Real candidate matcher implementation with database integration
import { adminDb } from '@/lib/firebase-admin'

export interface CandidateMatchInput {
  placementId: string
  programId: string
  requirements: {
    skills: string[]
    experience: string
    availability: string
    location?: string
    duration?: string
  }
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
  message?: string
  error?: string
}

// Calculate match score based on requirements and learner profile
function calculateMatchScore(learnerData: any, requirements: any): number {
  let score = 0
  let totalWeight = 0

  // Skills matching (40% weight)
  const learnerSkills = learnerData.skills || []
  const requiredSkills = requirements.skills || []
  const skillMatches = requiredSkills.filter((skill: string) => 
    learnerSkills.some((learnerSkill: string) => 
      learnerSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(learnerSkill.toLowerCase())
    )
  ).length
  
  const skillScore = requiredSkills.length > 0 ? (skillMatches / requiredSkills.length) * 100 : 50
  score += skillScore * 0.4
  totalWeight += 0.4

  // Experience matching (30% weight)
  const learnerExp = learnerData.experience || learnerData.yearsOfExperience || ''
  const requiredExp = requirements.experience || ''
  
  // Simple experience matching - in a real system, this would be more sophisticated
  let expScore = 50 // Default score
  if (learnerExp && requiredExp) {
    const learnerYears = extractYears(learnerExp)
    const requiredYears = extractYears(requiredExp)
    
    if (learnerYears >= requiredYears) {
      expScore = Math.min(100, 70 + (learnerYears - requiredYears) * 10)
    } else {
      expScore = Math.max(30, 70 - (requiredYears - learnerYears) * 15)
    }
  }
  
  score += expScore * 0.3
  totalWeight += 0.3

  // Availability matching (20% weight)
  const learnerAvailability = learnerData.availability || ''
  const requiredAvailability = requirements.availability || ''
  
  let availScore = 50 // Default score
  if (learnerAvailability && requiredAvailability) {
    // Simple availability matching
    if (learnerAvailability.toLowerCase().includes('immediate') || 
        learnerAvailability.toLowerCase().includes('available')) {
      availScore = 90
    } else if (learnerAvailability.toLowerCase().includes('flexible')) {
      availScore = 80
    } else {
      availScore = 60
    }
  }
  
  score += availScore * 0.2
  totalWeight += 0.2

  // Location matching (10% weight)
  const learnerLocation = learnerData.location || ''
  const requiredLocation = requirements.location || ''
  
  let locationScore = 50 // Default score
  if (learnerLocation && requiredLocation) {
    if (learnerLocation.toLowerCase().includes(requiredLocation.toLowerCase()) ||
        requiredLocation.toLowerCase().includes(learnerLocation.toLowerCase())) {
      locationScore = 100
    } else if (learnerLocation.toLowerCase().includes('remote') || 
               learnerLocation.toLowerCase().includes('flexible')) {
      locationScore = 80
    } else {
      locationScore = 40
    }
  }
  
  score += locationScore * 0.1
  totalWeight += 0.1

  return Math.round(score / totalWeight)
}

// Extract years from experience string
function extractYears(experience: string): number {
  const match = experience.match(/(\d+(?:\.\d+)?)\s*years?/i)
  return match ? parseFloat(match[1]) : 0
}

// Generate justification for match
function generateJustification(learnerData: any, requirements: any): string {
  const justifications = []
  
  // Skills justification
  const learnerSkills = learnerData.skills || []
  const requiredSkills = requirements.skills || []
  const matchingSkills = requiredSkills.filter((skill: string) => 
    learnerSkills.some((learnerSkill: string) => 
      learnerSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(learnerSkill.toLowerCase())
    )
  )
  
  if (matchingSkills.length > 0) {
    justifications.push(`Strong match in required skills: ${matchingSkills.join(', ')}`)
  }
  
  // Experience justification
  const learnerExp = learnerData.experience || learnerData.yearsOfExperience || ''
  if (learnerExp) {
    justifications.push(`Relevant experience: ${learnerExp}`)
  }
  
  // Academic performance
  if (learnerData.academicPerformance === 'excellent' || learnerData.gpa >= 3.5) {
    justifications.push('Excellent academic performance')
  }
  
  // Additional qualifications
  if (learnerData.certifications && learnerData.certifications.length > 0) {
    justifications.push(`Professional certifications: ${learnerData.certifications.length} obtained`)
  }
  
  // Default justification if none specific
  if (justifications.length === 0) {
    justifications.push('Good overall profile with potential for growth')
  }
  
  return justifications.join('. ') + '.'
}

export async function candidateMatcherFlow(input: CandidateMatchInput): Promise<CandidateMatchResult> {
  try {
    // Query real learners from database
    const learnersSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'learner')
      .where('program', '==', input.programId)
      .where('status', '==', 'active')
      .get()

    if (learnersSnapshot.empty) {
      return {
        success: true,
        candidates: [],
        message: 'No eligible candidates found for this placement'
      }
    }

    const candidates: Candidate[] = []
    
    // Process each learner and calculate match scores
    for (const doc of learnersSnapshot.docs) {
      const learnerData = doc.data()
      
      // Calculate match score based on requirements and learner profile
      const matchScore = calculateMatchScore(learnerData, input.requirements)
      
      // Only include candidates with reasonable match scores
      if (matchScore >= 70) {
        candidates.push({
          id: doc.id,
          name: `${learnerData.firstName} ${learnerData.lastName}`,
          email: learnerData.email,
          program: learnerData.program,
          matchScore,
          justification: generateJustification(learnerData, input.requirements),
          skills: learnerData.skills || [],
          experience: learnerData.experience || learnerData.yearsOfExperience || 'Not specified',
          availability: learnerData.availability || 'Available'
        })
      }
    }

    // Sort by match score (highest first)
    candidates.sort((a, b) => b.matchScore - a.matchScore)

    // Take top candidates (limit to 10)
    const topCandidates = candidates.slice(0, 10)

    return {
      success: true,
      candidates: topCandidates,
      message: `Found ${topCandidates.length} suitable candidates`
    }

  } catch (error) {
    console.error('Error in candidate matching:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
