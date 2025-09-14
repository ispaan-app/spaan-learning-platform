import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const imageUrl = formData.get('imageUrl') as string

    let finalUrl: string

    if (file) {
      // Handle file upload
      // In a real implementation, you would upload to Firebase Storage
      // For now, we'll simulate the upload process
      const buffer = await file.arrayBuffer()
      const fileName = `hero-image-${Date.now()}.${file.name.split('.').pop()}`
      
      // Simulate upload to Firebase Storage
      // const bucket = adminStorage.bucket()
      // const fileRef = bucket.file(`branding/${fileName}`)
      // await fileRef.save(buffer)
      // finalUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`
      
      // For demo purposes, use a placeholder URL
      finalUrl = `https://via.placeholder.com/1920x1080/4F46E5/FFFFFF?text=Uploaded+Hero+Image`
    } else if (imageUrl) {
      // Handle AI-generated image URL
      finalUrl = imageUrl
    } else {
      return NextResponse.json(
        { error: 'No file or image URL provided' },
        { status: 400 }
      )
    }

    // Update the appearance settings in Firestore
    await setDoc(doc(db, 'settings', 'appearance'), {
      heroImageUrl: finalUrl,
      lastUpdated: new Date(),
      updatedBy: 'super-admin' // In real implementation, get from auth context
    }, { merge: true })

    return NextResponse.json({ 
      success: true, 
      url: finalUrl 
    })

  } catch (error) {
    console.error('Error uploading hero image:', error)
    return NextResponse.json(
      { error: 'Failed to upload hero image' },
      { status: 500 }
    )
  }
}

