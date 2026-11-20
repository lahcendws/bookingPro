import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = await createClient()

  // Refresh session if the user is logged in and the session is expiring soon
  const { data: { user } } = await supabase.auth.getUser()

  const response = NextResponse.next()

  // Set auth headers for downstream use (by getAuthUser in layouts)
  if (user) {
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-email', user.email ?? '')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - robots.txt (search engine robots)
     * - api paths that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
}