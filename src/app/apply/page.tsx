// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { ApplyForm } from '@/components/applicant/ApplyForm'
import { adminDb } from '@/lib/firebase-admin'

interface Program {
  id: string
  name: string
  description: string
  duration: string
  level: string
  available: boolean
}

async function getPrograms(): Promise<Program[]> {
  try {
    const programsSnapshot = await adminDb
      .collection('programs')
      .where('available', '==', true)
      .orderBy('name', 'asc')
      .get()

    return programsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Program[]
  } catch (error) {
    console.error('Error fetching programs:', error)
    // Return default programs if Firestore is unavailable
    return [
      {
        id: 'computer-science',
        name: 'Computer Science',
        description: 'Comprehensive computer science fundamentals',
        duration: '12 months',
        level: 'Beginner to Advanced',
        available: true
      },
      {
        id: 'data-science',
        name: 'Data Science',
        description: 'Data analysis, machine learning, and statistics',
        duration: '10 months',
        level: 'Intermediate',
        available: true
      },
      {
        id: 'artificial-intelligence',
        name: 'Artificial Intelligence',
        description: 'AI fundamentals, deep learning, and neural networks',
        duration: '14 months',
        level: 'Advanced',
        available: true
      },
      {
        id: 'software-engineering',
        name: 'Software Engineering',
        description: 'Software development lifecycle and best practices',
        duration: '12 months',
        level: 'Intermediate',
        available: true
      },
      {
        id: 'cybersecurity',
        name: 'Cybersecurity',
        description: 'Security fundamentals, ethical hacking, and defense',
        duration: '10 months',
        level: 'Intermediate',
        available: true
      },
      {
        id: 'web-development',
        name: 'Web Development',
        description: 'Full-stack web development with modern frameworks',
        duration: '8 months',
        level: 'Beginner',
        available: true
      },
      {
        id: 'mobile-development',
        name: 'Mobile Development',
        description: 'iOS and Android app development',
        duration: '9 months',
        level: 'Intermediate',
        available: true
      },
      {
        id: 'cloud-computing',
        name: 'Cloud Computing',
        description: 'AWS, Azure, and Google Cloud platforms',
        duration: '6 months',
        level: 'Intermediate',
        available: true
      },
      {
        id: 'devops',
        name: 'DevOps',
        description: 'CI/CD, containerization, and infrastructure automation',
        duration: '7 months',
        level: 'Intermediate',
        available: true
      }
    ]
  }
}

export default async function ApplyPage() {
  const programs = await getPrograms()
  
  return <ApplyForm programs={programs} />
}
