'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type CommentActionsProps = {
  commentId: string
  authorId: string
  currentUserId: string | null
  content: string
}

export default function CommentActions({
  commentId,
  authorId,
  currentUserId,
  content,
}: CommentActionsProps) {
  const router = useRouter()

  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  if (!currentUserId || currentUserId !== authorId) {
    return null
  }

  async function saveEdit() {
    const trimmedContent = editContent.trim()

    if (!trimmedContent) {
      setError('Comment cannot be empty.')
      return
    }

    setSaving(true)
    setError('')

    const supabase = createClient()

    const { error } = await supabase
      .from('comments')
      .update({
        content: trimmedContent,
      })
      .eq('id', commentId)
      .eq('author_id', currentUserId)

    if (error) {
      console.error('Comment update failed:', error)
      setError(error.message || 'Unable to update comment.')
      setSaving(false)
      return
    }

    setEditContent(trimmedContent)
    setSaving(false)
    setEditing(false)

    router.refresh()
  }

  async function deleteComment() {
    setDeleting(true)
    setError('')
    setConfirmingDelete(false)

    const supabase = createClient()

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', currentUserId)

    if (error) {
      console.error('Comment deletion failed:', error)
      setError(error.message || 'Unable to delete comment.')
      setDeleting(false)
      return
    }

    router.refresh()
  }

  if (editing) {
    return (
      <div className="mt-3">
        <textarea
          value={editContent}
          onChange={(event) => setEditContent(event.target.value)}
          disabled={saving}
          rows={4}
          className="w-full resize-y border px-3 py-2 text-sm outline-none"
          style={{
            background: 'var(--surface-secondary)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border)',
          }}
        />

        {error && (
          <p className="mt-2 text-xs text-red-500">
            {error}
          </p>
        )}

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={saveEdit}
            disabled={saving}
            className="border px-3 py-1.5 text-xs font-bold"
            style={{
              background: 'var(--accent)',
              color: '#ffffff',
              borderColor: 'var(--accent)',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setEditContent(content)
              setError('')
            }}
            disabled={saving}
            className="border px-3 py-1.5 text-xs font-bold"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2">
      {confirmingDelete && (
        <div className="mb-2 rounded border border-red-200 bg-red-50 p-2.5 dark:border-red-900/60 dark:bg-red-950/20">
          <p className="text-[10px] font-bold text-red-600 dark:text-red-300">
            Delete this comment?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={deleteComment}
              disabled={deleting}
              className="border border-red-500 bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Yes, delete'}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmingDelete(false)
                setError('')
              }}
              disabled={deleting}
              className="border px-2.5 py-1 text-[10px] font-bold"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setEditing(true)
            setError('')
          }}
          className="text-xs font-semibold hover:underline"
          style={{ color: 'var(--text-secondary)' }}
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => {
            setConfirmingDelete(true)
            setError('')
          }}
          disabled={deleting}
          className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-60"
        >
          Delete
        </button>

        {error && (
          <span className="text-xs text-red-500">
            {error}
          </span>
        )}
      </div>
    </div>
  )
}