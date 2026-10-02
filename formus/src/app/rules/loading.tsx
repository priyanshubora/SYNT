import ForumShell from '@/components/forum/forum-shell'

export default function RulesLoading() {
  return (
    <ForumShell>
      <div className="mx-auto max-w-4xl" aria-busy="true" aria-label="Loading community rules">
        <span className="sr-only">Loading community rules…</span>
        <div className="motion-safe:animate-pulse mb-7 h-8 w-64 bg-[var(--surface-secondary)]" />
        <div className="border border-[var(--border)] bg-[var(--surface)]">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex gap-4 border-b border-[var(--border)] px-5 py-5 last:border-0">
              <div className="motion-safe:animate-pulse h-6 w-6 bg-[var(--surface-secondary)]" />
              <div className="flex-1">
                <div className="motion-safe:animate-pulse h-4 w-40 bg-[var(--surface-secondary)]" />
                <div className="motion-safe:animate-pulse mt-3 h-3 w-full bg-[var(--surface-secondary)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ForumShell>
  )
}
