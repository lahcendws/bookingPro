import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)

  // Create Supabase client and get user for auth headers
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('x-request-id', requestId)

  // Set auth headers for downstream use (by getAuthUser in layouts)
  if (user) {
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-email', user.email ?? '')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
}