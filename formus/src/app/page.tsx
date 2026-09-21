import Link from 'next/link'

import ForumShell from '@/components/forum/forum-shell'
import RealtimeRefresh from '@/components/forum/realtime-refresh'
import SortFilter from '@/components/forum/sort-filter'
import ThreadCard from '@/components/forum/thread-card'

import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

const THREADS_PER_PAGE = 30

type SortType =
  | 'latest'
  | 'top'
  | 'replies'

type HomePageProps = {
  searchParams: Promise<{
    page?: string
    sort?: string
  }>
}

export default async function HomePage({
  searchParams,
}: HomePageProps) {
  const { page, sort } =
    await searchParams

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

  const supabase = await createClient()

  /*
   * TOP and MOST REPLIES only
   * consider the last 7 days.
   */

  const sevenDaysAgo = new Date()

  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 7
  )

  /*
   * COUNT
   */

  let countQuery = supabase
    .from('threads')
    .select('*', {
      count: 'exact',
      head: true,
    })

  if (
    currentSort === 'top' ||
    currentSort === 'replies'
  ) {
    countQuery = countQuery.gte(
      'created_at',
      sevenDaysAgo.toISOString()
    )
  }

  const {
    count: totalThreads,
    error: countError,
  } = await countQuery

  if (countError) {
    console.error(
      'Homepage thread count error:',
      countError
    )
  }

  const total = totalThreads ?? 0

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
   * THREAD QUERY
   */

  let threadQuery = supabase
    .from('thread_stats')
    .select(`
      id,
      title,
      content,
      created_at,
      category_name,
      category_slug,
      author_username,
      team_name,
      team_logo_url,
      score,
      vote_count,
      comment_count
    `)

  /*
   * TOP
   *
   * Highest scoring threads
   * from the last 7 days.
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
   * Most commented threads
   * from the last 7 days.
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
    error,
  } = await threadQuery.range(
    from,
    to
  )

  /*
   * PAGINATION
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
   * URL HELPERS
   */

  function pageUrl(
    targetPage: number
  ) {
    if (currentSort === 'latest') {
      return targetPage === 1
        ? '/'
        : `/?page=${targetPage}`
    }

    return `/?sort=${currentSort}&page=${targetPage}`
  }

  function sortUrl(
    targetSort: SortType
  ) {
    if (targetSort === 'latest') {
      return '/'
    }

    return `/?sort=${targetSort}`
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
      <RealtimeRefresh />

      <ForumShell>
        <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="mb-5">

          <p
            className="text-sm font-medium"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            SNYT
          </p>

          <h1
            className="mt-1 text-3xl font-bold"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            {currentSort === 'top'
              ? 'Top discussions'
              : currentSort ===
                  'replies'
                ? 'Most replied discussions'
                : 'Latest discussions'}
          </h1>

          <p
            className="mt-2"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            {currentSort === 'top'
              ? 'The highest-scoring conversations from the last 7 days.'
              : currentSort ===
                  'replies'
                ? 'The conversations with the most replies from the last 7 days.'
                : 'The latest conversations across SNYT.'}
          </p>

        </div>

        {/* FILTERS */}

        <div className="mb-5 flex items-center justify-between">

          <SortFilter
            currentSort={currentSort}
            basePath="/"
          />

          <span
            className="hidden text-[10px] sm:block"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            {currentSort === 'top'
              ? 'Top this week'
              : currentSort ===
                  'replies'
                ? 'Most replies this week'
                : `Showing ${showingFrom}-${showingTo} of ${total}`}
          </span>

        </div>

        {/* THREADS */}

        {error ? (
          <div
            className="border p-5 text-red-400"
            style={{
              background:
                'var(--surface)',
              borderColor:
                'var(--border)',
            }}
          >
            <p>
              Failed to load discussions.
            </p>

            <pre className="mt-3 overflow-auto text-xs">
              {JSON.stringify(
                error,
                null,
                2
              )}
            </pre>
          </div>
        ) : threads &&
          threads.length > 0 ? (
          <div className="space-y-4">

            {threads.map(
              (thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                />
              )
            )}

          </div>
        ) : (
          <div
            className="border p-10 text-center"
            style={{
              background:
                'var(--surface)',
              borderColor:
                'var(--border)',
            }}
          >

            <h2
              className="text-lg font-semibold"
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              {currentSort === 'top'
                ? 'No top discussions this week'
                : currentSort ===
                    'replies'
                  ? 'No discussions with replies this week'
                  : 'No discussions yet'}
            </h2>

            <p
              className="mt-2 text-sm"
              style={{
                color:
                  'var(--text-muted)',
              }}
            >
              {currentSort === 'latest'
                ? 'Someone needs to start a discussion.'
                : 'There are no qualifying discussions from the last 7 days.'}
            </p>

            {currentSort === 'latest' && (
              <Link
                href="/new"
                className="mt-5 inline-block border px-4 py-2 text-sm font-semibold"
                style={{
                  background:
                    'var(--accent)',
                  borderColor:
                    'var(--accent)',
                  color: '#ffffff',
                }}
              >
                Create the first thread
              </Link>
            )}

          </div>
        )}

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
                className="rounded-lg border px-4 py-2 text-[10px] font-medium"
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
                className="rounded-lg border px-4 py-2 text-[10px] font-medium"
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

        {/* COUNT */}

        <div
          className="pb-5 text-center text-[10px]"
          style={{
            color:
              'var(--text-muted)',
          }}
        >
          {total === 0
            ? 'No discussions'
            : currentSort === 'top'
              ? `Top discussions this week · ${showingFrom}-${showingTo} of ${total}`
              : currentSort ===
                  'replies'
                ? `Most replies this week · ${showingFrom}-${showingTo} of ${total}`
                : `Showing ${showingFrom}-${showingTo} of ${total} discussions`}
        </div>

      </div>
      </ForumShell>
    </>
  )
}