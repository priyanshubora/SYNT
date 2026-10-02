'use client'

import { useState } from 'react'
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

  const [optimisticState, setOptimisticState] = useState<{
    baseScore: number
    baseUserVote: number | null
    score: number
    userVote: number | null
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [voteError, setVoteError] = useState(false)

  const optimisticStateIsCurrent =
    optimisticState?.baseScore === initialScore &&
    optimisticState.baseUserVote === initialUserVote
  const score = optimisticStateIsCurrent ? optimisticState.score : initialScore
  const userVote = optimisticStateIsCurrent
    ? optimisticState.userVote
    : initialUserVote

  async function handleVote(value: 1 | -1) {
    if (loading) return

    if (!currentUserId) {
      router.push(
        `/login?next=${encodeURIComponent(window.location.pathname)}`,
      )
      return
    }

    setLoading(true)
    setVoteError(false)
    const previousScore = score
    const previousVote = userVote
    const removingVote = previousVote === value

    setOptimisticState({
      baseScore: initialScore,
      baseUserVote: initialUserVote,
      score: removingVote
        ? previousScore - value
        : previousScore + value - (previousVote ?? 0),
      userVote: removingVote ? null : value,
    })

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
        setOptimisticState({
          baseScore: initialScore,
          baseUserVote: initialUserVote,
          score: previousScore,
          userVote: previousVote,
        })
        setLoading(false)
        setVoteError(true)
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
      setOptimisticState({
        baseScore: initialScore,
        baseUserVote: initialUserVote,
        score: previousScore,
        userVote: previousVote,
      })
      setLoading(false)
      setVoteError(true)
      return
    }

    setLoading(false)
  }

  return (
    <div className="relative flex w-11 flex-col items-center">
      {/* UPVOTE */}
      <button
        type="button"
        disabled={loading}
        onClick={() => handleVote(1)}
        aria-label="Upvote thread"
        className={`flex h-11 w-11 items-center justify-center text-[18px] font-semibold leading-none transition ${
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
        className={`flex h-11 w-11 items-center justify-center text-[18px] font-semibold leading-none transition ${
          userVote === -1
            ? 'bg-[#fff0f0] text-[#ef4444]'
            : 'text-[#788497] hover:bg-[#fff4f4] hover:text-[#ef4444] dark:hover:bg-[#303030]'
        }`}
      >
        ↓
      </button>
      {voteError && (
        <span
          role="alert"
          className="absolute left-full top-1/2 z-10 ml-2 w-40 -translate-y-1/2 rounded-md border border-red-500/30 bg-[var(--surface)] px-2 py-1 text-center text-[10px] leading-4 text-red-500 shadow-lg"
        >
          Vote could not be saved. Try again.
        </span>
      )}
    </div>
  )
}
