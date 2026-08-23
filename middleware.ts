import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

const ADMIN_ROUTES = ['/api/members', '/api/posts', '/api/categories', '/api/activity-logs']
const ADMIN_METHODS = ['POST', 'PATCH', 'DELETE']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
  const isAdminMethod = ADMIN_METHODS.includes(request.method)
  const isAuthRoute = pathname.startsWith('/api/auth/me')

  if ((isAdminRoute && isAdminMethod) || isAuthRoute) {
    const token = request.cookies.get('admin-token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      await verifyToken(token)
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}