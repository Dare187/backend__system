import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Run all queries at the same time for speed
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      totalLeads,
      totalSubscribers,
      recentLeads,
      recentInvoices,
      recentProjects,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ON_TRACK' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'PENDING' } }),
      prisma.invoice.findMany({ where: { status: 'PAID' } }),
      prisma.lead.count(),
      prisma.newsletterSubscriber.count(),
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    // Calculate total revenue from paid invoices
    const totalRevenue = paidInvoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0
    )

    // Build recent activity feed
    const recentActivity = [
      ...recentLeads.map((lead) => ({
        type: 'NEW_LEAD',
        message: `New lead from ${lead.fullName} at ${lead.companyName}`,
        createdAt: lead.createdAt,
      })),
      ...recentInvoices.map((invoice) => ({
        type: 'INVOICE',
        message: `Invoice of $${invoice.amount} is ${invoice.status}`,
        createdAt: invoice.createdAt,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 8)

    return NextResponse.json({
      overview: {
        totalRevenue,
        activeProjects,
        pendingInvoices,
        totalLeads,
        totalSubscribers,
        completedProjects,
        totalProjects,
      },
      recentActivity,
      recentProjects,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}