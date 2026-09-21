'use client'

import { startTransition } from 'react'
import { useRouter } from 'next/navigation'

type SortType = 'latest' | 'top' | 'replies'

type SortFilterProps = {
  currentSort: SortType
  basePath: string
}

const options: Array<{
  value: SortType
  label: string
}> = [
  { value: 'latest', label: 'Latest' },
  { value: 'top', label: 'Top' },
  { value: 'replies', label: 'Most Replies' },
]

export default function SortFilter({
  currentSort,
  basePath,
}: SortFilterProps) {
  const router = useRouter()

  const goToSort = (value: SortType) => {
    const href =
      value === 'latest'
        ? basePath
        : `${basePath}?sort=${value}`

    startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  return (
    <div className="flex gap-2">
      {options.map(({ value, label }) => {
        const active = currentSort === value

        return (
          <button
            key={value}
            type="button"
            onMouseEnter={() => {
              const href =
                value === 'latest'
                  ? basePath
                  : `${basePath}?sort=${value}`

              router.prefetch(href)
            }}
            onFocus={() => {
              const href =
                value === 'latest'
                  ? basePath
                  : `${basePath}?sort=${value}`

              router.prefetch(href)
            }}
            onClick={() => goToSort(value)}
            className="rounded-full px-5 py-2 text-[10px] font-bold transition"
            style={{
              background: active
                ? '#74A662'
                : 'var(--surface-secondary)',
              color: active
                ? '#ffffff'
                : 'var(--text-secondary)',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
