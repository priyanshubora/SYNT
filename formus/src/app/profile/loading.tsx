import ForumShell from '@/components/forum/forum-shell'

export default function ProfileLoading() {
  return (
    <ForumShell>
      <div
        className="mx-auto max-w-[1100px]"
        aria-busy="true"
        aria-label="Loading profile"
      >
        <span className="sr-only">Loading profile…</span>
        <div className="grid gap-5 md:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex flex-col items-center border-b border-[var(--border)] pb-5">
              <div className="motion-safe:animate-pulse h-20 w-20 bg-[var(--surface-secondary)]" />
              <div className="motion-safe:animate-pulse mt-4 h-4 w-28 bg-[var(--surface-secondary)]" />
              <div className="motion-safe:animate-pulse mt-3 h-3 w-36 bg-[var(--surface-secondary)]" />
            </div>
            <div className="space-y-3 pt-5">
              <div className="motion-safe:animate-pulse h-10 bg-[var(--surface-secondary)]" />
              <div className="motion-safe:animate-pulse h-10 bg-[var(--surface-secondary)]" />
              <div className="motion-safe:animate-pulse h-10 bg-[var(--surface-secondary)]" />
            </div>
          </aside>
          <main>
            <div className="motion-safe:animate-pulse h-6 w-32 bg-[var(--surface-secondary)]" />
            <div className="mt-2 motion-safe:animate-pulse h-3 w-56 bg-[var(--surface-secondary)]" />
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="motion-safe:animate-pulse h-20 bg-[var(--surface-secondary)]" />
              <div className="motion-safe:animate-pulse h-20 bg-[var(--surface-secondary)]" />
              <div className="motion-safe:animate-pulse h-20 bg-[var(--surface-secondary)]" />
            </div>
            <div className="mt-5 space-y-3">
              <div className="motion-safe:animate-pulse h-24 bg-[var(--surface-secondary)]" />
              <div className="motion-safe:animate-pulse h-24 bg-[var(--surface-secondary)]" />
              <div className="motion-safe:animate-pulse h-24 bg-[var(--surface-secondary)]" />
            </div>
          </main>
        </div>
      </div>
    </ForumShell>
  )
}
