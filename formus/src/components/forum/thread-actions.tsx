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
}: ThreadActionsProps) {
  const router = useRouter()

  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  if (!currentUserId || currentUserId !== authorId) {
    return null
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

  return (
    <div className="mt-4">
      {confirmingDelete && (
        <div className="mb-3 rounded border border-red-200/80 bg-red-50/80 p-3 dark:border-red-900/50 dark:bg-red-950/20">
          <p className="text-xs font-bold text-red-600 dark:text-red-300">
            Delete this discussion?
          </p>
          <p className="mt-1 text-[10px] text-red-500/80">
            This action cannot be undone.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={deleteThread}
              disabled={deleting}
              className="border border-red-300 bg-red-100 px-3 py-1.5 text-[10px] font-bold text-red-700 disabled:opacity-60 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
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
            setConfirmingDelete(true)
            setError('')
          }}
          disabled={deleting}
          className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
        >
          Delete
        </button>

        {error && (
          <span className="text-xs text-red-500/80">
            {error}
          </span>
        )}
      </div>
    </div>
  )
}