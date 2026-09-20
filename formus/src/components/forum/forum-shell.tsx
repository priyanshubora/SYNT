import Link from 'next/link'

import ForumHeader from './forum-header'
import CommunitySidebar from './community-sidebar'
import MobileNav from './mobile-nav'

type ForumShellProps = {
  children: React.ReactNode
  activeSlug?: string
}

export default function ForumShell({
  children,
  activeSlug,
}: ForumShellProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--page-background)',
        color: 'var(--text-primary)',
      }}
    >

      <ForumHeader />

      <MobileNav activeSlug={activeSlug} />

      <div className="mx-auto flex max-w-[1400px]">

        {/* SIDEBAR */}
        <div className="hidden md:block">
          <CommunitySidebar activeSlug={activeSlug} />
        </div>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 md:px-5 md:py-5">
          {children}
        </main>

      </div>

      {/* FOOTER */}
      <footer
        className="mt-10 border-t"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-3 px-5 py-5 text-[9px] text-[#9aa4b2] sm:flex-row">

          <span>
            © 2025 SNYT Esports. Built for competitive gaming communities.
          </span>

          <div className="flex gap-5">
            <Link href="/rules" className="transition hover:text-[#657286]">
              Guidelines
            </Link>
            <span>Privacy</span>
            <span>Support</span>
          </div>

        </div>
      </footer>

    </div>
  )
}