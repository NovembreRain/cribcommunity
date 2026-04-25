import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/(auth)']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const session = request.cookies.get('crib_admin_session')?.value
  const secret = process.env.ADMIN_SECRET

  if (!secret || session !== secret) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
