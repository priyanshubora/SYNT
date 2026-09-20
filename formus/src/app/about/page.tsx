import type { Metadata } from 'next'
import Link from 'next/link'

import ForumShell from '@/components/forum/forum-shell'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About — FORMUS',
  description:
    'Formus is the esports discussion platform by SNYT Esports. Threads, votes and debates for every gaming community.',
}

const communities = [
  {
    name: 'Esports',
    slug: 'esports',
    description: 'General esports discussions, tournaments, teams and players.',
  },
  {
    name: 'BGMI',
    slug: 'bgmi',
    description: 'Battlegrounds Mobile India discussions.',
  },
  {
    name: 'Valorant',
    slug: 'valorant',
    description: 'Valorant esports, teams, tournaments and competitive play.',
  },
  {
    name: 'Chess',
    slug: 'chess',
    description: 'Chess discussions, tournaments, players and strategy.',
  },
  {
    name: 'Free Fire',
    slug: 'free-fire',
    description: 'Free Fire esports and community discussions.',
  },
  {
    name: 'Off-Topic / Lounge',
    slug: 'offtopic',
    description: 'Anything outside the main esports categories.',
  },
]

const communityColors: Record<string, string> = {
  esports: 'bg-[#286ff1]',
  bgmi: 'bg-[#ff7a00]',
  valorant: 'bg-[#fa4454]',
  chess: 'bg-[#64748b]',
  'free-fire': 'bg-[#f59e0b]',
  offtopic: 'bg-[#94a3b8]',
}

const features = [
  {
    icon: '+',
    title: 'Start discussions',
    description:
      'Create threads in any community and get the conversation going.',
  },
  {
    icon: '▲',
    title: 'Vote on quality',
    description:
      'Upvote sharp takes, downvote the noise. The score decides what rises.',
  },
  {
    icon: '↳',
    title: 'Reply and debate',
    description:
      'Threaded comments keep every discussion going as deep as it needs to.',
  },
  {
    icon: '◆',
    title: 'Represent your team',
    description:
      'Pick your side from real esports teams and carry it next to your name.',
  },
]

const numberFormat = new Intl.NumberFormat('en-US')

async function countRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: 'categories' | 'threads' | 'comments' | 'profiles'
): Promise<number | null> {
  const { count, error } = await supabase
    .from(table)
    .select('*', {
      count: 'exact',
      head: true,
    })

  if (error) {
    console.error(`About page ${table} count error:`, error)

    return null
  }

  return count
}

export default async function AboutPage() {
  const supabase = await createClient()

  const [categories, threads, comments, profiles] = await Promise.all([
    countRows(supabase, 'categories'),
    countRows(supabase, 'threads'),
    countRows(supabase, 'comments'),
    countRows(supabase, 'profiles'),
  ])

  const stats = [
    {
      label: 'Communities',
      value: categories,
    },
    {
      label: 'Threads',
      value: threads,
    },
    {
      label: 'Comments',
      value: comments,
    },
    {
      label: 'Members',
      value: profiles,
    },
  ]

  return (
    <ForumShell>
      <div className="mx-auto max-w-4xl">

        {/* PAGE HEADER */}

        <div className="mb-8">
          <p className="text-sm font-medium text-neutral-500">
            FORMUS
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            About Formus
          </h1>

          <p className="mt-2 text-neutral-400">
            The discussion platform for competitive gaming communities, built by
            SNYT Esports.
          </p>
        </div>

        {/* STORY */}

        <div
          className="rounded-[15px] border p-6"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <h2 className="text-[15px] font-bold">
            What is Formus?
          </h2>

          <p
            className="mt-3 text-[12px] leading-6"
            style={{
              color: 'var(--text-secondary)',
            }}
          >
            Formus is a community platform built by SNYT Esports for people who
            live competitive gaming — match reactions, roster drama, strategy
            breakdowns and everything the internet argues about after the final
            round.
          </p>

          <p
            className="mt-3 text-[11px] leading-5"
            style={{
              color: 'var(--text-secondary)',
            }}
          >
            Every community gets its own space, its own threads and its own
            voice. Create a thread, cast your vote and jump into the comments —
            the best takes rise to the top.
          </p>
        </div>

        {/* LIVE STATS */}

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[12px] border p-4 text-center"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <span
                className="text-[22px] font-black tabular-nums"
                style={{
                  color: 'var(--text-primary)',
                }}
              >
                {stat.value === null
                  ? '—'
                  : numberFormat.format(stat.value)}
              </span>

              <p
                className="mt-1 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* FEATURES */}

        <div className="mt-8">
          <h2 className="text-[15px] font-bold">
            Built for competitive gaming
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 rounded-[12px] border p-4"
                style={{
                  background: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-black text-white"
                  style={{
                    background: 'var(--accent)',
                  }}
                >
                  {feature.icon}
                </span>

                <div className="min-w-0">
                  <h3
                    className="text-[12px] font-bold"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className="mt-1 text-[10px] leading-4"
                    style={{
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMMUNITIES */}

        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-bold">
              Communities
            </h2>

            <span
              className="text-[10px]"
              style={{
                color: 'var(--text-muted)',
              }}
            >
              {numberFormat.format(categories ?? 0)} and counting
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {communities.map((community) => (
              <Link
                key={community.slug}
                href={`/category/${community.slug}`}
                className="group flex items-start gap-3 rounded-[12px] border p-4 hover:bg-[#f7f9fc] dark:hover:bg-[#292929]"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  transitionProperty: 'background-color, border-color, color',
                  transitionDuration: '150ms',
                  transitionTimingFunction: 'ease-out',
                }}
              >
                <span
                  className={`mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full ${
                    communityColors[community.slug] ?? 'bg-[#286ff1]'
                  }`}
                />

                <span className="min-w-0">
                  <span
                    className="block text-[12px] font-bold"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                  >
                    {community.name}
                  </span>

                  <span
                    className="mt-[2px] block text-[10px] leading-4"
                    style={{
                      color: 'var(--text-muted)',
                    }}
                  >
                    {community.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}

        <div
          className="mt-8 rounded-[15px] border border-dashed p-6 text-center"
          style={{
            borderColor: 'var(--border)',
          }}
        >
          <h2 className="text-[14px] font-bold">
            Join the discussion
          </h2>

          <p
            className="mt-1 text-[11px]"
            style={{
              color: 'var(--text-secondary)',
            }}
          >
            Sign in with Google and make your first post in under a minute.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-[#74A662] px-4 py-2 text-[11px] font-bold text-white transition hover:bg-[#669a56]"
            >
              Join Formus
            </Link>

            <Link
              href="/rules"
              className="rounded-lg border bg-white px-4 py-2 text-[11px] font-medium text-[#657286] transition hover:bg-[#f5f7fa] dark:bg-[#222] dark:text-[#999] dark:hover:bg-[#292929]"
              style={{
                borderColor: 'var(--border)',
              }}
            >
              Read the rules
            </Link>
          </div>
        </div>

        {/* FOOTNOTE */}

        <p
          className="mt-6 pb-2 text-center text-[10px]"
          style={{
            color: 'var(--text-muted)',
          }}
        >
          Formus is built and maintained by SNYT Esports. © 2025 SNYT Esports.
        </p>

      </div>
    </ForumShell>
  )
}
