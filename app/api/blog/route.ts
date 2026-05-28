import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const blogSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  content: z.string().min(10),
  category: z.string().min(1),
  coverImage: z.string().optional(),
  readTime: z.number().min(1),
  authorId: z.string().min(1),
})

// GET all posts with pagination and category filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 6)
    const category = searchParams.get('category') || undefined
    const skip = (page - 1) * limit

    const where = category ? { category } : {}

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Blog GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// POST create a new blog post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = blogSchema.parse(body)

    // Check slug is unique
    const existing = await prisma.blogPost.findUnique({
      where: { slug: validated.slug },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    const post = await prisma.blogPost.create({
      data: validated,
    })

    return NextResponse.json(
      { message: 'Blog post created successfully', post },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Blog POST error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}