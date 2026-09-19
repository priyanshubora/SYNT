'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Category = {
  id: string
  name: string
  slug: string
}

type NewThreadFormProps = {
  categories: Category[]
  defaultCategory?: string
}

export default function NewThreadForm({
  categories,
  defaultCategory,
}: NewThreadFormProps) {
  const router = useRouter()

  const [categoryId, setCategoryId] = useState(
    defaultCategory ?? categories[0]?.id ?? ''
  )

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setSaving(true)
    setError('')

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?next=/new')
      return
    }

    const cleanTitle = title.trim()
    const cleanContent = content.trim()

    if (cleanTitle.length < 3) {
      setError('Title must be at least 3 characters.')
      setSaving(false)
      return
    }

    if (cleanTitle.length > 200) {
      setError('Title must be 200 characters or fewer.')
      setSaving(false)
      return
    }

    if (!cleanContent) {
      setError('Thread content cannot be empty.')
      setSaving(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      router.push('/setup-profile?next=/new')
      return
    }

    const { data: thread, error } = await supabase
      .from('threads')
      .insert({
        category_id: categoryId,
        author_id: user.id,
        title: cleanTitle,
        content: cleanContent,
      })
      .select('id')
      .single()

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push(`/thread/${thread.id}`)
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8"
    >
      <div>
        <label className="block text-sm font-medium">
          Category
        </label>

        <select
          value={categoryId}
          onChange={(event) =>
            setCategoryId(event.target.value)
          }
          className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none"
          required
        >
          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium">
          Title
        </label>

        <input
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          maxLength={200}
          required
          placeholder="What do you want to discuss?"
          className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-500"
        />

        <p className="mt-2 text-xs text-neutral-600">
          {title.length}/200
        </p>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium">
          Content
        </label>

        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          required
          rows={10}
          placeholder="Explain your topic..."
          className="mt-2 w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 leading-6 outline-none focus:border-neutral-500"
        />
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Publishing...' : 'Publish Thread'}
        </button>
      </div>
    </form>
  )
}