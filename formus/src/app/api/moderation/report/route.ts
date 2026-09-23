import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { readJsonObject, UUID_PATTERN } from '@/lib/api/request'
import { enforceMutationRateLimit } from '@/lib/api/rate-limit'

type ReportStatus =
  | 'reviewed'
  | 'dismissed'
  | 'action_taken'

export async function POST(
  request: Request,
) {
  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      {
        error:
          'Unauthorized.',
      },
      {
        status: 401,
      },
    )
  }

  const { data: profile } =
    await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

  if (
    !profile ||
    ![
      'moderator',
      'admin',
    ].includes(profile.role)
  ) {
    return NextResponse.json(
      {
        error:
          'Moderator permission required.',
      },
      {
        status: 403,
      },
    )
  }

  const rateLimitResponse = await enforceMutationRateLimit(
    supabase,
    'moderation.report_status',
  )
  if (rateLimitResponse) return rateLimitResponse

  const parsedBody = await readJsonObject(request)
  if (!parsedBody.ok) {
    return NextResponse.json(
      { error: parsedBody.message },
      { status: parsedBody.status },
    )
  }
  const body = parsedBody.value

  const reportId =
    typeof body.reportId ===
    'string'
      ? body.reportId
      : ''

  const status =
    body.status as ReportStatus

  if (!UUID_PATTERN.test(reportId)) {
    return NextResponse.json(
      {
        error:
          'Missing report ID.',
      },
      {
        status: 400,
      },
    )
  }

  if (
    ![
      'reviewed',
      'dismissed',
      'action_taken',
    ].includes(status)
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid report status.',
      },
      {
        status: 400,
      },
    )
  }

  const { error } =
    await supabase
      .from('reports')
      .update({
        status,
        resolved_by:
          user.id,
        resolved_at:
          new Date().toISOString(),
      })
      .eq('id', reportId)

  if (error) {
    console.error(
      'Report update failed:',
      error,
    )

    return NextResponse.json(
      {
        error:
          'Unable to update report.',
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
