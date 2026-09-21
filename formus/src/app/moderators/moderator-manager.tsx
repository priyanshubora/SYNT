'use client'

import { useState } from 'react'

type User = {
  id: string
  username: string
  role: string
  created_at: string
}

export default function ModeratorManager({
  users: initialUsers,
}: {
  users: User[]
}) {
  const [users, setUsers] =
    useState(initialUsers)

  const [username, setUsername] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  async function changeRole(
    targetUsername: string,
    role: 'user' | 'moderator',
  ) {
    setLoading(true)

    try {
      const response =
        await fetch(
          '/api/admin/moderators',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              username:
                targetUsername,
              role,
            }),
          },
        )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ??
            'Failed to change role.',
        )
      }

      setUsers(
        (current) =>
          current.map(
            (user) =>
              user.username ===
              targetUsername
                ? {
                    ...user,
                    role,
                  }
                : user,
          ),
      )

      setUsername('')
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to change role.',
      )
    } finally {
      setLoading(false)
    }
  }

  const moderators =
    users.filter(
      (user) =>
        user.role ===
        'moderator',
    )

  return (
    <div className="space-y-5">
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
          className="border-b px-5 py-4"
          style={{
            borderColor:
              'var(--border)',
          }}
        >
          <h2
            className="text-sm font-bold"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            Add Moderator
          </h2>

          <p
            className="mt-1 text-[10px]"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Enter the exact SNYT username.
          </p>
        </div>

        <div className="flex gap-2 px-5 py-5">
          <input
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value,
              )
            }
            placeholder="Username"
            className="h-9 flex-1 border bg-transparent px-3 text-xs outline-none"
            style={{
              borderColor:
                'var(--border)',
              color:
                'var(--text-primary)',
            }}
          />

          <button
            type="button"
            disabled={
              loading ||
              !username.trim()
            }
            onClick={() =>
              changeRole(
                username.trim(),
                'moderator',
              )
            }
            className="border px-4 text-xs font-bold text-white disabled:opacity-50"
            style={{
              background:
                'var(--accent)',
              borderColor:
                'var(--accent)',
            }}
          >
            Add Moderator
          </button>
        </div>
      </section>


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
          className="border-b px-5 py-4"
          style={{
            borderColor:
              'var(--border)',
          }}
        >
          <h2
            className="text-sm font-bold"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            Current Moderators
          </h2>
        </div>

        {moderators.length ===
        0 ? (
          <div
            className="px-5 py-8 text-center text-xs"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            No moderators yet.
          </div>
        ) : (
          moderators.map(
            (user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b px-5 py-4 last:border-b-0"
                style={{
                  borderColor:
                    'var(--border)',
                }}
              >
                <div>
                  <div
                    className="text-xs font-bold"
                    style={{
                      color:
                        'var(--text-primary)',
                    }}
                  >
                    {user.username}
                  </div>

                  <div
                    className="mt-1 text-[9px]"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    MODERATOR
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    changeRole(
                      user.username,
                      'user',
                    )
                  }
                  className="border border-red-300 px-3 py-2 text-[10px] font-bold text-red-500"
                >
                  Remove
                </button>
              </div>
            ),
          )
        )}
      </section>
    </div>
  )
}