'use client'

import { postComment } from '@/app/actions/comment'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type CommentFormProps = {
  threadId: string
}

export default function CommentForm({
  threadId,
}: CommentFormProps) {
  const router = useRouter()

  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const cleanContent = content.trim()

    if (!cleanContent) {
      setError('Comment cannot be empty.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await postComment(threadId, cleanContent)
      setContent('')
      setSaving(false)
    } catch (err: any) {
      setError(err.message || 'Failed to post comment')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        rows={5}
        placeholder="Join the discussion..."
        className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm leading-6 outline-none focus:border-neutral-500"
      />

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {saving ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}