import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single project by id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Project GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// PATCH update project (progress, status etc)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...body,
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.targetLaunch && { targetLaunch: new Date(body.targetLaunch) }),
      },
    })

    return NextResponse.json(
      { message: 'Project updated successfully', project }
    )
  } catch (error) {
    console.error('Project PATCH error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// DELETE a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.delete({
      where: { id: params.id },
    })

    return NextResponse.json(
      { message: 'Project deleted successfully' }
    )
  } catch (error) {
    console.error('Project DELETE error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}