import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH update task status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...body,
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
      },
    })

    return NextResponse.json(
      { message: 'Task updated successfully', task }
    )
  } catch (error) {
    console.error('Task PATCH error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// DELETE a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.task.delete({ where: { id } })

    return NextResponse.json(
      { message: 'Task deleted successfully' }
    )
  } catch (error) {
    console.error('Task DELETE error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}