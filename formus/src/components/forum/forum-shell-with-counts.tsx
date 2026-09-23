import { createClient } from '@/lib/supabase/server'
import ForumShell from './forum-shell'

type ForumShellWithCountsProps = {
  children: React.ReactNode
  activeSlug?: string
}

async function getCategoryCounts() {
  const supabase = await createClient()
  const counts: Record<string, number> = {}
  const { data, error } = await supabase
    .from('categories')
    .select('slug, threads(count)')
    .is('threads.deleted_at', null)

  if (error) {
    console.error('Category counts loading failed:', error)
    return counts
  }

  const categories = (data ?? []) as Array<{
    slug: string
    threads: Array<{ count: number }>
  }>

  for (const category of categories) {
    const slug = category.slug === 'off-topic' ? 'offtopic' : category.slug
    counts[slug] = category.threads?.[0]?.count ?? 0
  }

  return counts
}

export default async function ForumShellWithCounts({
  children,
  activeSlug,
}: ForumShellWithCountsProps) {
  const counts = await getCategoryCounts()

  return (
    <ForumShell activeSlug={activeSlug} counts={counts}>
      {children}
    </ForumShell>
  )
}
