'use client'
import Link from 'next/link'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

import CommentVoteButtons from './comment-vote-buttons'
import CommentActions from './comment-actions'
import ReportButton from '@/components/forum/report-button'
type Comment = {
  id: string
  thread_id: string
  author_id: string
  parent_id: string | null
  content: string
  created_at: string
  updated_at: string
  comment_number: number
  author_username: string
  author_avatar_url: string | null
  team_name: string | null
  team_logo_url: string | null
  author_role: 'user' | 'moderator' | 'admin'
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
  highlightedCommentId: string | null
  isLocked: boolean
  currentUserRole: 'user' | 'moderator' | 'admin'
}

function timeAgo(dateString: string) {
  const date = new Date(
    dateString,
  )

  const now = new Date()

  const seconds = Math.floor(
    (now.getTime() -
      date.getTime()) /
      1000,
  )

  if (seconds < 60) {
    return 'just now'
  }

  const minutes = Math.floor(
    seconds / 60,
  )

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(
    minutes / 60,
  )

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(
    hours / 24,
  )

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
  highlightedCommentId,
  isLocked,
  currentUserRole,
}: CommentSectionProps) {
  const router = useRouter()

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null,
    )

  const replyTextareaRef =
    useRef<HTMLTextAreaElement | null>(
      null,
    )

  const [commentText, setCommentText] =
    useState('')

  const [replyText, setReplyText] =
    useState('')

  const [replyToId, setReplyToId] =
    useState<string | null>(null)

  const [posting, setPosting] =
    useState(false)

  const [replyPosting, setReplyPosting] =
    useState(false)

  const [error, setError] =
    useState('')

  const [replyError, setReplyError] =
    useState('')

  const [shareStatus, setShareStatus] =
    useState<string | null>(null)

  const [
    highlightedId,
    setHighlightedId,
  ] = useState<string | null>(
    highlightedCommentId,
  )

  /*
   * SCROLL TO SHARED COMMENT
   */

  useEffect(() => {
    const targetId =
      highlightedCommentId

    if (!targetId) {
      return
    }

    const element =
      document.getElementById(
        `comment-${targetId}`,
      )

    if (!element) {
      return
    }

    const timer =
      window.setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })

        setHighlightedId(
          targetId,
        )
      }, 150)

    const clearTimer =
      window.setTimeout(() => {
        setHighlightedId(null)
      }, 3500)

    return () => {
      window.clearTimeout(
        timer,
      )

      window.clearTimeout(
        clearTimer,
      )
    }
  }, [
    highlightedCommentId,
  ])

  /*
   * TEXTAREA RESIZING
   */

  function resizeTextarea(
    textarea: HTMLTextAreaElement | null,
  ) {
    if (!textarea) {
      return
    }

    textarea.style.height =
      'auto'

    textarea.style.height =
      `${textarea.scrollHeight}px`
  }

  /*
   * LOGIN
   */

  function loginForComment(
    commentId?: string,
  ) {
    const hash =
      commentId
        ? `#comment-${commentId}`
        : ''

    const nextUrl =
      `/thread/${threadId}${hash}`

    router.push(
      `/login?next=${encodeURIComponent(
        nextUrl,
      )}`,
    )
  }

  /*
   * NORMAL COMMENT
   */

  async function submitComment() {
    const trimmedComment =
      commentText.trim()

    if (!trimmedComment) {
      setError(
        'Write something before posting.',
      )

      return
    }

    if (!currentUserId) {
      loginForComment()
      return
    }

    setPosting(true)
    setError('')

    const supabase =
      createClient()

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser()

    if (authError || !user) {
      setError(
        'You need to be logged in to comment.',
      )

      setPosting(false)
      return
    }

    const {
      error: insertError,
    } = await supabase
      .from('comments')
      .insert({
        thread_id: threadId,
        author_id: user.id,
        parent_id: null,
        content:
          trimmedComment,
      })

    if (insertError) {
      console.error(
        'Comment creation failed:',
        insertError,
      )

      setError(
        insertError.message ||
          'Unable to post comment.',
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

  /*
   * START REPLY
   */

  function startReply(
    commentId: string,
  ) {
    if (!currentUserId) {
      loginForComment(
        commentId,
      )

      return
    }

    setReplyToId(
      commentId,
    )

    setReplyText('')
    setReplyError('')

    window.setTimeout(() => {
      replyTextareaRef.current?.focus()
    }, 50)
  }

  /*
   * CANCEL REPLY
   */

  function cancelReply() {
    setReplyToId(null)
    setReplyText('')
    setReplyError('')

    if (replyTextareaRef.current) {
      replyTextareaRef.current.style.height =
        'auto'
    }
  }

  /*
   * SUBMIT REPLY
   */

  async function submitReply(
    parentId: string,
  ) {
    const trimmedReply =
      replyText.trim()

    if (!trimmedReply) {
      setReplyError(
        'Write something before posting.',
      )

      return
    }

    if (!currentUserId) {
      loginForComment(
        parentId,
      )

      return
    }

    setReplyPosting(true)
    setReplyError('')

    const supabase =
      createClient()

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser()

    if (authError || !user) {
      setReplyError(
        'You need to be logged in to reply.',
      )

      setReplyPosting(false)
      return
    }

    const {
      error: insertError,
    } = await supabase
      .from('comments')
      .insert({
        thread_id: threadId,
        author_id: user.id,
        parent_id: parentId,
        content:
          trimmedReply,
      })

    if (insertError) {
      console.error(
        'Reply creation failed:',
        insertError,
      )

      setReplyError(
        insertError.message ||
          'Unable to post reply.',
      )

      setReplyPosting(false)
      return
    }

    setReplyText('')
    setReplyToId(null)
    setReplyPosting(false)

    if (replyTextareaRef.current) {
      replyTextareaRef.current.style.height =
        'auto'
    }

    router.refresh()
  }

  /*
   * SHARE COMMENT
   */

  async function shareComment(
    comment: Comment,
  ) {
    const url =
      `${window.location.origin}/thread/${threadId}?commentId=${encodeURIComponent(
        comment.id,
      )}#comment-${comment.id}`

    try {
      if (
        typeof navigator.share ===
        'function'
      ) {
        await navigator.share({
          title:
            `Comment by ${comment.author_username}`,
          text:
            comment.content.slice(
              0,
              140,
            ),
          url,
        })

        setShareStatus(
          comment.id,
        )
      } else {
        await navigator.clipboard.writeText(
          url,
        )

        setShareStatus(
          comment.id,
        )
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return
      }

      try {
        await navigator.clipboard.writeText(
          url,
        )

        setShareStatus(
          comment.id,
        )
      } catch (copyError) {
        console.error(
          'Comment sharing failed:',
          error,
          copyError,
        )
      }
    }

    window.setTimeout(() => {
      setShareStatus(
        (current) =>
          current === comment.id
            ? null
            : current,
      )
    }, 1800)
  }

  /*
   * PAGINATION
   */

  function pageUrl(
    page: number,
  ) {
    return `/thread/${threadId}?commentsPage=${page}`
  }

  const startPage =
    Math.max(
      1,
      currentPage - 2,
    )

  const endPage =
    Math.min(
      totalPages,
      currentPage + 2,
    )

  const pageNumbers: number[] =
    []

  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {
    pageNumbers.push(page)
  }

  /*
   * BUILD CHILD MAP AND EXPANDED STATE
   */

  const childrenByParent =
    new Map<
      string | null,
      Comment[]
    >()

  for (const comment of comments) {
    const parentId =
      comment.parent_id

    const existing =
      childrenByParent.get(
        parentId,
      ) ?? []

    existing.push(comment)

    childrenByParent.set(
      parentId,
      existing,
    )
  }

  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  function toggleReplies(commentId: string) {
    setExpandedReplies((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
  }

  /*
   * GET ALL NESTED REPLIES (Instagram Style - Flatten All Levels)
   */

  function getAllReplies(commentId: string): Comment[] {
    const result: Comment[] = []
    const directReplies = childrenByParent.get(commentId) ?? []
    
    for (const reply of directReplies) {
      result.push(reply)
      // Recursively get nested replies
      const nestedReplies = getAllReplies(reply.id)
      result.push(...nestedReplies)
    }
    
    return result
  }

  /*
   * GET PARENT COMMENT USERNAME
   */

  function getParentUsername(parentId: string | null): string | null {
    if (!parentId) return null
    const parent = comments.find(c => c.id === parentId)
    return parent?.author_username ?? null
  }

  /*
   * GET ROOT COMMENT ID (for nested replies)
   */

  function getRootCommentId(commentId: string): string {
    const comment = comments.find(c => c.id === commentId)
    if (!comment || !comment.parent_id) return commentId
    // Recursively find root
    return getRootCommentId(comment.parent_id)
  }

  /*
   * RENDER COMMENT TREE (Instagram Style)
   */

  function renderComments(
    parentId: string | null,
    depth = 0,
  ): React.ReactNode {
    const children =
      childrenByParent.get(
        parentId,
      ) ?? []

    return children.map(
      (comment) => {
        const isReply =
          Boolean(
            comment.parent_id,
          )

        const isHighlighted =
          highlightedId ===
          comment.id

        // Get ALL replies (including nested) to this comment
        const allReplies = !isReply ? getAllReplies(comment.id) : []
        const replyCount = allReplies.length
        const isExpanded = expandedReplies.has(comment.id)

        return (
          <div
            key={comment.id}
            id={`comment-${comment.id}`}
          >
            <article
              className={`border-b px-4 py-5 last:border-b-0 sm:px-5 ${
                isHighlighted
                  ? 'ring-2 ring-[var(--accent)] ring-inset'
                  : ''
              }`}
              style={{
                borderColor:
                  'var(--border)',
                background:
                  isHighlighted
                    ? 'var(--accent-soft)'
                    : 'transparent',
              }}
            >
              <div className="flex gap-3">
                {!isReply && (
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold"
                    style={{
                      background:
                        'transparent',
                      borderColor:
                        '#74A662',
                      color:
                        '#74A662',
                    }}
                  >
                    #{comment.comment_number}
                  </div>
                )}

                <div className={`min-w-0 flex-1 ${isReply ? 'ml-9 sm:ml-12' : ''}`}>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className="text-sm font-bold"
                      style={{
                        color:
                          'var(--text-primary)',
                      }}
                    >
                      {
                        comment.author_username
                      }
                    </span>

                    {comment.author_role !== 'user' ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="border px-1.5 py-0.5 text-[8px] font-bold uppercase"
                          style={{
                            background: 'var(--accent-soft)',
                            borderColor: 'var(--border)',
                            color: 'var(--accent)',
                          }}
                        >
                          {comment.author_role}
                        </span>

                        {comment.team_name && (
                          <span
                            className="inline-flex items-center gap-1.5 whitespace-nowrap border px-1.5 py-0.5 text-[9px] font-bold"
                            style={{
                              background:
                                'var(--accent-soft)',
                              borderColor:
                                'var(--border)',
                              color:
                                'var(--accent)',
                            }}
                          >
                            {comment.team_logo_url && (
                              <img
                                src={
                                  comment.team_logo_url
                                }
                                alt=""
                                className="h-4 w-4 object-contain"
                              />
                            )}

                            <span>
                              {
                                comment.team_name
                              }
                            </span>
                          </span>
                        )}
                      </span>
                    ) : (
                      comment.team_name && (
                        <span
                          className="inline-flex items-center gap-1.5 whitespace-nowrap border px-1.5 py-0.5 text-[9px] font-bold"
                          style={{
                            background:
                              'var(--accent-soft)',
                            borderColor:
                              'var(--border)',
                            color:
                              'var(--accent)',
                          }}
                        >
                          {comment.team_logo_url && (
                            <img
                              src={
                                comment.team_logo_url
                              }
                              alt=""
                              className="h-4 w-4 object-contain"
                            />
                          )}

                          <span>
                            {
                              comment.team_name
                            }
                          </span>
                        </span>
                      )
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
                        comment.created_at,
                      )}
                    </span>

                    {comment.updated_at !==
                      comment.created_at && (
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

                  {/* CONTENT */}

                  <p
                    className="comment-text mt-2 whitespace-pre-wrap text-sm leading-6"
                    style={{
                      color:
                        'var(--text-secondary)',
                    }}
                  >
                    {comment.content}
                  </p>

                  {/* EDIT / DELETE */}

                  <CommentActions
                    commentId={
                      comment.id
                    }
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

                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    {currentUserRole !== 'user' && (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            const reason =
                              window.prompt(
                                'Reason for deleting this comment:',
                              )

                            if (!reason?.trim()) {
                              return
                            }

                            const response =
                              await fetch(
                                '/api/moderation/action',
                                {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type':
                                      'application/json',
                                  },
                                  body: JSON.stringify({
                                    action:
                                      'delete_comment',
                                    targetType:
                                      'comment',
                                    targetId:
                                      comment.id,
                                    reason:
                                      reason.trim(),
                                  }),
                                },
                              )

                            if (!response.ok) {
                              const data =
                                await response
                                  .json()
                                  .catch(
                                    () => null,
                                  )

                              window.alert(
                                data?.error ||
                                  'Moderation action failed.',
                              )

                              return
                            }

                            router.refresh()
                          }}
                          className="text-[10px] font-semibold text-red-500 hover:underline"
                        >
                          Mod: Delete
                        </button>
                      </>
                    )}

                    <ReportButton
                      targetType="comment"
                      targetId={comment.id}
                      currentUserId={
                        currentUserId
                      }
                    />
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">

                    <CommentVoteButtons
                      commentId={
                        comment.id
                      }
                      initialScore={
                        comment.score
                      }
                      initialUserVote={
                        comment.userVote
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        startReply(
                          comment.id,
                        )
                      }
                      disabled={isLocked}
                      className="text-xs font-semibold transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      {isLocked ? 'Locked' : 'Reply'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        shareComment(
                          comment,
                        )
                      }
                      className="text-xs font-semibold transition hover:opacity-70"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      {shareStatus ===
                      comment.id
                        ? 'Copied'
                        : 'Share'}
                    </button>

                  </div>

                  {/* VIEW ALL REPLIES BUTTON (Instagram Style) */}

                  {!isReply && replyCount > 0 && !isExpanded && (
                    <button
                      type="button"
                      onClick={() => toggleReplies(comment.id)}
                      className="mt-3 flex items-center gap-2 text-xs font-semibold hover:opacity-70"
                      style={{
                        color: 'var(--text-muted)',
                      }}
                    >
                      <div
                        className="h-[1px] w-6"
                        style={{
                          background: 'var(--border)',
                        }}
                      />
                      View all {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </button>
                  )}

                  {/* HIDE REPLIES BUTTON */}

                  {!isReply && replyCount > 0 && isExpanded && (
                    <button
                      type="button"
                      onClick={() => toggleReplies(comment.id)}
                      className="mt-3 flex items-center gap-2 text-xs font-semibold hover:opacity-70"
                      style={{
                        color: 'var(--text-muted)',
                      }}
                    >
                      <div
                        className="h-[1px] w-6"
                        style={{
                          background: 'var(--border)',
                        }}
                      />
                      Hide replies
                    </button>
                  )}

                  {/* REPLY BOX */}

                  {replyToId ===
                    comment.id && (
                    <div
                      className="mt-4 border p-3"
                      style={{
                        background:
                          'var(--surface-secondary)',
                        borderColor:
                          'var(--border)',
                      }}
                    >

                      <div
                        className="mb-2 text-[10px] font-semibold"
                        style={{
                          color:
                            'var(--text-muted)',
                        }}
                      >
                        Replying to{' '}
                        {
                          comment.author_username
                        }
                      </div>

                      <textarea
                        ref={
                          replyTextareaRef
                        }
                        value={
                          replyText
                        }
                        onChange={(
                          event,
                        ) => {
                          setReplyText(
                            event.target
                              .value,
                          )

                          resizeTextarea(
                            event.target,
                          )

                          if (
                            replyError
                          ) {
                            setReplyError(
                              '',
                            )
                          }
                        }}
                        onKeyDown={(
                          event,
                        ) => {
                          if (
                            event.key ===
                              'Enter' &&
                            (event.ctrlKey ||
                              event.metaKey)
                          ) {
                            event.preventDefault()

                            submitReply(
                              comment.id,
                            )
                          }
                        }}
                        rows={1}
                        autoFocus
                        placeholder="Write a reply..."
                        className="comment-input min-h-[42px] w-full resize-none overflow-hidden border px-3 py-2.5 text-sm outline-none"
                        style={{
                          background:
                            'var(--surface)',
                          color:
                            'var(--text-primary)',
                          borderColor:
                            'var(--border)',
                        }}
                      />

                      {replyError && (
                        <p className="mt-2 text-xs text-red-500">
                          {
                            replyError
                          }
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
                          Ctrl + Enter to reply
                        </span>

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={
                              cancelReply
                            }
                            className="border px-3 py-1.5 text-[10px] font-semibold"
                            style={{
                              background:
                                'var(--surface)',
                              borderColor:
                                'var(--border)',
                              color:
                                'var(--text-secondary)',
                            }}
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              submitReply(
                                comment.id,
                              )
                            }
                            disabled={
                              replyPosting
                            }
                            className="border px-3 py-1.5 text-[10px] font-bold"
                            style={{
                              background:
                                'var(--accent)',
                              borderColor:
                                'var(--accent)',
                              color:
                                '#ffffff',
                              opacity:
                                replyPosting
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {replyPosting
                              ? 'Posting...'
                              : 'Reply'}
                          </button>

                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </article>

            {/* EXPANDED REPLIES (Instagram Style - Flat Indentation) */}

            {!isReply && isExpanded && allReplies.length > 0 && (
              <div>
                {allReplies.map((reply) => {
                  const replyIsHighlighted = highlightedId === reply.id
                  const replyToUsername = getParentUsername(reply.parent_id)

                  return (
                    <article
                      key={reply.id}
                      id={`comment-${reply.id}`}
                      className={`border-b px-4 py-5 last:border-b-0 sm:px-5 ${
                        replyIsHighlighted
                          ? 'ring-2 ring-[var(--accent)] ring-inset'
                          : ''
                      }`}
                      style={{
                        borderColor: 'var(--border)',
                        background: replyIsHighlighted
                          ? 'var(--accent-soft)'
                          : 'transparent',
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="min-w-0 flex-1 ml-9 sm:ml-12">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span
                              className="text-sm font-bold"
                              style={{
                                color: 'var(--text-primary)',
                              }}
                            >
                              {reply.author_username}
                            </span>

                            {reply.author_role !== 'user' ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className="border px-1.5 py-0.5 text-[8px] font-bold uppercase"
                                  style={{
                                    background: 'var(--accent-soft)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--accent)',
                                  }}
                                >
                                  {reply.author_role}
                                </span>

                                {reply.team_name && (
                                  <span
                                    className="inline-flex items-center gap-1.5 whitespace-nowrap border px-1.5 py-0.5 text-[9px] font-bold"
                                    style={{
                                      background: 'var(--accent-soft)',
                                      borderColor: 'var(--border)',
                                      color: 'var(--accent)',
                                    }}
                                  >
                                    {reply.team_logo_url && (
                                      <img
                                        src={reply.team_logo_url}
                                        alt=""
                                        className="h-4 w-4 object-contain"
                                      />
                                    )}
                                    <span>{reply.team_name}</span>
                                  </span>
                                )}
                              </span>
                            ) : (
                              reply.team_name && (
                                <span
                                  className="inline-flex items-center gap-1.5 whitespace-nowrap border px-1.5 py-0.5 text-[9px] font-bold"
                                  style={{
                                    background: 'var(--accent-soft)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--accent)',
                                  }}
                                >
                                  {reply.team_logo_url && (
                                    <img
                                      src={reply.team_logo_url}
                                      alt=""
                                      className="h-4 w-4 object-contain"
                                    />
                                  )}
                                  <span>{reply.team_name}</span>
                                </span>
                              )
                            )}

                            <span
                              className="text-[10px]"
                              style={{
                                color: 'var(--text-muted)',
                              }}
                            >
                              · {timeAgo(reply.created_at)}
                            </span>

                            {reply.updated_at !== reply.created_at && (
                              <span
                                className="text-[10px]"
                                style={{
                                  color: 'var(--text-muted)',
                                }}
                              >
                                · edited
                              </span>
                            )}
                          </div>

                          {/* CONTENT */}

                          <p
                            className="comment-text mt-2 whitespace-pre-wrap text-sm leading-6"
                            style={{
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {replyToUsername && (
                              <span
                                className="font-semibold"
                                style={{
                                  color: 'var(--text-primary)',
                                }}
                              >
                                @{replyToUsername}{' '}
                              </span>
                            )}
                            {reply.content}
                          </p>

                          {/* EDIT / DELETE */}

                          <CommentActions
                            commentId={reply.id}
                            authorId={reply.author_id}
                            currentUserId={currentUserId}
                            content={reply.content}
                          />

                          <div className="mt-2 flex flex-wrap items-center gap-4">
                            {currentUserRole !== 'user' && (
                              <>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const reason = window.prompt(
                                      'Reason for deleting this comment:',
                                    )

                                    if (!reason?.trim()) {
                                      return
                                    }

                                    const response = await fetch(
                                      '/api/moderation/action',
                                      {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          action: 'delete_comment',
                                          targetType: 'comment',
                                          targetId: reply.id,
                                          reason: reason.trim(),
                                        }),
                                      },
                                    )

                                    if (!response.ok) {
                                      const data = await response
                                        .json()
                                        .catch(() => null)

                                      window.alert(
                                        data?.error ||
                                          'Moderation action failed.',
                                      )

                                      return
                                    }

                                    router.refresh()
                                  }}
                                  className="text-[10px] font-semibold text-red-500 hover:underline"
                                >
                                  Mod: Delete
                                </button>
                              </>
                            )}

                            <ReportButton
                              targetType="comment"
                              targetId={reply.id}
                              currentUserId={currentUserId}
                            />
                          </div>

                          {/* ACTIONS */}

                          <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                            <CommentVoteButtons
                              commentId={reply.id}
                              initialScore={reply.score}
                              initialUserVote={reply.userVote}
                            />

                            <button
                              type="button"
                              onClick={() => startReply(comment.id)}
                              disabled={isLocked}
                              className="text-xs font-semibold transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                              style={{
                                color: 'var(--text-muted)',
                              }}
                            >
                              {isLocked ? 'Locked' : 'Reply'}
                            </button>

                            <button
                              type="button"
                              onClick={() => shareComment(reply)}
                              className="text-xs font-semibold transition hover:opacity-70"
                              style={{
                                color: 'var(--text-muted)',
                              }}
                            >
                              {shareStatus === reply.id ? 'Copied' : 'Share'}
                            </button>
                          </div>

                          {/* REPLY BOX FOR NESTED REPLY */}

                          {replyToId === reply.id && (
                            <div
                              className="mt-4 border p-3"
                              style={{
                                background: 'var(--surface-secondary)',
                                borderColor: 'var(--border)',
                              }}
                            >
                              <div
                                className="mb-2 text-[10px] font-semibold"
                                style={{
                                  color: 'var(--text-muted)',
                                }}
                              >
                                Replying to {reply.author_username}
                              </div>

                              <textarea
                                ref={replyTextareaRef}
                                value={replyText}
                                onChange={(event) => {
                                  setReplyText(event.target.value)
                                  resizeTextarea(event.target)
                                  if (replyError) {
                                    setReplyError('')
                                  }
                                }}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === 'Enter' &&
                                    (event.ctrlKey || event.metaKey)
                                  ) {
                                    event.preventDefault()
                                    submitReply(comment.id)
                                  }
                                }}
                                rows={1}
                                autoFocus
                                placeholder="Write a reply..."
                                className="comment-input min-h-[42px] w-full resize-none overflow-hidden border px-3 py-2.5 text-sm outline-none"
                                style={{
                                  background: 'var(--surface)',
                                  color: 'var(--text-primary)',
                                  borderColor: 'var(--border)',
                                }}
                              />

                              {replyError && (
                                <p className="mt-2 text-xs text-red-500">
                                  {replyError}
                                </p>
                              )}

                              <div className="mt-3 flex items-center justify-between">
                                <span
                                  className="text-[10px]"
                                  style={{
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  Ctrl + Enter to reply
                                </span>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={cancelReply}
                                    className="border px-3 py-1.5 text-[10px] font-semibold"
                                    style={{
                                      background: 'var(--surface)',
                                      borderColor: 'var(--border)',
                                      color: 'var(--text-secondary)',
                                    }}
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => submitReply(comment.id)}
                                    disabled={replyPosting}
                                    className="border px-3 py-1.5 text-[10px] font-bold"
                                    style={{
                                      background: 'var(--accent)',
                                      borderColor: 'var(--accent)',
                                      color: '#ffffff',
                                      opacity: replyPosting ? 0.6 : 1,
                                    }}
                                  >
                                    {replyPosting ? 'Posting...' : 'Reply'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        )
      },
    )
  }

  const showingFrom =
    totalComments === 0
      ? 0
      : Math.min(
          (currentPage - 1) *
            30 +
            1,
          totalComments,
        )

  const showingTo =
    totalComments === 0
      ? 0
      : Math.min(
          currentPage * 30,
          totalComments,
        )

  return (
    <section
      className="comment-section mt-5 overflow-hidden border"
      style={{
        background:
          'var(--surface)',
        borderColor:
          'var(--border)',
      }}
    >

      {/* COMMENT HEADER */}

      <div
        className="comment-header flex items-center justify-between border-b px-4 py-3"
        style={{
          background:
            'var(--surface)',
          borderColor:
            'var(--border)',
        }}
      >
        <div className="flex items-center gap-5">

          <button
            type="button"
            className="comment-tab active relative pb-1 text-sm font-bold"
            style={{
              color:
                'var(--accent)',
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

      {/* NEW COMMENT */}

      <div
        className="border-b p-4"
        style={{
          borderColor:
            'var(--border)',
        }}
      >

        {isLocked ? (
          <div
            className="border px-4 py-3 text-sm"
            style={{
              background: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            🔒 This discussion is locked. New comments and replies are disabled.
          </div>
        ) : !currentUserId ? (
          <button
            type="button"
            onClick={() =>
              loginForComment()
            }
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
              ref={
                textareaRef
              }
              value={
                commentText
              }
              onChange={(
                event,
              ) => {
                setCommentText(
                  event.target
                    .value,
                )

                resizeTextarea(
                  event.target,
                )

                if (error) {
                  setError('')
                }
              }}
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                    'Enter' &&
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
                onClick={
                  submitComment
                }
                disabled={
                  posting
                }
                className="border px-4 py-2 text-xs font-bold"
                style={{
                  background:
                    'var(--accent)',
                  borderColor:
                    'var(--accent)',
                  color:
                    '#ffffff',
                  opacity:
                    posting
                      ? 0.6
                      : 1,
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

      {/* COMMENTS */}

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
          <div>
            {renderComments(
              null,
              0,
            )}
          </div>
        )}

      </div>

      {/* PAGINATION */}

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
                currentPage - 1,
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
                  href={pageUrl(
                    1,
                  )}
                  scroll={true}
                  className="text-[10px]"
                  style={{
                    color:
                      'var(--text-secondary)',
                  }}
                >
                  1
                </Link>

                {startPage >
                  2 && (
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
                  number ===
                  currentPage

                return (
                  <Link
                    key={
                      number
                    }
                    href={pageUrl(
                      number,
                    )}
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
              },
            )}

            {endPage <
              totalPages && (
              <>
                {endPage <
                  totalPages -
                    1 && (
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
                    totalPages,
                  )}
                  scroll={true}
                  className="text-[10px]"
                  style={{
                    color:
                      'var(--text-secondary)',
                  }}
                >
                  {
                    totalPages
                  }
                </Link>
              </>
            )}

          </div>

          {currentPage <
          totalPages ? (
            <Link
              href={pageUrl(
                currentPage + 1,
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

      {/* COUNT */}

      {totalComments > 0 && (
        <div
          className="pb-4 text-center text-[10px]"
          style={{
            color:
              'var(--text-muted)',
          }}
        >
          Showing{' '}
          {showingFrom}-
          {showingTo} of{' '}
          {totalComments}{' '}
          comments
        </div>
      )}

    </section>
  )
}