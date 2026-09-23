'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  commentId: string
  initialScore: number
  initialUserVote: number | null
  currentUserId: string | null
}

export default function CommentVoteButtons({
  commentId,
  initialScore,
  initialUserVote,
  currentUserId,
}: Props) {
  const router = useRouter()

  const [optimisticState, setOptimisticState] = useState<{
    baseScore: number
    baseUserVote: number | null
    score: number
    userVote: number | null
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const optimisticStateIsCurrent =
    optimisticState?.baseScore === initialScore &&
    optimisticState.baseUserVote === initialUserVote
  const score = optimisticStateIsCurrent ? optimisticState.score : initialScore
  const userVote = optimisticStateIsCurrent
    ? optimisticState.userVote
    : initialUserVote

  async function vote(value: 1 | -1) {
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
     * REMOVE CURRENT VOTE
     */
    if (removingVote) {
      const { error } = await supabase
        .from('comment_votes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', currentUserId)

      if (error) {
        console.error('Comment vote removal failed:', error)
        setOptimisticState({
          baseScore: initialScore,
          baseUserVote: initialUserVote,
          score: previousScore,
          userVote: previousVote,
        })
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
      .from('comment_votes')
      .upsert(
        {
          comment_id: commentId,
          user_id: currentUserId,
          value,
        },
        {
          onConflict: 'comment_id,user_id',
        }
      )

    if (error) {
      console.error('Comment vote failed:', error)
      setOptimisticState({
        baseScore: initialScore,
        baseUserVote: initialUserVote,
        score: previousScore,
        userVote: previousVote,
      })
      setLoading(false)
      return
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center gap-1">

      {/* UPVOTE */}
      <button
        type="button"
        disabled={loading}
        onClick={() => vote(1)}
        aria-label="Upvote comment"
        className={`flex h-7 w-7 items-center justify-center text-[17px] transition ${
          userVote === 1
            ? 'bg-[#e8f1ff] text-[#286ff1]'
            : 'text-[#788497] hover:bg-[#eef2f7] hover:text-[#286ff1] dark:hover:bg-[#303030]'
        }`}
      >
        ↑
      </button>

      {/* SCORE */}
      <span
        className={`min-w-[25px] text-center text-[11px] font-bold ${
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
        onClick={() => vote(-1)}
        aria-label="Downvote comment"
        className={`flex h-7 w-7 items-center justify-center text-[17px] transition ${
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
