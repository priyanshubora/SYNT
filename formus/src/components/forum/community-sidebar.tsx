import Link from 'next/link'

const communities = [
  { name: 'Esports', slug: 'esports', dot: '#8b5cf6' },
  { name: 'BGMI', slug: 'bgmi', dot: '#facc15' },
  { name: 'Valorant', slug: 'valorant', dot: '#ef4444' },
  { name: 'Chess', slug: 'chess', dot: '#22c55e' },
  { name: 'Free Fire', slug: 'free-fire', dot: '#3b82f6' },
  { name: 'Off-Topic / Lounge', slug: 'offtopic', dot: '#7dd3fc' },
]

type CommunitySidebarProps = {
  activeSlug?: string
  counts?: Record<string, number>
}

export default function CommunitySidebar({
  activeSlug,
  counts = {},
}: CommunitySidebarProps) {

  return (
    <aside className="w-[224px] shrink-0 px-4 pt-6">
      <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-wide text-[#8792a3] dark:text-[#8f8f8f]">
        Communities
      </div>

      <div
        className="overflow-hidden rounded-[12px] border border-white/10 bg-[#2a2a2a]"
      >
        {communities.map((community) => {
          const active = community.slug === activeSlug
          const count = counts[community.slug] ?? 0

          return (
            <Link
              key={community.slug}
              href={`/category/${community.slug}`}
              prefetch={true}
              className={`group relative flex h-[56px] items-center justify-between px-4 text-[16px] font-medium transition ${
                active
                  ? 'bg-[#3b3b3b] text-white'
                  : 'border-b border-white/10 text-[#d5d5d5] hover:bg-[#313131]'
              } ${
                communities.indexOf(community) === communities.length - 1
                  ? ''
                  : 'border-b border-white/10'
              }`}
              style={
                active
                  ? {
                      boxShadow: `inset -3px 0 0 ${community.dot}`,
                    }
                  : undefined
              }
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className="h-[10px] w-[10px] shrink-0 rounded-full"
                  style={{ backgroundColor: community.dot }}
                />

                <span className="truncate">{community.name}</span>
              </span>

              <span
                className={`ml-2 text-[11px] font-semibold ${
                  active
                    ? 'text-[#d8d8d8]'
                    : 'text-[#9a9a9a]'
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