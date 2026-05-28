import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const sprintSchema = z.object({
  name: z.string().min(1),
  projectId: z.string().min(1),
})

// GET all sprints for a project
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId') || undefined

    const sprints = await prisma.sprint.findMany({
      where: { ...(projectId && { projectId }) },
    })

    return NextResponse.json(sprints)
  } catch (error) {
    console.error('Sprints GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// POST create a new sprint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = sprintSchema.parse(body)

    const sprint = await prisma.sprint.create({
      data: validated,
    })

    return NextResponse.json(
      { message: 'Sprint created successfully', sprint },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Sprints POST error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}