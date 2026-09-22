import Link from 'next/link'
import { notFound } from 'next/navigation'

import ForumShellWithCounts from '@/components/forum/forum-shell-with-counts'
import CommunityHeader from '@/components/forum/community-header'
import RealtimeRefresh from '@/components/forum/realtime-refresh'
import SortFilter from '@/components/forum/sort-filter'
import ThreadCard from '@/components/forum/thread-card'

import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

const communityMeta: Record<
  string,
  {
    name: string
    leader: string
  }
> = {
  esports: {
    name: 'Esports',
    leader: 'FORMUS',
  },

  bgmi: {
    name: 'BGMI',
    leader: 'KRAFTON',
  },

  valorant: {
    name: 'Valorant',
    leader: 'RIOT GAMES',
  },

  chess: {
    name: 'Chess',
    leader: 'CHESS',
  },

  'free-fire': {
    name: 'Free Fire',
    leader: 'GARENA',
  },

  'off-topic': {
    name: 'Off-Topic / Lounge',
    leader: 'FORMUS',
  },

  offtopic: {
    name: 'Off-Topic / Lounge',
    leader: 'FORMUS',
  },
}

function formatCompactCount(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
  }

  return value.toString()
}

const THREADS_PER_PAGE = 30

type SortType =
  | 'latest'
  | 'top'
  | 'replies'

type CategoryPageProps = {
  params: Promise<{
    slug: string
  }>

  searchParams: Promise<{
    page?: string
    sort?: string
  }>
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params
  const { page, sort } = await searchParams

  const normalizedSlug =
    slug === 'offtopic' ? 'off-topic' : slug

  const community = communityMeta[normalizedSlug]

  const supabase = await createClient()

  const {
    data: category,
    error: categoryError,
  } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', normalizedSlug)
    .maybeSingle()

  if (!community || categoryError || !category) {
    notFound()
  }

  const currentSort: SortType =
    sort === 'top' ||
    sort === 'replies'
      ? sort
      : 'latest'

  const requestedPage = Number(
    page ?? '1'
  )

  const currentPage =
    Number.isInteger(requestedPage) &&
    requestedPage > 0
      ? requestedPage
      : 1

  const [
    categoryCountResult,
    categoryAuthorsResult,
  ] = await Promise.all([
    supabase
      .from('threads')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('category_id', category.id),
    supabase
      .from('threads')
      .select('author_id')
      .eq('category_id', category.id),
  ])

  const {
    count: totalThreads,
    error: countError,
  } = categoryCountResult

  if (countError) {
    console.error(
      'Category thread count error:',
      countError
    )
  }

  const {
    data: threadAuthors,
    error: authorError,
  } = categoryAuthorsResult

  if (authorError) {
    console.error(
      'Category member count error:',
      authorError
    )
  }

  const uniqueMembers = new Set(
    (threadAuthors ?? []).map(
      (row) => row.author_id
    )
  ).size

  const liveDiscussions = formatCompactCount(
    totalThreads ?? 0
  )
  const liveMembers = formatCompactCount(
    uniqueMembers
  )

  /*
   * TOP AND MOST REPLIES
   *
   * These filters only consider
   * threads created during the
   * last 7 days.
   */

  const sevenDaysAgo = new Date()

  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 7
  )

  /*
   * Build the base query used for
   * counting and fetching.
   */

  let countQuery = supabase
    .from('thread_stats')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('category_slug', slug)

  if (currentSort === 'top') {
    countQuery = countQuery.gte(
      'created_at',
      sevenDaysAgo.toISOString()
    )
  }

  if (currentSort === 'replies') {
    countQuery = countQuery.gte(
      'created_at',
      sevenDaysAgo.toISOString()
    )
  }

  const totalCountForList =
    (await countQuery).count ??
    totalThreads ??
    0

  const total = totalCountForList

  const totalPages = Math.max(
    1,
    Math.ceil(
      total / THREADS_PER_PAGE
    )
  )

  const safePage = Math.min(
    currentPage,
    totalPages
  )

  const from =
    (safePage - 1) *
    THREADS_PER_PAGE

  const to =
    from +
    THREADS_PER_PAGE -
    1

  /*
   * Load the actual threads.
   */

  let threadQuery = supabase
    .from('thread_stats')
    .select('*')
    .eq('category_slug', slug)

  /*
   * TOP
   *
   * Highest score during the
   * last 7 days.
   */

  if (currentSort === 'top') {
    threadQuery = threadQuery
      .gte(
        'created_at',
        sevenDaysAgo.toISOString()
      )
      .order('score', {
        ascending: false,
      })
      .order('created_at', {
        ascending: false,
      })
  }

  /*
   * MOST REPLIES
   *
   * Most comments during the
   * last 7 days.
   */

  else if (currentSort === 'replies') {
    threadQuery = threadQuery
      .gte(
        'created_at',
        sevenDaysAgo.toISOString()
      )
      .order('comment_count', {
        ascending: false,
      })
      .order('created_at', {
        ascending: false,
      })
  }

  /*
   * LATEST
   *
   * Newest threads first.
   */

  else {
    threadQuery = threadQuery
      .order('created_at', {
        ascending: false,
      })
      .order('score', {
        ascending: false,
      })
  }

  const {
    data: threads,
    error: threadsError,
  } = await threadQuery.range(
    from,
    to
  )

  if (threadsError) {
    console.error(
      'Category threads error:',
      threadsError
    )
  }

  const threadList = threads ?? []

  /*
   * Pagination numbers.
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

  /*
   * Build URLs while preserving
   * the selected filter.
   */

  function pageUrl(
    targetPage: number
  ) {
    if (currentSort === 'latest') {
      return targetPage === 1
        ? `/category/${slug}`
        : `/category/${slug}?page=${targetPage}`
    }

    return `/category/${slug}?sort=${currentSort}&page=${targetPage}`
  }

  const showingFrom =
    total === 0
      ? 0
      : from + 1

  const showingTo =
    Math.min(
      from + THREADS_PER_PAGE,
      total
    )

  return (
    <>
      <RealtimeRefresh
        channelName={`forum-live-updates:${normalizedSlug}`}
        tableFilters={[
          {
            table: 'threads',
            filter: `category_id=eq.${category.id}`,
          },
          { table: 'comments' },
          { table: 'thread_votes' },
        ]}
      />

      <ForumShellWithCounts activeSlug={slug}>
        <div className="mx-auto max-w-[1000px]">

        {/* COMMUNITY HEADER */}

        <CommunityHeader
          name={community.name}
          slug={normalizedSlug}
          discussions={liveDiscussions}
          members={liveMembers}
        />

        {/* SORT BAR */}

        <div className="flex items-center justify-between py-4">

          <SortFilter
            currentSort={currentSort}
            basePath={`/category/${slug}`}
          />

          <span
            className="hidden text-[10px] sm:block"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            {currentSort === 'top'
              ? 'Top threads this week'
              : currentSort ===
                  'replies'
                ? 'Most replies this week'
                : `Showing ${showingFrom}-${showingTo} of ${total} threads`}
          </span>

        </div>

        {/* THREAD LIST */}

        <div
          className="overflow-hidden rounded-[15px] border"
          style={{
            background:
              'var(--surface)',
            borderColor:
              'var(--border)',
          }}
        >

          {threadList.length > 0 ? (
            threadList.map(
              (thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                />
              )
            )
          ) : (
            <div
              className="px-6 py-12 text-center text-sm"
              style={{
                color:
                  'var(--text-secondary)',
              }}
            >
              {currentSort === 'top'
                ? 'No top threads from the last 7 days.'
                : currentSort ===
                    'replies'
                  ? 'No threads with replies from the last 7 days.'
                  : 'No threads yet.'}
            </div>
          )}

        </div>

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="flex items-center justify-between py-5">

            {/* PREVIOUS */}

            {safePage > 1 ? (
              <Link
                href={pageUrl(
                  safePage - 1
                )}
                scroll={true}
                className="rounded-lg border px-4 py-2 text-[10px] font-medium transition hover:opacity-80"
                style={{
                  background:
                    'var(--surface)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--text-secondary)',
                }}
              >
                Previous
              </Link>
            ) : (
              <span
                className="rounded-lg border px-4 py-2 text-[10px] opacity-40"
                style={{
                  background:
                    'var(--surface-secondary)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--text-muted)',
                }}
              >
                Previous
              </span>
            )}

            {/* PAGE NUMBERS */}

            <div className="flex items-center gap-3">

              {startPage > 1 && (
                <>
                  <Link
                    href={pageUrl(1)}
                    scroll={true}
                    className="text-[10px]"
                    style={{
                      color:
                        'var(--text-secondary)',
                    }}
                  >
                    1
                  </Link>

                  {startPage > 2 && (
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      ...
                    </span>
                  )}
                </>
              )}

              {pageNumbers.map(
                (number) => {
                  const active =
                    number === safePage

                  return (
                    <Link
                      key={number}
                      href={pageUrl(
                        number
                      )}
                      scroll={true}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold"
                      style={{
                        background:
                          active
                            ? '#286ff1'
                            : 'transparent',

                        color:
                          active
                            ? '#ffffff'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {number}
                    </Link>
                  )
                }
              )}

              {endPage < totalPages && (
                <>
                  {endPage <
                    totalPages - 1 && (
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      ...
                    </span>
                  )}

                  <Link
                    href={pageUrl(
                      totalPages
                    )}
                    scroll={true}
                    className="text-[10px]"
                    style={{
                      color:
                        'var(--text-secondary)',
                    }}
                  >
                    {totalPages}
                  </Link>
                </>
              )}

            </div>

            {/* NEXT */}

            {safePage < totalPages ? (
              <Link
                href={pageUrl(
                  safePage + 1
                )}
                scroll={true}
                className="rounded-lg border px-4 py-2 text-[10px] font-medium transition hover:opacity-80"
                style={{
                  background:
                    'var(--surface)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--text-secondary)',
                }}
              >
                Next
              </Link>
            ) : (
              <span
                className="rounded-lg border px-4 py-2 text-[10px] opacity-40"
                style={{
                  background:
                    'var(--surface-secondary)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--text-muted)',
                }}
              >
                Next
              </span>
            )}

          </div>
        )}

        {/* THREAD COUNT */}

        <div
          className="pb-4 text-center text-[10px]"
          style={{
            color:
              'var(--text-muted)',
          }}
        >
          {total === 0
            ? 'No discussions'
            : currentSort === 'top'
              ? `Showing top threads from the last 7 days · ${showingFrom}-${showingTo} of ${total}`
              : currentSort ===
                  'replies'
                ? `Showing most-replied threads from the last 7 days · ${showingFrom}-${showingTo} of ${total}`
                : `Showing ${showingFrom}-${showingTo} of ${total} threads`}
        </div>

      </div>
      </ForumShellWithCounts>
    </>
  )
}