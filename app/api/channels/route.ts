import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const channelSchema = z.object({
  name: z.string().min(1),
  projectId: z.string().min(1),
  participants: z.array(z.string()).optional(),
})

// GET all channels for a project
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId') || undefined

    const channels = await prisma.channel.findMany({
      where: { ...(projectId && { projectId }) },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error('Channels GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// POST create a new channel
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = channelSchema.parse(body)

    const channel = await prisma.channel.create({
      data: {
        name: validated.name,
        projectId: validated.projectId,
        participants: validated.participants || [],
      },
    })

    return NextResponse.json(
      { message: 'Channel created successfully', channel },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Channels POST error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}