'use client'

import Link from 'next/link'

type MobileNavProps = {
  activeSlug?: string
}

const categories = [
  {
    name: 'BGMI',
    slug: 'bgmi',
  },
  {
    name: 'Valorant (VLR)',
    slug: 'valorant',
  },
   {
    name: 'Esports',
    slug: 'esports',
  },
  {
    name: 'Chess',
    slug: 'chess',
  },
  {
    name: 'Free Fire',
    slug: 'free-fire',
  },
  {
    name: 'Off-Topic / Lounge',
    slug: 'offtopic',
  },
]

export default function MobileNav({
  activeSlug,
}: MobileNavProps) {
  return (
    <div className="border-b border-[#e3e7ed] bg-white md:hidden">

      <div className="flex gap-2 overflow-x-auto px-4 py-3">

        {categories.map((category) => {
          const active = activeSlug === category.slug

          return (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-medium transition ${
                active
                  ? 'border-[#286ff1] bg-[#286ff1] text-white'
                  : 'border-[#e1e6ed] bg-white text-[#687386] hover:border-[#286ff1] hover:text-[#286ff1]'
              }`}
            >
              {category.name}
            </Link>
          )
        })}

      </div>

    </div>
  )
}