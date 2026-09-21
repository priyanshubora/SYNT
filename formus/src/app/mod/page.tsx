'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import ForumShell from '@/components/forum/forum-shell'
import { createClient } from '@/lib/supabase/client'

type Role =
  | 'moderator'
  | 'admin'

type Report = {
  id: string
  target_type: 'thread' | 'comment'
  target_id: string
  reason: string
  description: string | null
  status: string
  created_at: string
}

type Thread = {
  id: string
  title: string
  author_id: string
  created_at: string
  deleted_at: string | null
  is_locked: boolean
}

type Comment = {
  id: string
  thread_id: string
  author_id: string
  content: string
  created_at: string
  deleted_at: string | null
}

type Action = {
  id: string
  moderator_id: string
  action: string
  target_type: string
  target_id: string
  reason: string | null
  created_at: string
}

export default function ModPage() {
  const router =
    useRouter()

  const [role, setRole] =
    useState<Role | null>(null)

  const [reports, setReports] =
    useState<Report[]>([])

  const [threads, setThreads] =
    useState<Thread[]>([])

  const [comments, setComments] =
    useState<Comment[]>([])

  const [actions, setActions] =
    useState<Action[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [
    actionLoading,
    setActionLoading,
  ] = useState<string | null>(
    null,
  )

  async function loadDashboard() {
    setLoading(true)
    setError('')

    const supabase =
      createClient()

    const {
      data: { user },
    } =
      await supabase.auth.getUser()

    if (!user) {
      router.replace(
        '/login?next=/mod',
      )
      return
    }

    const { data: profile } =
      await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (
      !profile ||
      ![
        'moderator',
        'admin',
      ].includes(profile.role)
    ) {
      router.replace('/')
      return
    }

    setRole(
      profile.role as Role,
    )

    const [
      reportsResult,
      threadsResult,
      commentsResult,
      actionsResult,
    ] = await Promise.all([
      supabase
        .from('reports')
        .select(
          `
            id,
            target_type,
            target_id,
            reason,
            description,
            status,
            created_at
          `,
        )
        .eq(
          'status',
          'pending',
        )
        .order(
          'created_at',
          {
            ascending: false,
          },
        )
        .limit(50),

      supabase
        .from('threads')
        .select(
          `
            id,
            title,
            author_id,
            created_at,
            deleted_at,
            is_locked
          `,
        )
        .order(
          'created_at',
          {
            ascending: false,
          },
        )
        .limit(50),

      supabase
        .from('comments')
        .select(
          `
            id,
            thread_id,
            author_id,
            content,
            created_at,
            deleted_at
          `,
        )
        .order(
          'created_at',
          {
            ascending: false,
          },
        )
        .limit(50),

      supabase
        .from(
          'moderation_actions',
        )
        .select(
          `
            id,
            moderator_id,
            action,
            target_type,
            target_id,
            reason,
            created_at
          `,
        )
        .order(
          'created_at',
          {
            ascending: false,
          },
        )
        .limit(50),
    ])

    if (reportsResult.error) {
      setError(
        reportsResult.error.message,
      )
    }

    setReports(
      reportsResult.data ?? [],
    )

    setThreads(
      threadsResult.data ?? [],
    )

    setComments(
      commentsResult.data ?? [],
    )

    setActions(
      actionsResult.data ?? [],
    )

    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  async function moderationAction(
    action: string,
    targetType: 'thread' | 'comment',
    targetId: string,
  ) {
    const requiresReason =
      action.includes(
        'delete',
      ) ||
      action.includes(
        'lock',
      ) ||
      action.includes(
        'unlock',
      )

    let reason = ''

    if (requiresReason) {
      const input =
        window.prompt(
          'Reason for this action:',
        )

      if (!input?.trim()) {
        return
      }

      reason =
        input.trim()
    }

    setActionLoading(
      `${action}-${targetId}`,
    )

    try {
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
              action,
              targetType,
              targetId,
              reason,
            }),
          },
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Moderation action failed.',
        )
      }

      await loadDashboard()
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Moderation action failed.',
      )
    } finally {
      setActionLoading(null)
    }
  }

  async function resolveReport(
    reportId: string,
    status:
      | 'reviewed'
      | 'dismissed'
      | 'action_taken',
  ) {
    setActionLoading(
      `report-${reportId}`,
    )

    try {
      const response =
        await fetch(
          '/api/moderation/report',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              reportId,
              status,
            }),
          },
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to update report.',
        )
      }

      await loadDashboard()
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Unable to update report.',
      )
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <ForumShell>
        <div className="mx-auto max-w-[1200px] px-4 py-10 text-sm">
          Loading moderation...
        </div>
      </ForumShell>
    )
  }

  return (
    <ForumShell>
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <div className="mb-6">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{
              color:
                'var(--accent)',
            }}
          >
            SNYT Moderation
          </div>

          <div className="mt-1 flex items-center gap-2">
            <h1
              className="text-2xl font-bold"
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              Moderator Dashboard
            </h1>

            {role && (
              <span
                className="border px-2 py-1 text-[9px] font-bold uppercase"
                style={{
                  background:
                    'var(--accent-soft)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--accent)',
                }}
              >
                {role}
              </span>
            )}
          </div>

          <p
            className="mt-1 text-xs"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Manage reports,
            threads, comments and
            moderation history.
          </p>
        </div>

        {error && (
          <div className="mb-5 border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* REPORTS */}

        <section
          className="mb-6 border"
          style={{
            background:
              'var(--surface)',
            borderColor:
              'var(--border)',
          }}
        >
          <div
            className="border-b px-4 py-3"
            style={{
              borderColor:
                'var(--border)',
            }}
          >
            <h2
              className="text-sm font-bold"
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              Pending Reports
              <span
                className="ml-2 text-[10px]"
                style={{
                  color:
                    'var(--accent)',
                }}
              >
                {reports.length}
              </span>
            </h2>
          </div>

          {reports.length === 0 ? (
            <div
              className="px-4 py-8 text-center text-xs"
              style={{
                color:
                  'var(--text-muted)',
              }}
            >
              No pending reports.
            </div>
          ) : (
            <div>
              {reports.map(
                (report) => (
                  <div
                    key={report.id}
                    className="border-b px-4 py-4 last:border-b-0"
                    style={{
                      borderColor:
                        'var(--border)',
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="border px-1.5 py-0.5 text-[9px] font-bold uppercase"
                        style={{
                          background:
                            'var(--accent-soft)',
                          borderColor:
                            'var(--border)',
                          color:
                            'var(--accent)',
                        }}
                      >
                        {report.target_type}
                      </span>

                      <span
                        className="text-xs font-bold"
                        style={{
                          color:
                            'var(--text-primary)',
                        }}
                      >
                        {report.reason}
                      </span>

                      <span
                        className="text-[10px]"
                        style={{
                          color:
                            'var(--text-muted)',
                        }}
                      >
                        {new Date(
                          report.created_at,
                        ).toLocaleString()}
                      </span>
                    </div>

                    {report.description && (
                      <p
                        className="mt-2 text-xs"
                        style={{
                          color:
                            'var(--text-secondary)',
                        }}
                      >
                        {
                          report.description
                        }
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          resolveReport(
                            report.id,
                            'reviewed',
                          )
                        }
                        disabled={
                          actionLoading ===
                          `report-${report.id}`
                        }
                        className="border px-3 py-1.5 text-[10px] font-semibold"
                        style={{
                          borderColor:
                            'var(--border)',
                          color:
                            'var(--text-secondary)',
                        }}
                      >
                        Review
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          resolveReport(
                            report.id,
                            'dismissed',
                          )
                        }
                        disabled={
                          actionLoading ===
                          `report-${report.id}`
                        }
                        className="border px-3 py-1.5 text-[10px] font-semibold"
                        style={{
                          borderColor:
                            'var(--border)',
                          color:
                            'var(--text-secondary)',
                        }}
                      >
                        Dismiss
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const reason =
                            window.prompt(
                              'Reason for removing the reported content:',
                            )

                          if (
                            !reason?.trim()
                          ) {
                            return
                          }

                          setActionLoading(
                            `report-${report.id}`,
                          )

                          try {
                            const response =
                              await fetch(
                                '/api/moderation/action',
                                {
                                  method:
                                    'POST',
                                  headers:
                                    {
                                      'Content-Type':
                                        'application/json',
                                    },
                                  body: JSON.stringify(
                                    {
                                      action:
                                        report.target_type ===
                                        'thread'
                                          ? 'delete_thread'
                                          : 'delete_comment',
                                      targetType:
                                        report.target_type,
                                      targetId:
                                        report.target_id,
                                      reason:
                                        reason.trim(),
                                    },
                                  ),
                                },
                              )

                            const data =
                              await response.json()

                            if (
                              !response.ok
                            ) {
                              throw new Error(
                                data?.error ||
                                  'Moderation failed.',
                              )
                            }

                            await resolveReport(
                              report.id,
                              'action_taken',
                            )
                          } catch (error) {
                            window.alert(
                              error instanceof
                                Error
                                ? error.message
                                : 'Moderation failed.',
                            )
                          } finally {
                            setActionLoading(
                              null,
                            )
                          }
                        }}
                        disabled={
                          actionLoading ===
                          `report-${report.id}`
                        }
                        className="border border-red-300 px-3 py-1.5 text-[10px] font-semibold text-red-600 dark:border-red-900 dark:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* THREADS */}

        <section
          className="mb-6 border"
          style={{
            background:
              'var(--surface)',
            borderColor:
              'var(--border)',
          }}
        >
          <div
            className="border-b px-4 py-3"
            style={{
              borderColor:
                'var(--border)',
            }}
          >
            <h2
              className="text-sm font-bold"
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              Recent Threads
            </h2>
          </div>

          <div>
            {threads.map(
              (thread) => (
                <div
                  key={thread.id}
                  className="border-b px-4 py-4 last:border-b-0"
                  style={{
                    borderColor:
                      'var(--border)',
                  }}
                >
                  <div
                    className="text-sm font-semibold"
                    style={{
                      color:
                        'var(--text-primary)',
                    }}
                  >
                    {thread.title}
                  </div>

                  <div
                    className="mt-1 text-[10px]"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    {thread.deleted_at
                      ? 'Deleted'
                      : 'Active'}

                    {' · '}

                    {thread.is_locked
                      ? 'Locked'
                      : 'Unlocked'}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {thread.deleted_at ? (
                      <button
                        type="button"
                        onClick={() =>
                          moderationAction(
                            'restore_thread',
                            'thread',
                            thread.id,
                          )
                        }
                        className="border px-3 py-1.5 text-[10px] font-semibold"
                        style={{
                          borderColor:
                            'var(--border)',
                          color:
                            'var(--text-secondary)',
                        }}
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          moderationAction(
                            'delete_thread',
                            'thread',
                            thread.id,
                          )
                        }
                        className="border border-red-300 px-3 py-1.5 text-[10px] font-semibold text-red-600 dark:border-red-900 dark:text-red-400"
                      >
                        Delete
                      </button>
                    )}

                    {!thread.deleted_at && (
                      <button
                        type="button"
                        onClick={() =>
                          moderationAction(
                            thread.is_locked
                              ? 'unlock_thread'
                              : 'lock_thread',
                            'thread',
                            thread.id,
                          )
                        }
                        className="border px-3 py-1.5 text-[10px] font-semibold"
                        style={{
                          borderColor:
                            'var(--border)',
                          color:
                            'var(--text-secondary)',
                        }}
                      >
                        {thread.is_locked
                          ? 'Unlock'
                          : 'Lock'}
                      </button>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        {/* COMMENTS */}

        <section
          className="mb-6 border"
          style={{
            background:
              'var(--surface)',
            borderColor:
              'var(--border)',
          }}
        >
          <div
            className="border-b px-4 py-3"
            style={{
              borderColor:
                'var(--border)',
            }}
          >
            <h2
              className="text-sm font-bold"
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              Recent Comments
            </h2>
          </div>

          <div>
            {comments.map(
              (comment) => (
                <div
                  key={comment.id}
                  className="border-b px-4 py-4 last:border-b-0"
                  style={{
                    borderColor:
                      'var(--border)',
                  }}
                >
                  <p
                    className="line-clamp-3 text-xs"
                    style={{
                      color:
                        'var(--text-secondary)',
                    }}
                  >
                    {comment.content}
                  </p>

                  <div
                    className="mt-1 text-[10px]"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    {comment.deleted_at
                      ? 'Deleted'
                      : 'Active'}
                  </div>

                  <div className="mt-3">
                    {comment.deleted_at ? (
                      <button
                        type="button"
                        onClick={() =>
                          moderationAction(
                            'restore_comment',
                            'comment',
                            comment.id,
                          )
                        }
                        className="border px-3 py-1.5 text-[10px] font-semibold"
                        style={{
                          borderColor:
                            'var(--border)',
                          color:
                            'var(--text-secondary)',
                        }}
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          moderationAction(
                            'delete_comment',
                            'comment',
                            comment.id,
                          )
                        }
                        className="border border-red-300 px-3 py-1.5 text-[10px] font-semibold text-red-600 dark:border-red-900 dark:text-red-400"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        {/* HISTORY */}

        <section
          className="border"
          style={{
            background:
              'var(--surface)',
            borderColor:
              'var(--border)',
          }}
        >
          <div
            className="border-b px-4 py-3"
            style={{
              borderColor:
                'var(--border)',
            }}
          >
            <h2
              className="text-sm font-bold"
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              Moderation History
            </h2>
          </div>

          <div>
            {actions.map(
              (action) => (
                <div
                  key={action.id}
                  className="border-b px-4 py-3 last:border-b-0"
                  style={{
                    borderColor:
                      'var(--border)',
                  }}
                >
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="text-xs font-bold"
                      style={{
                        color:
                          'var(--text-primary)',
                      }}
                    >
                      {action.action}
                    </span>

                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      {action.target_type}
                    </span>

                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      {new Date(
                        action.created_at,
                      ).toLocaleString()}
                    </span>
                  </div>

                  {action.reason && (
                    <p
                      className="mt-1 text-[10px]"
                      style={{
                        color:
                          'var(--text-secondary)',
                      }}
                    >
                      {action.reason}
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
        </section>
      </div>
    </ForumShell>
  )
}