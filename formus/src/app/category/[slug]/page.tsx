import Link from 'next/link'
import ForumShell from '@/components/forum/forum-shell'
import ThreadCard from '@/components/forum/thread-card'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type CategoryPageProps = {
  params: Promise<{
    slug: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params

  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .maybeSingle()

  if (!category) {
    notFound()
  }

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
    .eq('category_id', category.id)
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
            COMMUNITY
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            {category.name}
          </h1>

          {category.description && (
            <p className="mt-2 text-neutral-400">
              {category.description}
            </p>
          )}

          <Link
            href={`/new?category=${category.id}`}
            className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Create Thread
          </Link>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/30 p-5 text-red-300">
            Failed to load threads.
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
              No threads yet
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Start the first discussion.
            </p>
          </div>
        )}
      </div>
    </ForumShell>
  )
}