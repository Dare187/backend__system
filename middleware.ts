import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = req.nextUrl

  // Protect all admin routes - only ADMIN role
  if (pathname.startsWith('/api/admin')) {
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - please log in' },
        { status: 401 }
      )
    }

    if (token.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden - admin access only' },
        { status: 403 }
      )
    }
  }

  // Protect client portal routes - any logged in user
  if (
    pathname.startsWith('/api/projects') ||
    pathname.startsWith('/api/invoices') ||
    pathname.startsWith('/api/deliverables') ||
    pathname.startsWith('/api/channels') ||
    pathname.startsWith('/api/sprints') ||
    pathname.startsWith('/api/tasks')
  ) {
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - please log in' },
        { status: 401 }
      )
    }
  }

  // Public routes - no protection needed
  // /api/leads, /api/newsletter, /api/blog, /api/case-studies, /api/pricing
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/projects/:path*',
    '/api/invoices/:path*',
    '/api/deliverables/:path*',
    '/api/channels/:path*',
    '/api/sprints/:path*',
    '/api/tasks/:path*',
  ],
}