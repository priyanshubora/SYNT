import Link from 'next/link'
import ForumShell from '@/components/forum/forum-shell'
import ThreadCard from '@/components/forum/thread-card'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: threads, error } = await supabase
    .from('thread_stats')
    .select(`
      id,
      title,
      content,
      created_at,
      category_name,
      category_slug,
      author_username,
      team_name,
      score,
      vote_count,
      comment_count
    `)
    .order('score', {
      ascending: false,
    })
    .order('comment_count', {
      ascending: false,
    })
    .order('created_at', {
      ascending: false,
    })
    .limit(20)

  return (
    <ForumShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-neutral-500">
            FORMUS
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Top discussions
          </h1>

          <p className="mt-2 text-neutral-400">
            The conversations currently getting the most attention.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/30 p-5 text-red-300">
            <p>Failed to load discussions.</p>

            <pre className="mt-3 overflow-auto text-xs">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        ) : threads && threads.length > 0 ? (
          <div className="space-y-4">
            {threads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center">
            <h2 className="text-lg font-semibold">
              No discussions yet
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Someone needs to start an argument.
            </p>

            <Link
              href="/new"
              className="mt-5 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Create the first thread
            </Link>
          </div>
        )}
      </div>
    </ForumShell>
  )
}