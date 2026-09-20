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

  const activeCategory =
    categories.find((category) => category.id === categoryId) ??
    categories[0]

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[1280px]">
      <div className="mb-6">
        <div className="mb-3 text-[12px] font-black uppercase tracking-[0.12em] text-[#e45d5d]">
          Forum Category
        </div>

        <div className="flex flex-wrap gap-3 rounded-[10px] border border-dashed border-[#505962] bg-[#2d3137]/80 p-3">
          {categories.map((category) => {
            const isActive = category.id === activeCategory?.id

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                className={[
                  'rounded-[8px] border px-4 py-2 text-[12px] font-semibold transition-all duration-150',
                  isActive
                    ? 'border-[#f0f4f8] bg-[#f3f5f7] text-[#1a212a] shadow-sm'
                    : 'border-[#535b64] bg-[#2d343b] text-[#edf2f7] hover:border-[#707a82] hover:bg-[#303840]',
                ].join(' ')}
              >
                {category.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 text-[12px] font-black uppercase tracking-[0.12em] text-[#dfe7f3]">
          Title
        </div>

        <div className="mb-2 text-[11px] text-[#9aa5b4]">
          cannot be edited after submission
        </div>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
          placeholder=""
          className="w-full rounded-[10px] border border-[#4b545d] bg-[#b8c0c8] px-4 py-3 text-[16px] text-[#1b232a] outline-none placeholder:text-[#596777] focus:border-[#b4c6d9]"
        />

        <div className="mt-2 flex justify-end text-[11px] text-[#b9c2cf]">
          {title.length}/200
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 text-[12px] font-black uppercase tracking-[0.12em] text-[#dfe7f3]">
          Text
        </div>

        <div className="mb-2 flex items-center justify-between rounded-t-[10px] border border-[#4b545d] border-b-0 bg-[#2f343a] px-4 py-3">
          <div className="flex items-center gap-3 text-[16px] text-[#edf2fb]">
            <span className="font-black">B</span>
            <span className="italic">I</span>
            <span className="underline">S</span>
            <span className="font-mono">A</span>
            <span className="text-[15px]">≡</span>
            <span className="text-[15px]">☰</span>
            <span className="text-[15px]">❝❞</span>
            <span className="text-[15px]">⌁</span>
          </div>

          <button
            type="button"
            className="rounded-[6px] border border-[#de6161] bg-[#d14d4d] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:bg-[#c44343]"
          >
            Preview
          </button>
        </div>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          rows={16}
          placeholder=""
          className="w-full resize-none rounded-b-[10px] border border-[#4b545d] bg-[#b8c0c8] px-4 py-3 text-[15px] leading-6 text-[#1b232a] outline-none focus:border-[#b4c6d9]"
        />
      </div>

      {error && (
        <div className="mb-5 rounded-[10px] border border-[#8a2b2b] bg-[#3b1c1c] p-4 text-sm text-[#f8c9c9]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-[8px] border border-[#d75e5e] bg-[#d75e5e] px-5 py-3 text-[15px] font-bold text-white transition hover:bg-[#c35555] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Publishing...' : 'Submit Thread'}
      </button>
    </form>
  )
}