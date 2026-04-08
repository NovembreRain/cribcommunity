import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Placeholder — add auth guards, redirects, locale handling here.
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public/ files
     */
    '/((?!_next/static|_next/image|favicon.ico|videos/|images/).*)',
  ],
}
