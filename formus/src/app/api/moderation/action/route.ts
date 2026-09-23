import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { readJsonObject, UUID_PATTERN } from '@/lib/api/request'
import { enforceMutationRateLimit } from '@/lib/api/rate-limit'

type Action =
  | 'delete_thread'
  | 'restore_thread'
  | 'delete_comment'
  | 'restore_comment'
  | 'lock_thread'
  | 'unlock_thread'

type TargetType =
  | 'thread'
  | 'comment'

const VALID_ACTIONS: Action[] = [
  'delete_thread',
  'restore_thread',
  'delete_comment',
  'restore_comment',
  'lock_thread',
  'unlock_thread',
]

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
    'moderation.action',
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

  const action =
    body.action as Action

  const targetType =
    body.targetType as TargetType

  const targetId =
    typeof body.targetId ===
    'string'
      ? body.targetId
      : ''

  const reason =
    typeof body.reason ===
    'string'
      ? body.reason.trim()
      : ''

  if (reason.length > 1000) {
    return NextResponse.json(
      { error: 'Reason must be 1000 characters or fewer.' },
      { status: 400 },
    )
  }

  if (
    !VALID_ACTIONS.includes(
      action,
    )
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid moderation action.',
      },
      {
        status: 400,
      },
    )
  }

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

  if (!UUID_PATTERN.test(targetId)) {
    return NextResponse.json(
      {
        error:
          'Missing target.',
      },
      {
        status: 400,
      },
    )
  }

  const threadAction =
    action ===
      'delete_thread' ||
    action ===
      'restore_thread' ||
    action ===
      'lock_thread' ||
    action ===
      'unlock_thread'

  const commentAction =
    action ===
      'delete_comment' ||
    action ===
      'restore_comment'

  if (
    threadAction &&
    targetType !== 'thread'
  ) {
    return NextResponse.json(
      {
        error:
          'This action requires a thread.',
      },
      {
        status: 400,
      },
    )
  }

  if (
    commentAction &&
    targetType !== 'comment'
  ) {
    return NextResponse.json(
      {
        error:
          'This action requires a comment.',
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
        .select(
          'id, deleted_at, is_locked',
        )
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
        .select(
          'id, deleted_at',
        )
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

  if (
    action.includes(
      'delete',
    ) ||
    action.includes(
      'lock',
    ) ||
    action.includes(
      'unlock',
    )
  ) {
    if (!reason) {
      return NextResponse.json(
        {
          error:
            'A reason is required.',
        },
        {
          status: 400,
        },
      )
    }
  }

  const now =
    new Date().toISOString()

  let updateError:
    | Error
    | null = null

  /*
   * THREAD ACTIONS
   */

  if (
    action ===
    'delete_thread'
  ) {
    const result =
      await supabase
        .from('threads')
        .update({
          deleted_at: now,
          deleted_by: user.id,
          deletion_reason:
            reason,
        })
        .eq('id', targetId)

    updateError =
      result.error
  }

  if (
    action ===
    'restore_thread'
  ) {
    const result =
      await supabase
        .from('threads')
        .update({
          deleted_at: null,
          deleted_by: null,
          deletion_reason:
            null,
        })
        .eq('id', targetId)

    updateError =
      result.error
  }

  if (
    action ===
    'lock_thread'
  ) {
    const result =
      await supabase
        .from('threads')
        .update({
          is_locked: true,
          locked_at: now,
          locked_by: user.id,
        })
        .eq('id', targetId)

    updateError =
      result.error
  }

  if (
    action ===
    'unlock_thread'
  ) {
    const result =
      await supabase
        .from('threads')
        .update({
          is_locked: false,
          locked_at: null,
          locked_by: null,
        })
        .eq('id', targetId)

    updateError =
      result.error
  }

  /*
   * COMMENT ACTIONS
   */

  if (
    action ===
    'delete_comment'
  ) {
    const result =
      await supabase
        .from('comments')
        .update({
          deleted_at: now,
          deleted_by: user.id,
          deletion_reason:
            reason,
        })
        .eq('id', targetId)

    updateError =
      result.error
  }

  if (
    action ===
    'restore_comment'
  ) {
    const result =
      await supabase
        .from('comments')
        .update({
          deleted_at: null,
          deleted_by: null,
          deletion_reason:
            null,
        })
        .eq('id', targetId)

    updateError =
      result.error
  }

  if (updateError) {
    console.error(
      'Moderation action failed:',
      updateError,
    )

    return NextResponse.json(
      {
        error:
          'Moderation action failed.',
      },
      {
        status: 500,
      },
    )
  }

  /*
   * LOG ACTION
   */

  const logReason =
    reason ||
    (action ===
      'restore_thread'
      ? 'Restored'
      : action ===
          'restore_comment'
        ? 'Restored'
        : null)

  const {
    error: logError,
  } =
    await supabase
      .from(
        'moderation_actions',
      )
      .insert({
        moderator_id:
          user.id,
        action,
        target_type:
          targetType,
        target_id:
          targetId,
        reason:
          logReason,
      })

  if (logError) {
    console.error(
      'Moderation log failed:',
      logError,
    )
  }

  return NextResponse.json({
    success: true,
  })
}
