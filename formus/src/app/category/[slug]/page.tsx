import Link from 'next/link'
import { notFound } from 'next/navigation'

import ForumShell from '@/components/forum/forum-shell'
import CommunityHeader from '@/components/forum/community-header'
import ThreadCard from '@/components/forum/thread-card'

import { createClient } from '@/lib/supabase/server'

const communityData: Record<
  string,
  {
    name: string
    leader: string
    discussions: string
    members: string
  }
> = {
  esports: {
    name: 'Esports',
    leader: 'FORMUS',
    discussions: '420',
    members: '9k',
  },

  bgmi: {
    name: 'BGMI',
    leader: 'KRAFTON',
    discussions: '1.2K',
    members: '18k',
  },

  valorant: {
    name: 'Valorant',
    leader: 'RIOT GAMES',
    discussions: '850',
    members: '12k',
  },

  chess: {
    name: 'Chess',
    leader: 'CHESS',
    discussions: '110',
    members: '4k',
  },

  'free-fire': {
    name: 'Free Fire',
    leader: 'GARENA',
    discussions: '275',
    members: '11k',
  },

  offtopic: {
    name: 'Off-Topic / Lounge',
    leader: 'FORMUS',
    discussions: '315',
    members: '7k',
  },
}

const THREADS_PER_PAGE = 30

type CategoryPageProps = {
  params: Promise<{
    slug: string
  }>

  searchParams: Promise<{
    page?: string
  }>
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params
  const { page } = await searchParams

  const community = communityData[slug]

  if (!community) {
    notFound()
  }

  const requestedPage = Number(page ?? '1')

  const currentPage =
    Number.isInteger(requestedPage) &&
    requestedPage > 0
      ? requestedPage
      : 1

  const supabase = await createClient()

  /*
   * Get the total number of threads
   * in this category.
   */
  const {
    count: totalThreads,
    error: countError,
  } = await supabase
    .from('thread_stats')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('category_slug', slug)

  if (countError) {
    console.error(
      'Category thread count error:',
      countError
    )
  }

  const total = totalThreads ?? 0

  /*
   * Calculate how many pages are required.
   *
   * Example:
   * 30 threads  = 1 page
   * 31 threads  = 2 pages
   * 60 threads  = 2 pages
   * 61 threads  = 3 pages
   */
  const totalPages = Math.max(
    1,
    Math.ceil(total / THREADS_PER_PAGE)
  )

  /*
   * Prevent invalid URLs such as:
   *
   * ?page=999
   */
  const safePage = Math.min(
    currentPage,
    totalPages
  )

  /*
   * Calculate which rows Supabase should return.
   */
  const from =
    (safePage - 1) *
    THREADS_PER_PAGE

  const to =
    from +
    THREADS_PER_PAGE -
    1

  /*
   * Load only the 30 threads
   * belonging to the current page.
   */
  const {
    data: threads,
    error: threadsError,
  } = await supabase
    .from('thread_stats')
    .select('*')
    .eq('category_slug', slug)
    .order('score', {
      ascending: false,
    })
    .order('created_at', {
      ascending: false,
    })
    .range(from, to)

  if (threadsError) {
    console.error(
      'Category threads error:',
      threadsError
    )
  }

  const threadList = threads ?? []

  /*
   * Create the page numbers shown
   * in the pagination bar.
   *
   * We don't show 50 page numbers at once.
   */
  const pageNumbers: number[] = []

  const startPage = Math.max(
    1,
    safePage - 2
  )

  const endPage = Math.min(
    totalPages,
    safePage + 2
  )

  for (
    let number = startPage;
    number <= endPage;
    number++
  ) {
    pageNumbers.push(number)
  }

  return (
    <ForumShell activeSlug={slug}>
      <div className="mx-auto max-w-[1000px]">

        {/* COMMUNITY HEADER */}

        <CommunityHeader
          name={community.name}
          slug={slug}
          leader={community.leader}
          discussions={community.discussions}
          members={community.members}
        />

        {/* SORT BAR */}

        <div className="flex items-center justify-between py-4">
          <div className="flex gap-2">

            <button
              type="button"
              className="rounded-full bg-[#286ff1] px-5 py-2 text-[10px] font-bold text-white"
            >
              Latest
            </button>

            <button
              type="button"
              className="rounded-full bg-[#eef2f7] px-5 py-2 text-[10px] font-medium text-[#657286] dark:bg-[#292929] dark:text-[#b8b8b8]"
            >
              Top
            </button>

            <button
              type="button"
              className="rounded-full bg-[#eef2f7] px-5 py-2 text-[10px] font-medium text-[#657286] dark:bg-[#292929] dark:text-[#b8b8b8]"
            >
              Most Replies
            </button>

          </div>

          <span className="hidden text-[10px] text-[#98a2b1] dark:text-[#888] sm:block">
            {total === 0
              ? 'No threads'
              : `Showing ${from + 1}-${Math.min(
                  from + THREADS_PER_PAGE,
                  total
                )} of ${total} threads`}
          </span>
        </div>

        {/* THREAD LIST */}

        <div
          className="overflow-hidden rounded-[15px] border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {threadList.length > 0 ? (
            threadList.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
              />
            ))
          ) : (
            <div
              className="px-6 py-12 text-center text-sm"
              style={{
                color: 'var(--text-secondary)',
              }}
            >
              No threads yet.
            </div>
          )}
        </div>

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="flex items-center justify-between py-5">

            {/* PREVIOUS */}

            {safePage > 1 ? (
              <Link
                href={`/category/${slug}?page=${safePage - 1}`}
                scroll={true}
                className="rounded-lg border bg-white px-4 py-2 text-[10px] font-medium text-[#657286] transition hover:bg-[#f5f7fa] dark:bg-[#222] dark:text-[#999] dark:hover:bg-[#292929]"
                style={{
                  borderColor: 'var(--border)',
                }}
              >
                Previous
              </Link>
            ) : (
              <span
                className="rounded-lg border bg-white px-4 py-2 text-[10px] text-[#9aa4b2] dark:bg-[#222] dark:text-[#777]"
                style={{
                  borderColor: 'var(--border)',
                  opacity: 0.5,
                }}
              >
                Previous
              </span>
            )}

            {/* PAGE NUMBERS */}

            <div className="flex items-center gap-3">

              {/* FIRST PAGE + ELLIPSIS */}

              {startPage > 1 && (
                <>
                  <Link
                    href={`/category/${slug}?page=1`}
                    scroll={true}
                    className="text-[10px] text-[#657286] transition hover:text-[#286ff1] dark:text-[#999]"
                  >
                    1
                  </Link>

                  {startPage > 2 && (
                    <span className="text-[10px] text-[#98a2b1]">
                      ...
                    </span>
                  )}
                </>
              )}

              {/* CURRENT PAGE RANGE */}

              {pageNumbers.map((number) => {
                const active =
                  number === safePage

                return (
                  <Link
                    key={number}
                    href={`/category/${slug}?page=${number}`}
                    scroll={true}
                    className={
                      active
                        ? 'flex h-7 w-7 items-center justify-center rounded-lg bg-[#286ff1] text-[10px] font-bold text-white'
                        : 'text-[10px] text-[#657286] transition hover:text-[#286ff1] dark:text-[#999]'
                    }
                  >
                    {number}
                  </Link>
                )
              })}

              {/* LAST PAGE + ELLIPSIS */}

              {endPage < totalPages && (
                <>
                  {endPage <
                    totalPages - 1 && (
                    <span className="text-[10px] text-[#98a2b1]">
                      ...
                    </span>
                  )}

                  <Link
                    href={`/category/${slug}?page=${totalPages}`}
                    scroll={true}
                    className="text-[10px] text-[#657286] transition hover:text-[#286ff1] dark:text-[#999]"
                  >
                    {totalPages}
                  </Link>
                </>
              )}

            </div>

            {/* NEXT */}

            {safePage < totalPages ? (
              <Link
                href={`/category/${slug}?page=${safePage + 1}`}
                scroll={true}
                className="rounded-lg border bg-white px-4 py-2 text-[10px] font-medium text-[#657286] transition hover:bg-[#f5f7fa] dark:bg-[#222] dark:text-[#999] dark:hover:bg-[#292929]"
                style={{
                  borderColor: 'var(--border)',
                }}
              >
                Next
              </Link>
            ) : (
              <span
                className="rounded-lg border bg-white px-4 py-2 text-[10px] text-[#9aa4b2] dark:bg-[#222] dark:text-[#777]"
                style={{
                  borderColor: 'var(--border)',
                  opacity: 0.5,
                }}
              >
                Next
              </span>
            )}

          </div>
        )}

        {/* MOBILE THREAD COUNT */}

        <div
          className="pb-4 text-center text-[10px] sm:hidden"
          style={{
            color: 'var(--text-muted)',
          }}
        >
          {total === 0
            ? 'No threads'
            : `Showing ${from + 1}-${Math.min(
                from + THREADS_PER_PAGE,
                total
              )} of ${total}`}
        </div>

      </div>
    </ForumShell>
  )
}