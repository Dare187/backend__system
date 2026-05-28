import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const caseStudySchema = z.object({
  clientName: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  results: z.string().min(5),
  tags: z.array(z.string()),
  image: z.string().optional(),
})

// GET all case studies with optional tag filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tag = searchParams.get('tag') || undefined

    const caseStudies = await prisma.caseStudy.findMany({
      where: tag ? { tags: { has: tag } } : {},
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(caseStudies)
  } catch (error) {
    console.error('Case studies GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// POST create a new case study
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = caseStudySchema.parse(body)

    const caseStudy = await prisma.caseStudy.create({
      data: validated,
    })

    return NextResponse.json(
      { message: 'Case study created successfully', caseStudy },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Case studies POST error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}