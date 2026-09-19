import Link from 'next/link'

type ThreadCardProps = {
  thread: {
    id: string
    title: string
    content: string
    created_at: string
    category?: {
      name: string
      slug: string
    } | null
    author?: {
      username: string
      team?: {
        name: string
      } | null
    } | null
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
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        {thread.category && (
          <span className="rounded-full border border-neutral-700 px-2 py-1">
            {thread.category.name}
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

      <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
        <span>
          {thread.author?.username ?? 'Unknown user'}
        </span>

        {thread.author?.team && (
          <>
            <span>•</span>
            <span>{thread.author.team.name}</span>
          </>
        )}
      </div>
    </Link>
  )
}