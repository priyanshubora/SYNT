'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

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

    if (!user) {
      router.push(
        `/login?next=${encodeURIComponent(window.location.pathname)}`,
      )
      return
    }

    /*
     * REMOVE VOTE
     */
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

    /*
     * ADD / CHANGE VOTE
     */
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
        },
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
        (current) => current + value - previousVote,
      )
    }

    setUserVote(value)
    setLoading(false)

    router.refresh()
  }

  return (
    <div className="flex w-[38px] flex-col items-center">
      {/* UPVOTE */}
      <button
        type="button"
        disabled={loading}
        onClick={() => handleVote(1)}
        aria-label="Upvote thread"
        className={`flex h-7 w-7 items-center justify-center text-[17px] font-semibold leading-none transition ${
          userVote === 1
            ? 'bg-[#e8f1ff] text-[#286ff1]'
            : 'text-[#788497] hover:bg-[#eef2f7] hover:text-[#286ff1] dark:hover:bg-[#303030]'
        }`}
      >
        ↑
      </button>

      {/* SCORE */}
      <span
        className={`py-1 text-[11px] font-bold leading-none ${
          score > 0
            ? 'text-[#286ff1]'
            : score < 0
              ? 'text-[#ef4444]'
              : 'text-[#788497]'
        }`}
      >
        {score}
      </span>

      {/* DOWNVOTE */}
      <button
        type="button"
        disabled={loading}
        onClick={() => handleVote(-1)}
        aria-label="Downvote thread"
        className={`flex h-7 w-7 items-center justify-center text-[17px] font-semibold leading-none transition ${
          userVote === -1
            ? 'bg-[#fff0f0] text-[#ef4444]'
            : 'text-[#788497] hover:bg-[#fff4f4] hover:text-[#ef4444] dark:hover:bg-[#303030]'
        }`}
      >
        ↓
      </button>
    </div>
  )
}