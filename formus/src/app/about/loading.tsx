import ForumShell from '@/components/forum/forum-shell'

export default function AboutLoading() {
  return (
    <ForumShell>
      <div className="mx-auto max-w-4xl" aria-busy="true" aria-label="Loading About Formus">
        <span className="sr-only">Loading About Formus…</span>
        <div className="motion-safe:animate-pulse mb-7 h-8 w-56 bg-[var(--surface-secondary)]" />
        <div className="motion-safe:animate-pulse h-36 border border-[var(--border)] bg-[var(--surface)]" />
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="motion-safe:animate-pulse h-20 border border-[var(--border)] bg-[var(--surface)]" />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="motion-safe:animate-pulse h-24 border border-[var(--border)] bg-[var(--surface-secondary)]" />
          ))}
        </div>
      </div>
    </ForumShell>
  )
}
