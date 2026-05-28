import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all projects with full details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined

    const projects = await prisma.project.findMany({
      where: {
        ...(status && { status }),
        ...(search && {
          name: { contains: search, mode: 'insensitive' },
        }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Admin projects GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}