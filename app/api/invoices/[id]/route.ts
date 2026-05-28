import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single invoice
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    })

    if (!invoice) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Invoice GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// PATCH update invoice status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        ...body,
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
      },
    })

    return NextResponse.json(
      { message: 'Invoice updated successfully', invoice }
    )
  } catch (error) {
    console.error('Invoice PATCH error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// DELETE an invoice
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.invoice.delete({
      where: { id: params.id },
    })

    return NextResponse.json(
      { message: 'Invoice deleted successfully' }
    )
  } catch (error) {
    console.error('Invoice DELETE error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}