import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [leads, invoices, projects, messages] = await Promise.all([
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    const activity = [
      ...leads.map((l) => ({
        type: 'NEW_LEAD',
        message: `New lead from ${l.fullName} at ${l.companyName}`,
        detail: `Budget: ${l.budget} | Timeline: ${l.timeline}`,
        createdAt: l.createdAt,
      })),
      ...invoices.map((i) => ({
        type: 'INVOICE',
        message: `Invoice of $${i.amount} marked as ${i.status}`,
        detail: `Project: ${i.projectId}`,
        createdAt: i.createdAt,
      })),
      ...projects.map((p) => ({
        type: 'PROJECT',
        message: `Project "${p.name}" is ${p.status}`,
        detail: `Progress: ${p.progress}%`,
        createdAt: p.createdAt,
      })),
      ...messages.map((m) => ({
        type: 'MESSAGE',
        message: `New message in channel`,
        detail: m.content.substring(0, 60),
        createdAt: m.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 20)

    return NextResponse.json({ activity })
  } catch (error) {
    console.error('Activity log error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}