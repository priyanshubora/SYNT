import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

  const [
    profileResult,
    threadsResult,
    commentsResult,
    threadVotesResult,
    commentVotesResult,
    notificationsResult,
    preferencesResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(),

    supabase
      .from('threads')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', {
        ascending: false,
      }),

    supabase
      .from('comments')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', {
        ascending: false,
      }),

    supabase
      .from('thread_votes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', {
        ascending: false,
      }),

    supabase
      .from('comment_votes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', {
        ascending: false,
      }),

    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', {
        ascending: false,
      }),

    supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const exportData = {
    exported_at:
      new Date().toISOString(),

    account: {
      id: user.id,
      email:
        user.email ?? null,
      created_at:
        user.created_at,
    },

    profile:
      profileResult.data ?? null,

    threads:
      threadsResult.data ?? [],

    comments:
      commentsResult.data ?? [],

    thread_votes:
      threadVotesResult.data ?? [],

    comment_votes:
      commentVotesResult.data ?? [],

    notifications:
      notificationsResult.data ?? [],

    notification_preferences:
      preferencesResult.data ?? null,
  }

  return new NextResponse(
    JSON.stringify(
      exportData,
      null,
      2,
    ),
    {
      status: 200,
      headers: {
        'Content-Type':
          'application/json',
        'Content-Disposition':
          'attachment; filename="snyt-account-data.json"',
        'Cache-Control':
          'no-store',
      },
    },
  )
}