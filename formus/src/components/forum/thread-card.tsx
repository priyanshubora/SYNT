'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type ThreadCardProps = {
  thread: {
    id: string
    title: string
    content: string
    category_name?: string | null
    category_slug?: string | null
    author_username?: string | null
    team_name?: string | null
    team_logo_url?: string | null
    created_at: string
    score?: number | null
    comment_count?: number | null
  }
}

function timeAgo(date: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000,
  )

  if (seconds < 60) {
    return `${Math.max(seconds, 0)}s ago`
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)

  return `${days}d ago`
}

export default function ThreadCard({
  thread,
}: ThreadCardProps) {
  const router = useRouter()
  const threadHref = `/thread/${thread.id}`

  return (
    <Link
      href={threadHref}
      prefetch={true}
      onMouseEnter={() => router.prefetch(threadHref)}
      onFocus={() => router.prefetch(threadHref)}
      className="thread-card group block border-b px-4 py-4 transition sm:px-5"
    >
      <div className="flex gap-4">
        {/* VOTE COLUMN */}
        <div className="flex w-[38px] shrink-0 flex-col items-center pt-1">
          <span className="text-[13px] text-[#7b8798] transition group-hover:text-[#286ff1]">
            △
          </span>

          <span className="mt-0.5 text-[13px] font-bold text-[#273449] dark:text-[#e5e7eb]">
            {thread.score ?? 0}
          </span>

          <span className="mt-0.5 text-[7px] uppercase tracking-wide text-[#a3adba] dark:text-[#777]">
            votes
          </span>
        </div>

        {/* THREAD CONTENT */}
        <div className="min-w-0 flex-1">
          {/* META */}
          <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[9px] text-[#9aa4b2] dark:text-[#888]">
            {thread.category_name && (
              <span className="rounded-[3px] bg-[#eef4ff] px-2 py-1 font-semibold text-[#4c76c4] dark:bg-[#26344a] dark:text-[#83aeff]">
                {thread.category_name}
              </span>
            )}

            <span>•</span>

            <span className="inline-flex flex-wrap items-center gap-1">
              <span>
                Posted by{' '}
              </span>

              <span className="inline-flex items-center gap-1 font-semibold text-[#526175] dark:text-[#c5cbd4]">
                {thread.author_username ?? 'user'}

                {thread.team_logo_url && (
                  <Image
                    src={thread.team_logo_url}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 object-contain"
                  />
                )}

                {thread.team_name && (
                  <span className="text-[8px] font-medium text-[#7b8798] dark:text-[#888]">
                    {thread.team_name}
                  </span>
                )}
              </span>
            </span>

            <span>
              {timeAgo(thread.created_at)}
            </span>
          </div>

          {/* TITLE */}
          <h2 className="text-[14px] font-bold leading-[1.35] text-[#111827] transition group-hover:text-[#2468db] dark:text-[#f4f4f5] sm:text-[15px]">
            {thread.title}
          </h2>

          {/* CONTENT */}
          <p className="mt-1 line-clamp-2 text-[11px] leading-[1.55] text-[#788497] dark:text-[#a1a1aa]">
            {thread.content}
          </p>

          {/* BOTTOM META */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] text-[#788497] dark:text-[#888]">
            <span>
              ◉ {thread.comment_count ?? 0} replies
            </span>

            <span className="text-[#d0d5dd] dark:text-[#555]">
              •
            </span>

            <span>
              Last active recently
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}