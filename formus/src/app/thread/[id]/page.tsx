import Link from 'next/link'
import ForumShell from '@/components/forum/forum-shell'
import CommentForm from '@/components/forum/comment-form'
import CommentList from '@/components/forum/comment-list'
import VoteButtons from '@/components/forum/vote-buttons'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type ThreadPageProps = {
  params: Promise<{
    id: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function ThreadPage({
  params,
}: ThreadPageProps) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: thread, error: threadError } =
    await supabase
      .from('thread_stats')
      .select(`
        id,
        title,
        content,
        created_at,
        category_id,
        category_name,
        category_slug,
        author_id,
        author_username,
        team_name,
        score,
        vote_count,
        comment_count
      `)
      .eq('id', id)
      .maybeSingle()

  if (threadError || !thread) {
    notFound()
  }

  const { data: comments, error: commentsError } =
    await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        author:profiles(
          username,
          team:teams(
            name
          )
        )
      `)
      .eq('thread_id', id)
      .order('created_at', {
        ascending: true,
      })

  let currentUserVote: number | null = null

  if (user) {
    const { data: vote } = await supabase
      .from('thread_votes')
      .select('value')
      .eq('thread_id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    currentUserVote = vote?.value ?? null
  }

  return (
    <ForumShell>
      <article className="mx-auto max-w-4xl">
        <Link
          href={
            thread.category_slug
              ? `/category/${thread.category_slug}`
              : '/'
          }
          className="text-sm text-neutral-500 hover:text-white"
        >
          ← Back to {thread.category_name ?? 'FORMUS'}
        </Link>

        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            {thread.category_name && (
              <span className="rounded-full border border-neutral-700 px-3 py-1">
                {thread.category_name}
              </span>
            )}

            <span>•</span>

            <span>
              {new Date(
                thread.created_at
              ).toLocaleString()}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-tight">
            {thread.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-white">
              {thread.author_username ?? 'Unknown user'}
            </span>

            {thread.team_name && (
              <>
                <span className="text-neutral-600">
                  •
                </span>

                <span className="text-neutral-400">
                  {thread.team_name}
                </span>
              </>
            )}
          </div>

          <div className="my-8 h-px bg-neutral-800" />

          <div className="whitespace-pre-wrap text-base leading-7 text-neutral-200">
            {thread.content}
          </div>

          <div className="mt-8 border-t border-neutral-800 pt-6">
            <VoteButtons
              threadId={thread.id}
              initialScore={Number(thread.score ?? 0)}
              initialUserVote={currentUserVote}
            />
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Discussion
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {thread.comment_count ?? 0} comments
            </p>
          </div>

          {commentsError ? (
            <div className="rounded-xl border border-red-900 bg-red-950/30 p-5 text-red-300">
              Failed to load comments.
            </div>
          ) : (
            <CommentList comments={comments ?? []} />
          )}
        </section>

        <section className="mt-8">
          {user ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
              <h3 className="text-lg font-semibold">
                Join the discussion
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                Share your take.
              </p>

              <div className="mt-5">
                <CommentForm threadId={thread.id} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-800 p-6">
              <h3 className="text-lg font-semibold">
                Want to join the discussion?
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                Sign in with Google to comment.
              </p>

              <Link
                href={`/login?next=${encodeURIComponent(
                  `/thread/${thread.id}`
                )}`}
                className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
              >
                Continue with Google
              </Link>
            </div>
          )}
        </section>
      </article>
    </ForumShell>
  )
}