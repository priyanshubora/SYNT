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
    .from('threads')
    .select(`
      id,
      title,
      content,
      created_at,
      category:categories(
        name,
        slug
      ),
      author:profiles(
        username,
        team:teams(
          name
        )
      )
    `)
    .eq('category_id', category.id)
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

          <div className="mt-5">
            <a
              href="/new"
              className="inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Create Thread
            </a>
          </div>
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
              This community is suspiciously quiet.
            </p>
          </div>
        )}
      </div>
    </ForumShell>
  )
}