'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

type Notification = {
  id: string
  type:
    | 'upvote'
    | 'mention'
    | 'reply'
  thread_id: string | null
  comment_id: string | null
  message: string
  is_read: boolean
  created_at: string
}

function getNotificationIcon(
  type: Notification['type'],
) {
  if (type === 'upvote') {
    return '↑'
  }

  if (type === 'mention') {
    return '@'
  }

  return '↩'
}

function getNotificationColor(
  type: Notification['type'],
) {
  if (type === 'upvote') {
    return '#286ff1'
  }

  if (type === 'mention') {
    return '#8b5cf6'
  }

  return '#16a34a'
}

function formatTime(
  timestamp: string,
) {
  const date =
    new Date(timestamp)

  const now = new Date()

  const difference =
    now.getTime() -
    date.getTime()

  const minutes =
    Math.floor(
      difference / 60000,
    )

  if (minutes < 1) {
    return 'now'
  }

  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours =
    Math.floor(
      minutes / 60,
    )

  if (hours < 24) {
    return `${hours}h`
  }

  const days =
    Math.floor(
      hours / 24,
    )

  if (days < 7) {
    return `${days}d`
  }

  return date.toLocaleDateString()
}

export default function NotificationBell() {
  const [open, setOpen] =
    useState(false)

  const [notifications, setNotifications] =
    useState<Notification[]>([])

  const [loading, setLoading] =
    useState(false)

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read,
    ).length

  async function loadNotifications() {
    setLoading(true)

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    const { data, error } =
      await supabase
        .from('notifications')
        .select(
          `
            id,
            type,
            thread_id,
            comment_id,
            message,
            is_read,
            created_at
          `,
        )
        .eq('user_id', user.id)
        .order('created_at', {
          ascending: false,
        })
        .limit(30)

    if (error) {
      console.error(
        'Notifications loading failed:',
        error,
      )

      setLoading(false)
      return
    }

    setNotifications(
      data ?? [],
    )

    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()

    const interval =
      window.setInterval(
        loadNotifications,
        30000,
      )

    return () =>
      window.clearInterval(
        interval,
      )
  }, [])

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    )

    return () =>
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      )
  }, [])

  async function markAsRead(
    notificationId: string,
  ) {
    const supabase =
      createClient()

    await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('id', notificationId)

    setNotifications(
      (current) =>
        current.map(
          (notification) =>
            notification.id ===
            notificationId
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification,
        ),
    )
  }

  async function markAllAsRead() {
    const supabase =
      createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('user_id', user.id)
      .eq('is_read', false)

    setNotifications(
      (current) =>
        current.map(
          (notification) => ({
            ...notification,
            is_read: true,
          }),
        ),
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => {
          setOpen(
            (current) => !current,
          )

          if (!open) {
            loadNotifications()
          }
        }}
        className="relative flex h-9 w-9 items-center justify-center border border-transparent text-[17px] transition hover:border-[#252525] hover:bg-[#111]"
        style={{
          color:
            'var(--header-text)',
        }}
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex min-w-[15px] translate-x-[2px] -translate-y-[2px] items-center justify-center bg-[#286ff1] px-1 text-[8px] font-bold leading-[15px] text-white">
            {unreadCount > 99
              ? '99+'
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 z-50 w-[350px] max-w-[calc(100vw-24px)] border shadow-xl"
          style={{
            background:
              'var(--surface)',
            borderColor:
              'var(--border)',
          }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{
              borderColor:
                'var(--border)',
            }}
          >
            <div>
              <div
                className="text-xs font-bold"
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                Notifications
              </div>

              {unreadCount > 0 && (
                <div
                  className="mt-0.5 text-[9px]"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  {unreadCount}{' '}
                  unread
                </div>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="text-[9px] font-bold hover:underline"
                style={{
                  color:
                    'var(--accent)',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading &&
            notifications.length === 0 ? (
              <div
                className="px-4 py-8 text-center text-[11px]"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Loading...
              </div>
            ) : notifications.length ===
              0 ? (
              <div
                className="px-4 py-10 text-center"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                <div className="text-2xl">
                  🔔
                </div>

                <div className="mt-2 text-xs font-semibold">
                  No notifications
                </div>

                <div className="mt-1 text-[10px]">
                  You're all caught up.
                </div>
              </div>
            ) : (
              notifications.map(
                (
                  notification,
                ) => (
                  <div
                    key={
                      notification.id
                    }
                    className="border-b"
                    style={{
                      borderColor:
                        'var(--border)',
                      background:
                        notification.is_read
                          ? 'var(--surface)'
                          : 'var(--accent-soft)',
                    }}
                  >
                    <div className="flex gap-3 px-4 py-3">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center border text-xs font-bold"
                        style={{
                          borderColor:
                            'var(--border)',
                          color:
                            getNotificationColor(
                              notification.type,
                            ),
                        }}
                      >
                        {getNotificationIcon(
                          notification.type,
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {notification.thread_id ? (
                          <Link
                            href={`/thread/${notification.thread_id}`}
                            onClick={() =>
                              markAsRead(
                                notification.id,
                              )
                            }
                            className="block text-[11px] leading-5 hover:underline"
                            style={{
                              color:
                                'var(--text-primary)',
                            }}
                          >
                            {
                              notification.message
                            }
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(
                                notification.id,
                              )
                            }
                            className="block text-left text-[11px] leading-5"
                            style={{
                              color:
                                'var(--text-primary)',
                            }}
                          >
                            {
                              notification.message
                            }
                          </button>
                        )}

                        <div
                          className="mt-1 text-[9px]"
                          style={{
                            color:
                              'var(--text-muted)',
                          }}
                        >
                          {formatTime(
                            notification.created_at,
                          )}
                        </div>
                      </div>

                      {!notification.is_read && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-[var(--accent)]" />
                      )}
                    </div>
                  </div>
                ),
              )
            )}
          </div>

          <div
            className="border-t px-4 py-2.5"
            style={{
              borderColor:
                'var(--border)',
            }}
          >
            <Link
              href="/settings"
              onClick={() =>
                setOpen(false)
              }
              className="text-[9px] font-bold hover:underline"
              style={{
                color:
                  'var(--text-secondary)',
              }}
            >
              Notification settings →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}