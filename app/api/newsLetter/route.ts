import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transporter } from '@/lib/mailer'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

import { ratelimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    // Check if email already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'You are already subscribed!' },
        { status: 400 }
      )
    }

    // Save to DB
    await prisma.newsletterSubscriber.create({
      data: { email },
    })

    // Send welcome email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Nahara Insights!',
      html: `
        <h2>You're in! 🎉</h2>
        <p>Thanks for subscribing to the Nahara Tech newsletter.</p>
        <p>Every week you'll get deep dives into:</p>
        <ul>
          <li>Scalable engineering</li>
          <li>Strategic business operations</li>
          <li>The future of technology</li>
        </ul>
        <p>Talk soon,<br/>Nahara Tech Team</p>
      `,
    })

    return NextResponse.json(
      { message: 'Subscribed successfully!' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.error('Newsletter error:', error)

    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// Get all subscribers (admin only)
export async function GET() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(subscribers)
  } catch (error) {
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}