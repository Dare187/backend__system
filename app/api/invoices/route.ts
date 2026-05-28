import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const invoiceSchema = z.object({
  projectId: z.string().min(1),
  amount: z.number().min(0),
  dueDate: z.string(),
  status: z.enum(['PAID', 'PENDING', 'OVERDUE']).optional(),
})

// GET all invoices
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId') || undefined
    const status = searchParams.get('status') || undefined

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Invoices GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// POST create a new invoice
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = invoiceSchema.parse(body)

    const invoice = await prisma.invoice.create({
      data: {
        ...validated,
        dueDate: new Date(validated.dueDate),
      },
    })

    return NextResponse.json(
      { message: 'Invoice created successfully', invoice },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Invoices POST error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}