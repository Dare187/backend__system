import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single case study
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id: params.id },
    })

    if (!caseStudy) {
      return NextResponse.json(
        { message: 'Case study not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(caseStudy)
  } catch (error) {
    console.error('Case study GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// PATCH update a case study
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    const caseStudy = await prisma.caseStudy.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(
      { message: 'Case study updated successfully', caseStudy }
    )
  } catch (error) {
    console.error('Case study PATCH error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// DELETE a case study
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.caseStudy.delete({
      where: { id: params.id },
    })

    return NextResponse.json(
      { message: 'Case study deleted successfully' }
    )
  } catch (error) {
    console.error('Case study DELETE error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}