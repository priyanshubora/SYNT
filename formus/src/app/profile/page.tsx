import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get currently logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect the profile page
  if (!user) {
    redirect('/login?next=/profile')
  }

  // Get profile + team/flair
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      team_id,
      created_at,
      updated_at,
      teams (
        id,
        name,
        logo_url
      )
    `)
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Profile fetch error:', profileError)
  }

  // Get user's threads
  const { data: threads, error: threadsError } = await supabase
    .from('threads')
    .select(`
      id,
      title,
      content,
      created_at,
      category_id,
      categories (
        name,
        slug
      )
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  if (threadsError) {
    console.error('Threads fetch error:', threadsError)
  }

  // Get user's comments
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      thread_id,
      threads (
        id,
        title
      )
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  if (commentsError) {
    console.error('Comments fetch error:', commentsError)
  }

  // Get votes received on user's threads
  const { data: userThreads } = await supabase
    .from('threads')
    .select('id')
    .eq('author_id', user.id)

  const threadIds = (userThreads ?? []).map(
    (thread) => thread.id
  )

  let totalVotesReceived = 0

  if (threadIds.length > 0) {
    const { data: votes } = await supabase
      .from('thread_votes')
      .select('value')
      .in('thread_id', threadIds)

    totalVotesReceived = (votes ?? []).reduce(
      (total, vote) => total + vote.value,
      0
    )
  }

  const totalThreads = threads?.length ?? 0
  const totalComments = comments?.length ?? 0

  const username =
    profile?.username ??
    user.user_metadata?.user_name ??
    user.email?.split('@')[0] ??
    'User'

  const avatarUrl =
    user.user_metadata?.avatar_url ??
    user.user_metadata?.picture ??
    null

  const team = Array.isArray(profile?.teams)
    ? profile.teams[0]
    : profile?.teams

  const joinDate = new Date(
    profile?.created_at ?? user.created_at
  ).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-[var(--page-background)]">

      {/* TOP PROFILE HEADER */}

      <section className="border-b border-[var(--border)] bg-[var(--surface)]">

        <div className="mx-auto max-w-[1000px] px-5 py-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            {/* USER */}

            <div className="flex items-center gap-5">

              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  className="h-20 w-20 rounded-full border border-[var(--border)] object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#286ff1] text-2xl font-bold text-white">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}

              <div>

                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                  {username}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2">

                  {team?.name && (
                    <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-[10px] font-semibold text-[#2869e8] dark:bg-[#26344a] dark:text-[#83aeff]">
                      {team.name}
                    </span>
                  )}

                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Joined {joinDate}
                  </span>

                </div>

              </div>

            </div>

            {/* LOGOUT */}

            <form action="/auth/signout" method="POST">

              <button
                type="submit"
                className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-[11px] font-semibold text-red-500 transition hover:bg-red-50 dark:border-red-900 dark:bg-[#222] dark:hover:bg-[#2b1c1c]"
              >
                Log out
              </button>

            </form>

          </div>

        </div>

      </section>

      {/* PROFILE CONTENT */}

      <div className="mx-auto max-w-[1000px] px-5 py-6">

        {/* STATISTICS */}

        <div className="grid grid-cols-3 gap-3">

          <div
            className="rounded-xl border p-4"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">
              Threads
            </p>

            <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
              {totalThreads}
            </p>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">
              Comments
            </p>

            <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
              {totalComments}
            </p>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">
              Votes Received
            </p>

            <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
              {totalVotesReceived}
            </p>
          </div>

        </div>

        {/* NAVIGATION */}

        <div className="mt-8 border-b border-[var(--border)]">

          <nav className="flex gap-6">

            <Link
              href="/profile"
              className="border-b-2 border-[#286ff1] px-1 pb-3 text-[11px] font-semibold text-[#286ff1]"
            >
              Overview
            </Link>

            <Link
              href="/profile?tab=threads"
              className="px-1 pb-3 text-[11px] text-[var(--text-secondary)] hover:text-[#286ff1]"
            >
              Threads
            </Link>

            <Link
              href="/profile?tab=comments"
              className="px-1 pb-3 text-[11px] text-[var(--text-secondary)] hover:text-[#286ff1]"
            >
              Comments
            </Link>

          </nav>

        </div>

        {/* USER THREADS */}

        <section className="mt-6">

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Your Threads
            </h2>

            <Link
              href="/new"
              className="rounded-lg bg-[#286ff1] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#1e5fd6]"
            >
              + New Thread
            </Link>

          </div>

          {totalThreads === 0 ? (

            <div
              className="rounded-xl border px-5 py-10 text-center text-sm"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              You haven't created any threads yet.
            </div>

          ) : (

            <div
              className="overflow-hidden rounded-xl border"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >

              {threads?.map((thread) => {

                const category = Array.isArray(thread.categories)
                  ? thread.categories[0]
                  : thread.categories

                return (
                  <Link
                    key={thread.id}
                    href={`/thread/${thread.id}`}
                    className="block border-b border-[var(--border)] px-5 py-4 last:border-b-0 hover:bg-[var(--surface-secondary)]"
                  >

                    <div className="mb-1 flex items-center gap-2 text-[9px] text-[var(--text-secondary)]">

                      {category?.name && (
                        <span className="rounded bg-[#eef4ff] px-2 py-1 text-[#2869e8] dark:bg-[#26344a] dark:text-[#83aeff]">
                          {category.name}
                        </span>
                      )}

                      <span>
                        {new Date(
                          thread.created_at
                        ).toLocaleDateString('en-IN')}
                      </span>

                    </div>

                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      {thread.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-[11px] text-[var(--text-secondary)]">
                      {thread.content}
                    </p>

                  </Link>
                )
              })}

            </div>

          )}

        </section>

        {/* COMMENTS */}

        <section className="mt-8">

          <h2 className="mb-4 text-sm font-bold text-[var(--text-primary)]">
            Your Comments
          </h2>

          {totalComments === 0 ? (

            <div
              className="rounded-xl border px-5 py-10 text-center text-sm"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              You haven't commented yet.
            </div>

          ) : (

            <div
              className="overflow-hidden rounded-xl border"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >

              {comments?.map((comment) => {

                const thread = Array.isArray(comment.threads)
                  ? comment.threads[0]
                  : comment.threads

                return (
                  <Link
                    key={comment.id}
                    href={`/thread/${comment.thread_id}`}
                    className="block border-b border-[var(--border)] px-5 py-4 last:border-b-0 hover:bg-[var(--surface-secondary)]"
                  >

                    <p className="text-[11px] leading-relaxed text-[var(--text-primary)]">
                      {comment.content}
                    </p>

                    {thread?.title && (
                      <p className="mt-2 text-[10px] font-semibold text-[#286ff1]">
                        On: {thread.title}
                      </p>
                    )}

                    <p className="mt-1 text-[9px] text-[var(--text-secondary)]">
                      {new Date(
                        comment.created_at
                      ).toLocaleDateString('en-IN')}
                    </p>

                  </Link>
                )
              })}

            </div>

          )}

        </section>

      </div>

    </main>
  )
}