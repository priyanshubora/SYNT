import Link from 'next/link'
import { redirect } from 'next/navigation'

import ForumShell from '@/components/forum/forum-shell'

import { createClient } from '@/lib/supabase/server'

type ProfilePageProps = {
  searchParams: Promise<{
    view?: string
  }>
}

export default async function ProfilePage({
  searchParams,
}: ProfilePageProps) {
  const { view } = await searchParams

  const activeView =
    view === 'comments' ||
    view === 'rank'
      ? view
      : 'threads'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/profile')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, username, avatar_url, team_id, reputation, post_count, last_seen_at, show_online_status'
    )
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login?next=/profile')
  }

  let teamName: string | null = null

  if (profile.team_id) {
    const { data: team } = await supabase
      .from('teams')
      .select('name')
      .eq('id', profile.team_id)
      .single()

    teamName = team?.name ?? null
  }

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .order('name', {
      ascending: true,
    })

  const { data: threads } = await supabase
    .from('thread_stats')
    .select(
      'id, title, category_name, category_slug, created_at, score, comment_count'
    )
    .eq('author_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(30)

  const { data: comments } = await supabase
    .from('comments')
    .select(
      'id, thread_id, content, created_at'
    )
    .eq('author_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(30)

  const lastSeen = profile.last_seen_at
    ? new Date(
        profile.last_seen_at
      ).getTime()
    : 0

  const isOnline =
    profile.show_online_status &&
    Date.now() - lastSeen <
      5 * 60 * 1000

  return (
    <ForumShell>
      <div className="mx-auto max-w-[1100px]">

        <div className="grid gap-5 md:grid-cols-[250px_minmax(0,1fr)]">

          {/* PROFILE SIDEBAR */}

          <aside
            className="border"
            style={{
              background:
                'var(--surface)',
              borderColor:
                'var(--border)',
            }}
          >

            {/* PROFILE HEADER */}

            <div
              className="border-b px-5 py-6 text-center"
              style={{
                borderColor:
                  'var(--border)',
              }}
            >

              <div className="relative mx-auto h-20 w-20">

                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="h-20 w-20 rounded-full border object-cover"
                    style={{
                      borderColor:
                        'var(--border)',
                    }}
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full border text-2xl font-bold"
                    style={{
                      background:
                        'var(--accent-soft)',
                      borderColor:
                        'var(--border)',
                      color:
                        'var(--accent)',
                    }}
                  >
                    {profile.username
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                {isOnline && (
                  <span
                    className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2"
                    style={{
                      background:
                        '#22c55e',
                      borderColor:
                        'var(--surface)',
                    }}
                  />
                )}

              </div>

              <h1
                className="mt-4 text-base font-bold"
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                {profile.username}
              </h1>

              {teamName && (
                <div
                  className="mx-auto mt-2 inline-block border px-2 py-1 text-[9px] font-bold"
                  style={{
                    background:
                      'var(--accent-soft)',
                    borderColor:
                      'var(--border)',
                    color:
                      'var(--accent)',
                  }}
                >
                  {teamName}
                </div>
              )}

              {profile.show_online_status && (
                <div
                  className="mt-2 text-[10px]"
                  style={{
                    color: isOnline
                      ? '#22c55e'
                      : 'var(--text-muted)',
                  }}
                >
                  {isOnline
                    ? 'Online'
                    : 'Offline'}
                </div>
              )}

            </div>

            {/* NAVIGATION */}

            <nav className="py-2">

              <div
                className="px-5 py-2 text-[9px] font-bold uppercase tracking-[0.15em]"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Profile
              </div>

              <Link
                href="/profile"
                className="flex items-center justify-between px-5 py-3 text-xs font-semibold"
                style={{
                  background:
                    activeView === 'threads'
                      ? 'var(--accent-soft)'
                      : 'transparent',
                  color:
                    activeView === 'threads'
                      ? 'var(--accent)'
                      : 'var(--text-secondary)',
                }}
              >
                <span>Threads</span>

                <span className="text-[10px]">
                  {profile.post_count ?? 0}
                </span>
              </Link>

              <Link
                href="/profile?view=comments"
                className="flex items-center justify-between px-5 py-3 text-xs font-semibold"
                style={{
                  background:
                    activeView === 'comments'
                      ? 'var(--accent-soft)'
                      : 'transparent',
                  color:
                    activeView === 'comments'
                      ? 'var(--accent)'
                      : 'var(--text-secondary)',
                }}
              >
                <span>Comments</span>

                <span className="text-[10px]">
                  {comments?.length ?? 0}
                </span>
              </Link>

              <Link
                href="/profile?view=rank"
                className="flex items-center justify-between px-5 py-3 text-xs font-semibold"
                style={{
                  background:
                    activeView === 'rank'
                      ? 'var(--accent-soft)'
                      : 'transparent',
                  color:
                    activeView === 'rank'
                      ? 'var(--accent)'
                      : 'var(--text-secondary)',
                }}
              >
                <span>Rank</span>

                <span
                  className="text-[10px]"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  —
                </span>
              </Link>

              <Link
                href="/profile/edit"
                className="block px-5 py-3 text-xs font-semibold"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                Edit Profile
              </Link>

              <div
                className="my-2 border-t"
                style={{
                  borderColor:
                    'var(--border)',
                }}
              />

              <Link
                href="/settings"
                className="block px-5 py-3 text-xs font-semibold"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                Settings
              </Link>

            </nav>

          </aside>

          {/* MAIN */}

          <main>

            <div className="mb-5">

              <h2
                className="text-lg font-bold"
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                {activeView === 'threads'
                  ? 'Threads'
                  : activeView === 'comments'
                    ? 'Comments'
                    : 'Rank'}
              </h2>

              <p
                className="mt-1 text-xs"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                {activeView === 'threads'
                  ? 'Threads you have created.'
                  : activeView === 'comments'
                    ? 'Comments you have posted.'
                    : 'Your current SNYT ranking.'}
              </p>

            </div>

            {/* STATS */}

            <div
              className="mb-5 grid grid-cols-3 border"
              style={{
                background:
                  'var(--surface)',
                borderColor:
                  'var(--border)',
              }}
            >

              <div
                className="border-r px-4 py-4"
                style={{
                  borderColor:
                    'var(--border)',
                }}
              >
                <div
                  className="text-[9px] font-bold uppercase"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  Threads
                </div>

                <div
                  className="mt-1 text-lg font-bold"
                  style={{
                    color:
                      'var(--text-primary)',
                  }}
                >
                  {profile.post_count ?? 0}
                </div>
              </div>

              <div
                className="border-r px-4 py-4"
                style={{
                  borderColor:
                    'var(--border)',
                }}
              >
                <div
                  className="text-[9px] font-bold uppercase"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  Reputation
                </div>

                <div
                  className="mt-1 text-lg font-bold"
                  style={{
                    color:
                      'var(--text-primary)',
                  }}
                >
                  {profile.reputation ?? 0}
                </div>
              </div>

              <div className="px-4 py-4">

                <div
                  className="text-[9px] font-bold uppercase"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  Rank
                </div>

                <div
                  className="mt-1 text-sm font-bold"
                  style={{
                    color:
                      'var(--accent)',
                  }}
                >
                  Unranked
                </div>

              </div>

            </div>

            {/* THREADS */}

            {activeView === 'threads' && (
              <section
                className="border"
                style={{
                  background:
                    'var(--surface)',
                  borderColor:
                    'var(--border)',
                }}
              >

                {threads &&
                threads.length > 0 ? (
                  threads.map(
                    (thread) => (
                      <Link
                        key={thread.id}
                        href={`/thread/${thread.id}`}
                        className="block border-b px-5 py-4 last:border-b-0"
                        style={{
                          borderColor:
                            'var(--border)',
                        }}
                      >

                        <div className="flex items-center justify-between gap-4">

                          <div className="min-w-0">

                            <div
                              className="truncate text-sm font-semibold"
                              style={{
                                color:
                                  'var(--text-primary)',
                              }}
                            >
                              {thread.title}
                            </div>

                            <div className="mt-1 flex flex-wrap gap-2 text-[10px]">

                              <span
                                style={{
                                  color:
                                    'var(--accent)',
                                }}
                              >
                                {thread.category_name}
                              </span>

                              <span
                                style={{
                                  color:
                                    'var(--text-muted)',
                                }}
                              >
                                ·
                              </span>

                              <span
                                style={{
                                  color:
                                    'var(--text-muted)',
                                }}
                              >
                                {thread.comment_count ?? 0}{' '}
                                comments
                              </span>

                              <span
                                style={{
                                  color:
                                    'var(--text-muted)',
                                }}
                              >
                                ·
                              </span>

                              <span
                                style={{
                                  color:
                                    'var(--text-muted)',
                                }}
                              >
                                {thread.score ?? 0}{' '}
                                score
                              </span>

                            </div>

                          </div>

                          <span
                            style={{
                              color:
                                'var(--text-muted)',
                            }}
                          >
                            →
                          </span>

                        </div>

                      </Link>
                    )
                  )
                ) : (
                  <div
                    className="px-5 py-12 text-center text-sm"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    You haven't created
                    any threads yet.
                  </div>
                )}

              </section>
            )}

            {/* COMMENTS */}

            {activeView === 'comments' && (
              <section
                className="border"
                style={{
                  background:
                    'var(--surface)',
                  borderColor:
                    'var(--border)',
                }}
              >

                {comments &&
                comments.length > 0 ? (
                  comments.map(
                    (comment) => (
                      <Link
                        key={comment.id}
                        href={`/thread/${comment.thread_id}#comment-${comment.id}`}
                        className="block border-b px-5 py-4 transition hover:bg-[var(--surface-secondary)] last:border-b-0"
                        style={{
                          borderColor:
                            'var(--border)',
                        }}
                      >

                        <div
                          className="text-sm leading-6"
                          style={{
                            color:
                              'var(--text-secondary)',
                          }}
                        >
                          {comment.content}
                        </div>

                        <div className="mt-2 text-[10px]">
                          <span
                            style={{
                              color:
                                'var(--accent)',
                            }}
                          >
                            Open thread
                          </span>

                          <span
                            className="mx-2"
                            style={{
                              color:
                                'var(--text-muted)',
                            }}
                          >
                            ·
                          </span>

                          <span
                            style={{
                              color:
                                'var(--text-muted)',
                            }}
                          >
                            {new Date(
                              comment.created_at
                            ).toLocaleString()}
                          </span>
                        </div>

                      </Link>
                    )
                  )
                ) : (
                  <div
                    className="px-5 py-12 text-center text-sm"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    You haven't posted
                    any comments yet.
                  </div>
                )}

              </section>
            )}

            {/* RANK */}

            {activeView === 'rank' && (
              <section
                className="border px-6 py-10 text-center"
                style={{
                  background:
                    'var(--surface)',
                  borderColor:
                    'var(--border)',
                }}
              >

                <div
                  className="text-2xl font-bold"
                  style={{
                    color:
                      'var(--accent)',
                  }}
                >
                  Unranked
                </div>

                <p
                  className="mx-auto mt-2 max-w-md text-xs leading-5"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  Ranking will be added
                  later. Your reputation,
                  activity, and community
                  participation can be used
                  when the ranking system is
                  built.
                </p>

              </section>
            )}

          </main>

        </div>
      </div>
    </ForumShell>
  )
}