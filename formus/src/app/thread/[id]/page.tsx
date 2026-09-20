import Link from 'next/link'
import { notFound } from 'next/navigation'

import ForumShell from '@/components/forum/forum-shell'
import VoteButtons from '@/components/forum/vote-buttons'
import CommentSection from '@/components/forum/comment-section'
import ThreadActions from '@/components/forum/thread-actions'
import ShareButton from '@/components/forum/share-button'

import { createClient } from '@/lib/supabase/server'

const COMMENTS_PER_PAGE = 30

type ThreadPageProps = {
  params: Promise<{
    id: string
  }>

  searchParams: Promise<{
    commentsPage?: string
  }>
}

export default async function ThreadPage({
  params,
  searchParams,
}: ThreadPageProps) {
  const { id } = await params
  const { commentsPage } = await searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: thread, error: threadError } =
    await supabase
      .from('thread_stats')
      .select('*')
      .eq('id', id)
      .single()

  if (threadError || !thread) {
    notFound()
  }

  const { data: author } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, team_id')
    .eq('id', thread.author_id)
    .single()

  let authorTeamName: string | null = null

  if (author?.team_id) {
    const { data: team } = await supabase
      .from('teams')
      .select('name')
      .eq('id', author.team_id)
      .single()

    authorTeamName = team?.name ?? null
  }

  let userVote: number | null = null

  if (user) {
    const { data: vote } = await supabase
      .from('thread_votes')
      .select('value')
      .eq('thread_id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    userVote = vote?.value ?? null
  }

  /*
   * COMMENT PAGINATION
   */

  const requestedCommentsPage = Number(
    commentsPage ?? '1'
  )

  const currentCommentsPage =
    Number.isInteger(requestedCommentsPage) &&
    requestedCommentsPage > 0
      ? requestedCommentsPage
      : 1

  const {
    count: totalComments,
    error: commentCountError,
  } = await supabase
    .from('comments')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('thread_id', id)

  if (commentCountError) {
    console.error(
      'Comment count error:',
      commentCountError
    )
  }

  const totalCommentCount =
    totalComments ?? 0

  const totalCommentPages = Math.max(
    1,
    Math.ceil(
      totalCommentCount /
        COMMENTS_PER_PAGE
    )
  )

  const safeCommentsPage = Math.min(
    currentCommentsPage,
    totalCommentPages
  )

  const commentFrom =
    (safeCommentsPage - 1) *
    COMMENTS_PER_PAGE

  const commentTo =
    commentFrom +
    COMMENTS_PER_PAGE -
    1

  const { data: comments, error: commentsError } =
    await supabase
      .from('comments')
      .select(
        'id, thread_id, author_id, content, created_at'
      )
      .eq('thread_id', id)
      .order('created_at', {
        ascending: true,
      })
      .range(commentFrom, commentTo)

  if (commentsError) {
    console.error(
      'Comments loading error:',
      commentsError
    )
  }

  const commentList = comments ?? []

  const authorIds = [
    ...new Set(
      commentList.map(
        (comment) => comment.author_id
      )
    ),
  ]

  const commentProfiles =
    authorIds.length > 0
      ? (
          await supabase
            .from('profiles')
            .select(
              'id, username, avatar_url, team_id'
            )
            .in('id', authorIds)
        ).data ?? []
      : []

  const teamIds = [
    ...new Set(
      commentProfiles
        .map((profile) => profile.team_id)
        .filter(Boolean)
    ),
  ]

  const teams =
    teamIds.length > 0
      ? (
          await supabase
            .from('teams')
            .select('id, name')
            .in('id', teamIds)
        ).data ?? []
      : []

  const commentIds = commentList.map(
    (comment) => comment.id
  )

  const commentVotes =
    commentIds.length > 0
      ? (
          await supabase
            .from('comment_votes')
            .select(
              'comment_id, user_id, value'
            )
            .in('comment_id', commentIds)
        ).data ?? []
      : []

  const commentData = commentList.map(
    (comment) => {
      const profile =
        commentProfiles.find(
          (item) =>
            item.id === comment.author_id
        )

      const team = profile?.team_id
        ? teams.find(
            (item) =>
              item.id === profile.team_id
          )
        : null

      const votesForComment =
        commentVotes.filter(
          (vote) =>
            vote.comment_id === comment.id
        )

      const score =
        votesForComment.reduce(
          (total, vote) =>
            total + vote.value,
          0
        )

      const currentUserVote = user
        ? votesForComment.find(
            (vote) =>
              vote.user_id === user.id
          )?.value ?? null
        : null

      return {
        id: comment.id,
        thread_id: comment.thread_id,
        author_id: comment.author_id,
        content: comment.content,
        created_at: comment.created_at,
        author_username:
          profile?.username ??
          'User',
        author_avatar_url:
          profile?.avatar_url ??
          null,
        team_name:
          team?.name ?? null,
        score,
        userVote:
          currentUserVote,
      }
    }
  )

  const categoryName =
    thread.category_name ??
    'Discussion'

  return (
    <ForumShell
      activeSlug={thread.category_slug}
    >
      <div className="mx-auto max-w-[1000px]">

        <div className="mb-4">
          <Link
            href={`/category/${thread.category_slug}`}
            className="text-xs font-semibold transition hover:underline"
            style={{
              color: 'var(--text-secondary)',
            }}
          >
            ← Back to {categoryName}
          </Link>
        </div>

        <article
          className="border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="border-b px-5 py-5 sm:px-6"
            style={{
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">

              <Link
                href={`/category/${thread.category_slug}`}
                className="border px-2 py-1 text-[10px] font-bold uppercase"
                style={{
                  background:
                    'var(--accent-soft)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--accent)',
                }}
              >
                {categoryName}
              </Link>

              <span
                className="text-[10px]"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                {new Date(
                  thread.created_at
                ).toLocaleString()}
              </span>

              {thread.updated_at !==
                thread.created_at && (
                <span
                  className="text-[10px]"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  · edited
                </span>
              )}
            </div>

            <h1
              className="text-2xl font-bold leading-tight sm:text-3xl"
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              {thread.title}
            </h1>

            <div className="mt-4 flex items-center gap-3">

              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border text-xs font-bold"
                style={{
                  background:
                    'var(--accent-soft)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--accent)',
                }}
              >
                {author?.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (
                    author?.username ??
                    thread.author_username ??
                    'U'
                  )
                    .slice(0, 1)
                    .toUpperCase()
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">

                  <span
                    className="text-sm font-bold"
                    style={{
                      color:
                        'var(--text-primary)',
                    }}
                  >
                    {author?.username ??
                      thread.author_username ??
                      'User'}
                  </span>

                  {authorTeamName && (
                    <span
                      className="border px-1.5 py-0.5 text-[9px] font-bold"
                      style={{
                        background:
                          'var(--accent-soft)',
                        borderColor:
                          'var(--border)',
                        color:
                          'var(--accent)',
                      }}
                    >
                      {authorTeamName}
                    </span>
                  )}

                </div>

                <span
                  className="text-[10px]"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  Thread author
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-6">

            <div className="flex gap-5">

              <div className="shrink-0">
                <VoteButtons
                  threadId={thread.id}
                  initialScore={Number(
                    thread.score ?? 0
                  )}
                  initialUserVote={
                    userVote
                  }
                />
              </div>

              <div className="min-w-0 flex-1">

                <div
                  className="whitespace-pre-wrap text-sm leading-7 sm:text-[15px]"
                  style={{
                    color:
                      'var(--text-secondary)',
                  }}
                >
                  {thread.content}
                </div>

                <ThreadActions
                  threadId={thread.id}
                  authorId={
                    thread.author_id
                  }
                  currentUserId={
                    user?.id ?? null
                  }
                  title={thread.title}
                  content={thread.content}
                />

              </div>
            </div>
          </div>

          <div
            className="border-t px-5 py-3 sm:px-6"
            style={{
              background:
                'var(--surface-secondary)',
              borderColor:
                'var(--border)',
            }}
          >

            <div className="flex flex-wrap items-center gap-4 text-[10px]">

              <span
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                {totalCommentCount} comments
              </span>

              <span
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                {Number(
                  thread.vote_count ?? 0
                )}{' '}
                votes
              </span>

              <ShareButton />

            </div>
          </div>
        </article>

        <CommentSection
          threadId={thread.id}
          comments={commentData}
          currentUserId={
            user?.id ?? null
          }
          totalComments={
            totalCommentCount
          }
          currentPage={
            safeCommentsPage
          }
          totalPages={
            totalCommentPages
          }
        />

      </div>
    </ForumShell>
  )
}