'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push(
        `/login?next=${encodeURIComponent(
          `/thread/${threadId}`
        )}`
      )
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      router.push(
        `/setup-profile?next=${encodeURIComponent(
          `/thread/${threadId}`
        )}`
      )
      return
    }

    const { error } = await supabase
      .from('comments')
      .insert({
        thread_id: threadId,
        author_id: user.id,
        content: cleanContent,
      })

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    setContent('')
    setSaving(false)

    router.refresh()
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