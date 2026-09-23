import Link from 'next/link'
import {
  notFound,
  redirect,
} from 'next/navigation'

import ForumShell from '@/components/forum/forum-shell'
import RealtimeRefresh from '@/components/forum/realtime-refresh'
import VoteButtons from '@/components/forum/vote-buttons'
import CommentSection from '@/components/forum/comment-section'
import ThreadActions from '@/components/forum/thread-actions'
import ShareButton from '@/components/forum/share-button'
import ReportButton from '@/components/forum/report-button'

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
  comment_number: number
}

type CommentPageData = {
  comments: RawComment[]
  totalCommentCount: number
  currentPage: number
  totalPages: number
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

  const threadPromise = supabase
    .from('thread_stats')
    .select('*')
    .eq('id', id)
    .single()

  const requestedCommentPage = Number(commentsPage)
  const targetCommentId =
    commentId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(commentId)
      ? commentId
      : null

  const commentPagePromise = supabase.rpc('get_thread_comment_page', {
    p_thread_id: id,
    p_page_size: COMMENTS_PER_PAGE,
    p_page:
      Number.isInteger(requestedCommentPage) && requestedCommentPage > 0
        ? requestedCommentPage
        : 1,
    p_comment_id: targetCommentId,
  })

  const [userResult, threadResult, commentPageResult] = await Promise.all([
    supabase.auth.getUser(),
    threadPromise,
    commentPagePromise,
  ])

  const user = userResult.data.user
  const { data: thread, error: threadError } = threadResult

  if (threadError || !thread) {
    notFound()
  }

  if (thread.deleted_at) {
    redirect('/')
  }

  const commentPage = commentPageResult.data as CommentPageData | null
  if (commentPageResult.error) {
    console.error('Comments loading error:', commentPageResult.error)
  }

  const rawComments = commentPage?.comments ?? []
  const visibleComments = rawComments
  const totalCommentCount = commentPage?.totalCommentCount ?? 0
  const safeCommentsPage = commentPage?.currentPage ?? 1
  const totalCommentPages = commentPage?.totalPages ?? 1

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

  const profilesPromise =
    authorIds.length > 0
      ? supabase
          .from('profiles')
          .select(
            'id, username, avatar_url, team_id, role',
          )
          .in('id', authorIds)
      : Promise.resolve({ data: [] })

  const commentIds = visibleComments.map(
    (comment) => comment.id,
  )

  const votesPromise =
    commentIds.length > 0
      ? supabase
          .from('comment_votes')
          .select(
            'comment_id, user_id, value',
          )
          .in('comment_id', commentIds)
      : Promise.resolve({ data: [] })

  const threadVotePromise = user
    ? supabase
        .from('thread_votes')
        .select('value')
        .eq('thread_id', id)
        .eq('user_id', user.id)
        .maybeSingle()
    : Promise.resolve({ data: null })

  const currentProfilePromise = user
    ? supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
    : Promise.resolve({ data: null })

  const [
    profilesResult,
    votesResult,
    threadVoteResult,
    currentProfileResult,
  ] =
    await Promise.all([
      profilesPromise,
      votesPromise,
      threadVotePromise,
      currentProfilePromise,
    ])

  const userVote = threadVoteResult.data?.value ?? null

  const commentProfiles =
    profilesResult.data ?? []

  const profilesById = new Map(
    commentProfiles.map((profile) => [profile.id, profile]),
  )

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

  const teamsResult =
    teamIds.length > 0
      ? await supabase
          .from('teams')
          .select(
            'id, name, logo_url',
          )
          .in('id', teamIds)
      : { data: [] }

  /*
   * COMMENT TEAMS
   */

  const teams = teamsResult.data ?? []
  const teamsById = new Map(teams.map((team) => [team.id, team]))

  /*
   * COMMENT VOTES
   */

  const commentVotes = votesResult.data ?? []
  const voteScoreByCommentId = new Map<string, number>()
  const userVoteByCommentId = new Map<string, number>()

  for (const vote of commentVotes) {
    voteScoreByCommentId.set(
      vote.comment_id,
      (voteScoreByCommentId.get(vote.comment_id) ?? 0) + vote.value,
    )

    if (user && vote.user_id === user.id) {
      userVoteByCommentId.set(vote.comment_id, vote.value)
    }
  }

  /*
   * BUILD CLIENT COMMENT DATA
   */

  const commentData =
    visibleComments.map(
      (comment) => {
        const profile = profilesById.get(comment.author_id)

        const team =
          profile?.team_id
            ? teamsById.get(profile.team_id)
            : null

        const score = voteScoreByCommentId.get(comment.id) ?? 0
        const currentUserVote = userVoteByCommentId.get(comment.id) ?? null

        const authorRole: 'user' | 'moderator' | 'admin' =
          profile?.role === 'admin'
            ? 'admin'
            : profile?.role === 'moderator'
              ? 'moderator'
              : 'user'

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
          comment_number: comment.comment_number,
          author_username:
            profile?.username ??
            'User',
          author_avatar_url:
            profile?.avatar_url ??
            null,
          author_role:
            authorRole,
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

  const authorRole =
    thread.author_role === 'admin'
      ? 'admin'
      : thread.author_role === 'moderator'
        ? 'moderator'
        : 'user'

  const authorTeamName =
    thread.team_name ?? null

  const authorTeamLogoUrl =
    thread.team_logo_url ?? null

  let currentUserRole:
    | 'user'
    | 'moderator'
    | 'admin' = 'user'

  if (currentProfileResult.data?.role === 'admin') {
    currentUserRole = 'admin'
  } else if (currentProfileResult.data?.role === 'moderator') {
    currentUserRole = 'moderator'
  }

  return (
    <>
      <RealtimeRefresh
        channelName={`thread-live-updates:${id}`}
        ignoreVoteUpdatesForUserId={user?.id ?? null}
        tableFilters={[
          { table: 'threads', filter: `id=eq.${id}` },
          { table: 'comments', filter: `thread_id=eq.${id}` },
          { table: 'thread_votes', filter: `thread_id=eq.${id}` },
          ...(commentIds.length > 0
            ? [{ table: 'comment_votes', filter: `comment_id=in.(${commentIds.join(',')})` }]
            : []),
        ]}
      />

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
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-sm font-bold"
                  style={{
                    color:
                      'var(--text-primary)',
                  }}
                >
                  {authorUsername}
                </span>

                {authorRole !== 'user' && (
                  <span
                    className="border px-1.5 py-0.5 text-[8px] font-bold uppercase"
                    style={{
                      background:
                        'var(--accent-soft)',
                      borderColor:
                        'var(--border)',
                      color:
                        'var(--accent)',
                    }}
                  >
                    {authorRole}
                  </span>
                )}
              </div>

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

          {thread.is_locked && (
            <div
              className="border-b px-5 py-2.5 text-[11px] font-semibold sm:px-6"
              style={{
                background: 'var(--accent-soft)',
                borderColor: 'var(--border)',
                color: 'var(--accent)',
              }}
            >
              🔒 This discussion is locked. New comments and replies are disabled.
            </div>
          )}

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
                currentUserId={user?.id ?? null}
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

              <ReportButton
                targetType="thread"
                targetId={thread.id}
                currentUserId={
                  user?.id ?? null
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
          isLocked={
            Boolean(thread.is_locked)
          }
          currentUserRole={
            currentUserRole
          }
        />
      </div>
      </ForumShell>
    </>
  )
}
