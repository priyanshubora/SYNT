import ForumShell from '@/components/forum/forum-shell'
import NewThreadForm from '@/components/forum/new-thread-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type NewThreadPageProps = {
  searchParams: Promise<{
    category?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function NewThreadPage({
  searchParams,
}: NewThreadPageProps) {
  const { category: categoryParam } = await searchParams

  const supabase = await createClient()

  const [userResult, categoriesResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('categories')
      .select('id, name, slug')
      .order('name'),
  ])

  const {
    data: { user },
  } = userResult

  if (!user) {
    const next = categoryParam
      ? `/new?category=${encodeURIComponent(categoryParam)}`
      : '/new'

    redirect(`/login?next=${encodeURIComponent(next)}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/setup-profile?next=/new')
  }

  const { data: categories, error } = categoriesResult

  if (error || !categories) {
    return (
      <ForumShell>
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-5 text-red-300">
          Could not load categories.
        </div>
      </ForumShell>
    )
  }

  const selectedCategory = categories.find(
    (category) => category.id === categoryParam
  )

  return (
    <ForumShell>
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-neutral-500">
          NEW DISCUSSION
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Create a thread
        </h1>

        <p className="mt-2 text-neutral-400">
          Start a discussion the rest of FORMUS can argue about.
        </p>

        <div className="mt-8">
          <NewThreadForm
            categories={categories}
            defaultCategory={selectedCategory?.id}
          />
        </div>
      </div>
    </ForumShell>
  )
}