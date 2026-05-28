import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const teamSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'TEAM', 'CLIENT']),
})

// GET all team members
export async function GET() {
  try {
    const team = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'TEAM'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error('Admin team GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}