import { createClient } from '@/lib/supabase/server'
import ForumShell from './forum-shell'

type ForumShellWithCountsProps = {
  children: React.ReactNode
  activeSlug?: string
}

async function getCategoryCounts() {
  const supabase = await createClient()
  
  const communities = [
    { slug: 'esports' },
    { slug: 'bgmi' },
    { slug: 'valorant' },
    { slug: 'chess' },
    { slug: 'free-fire' },
    { slug: 'offtopic' },
  ]

  const counts: Record<string, number> = {}

  await Promise.all(
    communities.map(async (community) => {
      // Normalize slug (offtopic vs off-topic)
      const normalizedSlug =
        community.slug === 'offtopic' ? 'off-topic' : community.slug

      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', normalizedSlug)
        .maybeSingle()

      if (category) {
        const { count } = await supabase
          .from('threads')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .is('deleted_at', null)

        counts[community.slug] = count ?? 0
      } else {
        counts[community.slug] = 0
      }
    })
  )

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
