import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

const samplePrograms = [
  {
    id: 'computer-science-wil',
    name: 'Computer Science WIL Program',
    description: 'Comprehensive computer science fundamentals with work-integrated learning',
    duration: '12 months',
    level: 'Beginner to Advanced',
    available: true,
    maxStudents: 50,
    requirements: ['High School Certificate', 'Basic computer literacy'],
    curriculum: [
      'Programming Fundamentals',
      'Data Structures and Algorithms',
      'Software Engineering',
      'Database Management',
      'Web Development',
      'Mobile Development'
    ]
  },
  {
    id: 'data-science-wil',
    name: 'Data Science WIL Program',
    description: 'Data analysis, machine learning, and statistics with real-world projects',
    duration: '10 months',
    level: 'Intermediate',
    available: true,
    maxStudents: 30,
    requirements: ['Diploma or Bachelor Degree', 'Mathematics background preferred'],
    curriculum: [
      'Statistical Analysis',
      'Machine Learning',
      'Data Visualization',
      'Big Data Technologies',
      'Python for Data Science',
      'SQL and Database Analytics'
    ]
  },
  {
    id: 'artificial-intelligence-wil',
    name: 'Artificial Intelligence WIL Program',
    description: 'AI fundamentals, deep learning, and neural networks with industry projects',
    duration: '14 months',
    level: 'Advanced',
    available: true,
    maxStudents: 25,
    requirements: ['Bachelor Degree in Computer Science or related field'],
    curriculum: [
      'Machine Learning Foundations',
      'Deep Learning',
      'Natural Language Processing',
      'Computer Vision',
      'AI Ethics and Governance',
      'AI Project Management'
    ]
  },
  {
    id: 'software-engineering-wil',
    name: 'Software Engineering WIL Program',
    description: 'Software development lifecycle and best practices with industry experience',
    duration: '12 months',
    level: 'Intermediate',
    available: true,
    maxStudents: 40,
    requirements: ['Diploma or Bachelor Degree', 'Programming experience'],
    curriculum: [
      'Software Development Lifecycle',
      'Agile and DevOps',
      'System Design',
      'Testing and Quality Assurance',
      'Code Review and Best Practices',
      'Project Management'
    ]
  },
  {
    id: 'cybersecurity-wil',
    name: 'Cybersecurity WIL Program',
    description: 'Security fundamentals, ethical hacking, and defense with hands-on experience',
    duration: '10 months',
    level: 'Intermediate',
    available: true,
    maxStudents: 35,
    requirements: ['IT Diploma or Bachelor Degree', 'Basic networking knowledge'],
    curriculum: [
      'Network Security',
      'Ethical Hacking',
      'Incident Response',
      'Security Governance',
      'Penetration Testing',
      'Security Operations'
    ]
  },
  {
    id: 'web-development-wil',
    name: 'Web Development WIL Program',
    description: 'Full-stack web development with modern frameworks and industry projects',
    duration: '8 months',
    level: 'Beginner',
    available: true,
    maxStudents: 45,
    requirements: ['High School Certificate', 'Basic computer literacy'],
    curriculum: [
      'HTML, CSS, JavaScript',
      'React and Vue.js',
      'Node.js and Express',
      'Database Integration',
      'API Development',
      'Deployment and DevOps'
    ]
  },
  {
    id: 'mobile-development-wil',
    name: 'Mobile Development WIL Program',
    description: 'iOS and Android app development with real-world applications',
    duration: '9 months',
    level: 'Intermediate',
    available: true,
    maxStudents: 30,
    requirements: ['Programming experience', 'Basic mobile concepts'],
    curriculum: [
      'React Native Development',
      'iOS Development with Swift',
      'Android Development',
      'Mobile UI/UX Design',
      'App Store Deployment',
      'Mobile Analytics'
    ]
  },
  {
    id: 'cloud-computing-wil',
    name: 'Cloud Computing WIL Program',
    description: 'AWS, Azure, and Google Cloud platforms with industry certifications',
    duration: '6 months',
    level: 'Intermediate',
    available: true,
    maxStudents: 35,
    requirements: ['IT Diploma or Bachelor Degree', 'Basic networking knowledge'],
    curriculum: [
      'AWS Fundamentals',
      'Azure Cloud Services',
      'Google Cloud Platform',
      'Cloud Architecture',
      'DevOps in the Cloud',
      'Cloud Security'
    ]
  },
  {
    id: 'devops-wil',
    name: 'DevOps WIL Program',
    description: 'CI/CD, containerization, and infrastructure automation with industry tools',
    duration: '7 months',
    level: 'Intermediate',
    available: true,
    maxStudents: 25,
    requirements: ['Software Development background', 'Linux knowledge'],
    curriculum: [
      'Docker and Containerization',
      'Kubernetes Orchestration',
      'CI/CD Pipelines',
      'Infrastructure as Code',
      'Monitoring and Logging',
      'Cloud DevOps'
    ]
  },
  {
    id: 'digital-marketing-wil',
    name: 'Digital Marketing WIL Program',
    description: 'Digital marketing strategies, analytics, and campaign management',
    duration: '6 months',
    level: 'Beginner',
    available: true,
    maxStudents: 40,
    requirements: ['High School Certificate', 'Marketing interest'],
    curriculum: [
      'Social Media Marketing',
      'Search Engine Optimization',
      'Content Marketing',
      'Email Marketing',
      'Analytics and Reporting',
      'Campaign Management'
    ]
  }
]

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting to populate programs...')
    
    for (const program of samplePrograms) {
      await adminDb.collection('programs').doc(program.id).set({
        ...program,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log(`✅ Added program: ${program.name}`)
    }
    
    console.log('🎉 Successfully populated all programs!')
    return NextResponse.json({ 
      success: true, 
      message: `Successfully populated ${samplePrograms.length} programs`,
      count: samplePrograms.length
    })
  } catch (error: any) {
    console.error('❌ Error populating programs:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to populate programs' 
    }, { status: 500 })
  }
}

















