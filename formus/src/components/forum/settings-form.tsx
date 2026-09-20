'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

type SettingsFormProps = {
  username: string
  avatarUrl: string | null
  showOnlineStatus: boolean
}

export default function SettingsForm({
  username,
  avatarUrl,
  showOnlineStatus,
}: SettingsFormProps) {
  const router = useRouter()

  const [onlineVisible, setOnlineVisible] =
    useState(showOnlineStatus)

  const [saving, setSaving] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  async function toggleOnlineStatus() {
    const newValue = !onlineVisible

    setOnlineVisible(newValue)
    setSaving(true)
    setMessage('')
    setError('')

    const supabase = createClient()

    const { error: updateError } =
      await supabase
        .from('profiles')
        .update({
          show_online_status: newValue,
        })
        .eq(
          'id',
          (
            await supabase.auth.getUser()
          ).data.user?.id
        )

    if (updateError) {
      console.error(
        'Online status setting failed:',
        updateError
      )

      setOnlineVisible(!newValue)

      setError(
        updateError.message ||
          'Unable to save setting.'
      )

      setSaving(false)
      return
    }

    setMessage('Settings saved.')
    setSaving(false)

    router.refresh()
  }

  async function signOut() {
    const supabase = createClient()

    await supabase.auth.signOut()

    window.location.href = '/'
  }

  return (
    <div className="space-y-5">

      {/* PROFILE */}

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
            Profile
          </h2>
        </div>

        <div className="px-5 py-5">

          <div className="flex items-center gap-4">

            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
                style={{
                  background:
                    'var(--accent-soft)',
                  color:
                    'var(--accent)',
                }}
              >
                {username
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <div
                className="text-sm font-bold"
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                {username}
              </div>

              <div
                className="mt-1 text-[10px]"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Profile information
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* PRIVACY */}

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
            Privacy
          </h2>
        </div>

        <div className="px-5">

          <div className="flex items-center justify-between gap-5 py-5">

            <div>

              <div
                className="text-sm font-semibold"
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                Show online status
              </div>

              <p
                className="mt-1 text-xs leading-5"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Let other users see when
                you are online.
              </p>

            </div>

            <button
              type="button"
              onClick={toggleOnlineStatus}
              disabled={saving}
              aria-label="Toggle online status visibility"
              className="relative h-6 w-11 shrink-0 rounded-full transition"
              style={{
                background:
                  onlineVisible
                    ? 'var(--accent)'
                    : 'var(--border)',
              }}
            >
              <span
                className="absolute top-1 h-4 w-4 rounded-full bg-white transition"
                style={{
                  left: onlineVisible
                    ? '24px'
                    : '4px',
                }}
              />
            </button>

          </div>

        </div>

      </section>

      {/* ACCOUNT */}

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
            Account
          </h2>
        </div>

        <div className="px-5 py-5">

          <button
            type="button"
            onClick={signOut}
            className="border px-4 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/20"
            style={{
              borderColor:
                'var(--border)',
              background:
                'var(--surface)',
            }}
          >
            Sign Out
          </button>

        </div>

      </section>

      {message && (
        <p
          className="text-xs"
          style={{
            color:
              '#22c55e',
          }}
        >
          {message}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}

    </div>
  )
}