import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { readJsonObject, UUID_PATTERN } from '@/lib/api/request'
import { enforceMutationRateLimit } from '@/lib/api/rate-limit'

const ALLOWED_ROLES = [
  'user',
  'moderator',
] as const

type AllowedRole =
  (typeof ALLOWED_ROLES)[number]

export async function PATCH(
  request: Request,
) {
  try {
    const supabase =
      await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error:
            'You must be logged in.',
        },
        {
          status: 401,
        },
      )
    }

    /* Check current user's role */

    const { data: currentProfile } =
      await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single()

    if (
      !currentProfile ||
      currentProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        {
          error:
            'Only admins can manage moderators.',
        },
        {
          status: 403,
        },
      )
    }

    const rateLimitResponse = await enforceMutationRateLimit(
      supabase,
      'admin.moderators',
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

    const targetUserId =
      typeof body.userId === 'string'
        ? body.userId
        : ''

    const newRole =
      typeof body.role === 'string'
        ? body.role
        : ''

    if (!UUID_PATTERN.test(targetUserId)) {
      return NextResponse.json(
        {
          error:
            'User ID is required.',
        },
        {
          status: 400,
        },
      )
    }

    if (
      !ALLOWED_ROLES.includes(
        newRole as AllowedRole,
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid role.',
        },
        {
          status: 400,
        },
      )
    }

    /* Prevent admin from changing their own role */

    if (targetUserId === user.id) {
      return NextResponse.json(
        {
          error:
            'You cannot change your own admin role.',
        },
        {
          status: 400,
        },
      )
    }

    /* Find target user */

    const { data: targetProfile } =
      await supabase
        .from('profiles')
        .select(
          'id, username, role',
        )
        .eq('id', targetUserId)
        .single()

    if (!targetProfile) {
      return NextResponse.json(
        {
          error:
            'User not found.',
        },
        {
          status: 404,
        },
      )
    }

    /* Never allow another admin to be demoted here */

    if (
      targetProfile.role ===
      'admin'
    ) {
      return NextResponse.json(
        {
          error:
            'Admin accounts cannot be changed from this page.',
        },
        {
          status: 400,
        },
      )
    }

    /* Update role */

    const { data: updatedProfile, error } =
      await supabase
        .from('profiles')
        .update({
          role: newRole,
        })
        .eq('id', targetUserId)
        .select(
          'id, username, role',
        )
        .single()

    if (error) {
      console.error(
        'Moderator role update failed:',
        error,
      )

      return NextResponse.json(
        {
          error:
          'Unable to update role.',
        },
        {
          status: 500,
        },
      )
    }

    return NextResponse.json({
      success: true,
      user: updatedProfile,
    })
  } catch (error) {
    console.error(
      'Moderator API error:',
      error,
    )

    return NextResponse.json(
      {
        error:
          'Internal server error.',
      },
      {
        status: 500,
      },
    )
  }
}
