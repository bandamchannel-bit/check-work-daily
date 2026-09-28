import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/admin', '/employee']
const publicRoutes = ['/', '/login']

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)

  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie)

  // API Route Protection (Cron)
  if (path.startsWith('/api/cron/')) {
    const authHeader = req.headers.get('authorization')
    const querySecret = req.nextUrl.searchParams.get('secret')
    const isValidSecret = process.env.CRON_SECRET && (authHeader === `Bearer ${process.env.CRON_SECRET}` || querySecret === process.env.CRON_SECRET)
    const isAdmin = session?.userRole === 'ADMIN'

    // In production, require either valid CRON_SECRET or an active ADMIN session
    if (process.env.NODE_ENV === 'production' && !isValidSecret && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  if (isPublicRoute && session?.userId) {
    if (session.userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.nextUrl))
    }
    return NextResponse.redirect(new URL('/employee', req.nextUrl))
  }

  // Role-based protection for specific routes
  if (path.startsWith('/admin') && session?.userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/employee', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)', '/api/cron/:path*'],
}
