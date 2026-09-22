import Link from 'next/link'
import { redirect } from 'next/navigation'

import ForumShell from '@/components/forum/forum-shell'
import { createClient } from '@/lib/supabase/server'

type ProfilePageProps = {
  searchParams: Promise<{
    view?: string
    page?: string
  }>
}

type UserRole =
  | 'user'
  | 'moderator'
  | 'admin'

export default async function ProfilePage({
  searchParams,
}: ProfilePageProps) {
  const { view, page } = await searchParams

  const activeView =
    view === 'comments' || view === 'rank'
      ? view
      : 'threads'

  const PAGE_SIZE = 30
  const requestedPage = Number(page ?? '1')
  const currentPage =
    Number.isInteger(requestedPage) &&
      requestedPage > 0
      ? requestedPage
      : 1

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/profile')
  }

  const { data: profile } =
    await supabase
      .from('profiles')
      .select(
        `
          id,
          username,
          avatar_url,
          team_id,
          reputation,
          post_count,
          role
        `,
      )
      .eq('id', user.id)
      .single()

  if (!profile) {
    redirect('/login?next=/profile')
  }

  const role: UserRole =
    profile.role === 'admin'
      ? 'admin'
      : profile.role === 'moderator'
        ? 'moderator'
        : 'user'

  let teamName: string | null = null

  if (profile.team_id) {
    const { data: team } =
      await supabase
        .from('teams')
        .select('name')
        .eq('id', profile.team_id)
        .single()

    teamName = team?.name ?? null
  }

  const {
    count: totalThreadsCount,
  } = await supabase
    .from('thread_stats')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('author_id', user.id)

  const {
    count: totalCommentsCount,
  } = await supabase
    .from('comments')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('author_id', user.id)
    .is('deleted_at', null)

  const threadTotalPages = Math.max(
    1,
    Math.ceil((totalThreadsCount ?? 0) / PAGE_SIZE),
  )
  const commentTotalPages = Math.max(
    1,
    Math.ceil((totalCommentsCount ?? 0) / PAGE_SIZE),
  )

  const { data: threads } =
    await supabase
      .from('thread_stats')
      .select(
        `
          id,
          title,
          category_name,
          category_slug,
          created_at,
          score,
          comment_count
        `,
      )
      .eq('author_id', user.id)
      .order('created_at', {
        ascending: false,
      })
      .range(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE - 1,
      )

  const { data: comments } =
    await supabase
      .from('comments')
      .select(
        `
          id,
          thread_id,
          content,
          created_at
        `,
      )
      .eq('author_id', user.id)
      .is('deleted_at', null)
      .order('created_at', {
        ascending: false,
      })
      .range(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE - 1,
      )

  const isModerator =
    role === 'moderator' ||
    role === 'admin'

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
              <div className="mx-auto h-20 w-20">
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
                        '#eef6ee',
                      borderColor:
                        'var(--border)',
                      color:
                        '#74A662',
                    }}
                  >
                    {profile.username
                      .charAt(0)
                      .toUpperCase()}
                  </div>
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
                      '#eef6ee',
                    borderColor:
                      'var(--border)',
                    color:
                      '#74A662',
                  }}
                >
                  {teamName}
                </div>
              )}

              {role !== 'user' && (
                <div
                  className="mx-auto mt-2 inline-block border px-2 py-1 text-[9px] font-bold uppercase"
                  style={{
                    background:
                      '#eef6ee',
                    borderColor:
                      'var(--border)',
                    color:
                      '#74A662',
                  }}
                >
                  {role}
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
                      ? '#eef6ee'
                      : 'transparent',
                  color:
                    activeView === 'threads'
                      ? '#74A662'
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
                      ? '#eef6ee'
                      : 'transparent',
                  color:
                    activeView === 'comments'
                      ? '#74A662'
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
                      ? '#eef6ee'
                      : 'transparent',
                  color:
                    activeView === 'rank'
                      ? '#74A662'
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

              {/* MODERATION */}

              {isModerator && (
                <>
                  <div
                    className="my-2 border-t"
                    style={{
                      borderColor:
                        'var(--border)',
                    }}
                  />

                  <div
                    className="px-5 py-2 text-[9px] font-bold uppercase tracking-[0.15em]"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    Moderation
                  </div>

                  <Link
                    href="/mod"
                    className="flex items-center justify-between px-5 py-3 text-xs font-semibold"
                    style={{
                      color:
                        'var(--text-secondary)',
                    }}
                  >
                    <span>
                      Moderation
                    </span>

                    <span
                      style={{
                        color:
                          '#74A662',
                      }}
                    >
                      →
                    </span>
                  </Link>

                  {role === 'admin' && (
                    <Link
                      href="/admin/moderation"
                      className="flex items-center justify-between px-5 py-3 text-xs font-semibold"
                      style={{
                        color:
                          'var(--text-secondary)',
                      }}
                    >
                      <span>
                        Manage Moderators
                      </span>

                      <span
                        style={{
                          color:
                            '#74A662',
                        }}
                      >
                        →
                      </span>
                    </Link>
                  )}
                </>
              )}

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
                      '#74A662',
                  }}
                >
                  Coming Soon
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
                                    '#74A662',
                                }}
                              >
                                {
                                  thread.category_name
                                }
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
                                {thread.comment_count ??
                                  0}{' '}
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
                                {thread.score ??
                                  0}{' '}
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
                    ),
                  )
                ) : (
                  <div
                    className="px-5 py-12 text-center text-sm"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    You have not created
                    any threads yet.
                  </div>
                )}

                {threadTotalPages > 1 && (
                  <div className="flex items-center justify-between border-t px-5 py-3 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <Link
                      href={`/profile?view=threads&page=${Math.max(1, currentPage - 1)}`}
                      className={currentPage === 1 ? 'pointer-events-none opacity-40' : 'hover:text-[#74A662]'}
                    >
                      Prev
                    </Link>

                    <span style={{ color: 'var(--text-secondary)' }}>
                      Page {currentPage} / {threadTotalPages}
                    </span>

                    <Link
                      href={`/profile?view=threads&page=${Math.min(threadTotalPages, currentPage + 1)}`}
                      className={currentPage === threadTotalPages ? 'pointer-events-none opacity-40' : 'hover:text-[#74A662]'}
                    >
                      Next
                    </Link>
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
                          {
                            comment.content
                          }
                        </div>

                        <div className="mt-2 text-[10px]">
                          <span
                            style={{
                              color:
                                '#74A662',
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
                              comment.created_at,
                            ).toLocaleString()}
                          </span>
                        </div>
                      </Link>
                    ),
                  )
                ) : (
                  <div
                    className="px-5 py-12 text-center text-sm"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    You have not posted
                    any comments yet.
                  </div>
                )}

                {commentTotalPages > 1 && (
                  <div className="flex items-center justify-between border-t px-5 py-3 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <Link
                      href={`/profile?view=comments&page=${Math.max(1, currentPage - 1)}`}
                      className={currentPage === 1 ? 'pointer-events-none opacity-40' : 'hover:text-[#74A662]'}
                    >
                      Prev
                    </Link>

                    <span style={{ color: 'var(--text-secondary)' }}>
                      Page {currentPage} / {commentTotalPages}
                    </span>

                    <Link
                      href={`/profile?view=comments&page=${Math.min(commentTotalPages, currentPage + 1)}`}
                      className={currentPage === commentTotalPages ? 'pointer-events-none opacity-40' : 'hover:text-[#74A662]'}
                    >
                      Next
                    </Link>
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
                      '#74A662',
                  }}
                >
                  Coming Soon
                </div>

                <p
                  className="mx-auto mt-2 max-w-md text-xs leading-5"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  The ranking system is in
                  development and will be
                  available soon.
                </p>
              </section>
            )}
          </main>
        </div>
      </div>
    </ForumShell>
  )
}