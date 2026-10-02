'use client'

import Link from 'next/link'

type MobileNavProps = {
  activeSlug?: string
}

const categories = [
  {
    name: 'BGMI',
    slug: 'bgmi',
    accent: '#facc15',
  },
  {
    name: 'Valorant (VLR)',
    slug: 'valorant',
    accent: '#ef4444',
  },
   {
    name: 'Esports',
    slug: 'esports',
    accent: '#8b5cf6',
  },
  {
    name: 'Chess',
    slug: 'chess',
    accent: '#22c55e',
  },
  {
    name: 'Free Fire',
    slug: 'free-fire',
    accent: '#f97316',
  },
  {
    name: 'Off-Topic / Lounge',
    slug: 'offtopic',
    accent: '#7dd3fc',
  },
]

export default function MobileNav({
  activeSlug,
}: MobileNavProps) {
  return (
    <div className="community-mobile-nav border-b border-[#e3e7ed] bg-[#74A662] md:hidden">
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {categories.map((category) => {
          const active = activeSlug === category.slug

          return (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              prefetch={true}
              className={`community-mobile-nav__link inline-flex min-h-[44px] shrink-0 items-center rounded-full border px-4 py-2 text-[11px] font-medium transition ${
                active
                  ? 'border-[#6a9e59] bg-[#6a9e59] text-white shadow-sm'
                  : 'border-[#89b873] bg-[#87b96f] text-white/90 hover:border-[#5d9150] hover:bg-[#6d9f5e]'
              }`}
              style={{
                borderColor: active ? category.accent : undefined,
                boxShadow: active
                  ? `inset 0 -2px 0 ${category.accent}`
                  : undefined,
              }}
            >
              <span
                aria-hidden="true"
                className="mr-2 inline-block h-2 w-2 align-[1px]"
                style={{ backgroundColor: category.accent }}
              />
              {category.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
