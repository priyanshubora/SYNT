import Link from 'next/link'

type CommunityHeaderProps = {
  name: string
  slug: string
  leader: string
  discussions: string
  members: string
}

const communityColors: Record<string, string> = {
  bgmi: 'bg-[#ff7a00]',
  valorant: 'bg-[#fa4454]',
  'counter-strike-2': 'bg-[#1f2937]',
  chess: 'bg-[#e5e7eb]',
  'free-fire': 'bg-[#f59e0b]',
  offtopic: 'bg-[#64748b]',
}

export default function CommunityHeader({
  name,
  slug,
  leader,
  discussions,
  members,
}: CommunityHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[16px] border border-[#e1e7ef] bg-[#f8fafc]">

      {/* Background diagonal pattern */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent 0px, transparent 18px, #edf1f6 18px, #edf1f6 20px)',
        }}
      />

      <div className="relative flex min-h-[96px] items-center justify-between px-5 py-4">

        <div className="flex items-center gap-4">

          {/* Community logo */}
          <div
            className={`flex h-[49px] w-[49px] shrink-0 items-center justify-center rounded-[11px] text-[10px] font-black uppercase text-white shadow-sm ${
              communityColors[slug] ?? 'bg-[#286ff1]'
            }`}
          >
            {name === 'Counter-Strike 2'
              ? 'CS2'
              : name === 'Off-topic'
                ? 'OT'
                : name.substring(0, 5)}
          </div>

          <div>

            <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-[#9aa5b4]">
              Community
            </div>

            <h1 className="text-[20px] font-bold leading-none text-[#162033]">
              {name}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-[10px] text-[#718096]">

              <span>
                ◉ {discussions} Discussions
              </span>

              <span className="text-[#c4cad3]">
                •
              </span>

              <span>
                ● {members} Members
              </span>

            </div>

          </div>

        </div>

        <div className="flex flex-col items-end gap-2">
          <Link
            href={`/new?category=${slug}`}
            className="flex items-center gap-2 rounded-full bg-[#74A662] px-5 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#669a56]"
          >
            <span className="text-[15px] leading-none">+</span>
            New Thread
          </Link>
        </div>

      </div>
    </div>
  )
}