type ModDashboardProps = {
  role: string
  reports: Array<Record<string, unknown>>
  threads: Array<Record<string, unknown>>
  comments: Array<Record<string, unknown>>
  actions: Array<Record<string, unknown>>
}

export default function ModDashboard({
  role,
  reports,
  threads,
  comments,
  actions,
}: ModDashboardProps) {
  const statCards = [
    {
      label: 'Pending reports',
      value: reports.length,
    },
    {
      label: 'Threads',
      value: threads.length,
    },
    {
      label: 'Comments',
      value: comments.length,
    },
    {
      label: 'Recent actions',
      value: actions.length,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="border p-4"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-muted)' }}
            >
              {card.label}
            </div>
            <div
              className="mt-2 text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div
          className="border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="border-b px-4 py-3 text-sm font-bold"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            Pending Reports
          </div>

          <div className="divide-y divide-[var(--border)]">
            {reports.length === 0 ? (
              <div
                className="px-4 py-6 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                No pending reports.
              </div>
            ) : (
              reports.map((report) => (
                <div key={String(report.id)} className="px-4 py-3">
                  <div
                    className="text-xs font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {String(report.target_type ?? 'report')}
                  </div>
                  <div
                    className="mt-1 text-[10px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {String(report.reason ?? 'No reason provided')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div
          className="border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="border-b px-4 py-3 text-sm font-bold"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            Recent Moderation Actions
          </div>

          <div className="divide-y divide-[var(--border)]">
            {actions.length === 0 ? (
              <div
                className="px-4 py-6 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                No moderation activity yet.
              </div>
            ) : (
              actions.map((action) => (
                <div key={String(action.id)} className="px-4 py-3">
                  <div
                    className="text-xs font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {String(action.action ?? 'moderation action')}
                  </div>
                  <div
                    className="mt-1 text-[10px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {String(action.reason ?? 'No reason supplied')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div
          className="border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="border-b px-4 py-3 text-sm font-bold"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            Threads
          </div>

          <div className="divide-y divide-[var(--border)]">
            {threads.length === 0 ? (
              <div
                className="px-4 py-6 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                No threads found.
              </div>
            ) : (
              threads.map((thread) => (
                <div key={String(thread.id)} className="px-4 py-3">
                  <div
                    className="text-xs font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {String(thread.title ?? 'Untitled thread')}
                  </div>
                  <div
                    className="mt-1 text-[10px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {thread.deleted_at
                      ? 'Deleted'
                      : 'Active'}
                    {thread.is_locked ? ' • Locked' : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div
          className="border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="border-b px-4 py-3 text-sm font-bold"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            Comments
          </div>

          <div className="divide-y divide-[var(--border)]">
            {comments.length === 0 ? (
              <div
                className="px-4 py-6 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                No comments found.
              </div>
            ) : (
              comments.map((comment) => (
                <div key={String(comment.id)} className="px-4 py-3">
                  <div
                    className="text-xs font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {String(comment.thread_id ?? 'comment')}
                  </div>
                  <div
                    className="mt-1 text-[10px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {comment.deleted_at ? 'Deleted' : 'Active'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
        Role: {role}
      </div>
    </div>
  )
}
