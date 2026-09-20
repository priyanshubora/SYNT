'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import CommentVoteButtons from './comment-vote-buttons'
import CommentActions from './comment-actions'

type Comment = {
  id: string
  thread_id: string
  author_id: string
  content: string
  created_at: string
  author_username: string
  author_avatar_url: string | null
  team_name: string | null
  score: number
  userVote: number | null
}

type CommentSectionProps = {
  threadId: string
  comments: Comment[]
  currentUserId: string | null
  totalComments: number
  currentPage: number
  totalPages: number
}

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()

  const seconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  )

  if (seconds < 60) {
    return 'just now'
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)

  if (days < 7) {
    return `${days}d ago`
  }

  return date.toLocaleDateString()
}

export default function CommentSection({
  threadId,
  comments,
  currentUserId,
  totalComments,
  currentPage,
  totalPages,
}: CommentSectionProps) {
  const router = useRouter()

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(null)

  const [commentText, setCommentText] =
    useState('')

  const [posting, setPosting] =
    useState(false)

  const [error, setError] =
    useState('')

  function resizeTextarea() {
    const textarea =
      textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = 'auto'

    textarea.style.height =
      `${textarea.scrollHeight}px`
  }

  async function submitComment() {
    const trimmedComment =
      commentText.trim()

    if (!trimmedComment) {
      setError(
        'Write something before posting.'
      )
      return
    }

    if (!currentUserId) {
      window.location.href =
        `/login?next=${encodeURIComponent(
          `/thread/${threadId}`
        )}`

      return
    }

    setPosting(true)
    setError('')

    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error(
        'Authentication check failed:',
        authError
      )

      setError(
        'You need to be logged in to comment.'
      )

      setPosting(false)
      return
    }

    const { error: insertError } =
      await supabase
        .from('comments')
        .insert({
          thread_id: threadId,
          author_id: user.id,
          content: trimmedComment,
        })

    if (insertError) {
      console.error(
        'Comment creation failed:',
        {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        }
      )

      setError(
        insertError.message ||
          'Unable to post comment.'
      )

      setPosting(false)
      return
    }

    setCommentText('')

    if (textareaRef.current) {
      textareaRef.current.style.height =
        'auto'
    }

    setPosting(false)

    router.refresh()
  }

  function pageUrl(page: number) {
    return `/thread/${threadId}?commentsPage=${page}`
  }

  const startPage = Math.max(
    1,
    currentPage - 2
  )

  const endPage = Math.min(
    totalPages,
    currentPage + 2
  )

  const pageNumbers: number[] = []

  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {
    pageNumbers.push(page)
  }

  const showingFrom =
    totalComments === 0
      ? 0
      : (currentPage - 1) * 30 + 1

  const showingTo =
    Math.min(
      currentPage * 30,
      totalComments
    )

  return (
    <section
      className="comment-section mt-5 overflow-hidden border"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div
        className="comment-header flex items-center justify-between border-b px-4 py-3"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-5">

          <button
            type="button"
            className="comment-tab active relative pb-1 text-sm font-bold"
            style={{
              color: 'var(--accent)',
            }}
          >
            Comments{' '}
            <span
              className="ml-1"
              style={{
                color:
                  'var(--text-muted)',
              }}
            >
              {totalComments}
            </span>

            <span
              className="absolute bottom-[-13px] left-0 h-[2px] w-full"
              style={{
                background:
                  'var(--accent)',
              }}
            />
          </button>

          <button
            type="button"
            className="comment-tab pb-1 text-sm font-semibold"
            style={{
              color:
                'var(--text-secondary)',
            }}
          >
            Newest
          </button>

          <button
            type="button"
            className="comment-tab hidden pb-1 text-sm font-semibold sm:block"
            style={{
              color:
                'var(--text-secondary)',
            }}
          >
            Top
          </button>

        </div>

        <button
          type="button"
          className="border px-3 py-1.5 text-xs font-semibold"
          style={{
            background:
              'var(--surface-secondary)',
            borderColor:
              'var(--border)',
            color:
              'var(--text-secondary)',
          }}
        >
          Latest ▾
        </button>
      </div>

      <div
        className="border-b p-4"
        style={{
          borderColor:
            'var(--border)',
        }}
      >
        {!currentUserId ? (
          <button
            type="button"
            onClick={() => {
              window.location.href =
                `/login?next=${encodeURIComponent(
                  `/thread/${threadId}`
                )}`
            }}
            className="w-full border px-4 py-3 text-left text-sm"
            style={{
              background:
                'var(--surface-secondary)',
              borderColor:
                'var(--border)',
              color:
                'var(--text-secondary)',
            }}
          >
            Log in to join the discussion...
          </button>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={(event) => {
                setCommentText(
                  event.target.value
                )

                resizeTextarea()

                if (error) {
                  setError('')
                }
              }}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  (event.ctrlKey ||
                    event.metaKey)
                ) {
                  event.preventDefault()
                  submitComment()
                }
              }}
              rows={1}
              placeholder="Join the discussion..."
              className="comment-input min-h-[44px] w-full resize-none overflow-hidden border px-3 py-3 text-sm outline-none"
              style={{
                background:
                  'var(--surface-secondary)',
                color:
                  'var(--text-primary)',
                borderColor:
                  'var(--border)',
              }}
            />

            {error && (
              <p className="mt-2 text-xs text-red-500">
                {error}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between">

              <span
                className="text-[10px]"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Ctrl + Enter to post
              </span>

              <button
                type="button"
                onClick={submitComment}
                disabled={posting}
                className="border px-4 py-2 text-xs font-bold"
                style={{
                  background:
                    'var(--accent)',
                  borderColor:
                    'var(--accent)',
                  color: '#ffffff',
                  opacity:
                    posting ? 0.6 : 1,
                }}
              >
                {posting
                  ? 'Posting...'
                  : 'Post'}
              </button>

            </div>
          </>
        )}
      </div>

      <div>

        {comments.length === 0 ? (
          <div
            className="px-5 py-10 text-center text-sm"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            No comments yet. Start the discussion.
          </div>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              id={`comment-${comment.id}`}
              className="border-b px-4 py-5 last:border-b-0 sm:px-5"
              style={{
                borderColor:
                  'var(--border)',
              }}
            >
              <div className="flex gap-3">

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
                  {comment.author_avatar_url ? (
                    <img
                      src={
                        comment.author_avatar_url
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    comment.author_username
                      .slice(0, 1)
                      .toUpperCase()
                  )}
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">

                    <span
                      className="text-sm font-bold"
                      style={{
                        color:
                          'var(--text-primary)',
                      }}
                    >
                      {comment.author_username}
                    </span>

                    {comment.team_name && (
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
                        {comment.team_name}
                      </span>
                    )}

                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      ·{' '}
                      {timeAgo(
                        comment.created_at
                      )}
                    </span>

                  </div>

                  <p
                    className="comment-text mt-2 whitespace-pre-wrap text-sm leading-6"
                    style={{
                      color:
                        'var(--text-secondary)',
                    }}
                  >
                    {comment.content}
                  </p>

                  <CommentActions
                    commentId={comment.id}
                    authorId={
                      comment.author_id
                    }
                    currentUserId={
                      currentUserId
                    }
                    content={
                      comment.content
                    }
                  />

                  <div className="mt-3 flex items-center gap-4">

                    <CommentVoteButtons
                      commentId={comment.id}
                      initialScore={
                        comment.score
                      }
                      initialUserVote={
                        comment.userVote
                      }
                    />

                    <button
                      type="button"
                      className="text-xs font-semibold"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      Reply
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/thread/${threadId}?commentsPage=${currentPage}#comment-${comment.id}`
                          )
                        } catch (
                          error
                        ) {
                          console.error(
                            'Comment link copy failed:',
                            error
                          )
                        }
                      }}
                      className="text-xs font-semibold"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      Share
                    </button>

                  </div>

                </div>
              </div>
            </article>
          ))
        )}

      </div>

      {/* COMMENT PAGINATION */}

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between border-t px-4 py-4 sm:px-5"
          style={{
            borderColor:
              'var(--border)',
          }}
        >

          {currentPage > 1 ? (
            <Link
              href={pageUrl(
                currentPage - 1
              )}
              scroll={true}
              className="border px-4 py-2 text-[10px] font-semibold transition hover:opacity-80"
              style={{
                background:
                  'var(--surface)',
                borderColor:
                  'var(--border)',
                color:
                  'var(--text-secondary)',
              }}
            >
              Previous
            </Link>
          ) : (
            <span
              className="border px-4 py-2 text-[10px] font-semibold opacity-40"
              style={{
                background:
                  'var(--surface-secondary)',
                borderColor:
                  'var(--border)',
                color:
                  'var(--text-muted)',
              }}
            >
              Previous
            </span>
          )}

          <div className="flex items-center gap-3">

            {startPage > 1 && (
              <>
                <Link
                  href={pageUrl(1)}
                  scroll={true}
                  className="text-[10px]"
                  style={{
                    color:
                      'var(--text-secondary)',
                  }}
                >
                  1
                </Link>

                {startPage > 2 && (
                  <span
                    className="text-[10px]"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    ...
                  </span>
                )}
              </>
            )}

            {pageNumbers.map(
              (number) => {
                const active =
                  number === currentPage

                return (
                  <Link
                    key={number}
                    href={pageUrl(number)}
                    scroll={true}
                    className="flex h-7 w-7 items-center justify-center text-[10px] font-bold"
                    style={{
                      background:
                        active
                          ? 'var(--accent)'
                          : 'transparent',
                      color:
                        active
                          ? '#ffffff'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {number}
                  </Link>
                )
              }
            )}

            {endPage < totalPages && (
              <>
                {endPage <
                  totalPages - 1 && (
                  <span
                    className="text-[10px]"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    ...
                  </span>
                )}

                <Link
                  href={pageUrl(
                    totalPages
                  )}
                  scroll={true}
                  className="text-[10px]"
                  style={{
                    color:
                      'var(--text-secondary)',
                  }}
                >
                  {totalPages}
                </Link>
              </>
            )}

          </div>

          {currentPage < totalPages ? (
            <Link
              href={pageUrl(
                currentPage + 1
              )}
              scroll={true}
              className="border px-4 py-2 text-[10px] font-semibold transition hover:opacity-80"
              style={{
                background:
                  'var(--surface)',
                borderColor:
                  'var(--border)',
                color:
                  'var(--text-secondary)',
              }}
            >
              Next
            </Link>
          ) : (
            <span
              className="border px-4 py-2 text-[10px] font-semibold opacity-40"
              style={{
                background:
                  'var(--surface-secondary)',
                borderColor:
                  'var(--border)',
                color:
                  'var(--text-muted)',
              }}
            >
              Next
            </span>
          )}

        </div>
      )}

      {totalComments > 0 && (
        <div
          className="pb-4 text-center text-[10px]"
          style={{
            color:
              'var(--text-muted)',
          }}
        >
          Showing {showingFrom}-
          {showingTo} of{' '}
          {totalComments} comments
        </div>
      )}

    </section>
  )
}