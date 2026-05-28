import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['QUEUED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETE']).optional(),
  dueDate: z.string().optional(),
  sprintId: z.string().min(1),
  assigneeId: z.string().optional(),
})

// GET all tasks for a sprint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sprintId = searchParams.get('sprintId') || undefined
    const status = searchParams.get('status') || undefined

    const tasks = await prisma.task.findMany({
      where: {
        ...(sprintId && { sprintId }),
        ...(status && { status }),
      },
      orderBy: { dueDate: 'asc' },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Tasks GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// POST create a new task
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        ...validated,
        ...(validated.dueDate && { dueDate: new Date(validated.dueDate) }),
      },
    })

    return NextResponse.json(
      { message: 'Task created successfully', task },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Tasks POST error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}