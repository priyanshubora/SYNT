'use client'

import { startTransition, useOptimistic } from 'react'
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
  const [selectedSort, setSelectedSort] = useOptimistic(currentSort)

  const goToSort = (value: SortType) => {
    const href =
      value === 'latest'
        ? basePath
        : `${basePath}?sort=${value}`

    startTransition(() => {
      setSelectedSort(value)
      router.push(href, { scroll: false })
    })
  }

  return (
    <div className="sort-filter" role="group" aria-label="Sort discussions">
      <span
        className="sort-filter__indicator"
        aria-hidden="true"
        style={{ transform: `translateX(${options.findIndex(({ value }) => value === selectedSort) * 100}%)` }}
      />
      {options.map(({ value, label }) => {
        const active = selectedSort === value

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
            aria-pressed={active}
            className={`sort-filter__option${active ? ' is-active' : ''}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
