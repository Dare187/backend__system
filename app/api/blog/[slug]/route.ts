import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET single post by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
    })

    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      )
    }

    // Get related posts (same category)
    const related = await prisma.blogPost.findMany({
      where: {
        category: post.category,
        NOT: { slug: params.slug },
      },
      take: 2,
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json({ post, related })
  } catch (error) {
    console.error('Blog slug GET error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// PATCH update a post
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await req.json()

    const post = await prisma.blogPost.update({
      where: { slug: params.slug },
      data: body,
    })

    return NextResponse.json(
      { message: 'Post updated successfully', post }
    )
  } catch (error) {
    console.error('Blog PATCH error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}

// DELETE a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.blogPost.delete({
      where: { slug: params.slug },
    })

    return NextResponse.json(
      { message: 'Post deleted successfully' }
    )
  } catch (error) {
    console.error('Blog DELETE error:', error)
    return NextResponse.json(
      { message: 'Something went wrong', error: String(error) },
      { status: 500 }
    )
  }
}