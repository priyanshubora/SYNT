import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', requestUrl.origin)
    )
  }

  const supabase = await createClient()

  const { error } =
    await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL('/login?error=auth', requestUrl.origin)
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      new URL('/login?error=no_user', requestUrl.origin)
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    return NextResponse.redirect(
      new URL('/setup-profile', requestUrl.origin)
    )
  }

  return NextResponse.redirect(
    new URL(next, requestUrl.origin)
  )
}