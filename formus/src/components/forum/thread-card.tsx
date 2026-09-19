import Link from 'next/link'

type ThreadCardProps = {
  thread: {
    id: string
    title: string
    content: string
    created_at: string
    category_name?: string | null
    category_slug?: string | null
    author_username?: string | null
    team_name?: string | null
    score?: number | null
    vote_count?: number | null
    comment_count?: number | null
  }
}

export default function ThreadCard({
  thread,
}: ThreadCardProps) {
  const preview =
    thread.content.length > 180
      ? `${thread.content.slice(0, 180)}...`
      : thread.content

  return (
    <Link
      href={`/thread/${thread.id}`}
      className="block rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 transition hover:border-neutral-700 hover:bg-neutral-900"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        {thread.category_name && (
          <span className="rounded-full border border-neutral-700 px-2 py-1">
            {thread.category_name}
          </span>
        )}

        <span>•</span>

        <span>
          {new Date(thread.created_at).toLocaleDateString()}
        </span>
      </div>

      <h2 className="mt-3 text-lg font-semibold text-white">
        {thread.title}
      </h2>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">
        {preview}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <span className="font-medium text-neutral-300">
          {thread.author_username ?? 'Unknown user'}
        </span>

        {thread.team_name && (
          <>
            <span>•</span>
            <span>{thread.team_name}</span>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-neutral-800 pt-4 text-xs text-neutral-500">
        <span>
          {thread.score ?? 0} points
        </span>

        <span>
          {thread.vote_count ?? 0} votes
        </span>

        <span>
          {thread.comment_count ?? 0} comments
        </span>
      </div>
    </Link>
  )
}