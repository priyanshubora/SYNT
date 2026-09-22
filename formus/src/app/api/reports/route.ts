import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

const VALID_REASONS = [
  'spam',
  'harassment',
  'hate',
  'nsfw',
  'impersonation',
  'off_topic',
  'other',
] as const

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
        error: 'Login required.',
      },
      {
        status: 401,
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

  const targetType =
    body.targetType

  const targetId =
    body.targetId

  const reason =
    body.reason

  const description =
    typeof body.description ===
    'string'
      ? body.description.trim()
      : null

  if (
    targetType !== 'thread' &&
    targetType !== 'comment'
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid target type.',
      },
      {
        status: 400,
      },
    )
  }

  if (
    typeof targetId !==
      'string' ||
    !targetId.trim()
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid target.',
      },
      {
        status: 400,
      },
    )
  }

  if (
    !VALID_REASONS.includes(
      reason as (typeof VALID_REASONS)[number],
    )
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid report reason.',
      },
      {
        status: 400,
      },
    )
  }

  /*
   * Verify target exists.
   */

  if (
    targetType === 'thread'
  ) {
    const { data: target } =
      await supabase
        .from('threads')
        .select('id')
        .eq('id', targetId)
        .maybeSingle()

    if (!target) {
      return NextResponse.json(
        {
          error:
            'Thread not found.',
        },
        {
          status: 404,
        },
      )
    }
  }

  if (
    targetType === 'comment'
  ) {
    const { data: target } =
      await supabase
        .from('comments')
        .select('id')
        .eq('id', targetId)
        .maybeSingle()

    if (!target) {
      return NextResponse.json(
        {
          error:
            'Comment not found.',
        },
        {
          status: 404,
        },
      )
    }
  }

  /*
   * Prevent duplicate pending reports.
   */

  const {
    data: existing,
  } =
    await supabase
      .from('reports')
      .select('id')
      .eq(
        'reporter_id',
        user.id,
      )
      .eq(
        'target_type',
        targetType,
      )
      .eq(
        'target_id',
        targetId,
      )
      .eq(
        'status',
        'pending',
      )
      .maybeSingle()

  if (existing) {
    return NextResponse.json(
      {
        error:
          'You already reported this.',
      },
      {
        status: 409,
      },
    )
  }

  const { error } =
    await supabase
      .from('reports')
      .insert({
        reporter_id:
          user.id,
        target_type:
          targetType,
        target_id:
          targetId,
        reason,
        description:
          description || null,
      })

  if (error) {
    console.error(
      'Report creation failed:',
      error,
    )

    return NextResponse.json(
      {
        error:
          'Failed to create report.',
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