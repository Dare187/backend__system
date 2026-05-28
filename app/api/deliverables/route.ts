import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'

// GET all deliverables for a project
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId') || undefined

    const deliverables = await prisma.deliverable.findMany({
      where: { ...(projectId && { projectId }) },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(deliverables)
  } catch (error) {
    console.error('Deliverables GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// POST upload a new deliverable
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const uploadedBy = formData.get('uploadedBy') as string

    if (!file || !projectId || !uploadedBy) {
      return NextResponse.json(
        { message: 'file, projectId and uploadedBy are required' },
        { status: 400 }
      )
    }

    // Convert file to buffer for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'nahara-tech/deliverables',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    // Save to DB
    const deliverable = await prisma.deliverable.create({
      data: {
        fileName: file.name,
        fileUrl: uploaded.secure_url,
        fileType: file.type,
        projectId,
        uploadedBy,
        status: 'AWAITING_FEEDBACK',
      },
    })

    return NextResponse.json(
      { message: 'Deliverable uploaded successfully', deliverable },
      { status: 201 }
    )
  } catch (error) {
    console.error('Deliverables POST error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}