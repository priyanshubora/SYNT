import Link from 'next/link'
import Image from 'next/image'

type CommunityHeaderProps = {
  name: string
  slug: string
  leader: string
  discussions: string
  members: string
}

const communityLogos: Record<string, string> = {
  bgmi: '/bgmi.png',
  valorant: '/valorant.png',
  chess: '/chess.png',
  'free-fire': '/free fire.png',
  'off-topic': '/off-topic.png',
  offtopic: '/off-topic.png',
  esports: '/esports.png',
}

export default function CommunityHeader({
  name,
  slug,
  leader,
  discussions,
  members,
}: CommunityHeaderProps) {
  return (
    <div className="relative overflow-hidden border border-[#e1e7ef]">

      {/* Background Banner Image */}
      <div className="absolute inset-0">
        <Image
          src="/banner.png"
          alt="Community banner"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative flex min-h-[96px] items-center justify-between px-5 py-4">

        <div className="flex items-center gap-4">

          {/* Community logo */}
          <div className="flex h-[49px] w-[49px] shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-white shadow-sm">
            {communityLogos[slug] ? (
              <Image
                src={communityLogos[slug]}
                alt={`${name} logo`}
                width={49}
                height={49}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-[10px] font-black uppercase text-[#286ff1]">
                {name.substring(0, 5)}
              </span>
            )}
          </div>

          <div>

            <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-[#ffffff]/80">
              Community
            </div>

            <h1 className="text-[20px] font-bold leading-none text-[#ffffff]">
              {name}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-[10px] text-[#ffffff]/90">

              <span>
                ◉ {discussions} Discussions
              </span>

              <span className="text-[#ffffff]/60">
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
            className="flex items-center gap-2 bg-[#74A662] px-5 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#669a56]"
          >
            <span className="text-[15px] leading-none">+</span>
            New Thread
          </Link>
        </div>

      </div>
    </div>
  )
}