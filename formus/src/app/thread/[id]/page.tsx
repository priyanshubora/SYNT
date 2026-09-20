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
    commentId?: string
  }>
}

type RawComment = {
  id: string
  thread_id: string
  author_id: string
  parent_id: string | null
  content: string
  created_at: string
  updated_at: string
}

function getRootCommentId(
  commentId: string,
  commentsById: Map<string, RawComment>,
) {
  const visited = new Set<string>()

  let currentId = commentId

  while (true) {
    if (visited.has(currentId)) {
      return commentId
    }

    visited.add(currentId)

    const current = commentsById.get(currentId)

    if (!current || !current.parent_id) {
      return current?.id ?? commentId
    }

    currentId = current.parent_id
  }
}

export default async function ThreadPage({
  params,
  searchParams,
}: ThreadPageProps) {
  const { id } = await params

  const {
    commentsPage,
    commentId,
  } = await searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  /*
   * THREAD
   */

  const {
    data: thread,
    error: threadError,
  } = await supabase
    .from('thread_stats')
    .select('*')
    .eq('id', id)
    .single()

  if (threadError || !thread) {
    notFound()
  }

  /*
   * THREAD VOTE
   */

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
   * LOAD ALL COMMENTS
   *
   * We load the comment tree first and
   * paginate only top-level comments.
   *
   * This prevents a reply from being
   * separated from its parent by pagination.
   */

  const {
    data: allComments,
    error: commentsError,
  } = await supabase
    .from('comments')
    .select(
      `
        id,
        thread_id,
        author_id,
        parent_id,
        content,
        created_at,
        updated_at
      `,
    )
    .eq('thread_id', id)
    .order('created_at', {
      ascending: true,
    })

  if (commentsError) {
    console.error(
      'Comments loading error:',
      commentsError,
    )
  }

  const rawComments: RawComment[] =
    allComments ?? []

  const totalCommentCount =
    rawComments.length

  /*
   * COMMENT TREE LOOKUP
   */

  const commentsById =
    new Map<string, RawComment>()

  for (const comment of rawComments) {
    commentsById.set(
      comment.id,
      comment,
    )
  }

  /*
   * TOP LEVEL COMMENTS
   */

  const rootComments =
    rawComments.filter(
      (comment) =>
        !comment.parent_id ||
        !commentsById.has(
          comment.parent_id,
        ),
    )

  const requestedCommentsPage =
    Number(commentsPage ?? '1')

  let currentCommentsPage =
    Number.isInteger(
      requestedCommentsPage,
    ) &&
    requestedCommentsPage > 0
      ? requestedCommentsPage
      : 1

  /*
   * If a shared comment ID was provided,
   * automatically calculate the page
   * containing its root comment.
   */

  if (commentId) {
    const targetComment =
      commentsById.get(commentId)

    if (targetComment) {
      const rootId =
        getRootCommentId(
          targetComment.id,
          commentsById,
        )

      const rootIndex =
        rootComments.findIndex(
          (comment) =>
            comment.id === rootId,
        )

      if (rootIndex >= 0) {
        currentCommentsPage =
          Math.floor(
            rootIndex /
              COMMENTS_PER_PAGE,
          ) + 1
      }
    }
  }

  const totalCommentPages =
    Math.max(
      1,
      Math.ceil(
        rootComments.length /
          COMMENTS_PER_PAGE,
      ),
    )

  const safeCommentsPage =
    Math.min(
      currentCommentsPage,
      totalCommentPages,
    )

  const commentFrom =
    (safeCommentsPage - 1) *
    COMMENTS_PER_PAGE

  const commentTo =
    commentFrom +
    COMMENTS_PER_PAGE

  const visibleRootComments =
    rootComments.slice(
      commentFrom,
      commentTo,
    )

  const visibleRootIds =
    new Set(
      visibleRootComments.map(
        (comment) => comment.id,
      ),
    )

  /*
   * INCLUDE EVERY DESCENDANT OF THE
   * VISIBLE ROOT COMMENTS.
   */

  const visibleComments =
    rawComments.filter((comment) => {
      const rootId =
        getRootCommentId(
          comment.id,
          commentsById,
        )

      return visibleRootIds.has(
        rootId,
      )
    })

  /*
   * COMMENT AUTHORS
   */

  const authorIds = [
    ...new Set(
      visibleComments.map(
        (comment) =>
          comment.author_id,
      ),
    ),
  ]

  const commentProfiles =
    authorIds.length > 0
      ? (
          await supabase
            .from('profiles')
            .select(
              'id, username, avatar_url, team_id',
            )
            .in('id', authorIds)
        ).data ?? []
      : []

  /*
   * COMMENT TEAMS
   */

  const teamIds = [
    ...new Set(
      commentProfiles
        .map(
          (profile) =>
            profile.team_id,
        )
        .filter(
          (
            teamId,
          ): teamId is string =>
            Boolean(teamId),
        ),
    ),
  ]

  const teams =
    teamIds.length > 0
      ? (
          await supabase
            .from('teams')
            .select(
              'id, name, logo_url',
            )
            .in(
              'id',
              teamIds,
            )
        ).data ?? []
      : []

  /*
   * COMMENT VOTES
   */

  const commentIds =
    visibleComments.map(
      (comment) => comment.id,
    )

  const commentVotes =
    commentIds.length > 0
      ? (
          await supabase
            .from('comment_votes')
            .select(
              'comment_id, user_id, value',
            )
            .in(
              'comment_id',
              commentIds,
            )
        ).data ?? []
      : []

  /*
   * BUILD CLIENT COMMENT DATA
   */

  const commentData =
    visibleComments.map(
      (comment) => {
        const profile =
          commentProfiles.find(
            (item) =>
              item.id ===
              comment.author_id,
          )

        const team =
          profile?.team_id
            ? teams.find(
                (item) =>
                  item.id ===
                  profile.team_id,
              )
            : null

        const votesForComment =
          commentVotes.filter(
            (vote) =>
              vote.comment_id ===
              comment.id,
          )

        const score =
          votesForComment.reduce(
            (total, vote) =>
              total + vote.value,
            0,
          )

        const currentUserVote =
          user
            ? votesForComment.find(
                (vote) =>
                  vote.user_id ===
                  user.id,
              )?.value ?? null
            : null

        return {
          id: comment.id,
          thread_id:
            comment.thread_id,
          author_id:
            comment.author_id,
          parent_id:
            comment.parent_id,
          content:
            comment.content,
          created_at:
            comment.created_at,
          updated_at:
            comment.updated_at,
          author_username:
            profile?.username ??
            'User',
          author_avatar_url:
            profile?.avatar_url ??
            null,
          team_name:
            team?.name ?? null,
          team_logo_url:
            team?.logo_url ?? null,
          score,
          userVote:
            currentUserVote,
        }
      },
    )

  const categoryName =
    thread.category_name ??
    'Discussion'

  const authorUsername =
    thread.author_username ??
    'User'

  const authorTeamName =
    thread.team_name ?? null

  const authorTeamLogoUrl =
    thread.team_logo_url ?? null

  return (
    <ForumShell
      activeSlug={
        thread.category_slug
      }
    >
      <div className="mx-auto max-w-[1000px]">

        {/* BACK LINK */}

        <div className="mb-4">
          <Link
            href={`/category/${thread.category_slug}`}
            className="text-xs font-semibold transition hover:underline"
            style={{
              color:
                'var(--text-secondary)',
            }}
          >
            ← Back to {categoryName}
          </Link>
        </div>

        {/* THREAD */}

        <article
          className="border"
          style={{
            background:
              'var(--surface)',
            borderColor:
              'var(--border)',
          }}
        >

          {/* THREAD HEADER */}

          <div
            className="border-b px-5 py-5 sm:px-6"
            style={{
              borderColor:
                'var(--border)',
            }}
          >
            {/* CATEGORY + TIME */}

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
                  thread.created_at,
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

            {/* TITLE */}

            <h1
              className="text-2xl font-bold leading-tight sm:text-3xl"
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              {thread.title}
            </h1>

            {/* AUTHOR */}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className="text-sm font-bold"
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                {authorUsername}
              </span>

              {authorTeamName && (
                <span
                  className="inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-[9px] font-bold"
                  style={{
                    background:
                      'var(--accent-soft)',
                    borderColor:
                      'var(--border)',
                    color:
                      'var(--accent)',
                  }}
                >
                  {authorTeamLogoUrl && (
                    <img
                      src={
                        authorTeamLogoUrl
                      }
                      alt=""
                      className="h-4 w-4 object-contain"
                    />
                  )}

                  <span>
                    {authorTeamName}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* THREAD CONTENT */}

          <div
            className="grid grid-cols-[minmax(0,1fr)_52px]"
          >
            {/* POST CONTENT */}

            <div className="min-w-0 px-5 py-6 sm:px-6">
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
                threadId={
                  thread.id
                }
                authorId={
                  thread.author_id
                }
                currentUserId={
                  user?.id ?? null
                }
                title={
                  thread.title
                }
                content={
                  thread.content
                }
              />
            </div>

            {/* VOTE RAIL */}

            <div
              className="flex justify-center border-l px-1 pt-5 sm:px-2"
              style={{
                borderColor:
                  'var(--border)',
              }}
            >
              <VoteButtons
                threadId={
                  thread.id
                }
                initialScore={Number(
                  thread.score ?? 0,
                )}
                initialUserVote={
                  userVote
                }
              />
            </div>
          </div>

          {/* THREAD META */}

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
                {totalCommentCount}{' '}
                comments
              </span>

              <span
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                {Number(
                  thread.vote_count ??
                    0,
                )}{' '}
                votes
              </span>

              <ShareButton
                title={
                  thread.title
                }
              />
            </div>
          </div>
        </article>

        {/* COMMENTS */}

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
          highlightedCommentId={
            commentId ?? null
          }
        />
      </div>
    </ForumShell>
  )
}