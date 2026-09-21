import ForumHeader from './forum-header'
import CommunitySidebar from './community-sidebar'
import MobileNav from './mobile-nav'

type ForumShellProps = {
  children: React.ReactNode
  activeSlug?: string
  counts?: Record<string, number>
}

export default function ForumShell({
  children,
  activeSlug,
  counts = {},
}: ForumShellProps) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        background: 'var(--page-background)',
        color: 'var(--text-primary)',
      }}
    >
      <ForumHeader />

      <MobileNav activeSlug={activeSlug} />

      {/* MAIN AREA */}

      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <div className="hidden md:block">
          <CommunitySidebar
            activeSlug={activeSlug}
            counts={counts}
          />
        </div>

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 md:px-5 md:py-5">
          {children}
        </main>
      </div>

      {/* FOOTER */}

      <footer
        className="mt-auto border-t"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-5 py-5 text-[9px] text-[#9aa4b2] sm:flex-row">
          <span>
            © 2026 SNYT Esports. Built for competitive gaming communities.
          </span>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-end">
            <a href="/rules" className="transition hover:text-white">
              Guidelines
            </a>
            <a href="/about" className="transition hover:text-white">
              Privacy
            </a>
            <a href="mailto:borapriyanshu24@gmail.com" className="transition hover:text-white">
              Support
            </a>
            <a href="mailto:borapriyanshu24@gmail.com" className="transition hover:text-white">
              borapriyanshu24@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}