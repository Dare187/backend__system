import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const projectSchema = z.object({
  name: z.string().min(2),
  clientId: z.string().min(1),
  startDate: z.string(),
  targetLaunch: z.string(),
  budget: z.number().min(0),
  status: z.enum(['ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED']).optional(),
})

// GET all projects
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId') || undefined
    const status = searchParams.get('status') || undefined

    const projects = await prisma.project.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Projects GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// POST create a new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = projectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        ...validated,
        startDate: new Date(validated.startDate),
        targetLaunch: new Date(validated.targetLaunch),
      },
    })

    return NextResponse.json(
      { message: 'Project created successfully', project },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Projects POST error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}