'use client'

import { useMemo, useState } from 'react'

type UserRole =
  | 'user'
  | 'moderator'
  | 'admin'

type ModeratorUser = {
  id: string
  username: string
  avatar_url: string | null
  role: UserRole
  created_at: string
}

type ModeratorManagerProps = {
  initialUsers: ModeratorUser[]
  currentUserId: string
}

export default function ModeratorManager({
  initialUsers,
  currentUserId,
}: ModeratorManagerProps) {
  const [users, setUsers] =
    useState<ModeratorUser[]>(initialUsers)

  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] =
    useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return users
    }

    return users.filter((user) =>
      user.username
        .toLowerCase()
        .includes(query),
    )
  }, [users, search])

  const moderatorCount = users.filter(
    (user) => user.role === 'moderator',
  ).length

  async function changeRole(
    userId: string,
    newRole: 'user' | 'moderator',
  ) {
    if (loadingId) {
      return
    }

    setLoadingId(userId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        '/api/admin/moderators',
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            userId,
            role: newRole,
          }),
        },
      )

      const result = await response
        .json()
        .catch(() => null)

      if (!response.ok) {
        throw new Error(
          result?.error ||
            'Unable to update user role.',
        )
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: newRole,
              }
            : user,
        ),
      )

      const changedUser = users.find(
        (user) => user.id === userId,
      )

      if (changedUser) {
        setSuccess(
          newRole === 'moderator'
            ? `${changedUser.username} is now a moderator.`
            : `${changedUser.username} is no longer a moderator.`,
        )
      }
    } catch (err) {
      console.error(
        'Moderator role update failed:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update user role.',
      )
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>

      {/* SUMMARY */}

      <div
        className="mb-5 grid grid-cols-2 border sm:grid-cols-3"
        style={{
          background:
            'var(--surface)',
          borderColor:
            'var(--border)',
        }}
      >
        <div
          className="border-r px-4 py-4"
          style={{
            borderColor:
              'var(--border)',
          }}
        >
          <div
            className="text-[9px] font-bold uppercase"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Total Users
          </div>

          <div
            className="mt-1 text-lg font-bold"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            {users.length}
          </div>
        </div>

        <div
          className="px-4 py-4 sm:border-r"
          style={{
            borderColor:
              'var(--border)',
          }}
        >
          <div
            className="text-[9px] font-bold uppercase"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Moderators
          </div>

          <div
            className="mt-1 text-lg font-bold"
            style={{
              color:
                'var(--accent)',
            }}
          >
            {moderatorCount}
          </div>
        </div>

        <div className="hidden px-4 py-4 sm:block">
          <div
            className="text-[9px] font-bold uppercase"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Admins
          </div>

          <div
            className="mt-1 text-lg font-bold"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            {
              users.filter(
                (user) =>
                  user.role === 'admin',
              ).length
            }
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div
        className="mb-4 border p-4"
        style={{
          background:
            'var(--surface)',
          borderColor:
            'var(--border)',
        }}
      >
        <label
          className="mb-2 block text-[10px] font-bold uppercase tracking-wide"
          style={{
            color:
              'var(--text-muted)',
          }}
        >
          Find User
        </label>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Search by username..."
          className="h-10 w-full border px-3 text-sm outline-none"
          style={{
            background:
              'var(--surface-secondary)',
            borderColor:
              'var(--border)',
            color:
              'var(--text-primary)',
          }}
        />
      </div>

      {/* MESSAGES */}

      {error && (
        <div
          className="mb-4 border px-4 py-3 text-xs"
          style={{
            background:
              'var(--surface)',
            borderColor:
              '#ef4444',
            color:
              '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mb-4 border px-4 py-3 text-xs"
          style={{
            background:
              'var(--surface)',
            borderColor:
              'var(--accent)',
            color:
              'var(--accent)',
          }}
        >
          {success}
        </div>
      )}

      {/* USER LIST */}

      <section
        className="border"
        style={{
          background:
            'var(--surface)',
          borderColor:
            'var(--border)',
        }}
      >
        <div
          className="border-b px-4 py-3 text-[10px] font-bold uppercase tracking-wide"
          style={{
            borderColor:
              'var(--border)',
            color:
              'var(--text-muted)',
          }}
        >
          Users
        </div>

        {filteredUsers.length === 0 ? (
          <div
            className="px-5 py-12 text-center text-sm"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            No users found.
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isCurrentUser =
              user.id ===
              currentUserId

            const isLoading =
              loadingId === user.id

            return (
              <div
                key={user.id}
                className="flex flex-col gap-4 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  borderColor:
                    'var(--border)',
                }}
              >

                {/* USER */}

                <div className="flex min-w-0 items-center gap-3">

                  {user.avatar_url ? (
                    <img
                      src={
                        user.avatar_url
                      }
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background:
                          'var(--accent-soft)',
                        color:
                          'var(--accent)',
                      }}
                    >
                      {user.username
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">

                    <div
                      className="truncate text-sm font-semibold"
                      style={{
                        color:
                          'var(--text-primary)',
                      }}
                    >
                      {user.username}

                      {isCurrentUser && (
                        <span
                          className="ml-2 text-[9px] font-normal"
                          style={{
                            color:
                              'var(--text-muted)',
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>

                    <div
                      className="mt-1 text-[10px]"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      Joined{' '}
                      {new Date(
                        user.created_at,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* ROLE + ACTION */}

                <div className="flex items-center gap-3">

                  {user.role ===
                    'admin' && (
                    <span
                      className="border px-2 py-1 text-[9px] font-bold uppercase"
                      style={{
                        background:
                          'var(--accent-soft)',
                        borderColor:
                          'var(--border)',
                        color:
                          'var(--accent)',
                      }}
                    >
                      Admin
                    </span>
                  )}

                  {user.role ===
                    'moderator' && (
                    <span
                      className="border px-2 py-1 text-[9px] font-bold uppercase"
                      style={{
                        background:
                          'var(--accent-soft)',
                        borderColor:
                          'var(--border)',
                        color:
                          'var(--accent)',
                      }}
                    >
                      Moderator
                    </span>
                  )}

                  {user.role ===
                    'user' && (
                    <span
                      className="border px-2 py-1 text-[9px] font-bold uppercase"
                      style={{
                        background:
                          'var(--surface-secondary)',
                        borderColor:
                          'var(--border)',
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      User
                    </span>
                  )}

                  {user.role ===
                    'admin' ? (
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      Protected
                    </span>
                  ) : user.role ===
                    'moderator' ? (
                    <button
                      type="button"
                      disabled={
                        isLoading
                      }
                      onClick={() =>
                        changeRole(
                          user.id,
                          'user',
                        )
                      }
                      className="border px-3 py-2 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        borderColor:
                          'var(--border)',
                        color:
                          'var(--text-secondary)',
                      }}
                    >
                      {isLoading
                        ? 'Updating...'
                        : 'Remove Moderator'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        isLoading
                      }
                      onClick={() =>
                        changeRole(
                          user.id,
                          'moderator',
                        )
                      }
                      className="border px-3 py-2 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background:
                          'var(--accent)',
                        borderColor:
                          'var(--accent)',
                        color:
                          '#ffffff',
                      }}
                    >
                      {isLoading
                        ? 'Updating...'
                        : 'Make Moderator'}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </section>
    </div>
  )
}