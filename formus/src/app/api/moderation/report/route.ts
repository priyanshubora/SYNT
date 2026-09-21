import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

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

  let body: Record<
    string,
    unknown
  >

  try {
    body =
      await request.json()
  } catch {
    return NextResponse.json(
      {
        error:
          'Invalid request body.',
      },
      {
        status: 400,
      },
    )
  }

  const reportId =
    typeof body.reportId ===
    'string'
      ? body.reportId
      : ''

  const status =
    body.status as ReportStatus

  if (!reportId) {
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