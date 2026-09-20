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
    const confirmed = window.confirm(
      'Are you sure you want to delete this comment?'
    )

    if (!confirmed) {
      return
    }

    setDeleting(true)
    setError('')

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
    <div className="mt-2 flex items-center gap-3">
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
        onClick={deleteComment}
        disabled={deleting}
        className="text-xs font-semibold text-red-500 hover:underline"
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>

      {error && (
        <span className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  )
}