import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transporter } from '@/lib/mailer'
import { z } from 'zod'

// Validation schema
const leadSchema = z.object({
  fullName: z.string().min(2),
  companyName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  businessStage: z.string().min(1),
  systemInterest: z.string().min(1),
  services: z.array(z.string()),
  budget: z.string().min(1),
  timeline: z.string().min(1),
  description: z.string().min(10),
})

import { ratelimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate incoming data
    const validated = leadSchema.parse(body)

    // Save to MongoDB
    const lead = await prisma.lead.create({
      data: validated,
    })

    // Send email notification to Nahara team
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `New Lead: ${validated.fullName} from ${validated.companyName}`,
      html: `
        <h2>New Lead Submission</h2>
        <p><strong>Name:</strong> ${validated.fullName}</p>
        <p><strong>Company:</strong> ${validated.companyName}</p>
        <p><strong>Email:</strong> ${validated.email}</p>
        <p><strong>Phone:</strong> ${validated.phone}</p>
        <p><strong>Business Stage:</strong> ${validated.businessStage}</p>
        <p><strong>Interested In:</strong> ${validated.systemInterest}</p>
        <p><strong>Services Needed:</strong> ${validated.services.join(', ')}</p>
        <p><strong>Budget:</strong> ${validated.budget}</p>
        <p><strong>Timeline:</strong> ${validated.timeline}</p>
        <p><strong>Description:</strong> ${validated.description}</p>
      `,
    })

    // Send confirmation email to the lead
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: validated.email,
      subject: `We received your request, ${validated.fullName}!`,
      html: `
        <h2>Thanks for reaching out!</h2>
        <p>Hi ${validated.fullName},</p>
        <p>We've received your request and will get back to you within 4 hours.</p>
        <p>Here's what happens next:</p>
        <ol>
          <li><strong>Analysis</strong> - We analyze your technical infrastructure</li>
          <li><strong>Proposal</strong> - We propose a tailored growth roadmap within 24h</li>
          <li><strong>Onboarding</strong> - Team introduction and project kickoff</li>
          <li><strong>Execution</strong> - Agile development sprints begin immediately</li>
        </ol>
        <p>Talk soon,<br/>Nahara Tech Team</p>
      `,
    })

    return NextResponse.json(
      { message: 'Lead submitted successfully', id: lead.id },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.name },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// Get all leads (admin only - we'll protect this in Phase 4)
export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(leads)
  } catch (error) {
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}