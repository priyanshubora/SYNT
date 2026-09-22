'use client'

import {
  useEffect,
  useState,
} from 'react'

import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

type ThreadActionsProps = {
  threadId: string
  authorId: string
  currentUserId: string | null
  title: string
  content: string
}

type UserRole =
  | 'user'
  | 'moderator'
  | 'admin'

type ModerationAction =
  | 'delete_thread'
  | 'restore_thread'
  | 'lock_thread'
  | 'unlock_thread'

export default function ThreadActions({
  threadId,
  authorId,
  currentUserId,
}: ThreadActionsProps) {
  const router =
    useRouter()

  const [role, setRole] =
    useState<UserRole>('user')

  const [
    isLocked,
    setIsLocked,
  ] = useState(false)

  const [
    isDeleted,
    setIsDeleted,
  ] = useState(false)

  const [loading, setLoading] =
    useState(false)

  const [
    confirmingDelete,
    setConfirmingDelete,
  ] = useState(false)

  const [
    reasonOpen,
    setReasonOpen,
  ] = useState(false)

  const [reason, setReason] =
    useState('')

  const [
    pendingAction,
    setPendingAction,
  ] =
    useState<ModerationAction | null>(
      null,
    )

  const [error, setError] =
    useState('')

  const [statusMessage, setStatusMessage] =
    useState('')

  const isModerator =
    role === 'moderator' ||
    role === 'admin'

  const isAuthor =
    Boolean(currentUserId) &&
    currentUserId === authorId

  useEffect(() => {
    if (!currentUserId) {
      return
    }

    async function loadState() {
      const supabase =
        createClient()

      const [
        profileResult,
        threadResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('role')
          .eq(
            'id',
            currentUserId,
          )
          .maybeSingle(),

        supabase
          .from('threads')
          .select(
            'is_locked, deleted_at',
          )
          .eq(
            'id',
            threadId,
          )
          .maybeSingle(),
      ])

      if (
        profileResult.data?.role
      ) {
        setRole(
          profileResult.data
            .role as UserRole,
        )
      }

      if (
        threadResult.data
      ) {
        setIsLocked(
          Boolean(
            threadResult.data
              .is_locked,
          ),
        )

        setIsDeleted(
          Boolean(
            threadResult.data
              .deleted_at,
          ),
        )
      }
    }

    loadState()
  }, [
    currentUserId,
    threadId,
  ])

  async function deleteOwnThread() {
    if (
      !currentUserId ||
      !isAuthor
    ) {
      return
    }

    setLoading(true)
    setError('')

    const supabase =
      createClient()

    const {
      error: updateError,
    } =
      await supabase
        .from('threads')
        .update({
          deleted_at:
            new Date().toISOString(),
          deleted_by:
            currentUserId,
          deletion_reason:
            'Deleted by author',
        })
        .eq(
          'id',
          threadId,
        )
        .eq(
          'author_id',
          currentUserId,
        )

    if (updateError) {
      setError(
        updateError.message ||
          'Unable to delete thread.',
      )

      setLoading(false)
      return
    }

    setStatusMessage(
      'Thread deleted. Redirecting home...',
    )
    setConfirmingDelete(false)

    window.setTimeout(() => {
      router.replace('/')
      router.refresh()
    }, 700)
  }

  function openModerationAction(
    action: ModerationAction,
  ) {
    setPendingAction(action)
    setReason('')
    setError('')
    setReasonOpen(true)
  }

  async function executeModerationAction() {
    if (
      !pendingAction ||
      !isModerator
    ) {
      return
    }

    const trimmedReason =
      reason.trim()

    if (!trimmedReason) {
      setError(
        'A reason is required.',
      )
      return
    }

    setLoading(true)
    setError('')

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
              action:
                pendingAction,
              targetType:
                'thread',
              targetId:
                threadId,
              reason:
                trimmedReason,
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

      if (
        pendingAction ===
        'lock_thread'
      ) {
        setIsLocked(true)
      }

      if (
        pendingAction ===
        'unlock_thread'
      ) {
        setIsLocked(false)
      }

      if (
        pendingAction ===
        'delete_thread'
      ) {
        setIsDeleted(true)
        setStatusMessage(
          'Thread deleted. Redirecting home...',
        )
      }

      if (
        pendingAction ===
        'restore_thread'
      ) {
        setIsDeleted(false)
      }

      setReasonOpen(false)
      setPendingAction(null)
      setReason('')

      router.replace('/')
      router.refresh()
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Moderation action failed.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (
    !currentUserId ||
    (!isAuthor &&
      !isModerator)
  ) {
    return null
  }

  const actionLabel =
    pendingAction ===
    'delete_thread'
      ? 'Delete thread'
      : pendingAction ===
          'restore_thread'
        ? 'Restore thread'
        : pendingAction ===
            'lock_thread'
          ? 'Lock thread'
          : pendingAction ===
              'unlock_thread'
            ? 'Unlock thread'
            : 'Moderation action'

  return (
    <div className="mt-4">
      {statusMessage && (
        <div
          className="mb-3 border px-3 py-2 text-[11px] font-semibold"
          style={{
            background:
              'var(--accent-soft)',
            borderColor:
              'var(--border)',
            color:
              'var(--accent)',
          }}
        >
          {statusMessage}
        </div>
      )}

      {isAuthor &&
        !isDeleted && (
          <>
            {confirmingDelete && (
              <div className="mb-3 border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/20">
                <p className="text-xs font-bold text-red-600 dark:text-red-300">
                  Delete this discussion?
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={
                      deleteOwnThread
                    }
                    disabled={
                      loading
                    }
                    className="border border-red-300 bg-red-100 px-3 py-1.5 text-[10px] font-bold text-red-700 disabled:opacity-60 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
                  >
                    {loading
                      ? 'Deleting...'
                      : 'Yes, delete'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingDelete(
                        false,
                      )
                      setError('')
                    }}
                    disabled={
                      loading
                    }
                    className="border px-3 py-1.5 text-[10px] font-bold"
                    style={{
                      background:
                        'var(--surface)',
                      color:
                        'var(--text-secondary)',
                      borderColor:
                        'var(--border)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!confirmingDelete && (
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(
                    true,
                  )
                  setError('')
                }}
                disabled={loading}
                className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
              >
                Delete
              </button>
            )}
          </>
        )}

      {isModerator && (
        <div
          className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3"
          style={{
            borderColor:
              'var(--border)',
          }}
        >
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
            {role}
          </span>

          {isDeleted ? (
            <button
              type="button"
              onClick={() =>
                openModerationAction(
                  'restore_thread',
                )
              }
              disabled={loading}
              className="border px-2.5 py-1.5 text-[10px] font-semibold"
              style={{
                background:
                  'var(--surface)',
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
                openModerationAction(
                  'delete_thread',
                )
              }
              disabled={loading}
              className="border border-red-300 px-2.5 py-1.5 text-[10px] font-semibold text-red-600 dark:border-red-900 dark:text-red-400"
            >
              Delete
            </button>
          )}

          {!isDeleted && (
            <button
              type="button"
              onClick={() =>
                openModerationAction(
                  isLocked
                    ? 'unlock_thread'
                    : 'lock_thread',
                )
              }
              disabled={loading}
              className="border px-2.5 py-1.5 text-[10px] font-semibold"
              style={{
                background:
                  isLocked
                    ? 'var(--accent-soft)'
                    : 'var(--surface)',
                borderColor:
                  'var(--border)',
                color:
                  isLocked
                    ? 'var(--accent)'
                    : 'var(--text-secondary)',
              }}
            >
              {isLocked
                ? 'Unlock'
                : 'Lock'}
            </button>
          )}
        </div>
      )}

      {reasonOpen && (
        <div className="mt-3 border p-3">
          <div
            className="text-xs font-bold"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            {actionLabel}
          </div>

          <textarea
            value={reason}
            onChange={(event) => {
              setReason(
                event.target.value,
              )

              if (error) {
                setError('')
              }
            }}
            rows={3}
            placeholder="Reason for this moderation action..."
            className="mt-3 w-full resize-none border px-3 py-2 text-xs outline-none"
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

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setReasonOpen(false)
                setPendingAction(
                  null,
                )
                setReason('')
                setError('')
              }}
              disabled={loading}
              className="border px-3 py-1.5 text-[10px] font-semibold"
              style={{
                background:
                  'var(--surface)',
                color:
                  'var(--text-secondary)',
                borderColor:
                  'var(--border)',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                executeModerationAction
              }
              disabled={loading}
              className="border px-3 py-1.5 text-[10px] font-bold"
              style={{
                background:
                  'var(--accent)',
                color:
                  '#ffffff',
                borderColor:
                  'var(--accent)',
                opacity: loading
                  ? 0.6
                  : 1,
              }}
            >
              {loading
                ? 'Applying...'
                : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {error &&
        !reasonOpen && (
          <p className="mt-2 text-xs text-red-500">
            {error}
          </p>
        )}
    </div>
  )
}