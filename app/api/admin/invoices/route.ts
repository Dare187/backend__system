import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all invoices with stats
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined

    const [invoices, allInvoices] = await Promise.all([
      prisma.invoice.findMany({
        where: { ...(status && { status }) },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.findMany(),
    ])

    const totalRevenue = allInvoices
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + i.amount, 0)

    const totalPending = allInvoices
      .filter((i) => i.status === 'PENDING')
      .reduce((sum, i) => sum + i.amount, 0)

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalPending,
        totalInvoices: allInvoices.length,
        paidCount: allInvoices.filter((i) => i.status === 'PAID').length,
        pendingCount: allInvoices.filter((i) => i.status === 'PENDING').length,
        overdueCount: allInvoices.filter((i) => i.status === 'OVERDUE').length,
      },
      invoices,
    })
  } catch (error) {
    console.error('Admin invoices GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}