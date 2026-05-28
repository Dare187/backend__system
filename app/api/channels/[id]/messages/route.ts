import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'
import { z } from 'zod'

const messageSchema = z.object({
  content: z.string().min(1),
  senderId: z.string().min(1),
  attachments: z.array(z.string()).optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: channelId } = await params

    const messages = await prisma.message.findMany({
      where: { channelId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: channelId } = await params
    const body = await req.json()
    const validated = messageSchema.parse(body)

    // Save message to DB
    const message = await prisma.message.create({
      data: {
        content: validated.content,
        senderId: validated.senderId,
        channelId,
        attachments: validated.attachments || [],
      },
    })

    // Trigger real-time event via Pusher
    await pusher.trigger(`channel-${channelId}`, 'new-message', {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      channelId: message.channelId,
      createdAt: message.createdAt,
    })

    return NextResponse.json(
      { message: 'Message sent successfully', data: message },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Messages POST error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}