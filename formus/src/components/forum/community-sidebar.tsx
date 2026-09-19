import Link from 'next/link'

const communities = [
  {
    name: 'BGMI',
    slug: 'bgmi',
    count: '1.2k',
  },
  {
    name: 'Valorant (VLR)',
    slug: 'valorant',
    count: '850',
  },
  {
  name: 'Esports',
  slug: 'esports',
  count: '420',
},
  {
    name: 'Chess',
    slug: 'chess',
    count: '110',
  },
  {
    name: 'Free Fire',
    slug: 'free-fire',
    count: '275',
  },
  {
    name: 'Off-Topic / Lounge',
    slug: 'offtopic',
    count: '315',
  },
]

type CommunitySidebarProps = {
  activeSlug?: string
}

export default function CommunitySidebar({
  activeSlug,
}: CommunitySidebarProps) {
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
                {community.count}
              </span>

            </Link>
          )
        })}

      </div>

      <Link
        href="/communities"
        className="mt-4 flex items-center gap-2 px-2 text-[11px] font-medium text-[#64748b] hover:text-[#2869e8] dark:text-[#999] dark:hover:text-[#83aeff]"
      >
        <span className="text-[16px]">+</span>
        Browse all communities
      </Link>

    </aside>
  )
}