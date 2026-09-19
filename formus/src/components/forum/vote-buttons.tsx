'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type VoteButtonsProps = {
  threadId: string
  initialScore: number
  initialUserVote: number | null
}

export default function VoteButtons({
  threadId,
  initialScore,
  initialUserVote,
}: VoteButtonsProps) {
  const router = useRouter()

  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState(initialUserVote)
  const [loading, setLoading] = useState(false)

  async function handleVote(value: 1 | -1) {
    if (loading) return

    setLoading(true)

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // USER IS NOT LOGGED IN
    if (!user) {
      setLoading(false)

      window.location.href =
        `/login?next=${encodeURIComponent(`/thread/${threadId}`)}`

      return
    }

    // REMOVE EXISTING VOTE
    if (userVote === value) {
      const { error } = await supabase
        .from('thread_votes')
        .delete()
        .eq('thread_id', threadId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Vote removal failed:', error)
        setLoading(false)
        return
      }

      setScore((current) => current - value)
      setUserVote(null)

      setLoading(false)
      router.refresh()
      return
    }

    // CREATE OR CHANGE VOTE
    const previousVote = userVote

    const { error } = await supabase
      .from('thread_votes')
      .upsert(
        {
          thread_id: threadId,
          user_id: user.id,
          value,
        },
        {
          onConflict: 'thread_id,user_id',
        }
      )

    if (error) {
      console.error('Vote failed:', error)
      setLoading(false)
      return
    }

    if (previousVote === null) {
      setScore((current) => current + value)
    } else {
      setScore(
        (current) => current + value - previousVote
      )
    }

    setUserVote(value)
    setLoading(false)

    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => handleVote(1)}
        className={`rounded-lg border px-3 py-2 text-sm transition ${
          userVote === 1
            ? 'border-white bg-white text-black'
            : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
        }`}
      >
        ▲
      </button>

      <span className="min-w-12 text-center text-sm font-semibold">
        {score}
      </span>

      <button
        type="button"
        disabled={loading}
        onClick={() => handleVote(-1)}
        className={`rounded-lg border px-3 py-2 text-sm transition ${
          userVote === -1
            ? 'border-white bg-white text-black'
            : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
        }`}
      >
        ▼
      </button>
    </div>
  )
}