type CommentListProps = {
  comments: Array<{
    id: string
    content: string
    created_at: string
    author: {
      username: string
      team: {
        name: string
      } | null
    } | null
  }>
}

export default function CommentList({
  comments,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-800 p-8 text-center">
        <p className="text-sm text-neutral-500">
          No comments yet.
        </p>

        <p className="mt-1 text-sm text-neutral-600">
          Someone has to be brave enough to start.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"
        >
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-white">
              {comment.author?.username ?? 'Unknown user'}
            </span>

            {comment.author?.team && (
              <>
                <span className="text-neutral-600">
                  •
                </span>

                <span className="text-neutral-400">
                  {comment.author.team.name}
                </span>
              </>
            )}

            <span className="text-neutral-600">
              •
            </span>

            <span className="text-xs text-neutral-600">
              {new Date(
                comment.created_at
              ).toLocaleString()}
            </span>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-300">
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  )
}