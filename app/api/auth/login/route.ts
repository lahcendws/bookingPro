import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 })
  }

  // Refresh session to ensure cookies are properly set
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ success: false, error: 'Session not established' }, { status: 500 })
  }

  return NextResponse.json({ success: true, redirectTo })
}