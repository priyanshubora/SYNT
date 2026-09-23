import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { enforceMutationRateLimit } from '@/lib/api/rate-limit'
import { hasUnexpectedBody } from '@/lib/api/request'

export async function POST(request: Request) {
  if (await hasUnexpectedBody(request)) {
    return NextResponse.json(
      { error: 'This endpoint does not accept a request body.' },
      { status: 400, headers: { 'Cache-Control': 'private, no-store' } },
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const rateLimitResponse = await enforceMutationRateLimit(
      supabase,
      'auth.signout',
    )
    if (rateLimitResponse) return rateLimitResponse
  }

  await supabase.auth.signOut()

  const requestUrl = new URL(request.url)

  return NextResponse.redirect(
    new URL('/', requestUrl.origin)
  )
}
