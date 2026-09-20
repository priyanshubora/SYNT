import type { Metadata } from 'next'
import Link from 'next/link'

import ForumShell from '@/components/forum/forum-shell'

export const metadata: Metadata = {
  title: 'Rules — FORMUS',
  description:
    'The community rules of Formus, the esports discussion platform by SNYT Esports.',
}

const rules = [
  {
    title: 'Be respectful',
    description:
      'Treat every member with respect. Harassment, hate speech, threats and personal attacks are not tolerated anywhere on Formus.',
  },
  {
    title: 'Post in the right community',
    description:
      'Keep threads in the community they belong to. BGMI talk stays in BGMI, Valorant stays in Valorant, and everything else lands in the lounge.',
  },
  {
    title: 'No spam or self-promotion',
    description:
      'Do not flood communities with repeated posts, referral links or ads. Share your content where it is welcome and add value to the discussion.',
  },
  {
    title: 'No cheats, leaks or account selling',
    description:
      'Posting, sharing or trading cheats, exploits, leaked content or game accounts will get you banned without warning.',
  },
  {
    title: 'Mark your spoilers',
    description:
      'Tournament results, roster changes and match outcomes deserve a spoiler warning. Not everyone has watched the series yet.',
  },
  {
    title: 'Protect personal information',
    description:
      'Never post private data — addresses, phone numbers, socials — not even your own. What goes on the internet stays on the internet.',
  },
  {
    title: 'Vote honestly',
    description:
      'Upvote and downvote based on quality, not allegiances. Vote manipulation, brigading and bot voting are strictly prohibited.',
  },
  {
    title: 'Moderators have the final say',
    description:
      'Moderator decisions keep communities healthy. If you disagree with one, appeal calmly instead of fighting it out in the threads.',
  },
]

const enforcement = [
  {
    stage: 'Warning',
    description:
      'A moderator points out the broken rule and removes the content if needed.',
  },
  {
    stage: 'Post removal',
    description:
      'Threads or comments that break the rules are removed and noted on your account.',
  },
  {
    stage: 'Temporary ban',
    description:
      'Repeated violations lead to a temporary break from posting and commenting.',
  },
  {
    stage: 'Permanent ban',
    description:
      'Severe or continued abuse ends in losing access to Formus for good.',
  },
]

export default function RulesPage() {
  return (
    <ForumShell>
      <div className="mx-auto max-w-4xl">

        {/* PAGE HEADER */}

        <div className="mb-8">
          <p className="text-sm font-medium text-neutral-500">
            FORMUS
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Community rules
          </h1>

          <p className="mt-2 text-neutral-400">
            Short, simple and enforced in every community. Read them once,
            follow them always.
          </p>
        </div>

        {/* RULES LIST */}

        <div
          className="overflow-hidden rounded-[15px] border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {rules.map((rule, index) => (
            <div
              key={rule.title}
              className={`flex gap-4 px-5 py-4 ${
                index < rules.length - 1 ? 'border-b' : ''
              }`}
              style={{
                borderColor: 'var(--border)',
              }}
            >
              <span
                className="w-6 shrink-0 text-[13px] font-black tabular-nums"
                style={{
                  color: 'var(--accent)',
                }}
              >
                {index + 1}
              </span>

              <div className="min-w-0">
                <h2
                  className="text-[13px] font-bold"
                  style={{
                    color: 'var(--text-primary)',
                  }}
                >
                  {rule.title}
                </h2>

                <p
                  className="mt-1 text-[11px] leading-5"
                  style={{
                    color: 'var(--text-secondary)',
                  }}
                >
                  {rule.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ENFORCEMENT */}

        <div className="mt-8">
          <h2 className="text-[15px] font-bold">
            How enforcement works
          </h2>

          <p
            className="mt-1 text-[11px]"
            style={{
              color: 'var(--text-muted)',
            }}
          >
            Most issues end at step one. Serious violations skip straight to the
            end.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {enforcement.map((step, index) => (
              <div
                key={step.stage}
                className="rounded-[12px] border p-4"
                style={{
                  background: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                <span
                  className="text-[10px] font-black tabular-nums"
                  style={{
                    color: 'var(--accent)',
                  }}
                >
                  0{index + 1}
                </span>

                <h3
                  className="mt-1 text-[12px] font-bold"
                  style={{
                    color: 'var(--text-primary)',
                  }}
                >
                  {step.stage}
                </h3>

                <p
                  className="mt-1 text-[10px] leading-4"
                  style={{
                    color: 'var(--text-secondary)',
                  }}
                >
                  {step.description}
                </p>
              </div>
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
            Ready to post?
          </h2>

          <p
            className="mt-1 text-[11px]"
            style={{
              color: 'var(--text-secondary)',
            }}
          >
            Follow the rules and the conversation will take care of itself.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/new"
              className="rounded-lg bg-[#74A662] px-4 py-2 text-[11px] font-bold text-white transition hover:bg-[#669a56]"
            >
              Start a discussion
            </Link>

            <Link
              href="/about"
              className="rounded-lg border bg-white px-4 py-2 text-[11px] font-medium text-[#657286] transition hover:bg-[#f5f7fa] dark:bg-[#222] dark:text-[#999] dark:hover:bg-[#292929]"
              style={{
                borderColor: 'var(--border)',
              }}
            >
              What is Formus?
            </Link>
          </div>
        </div>

      </div>
    </ForumShell>
  )
}
