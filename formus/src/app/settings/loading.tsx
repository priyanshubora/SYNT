import ForumShell from '@/components/forum/forum-shell'

export default function SettingsLoading() {
  return (
    <ForumShell>
      <div className="mx-auto max-w-[800px]" aria-busy="true" aria-label="Loading settings">
        <span className="sr-only">Loading settings…</span>
        <div className="motion-safe:animate-pulse h-6 w-28 bg-[var(--surface-secondary)]" />
        <div className="motion-safe:animate-pulse mt-2 h-3 w-64 bg-[var(--surface-secondary)]" />
        <div className="mt-5 border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="space-y-4">
            <div className="motion-safe:animate-pulse h-12 bg-[var(--surface-secondary)]" />
            <div className="motion-safe:animate-pulse h-12 bg-[var(--surface-secondary)]" />
            <div className="motion-safe:animate-pulse h-24 bg-[var(--surface-secondary)]" />
          </div>
        </div>
      </div>
    </ForumShell>
  )
}
