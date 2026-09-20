import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const communities = [
  { name: 'Esports', slug: 'esports' },
  { name: 'BGMI', slug: 'bgmi' },
  { name: 'Valorant', slug: 'valorant' },
  { name: 'Chess', slug: 'chess' },
  { name: 'Free Fire', slug: 'free-fire' },
  { name: 'Off-Topic / Lounge', slug: 'offtopic' },
]

type CommunitySidebarProps = {
  activeSlug?: string
}

export default async function CommunitySidebar({
  activeSlug,
}: CommunitySidebarProps) {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: threads } = await supabase
    .from('threads')
    .select('category_id, categories(slug)')
    .gte('created_at', today.toISOString())

  const counts: Record<string, number> = {}

  communities.forEach((community) => {
    counts[community.slug] = 0
  })

  threads?.forEach((thread) => {
    const category = Array.isArray(thread.categories)
      ? thread.categories[0]
      : thread.categories

    if (category?.slug) {
      counts[category.slug] = (counts[category.slug] ?? 0) + 1
    }
  })

  return (
    <aside className="w-[224px] shrink-0 px-4 pt-6">
      <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-wide text-[#8792a3] dark:text-[#8f8f8f]">
        Communities
      </div>

      <div
        className="overflow-hidden rounded-[14px] border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {communities.map((community) => {
          const active = community.slug === activeSlug
          const count = counts[community.slug] ?? 0

          return (
            <Link
              key={community.slug}
              href={`/category/${community.slug}`}
              className={`group relative flex h-[39px] items-center justify-between px-4 text-[12px] transition ${
                active
                  ? 'mx-1 my-1 rounded-[10px] border border-dashed border-[#73a7ff] bg-[#f7faff] text-[#2869e8] dark:bg-[#26344a] dark:text-[#83aeff]'
                  : 'text-[#667085] hover:bg-[#f7f9fc] dark:text-[#a1a1aa] dark:hover:bg-[#292929]'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`h-[6px] w-[6px] shrink-0 rounded-full ${
                    active
                      ? 'bg-[#3478f6]'
                      : 'bg-[#ccd3dc] dark:bg-[#666]'
                  }`}
                />

                <span className="truncate font-medium">
                  {community.name}
                </span>
              </span>

              <span
                className={`ml-2 text-[10px] ${
                  active
                    ? 'rounded-full bg-[#edf4ff] px-2 py-1 text-[#2869e8] dark:bg-[#31496c] dark:text-[#9bbcff]'
                    : 'text-[#a1aaba] dark:text-[#777]'
                }`}
              >
                {count}
              </span>
            </Link>
          )
        })}
      </div>

    </aside>
  )
}