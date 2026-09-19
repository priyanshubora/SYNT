import ForumShell from '@/components/forum/forum-shell'
import NewThreadForm from '@/components/forum/new-thread-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function NewThreadPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/new')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/setup-profile?next=/new')
  }

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  if (error || !categories) {
    return (
      <ForumShell>
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-5 text-red-300">
          Could not load categories.
        </div>
      </ForumShell>
    )
  }

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
          <NewThreadForm categories={categories} />
        </div>
      </div>
    </ForumShell>
  )
}