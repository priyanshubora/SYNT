import Link from 'next/link'
import ForumShell from '@/components/forum/forum-shell'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type ThreadPageProps = {
  params: Promise<{
    id: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function ThreadPage({
  params,
}: ThreadPageProps) {
  const { id } = await params

  const supabase = await createClient()

  const { data: thread, error } = await supabase
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
    .eq('id', id)
    .maybeSingle()

  if (error || !thread) {
    notFound()
  }

  return (
    <ForumShell>
      <article className="mx-auto max-w-4xl">
        <Link
          href={
            thread.category
              ? `/category/${thread.category.slug}`
              : '/'
          }
          className="text-sm text-neutral-500 hover:text-white"
        >
          ← Back to {thread.category?.name ?? 'FORMUS'}
        </Link>

        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            {thread.category && (
              <span className="rounded-full border border-neutral-700 px-3 py-1">
                {thread.category.name}
              </span>
            )}

            <span>•</span>

            <span>
              {new Date(thread.created_at).toLocaleString()}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-tight">
            {thread.title}
          </h1>

          <div className="mt-5 flex items-center gap-2 text-sm">
            <span className="font-semibold text-white">
              {thread.author?.username ?? 'Unknown user'}
            </span>

            {thread.author?.team && (
              <>
                <span className="text-neutral-600">
                  •
                </span>

                <span className="text-neutral-400">
                  {thread.author.team.name}
                </span>
              </>
            )}
          </div>

          <div className="my-8 h-px bg-neutral-800" />

          <div className="whitespace-pre-wrap text-base leading-7 text-neutral-200">
            {thread.content}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-800 p-6">
          <h2 className="text-lg font-semibold">
            Discussion
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Comments will be available in the next phase.
          </p>
        </div>
      </article>
    </ForumShell>
  )
}