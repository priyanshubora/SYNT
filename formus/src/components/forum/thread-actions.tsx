'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type ThreadActionsProps = {
  threadId: string
  authorId: string
  currentUserId: string | null
  title: string
  content: string
}

export default function ThreadActions({
  threadId,
  authorId,
  currentUserId,
  title,
  content,
}: ThreadActionsProps) {
  const router = useRouter()

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editContent, setEditContent] = useState(content)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  if (!currentUserId || currentUserId !== authorId) {
    return null
  }

  async function saveEdit() {
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()

    if (!trimmedTitle) {
      setError('Title cannot be empty.')
      return
    }

    if (!trimmedContent) {
      setError('Content cannot be empty.')
      return
    }

    setSaving(true)
    setError('')

    const supabase = createClient()

    const { error } = await supabase
      .from('threads')
      .update({
        title: trimmedTitle,
        content: trimmedContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId)
      .eq('author_id', currentUserId)

    if (error) {
      console.error('Thread update failed:', error)
      setError(error.message || 'Unable to update thread.')
      setSaving(false)
      return
    }

    setEditTitle(trimmedTitle)
    setEditContent(trimmedContent)
    setSaving(false)
    setEditing(false)

    router.refresh()
  }

  async function deleteThread() {
    setDeleting(true)
    setError('')
    setConfirmingDelete(false)

    const supabase = createClient()

    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', threadId)
      .eq('author_id', currentUserId)

    if (error) {
      console.error('Thread deletion failed:', error)
      setError(error.message || 'Unable to delete thread.')
      setDeleting(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  if (editing) {
    return (
      <div
        className="mt-5 border p-4"
        style={{
          background: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="mb-4">
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Title
          </label>

          <input
            type="text"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            disabled={saving}
            className="w-full border px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border)',
            }}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Content
          </label>

          <textarea
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            disabled={saving}
            rows={8}
            className="w-full resize-y border px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border)',
            }}
          />
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-500">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={saveEdit}
            disabled={saving}
            className="border px-4 py-2 text-xs font-bold"
            style={{
              background: 'var(--accent)',
              color: '#ffffff',
              borderColor: 'var(--accent)',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setEditTitle(title)
              setEditContent(content)
              setError('')
            }}
            disabled={saving}
            className="border px-4 py-2 text-xs font-bold"
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
    <div className="mt-4">
      {confirmingDelete && (
        <div
          className="mb-3 rounded border border-red-200 bg-red-50 p-3 dark:border-red-900/60 dark:bg-red-950/20"
        >
          <p className="text-xs font-bold text-red-600 dark:text-red-300">
            Delete this discussion?
          </p>
          <p className="mt-1 text-[10px] text-red-500">
            This action cannot be undone.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={deleteThread}
              disabled={deleting}
              className="border border-red-500 bg-red-500 px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-60"
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
              className="border px-3 py-1.5 text-[10px] font-bold"
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

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => {
            setEditing(true)
            setError('')
          }}
          className="text-xs font-semibold transition hover:underline"
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
          className="text-xs font-semibold text-red-500 transition hover:underline disabled:opacity-60"
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