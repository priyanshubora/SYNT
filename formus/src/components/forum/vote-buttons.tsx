'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

type VoteButtonsProps = {
  threadId: string
  initialScore: number
  initialUserVote: number | null
  currentUserId: string | null
}

export default function VoteButtons({
  threadId,
  initialScore,
  initialUserVote,
  currentUserId,
}: VoteButtonsProps) {
  const router = useRouter()

  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState(initialUserVote)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setScore(initialScore)
    setUserVote(initialUserVote)
  }, [initialScore, initialUserVote])

  async function handleVote(value: 1 | -1) {
    if (loading) return

    if (!currentUserId) {
      router.push(
        `/login?next=${encodeURIComponent(window.location.pathname)}`,
      )
      return
    }

    setLoading(true)
    const previousScore = score
    const previousVote = userVote
    const removingVote = previousVote === value

    setScore(
      removingVote
        ? previousScore - value
        : previousScore + value - (previousVote ?? 0),
    )
    setUserVote(removingVote ? null : value)

    const supabase = createClient()

    /*
     * REMOVE VOTE
     */
    if (removingVote) {
      const { error } = await supabase
        .from('thread_votes')
        .delete()
        .eq('thread_id', threadId)
        .eq('user_id', currentUserId)

      if (error) {
        console.error('Vote removal failed:', error)
        setScore(previousScore)
        setUserVote(previousVote)
        setLoading(false)
        return
      }

      setLoading(false)
      return
    }

    /*
     * ADD / CHANGE VOTE
     */
    const { error } = await supabase
      .from('thread_votes')
      .upsert(
        {
          thread_id: threadId,
          user_id: currentUserId,
          value,
        },
        {
          onConflict: 'thread_id,user_id',
        },
      )

    if (error) {
      console.error('Vote failed:', error)
      setScore(previousScore)
      setUserVote(previousVote)
      setLoading(false)
      return
    }

    setLoading(false)
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
