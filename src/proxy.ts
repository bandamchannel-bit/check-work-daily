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
    // In production, require CRON_SECRET. For now, allow localhost to run them without it.
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
