import ForumShell from '@/components/forum/forum-shell'
import CommunityHeader from '@/components/forum/community-header'
import ThreadCard from '@/components/forum/thread-card'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const community = communityData[slug]

  if (!community) {
    notFound()
  }

  const supabase = await createClient()

  const { data: threads, error } = await supabase
    .from('thread_stats')
    .select('*')
    .eq('category_slug', slug)
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Category threads error:', error)
  }

  const threadList = threads ?? []

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
            Showing {threadList.length} threads
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

        <div className="flex items-center justify-between py-5">

          <button
            type="button"
            className="rounded-lg border bg-white px-4 py-2 text-[10px] text-[#9aa4b2] dark:bg-[#222] dark:text-[#777]"
            style={{
              borderColor: 'var(--border)',
            }}
          >
            Previous
          </button>

          <div className="flex items-center gap-3">

            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#286ff1] text-[10px] font-bold text-white"
            >
              1
            </button>

            <button
              type="button"
              className="text-[10px] text-[#657286] dark:text-[#999]"
            >
              2
            </button>

            <button
              type="button"
              className="text-[10px] text-[#657286] dark:text-[#999]"
            >
              3
            </button>

          </div>

          <button
            type="button"
            className="rounded-lg border bg-white px-4 py-2 text-[10px] text-[#657286] dark:bg-[#222] dark:text-[#999]"
            style={{
              borderColor: 'var(--border)',
            }}
          >
            Next
          </button>

        </div>

      </div>

    </ForumShell>
  )
}