'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  commentId: string
  initialScore: number
  initialUserVote: number | null
}

export default function CommentVoteButtons({
  commentId,
  initialScore,
  initialUserVote,
}: Props) {
  const router = useRouter()

  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState(initialUserVote)
  const [loading, setLoading] = useState(false)

  async function vote(value: 1 | -1) {
    if (loading) return

    setLoading(true)

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href =
        `/login?next=${encodeURIComponent(window.location.pathname)}`

      return
    }

    /*
     * REMOVE CURRENT VOTE
     */
    if (userVote === value) {
      const { error } = await supabase
        .from('comment_votes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Comment vote removal failed:', error)
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
      .from('comment_votes')
      .upsert(
        {
          comment_id: commentId,
          user_id: user.id,
          value,
        },
        {
          onConflict: 'comment_id,user_id',
        }
      )

    if (error) {
      console.error('Comment vote failed:', error)
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