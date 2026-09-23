import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { enforceMutationRateLimit } from '@/lib/api/rate-limit'
import { hasUnexpectedBody } from '@/lib/api/request'

export async function POST(request: Request) {
  if (await hasUnexpectedBody(request)) {
    return NextResponse.json(
      { error: 'This endpoint does not accept a request body.' },
      { status: 400 },
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      },
    )
  }

  const rateLimitResponse = await enforceMutationRateLimit(
    supabase,
    'account.delete',
  )
  if (rateLimitResponse) return rateLimitResponse

  const serviceRoleKey =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    console.error(
      'SUPABASE_SERVICE_ROLE_KEY is missing.',
    )

    return NextResponse.json(
      {
        error:
          'Server account deletion is not configured.',
      },
      {
        status: 500,
      },
    )
  }

  const admin =
    createAdminClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

  const { error } =
    await admin.auth.admin.deleteUser(
      user.id,
    )

  if (error) {
    console.error(
      'Supabase account deletion failed:',
      error,
    )

    return NextResponse.json(
      {
        error:
          'Failed to delete account.',
      },
      {
        status: 500,
      },
    )
  }

  return NextResponse.json({
    success: true,
  })
}
