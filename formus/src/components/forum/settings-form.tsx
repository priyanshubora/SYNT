'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

type SettingsFormProps = {
  username: string
  avatarUrl: string | null
}

type Preferences = {
  upvotes: boolean
  mentions: boolean
  replies: boolean
}

type SettingToggleProps = {
  enabled: boolean
  label: string
  description: string
  settingKey: keyof Preferences
  onToggle: (key: keyof Preferences) => void
  loading: boolean
  saving: boolean
}

function SettingToggle({
  enabled,
  label,
  description,
  settingKey,
  onToggle,
  loading,
  saving,
}: SettingToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(settingKey)}
      disabled={loading || saving}
      className="flex w-full items-center justify-between gap-4 border-b px-5 py-4 text-left last:border-b-0 transition hover:bg-[var(--surface-secondary)]"
      style={{
        borderColor: 'var(--border)',
      }}
    >
      <div className="min-w-0">
        <div
          className="text-xs font-bold"
          style={{
            color: 'var(--text-primary)',
          }}
        >
          {label}
        </div>

        <div
          className="mt-1 text-[10px]"
          style={{
            color: 'var(--text-muted)',
          }}
        >
          {description}
        </div>
      </div>

      <span
        className="relative h-5 w-9 shrink-0 border transition"
        style={{
          background: enabled
            ? 'var(--accent)'
            : 'var(--surface-secondary)',
          borderColor: enabled
            ? 'var(--accent)'
            : 'var(--border)',
        }}
      >
        <span
          className="absolute top-[2px] h-[14px] w-[14px] bg-white transition"
          style={{
            left: enabled ? '17px' : '2px',
          }}
        />
      </span>
    </button>
  )
}

export default function SettingsForm({
  username,
  avatarUrl,
}: SettingsFormProps) {
  const router = useRouter()

  const [preferences, setPreferences] =
    useState<Preferences>({
      upvotes: true,
      mentions: true,
      replies: true,
    })

  const [loadingPreferences, setLoadingPreferences] =
    useState(true)

  const [savingPreference, setSavingPreference] =
    useState<string | null>(null)

  const [deleting, setDeleting] =
    useState(false)

  const [downloading, setDownloading] =
    useState(false)

  const [deleteConfirm, setDeleteConfirm] =
    useState(false)

  useEffect(() => {
    async function loadPreferences() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoadingPreferences(false)
        return
      }

      const { data } = await supabase
        .from('notification_preferences')
        .select(
          'upvotes, mentions, replies',
        )
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setPreferences({
          upvotes: data.upvotes,
          mentions: data.mentions,
          replies: data.replies,
        })
      } else {
        await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            upvotes: true,
            mentions: true,
            replies: true,
          })
      }

      setLoadingPreferences(false)
    }

    loadPreferences()
  }, [])

  async function updatePreference(
    key: keyof Preferences,
  ) {
    const nextValue = !preferences[key]

    setPreferences((current) => ({
      ...current,
      [key]: nextValue,
    }))

    setSavingPreference(key)

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSavingPreference(null)
      return
    }

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: user.id,
          [key]: nextValue,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        },
      )

    if (error) {
      console.error(
        'Notification preference update failed:',
        error,
      )

      setPreferences((current) => ({
        ...current,
        [key]: !nextValue,
      }))
    }

    setSavingPreference(null)
  }

  async function downloadData() {
    if (downloading) return

    setDownloading(true)

    try {
      const response = await fetch(
        '/api/account/export',
      )

      if (!response.ok) {
        throw new Error(
          'Failed to export account data.',
        )
      }

      const blob =
        await response.blob()

      const url =
        window.URL.createObjectURL(blob)

      const anchor =
        document.createElement('a')

      anchor.href = url
      anchor.download =
        'snyt-account-data.json'

      document.body.appendChild(anchor)

      anchor.click()

      anchor.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(
        'Data export failed:',
        error,
      )

      alert(
        'Unable to download your data right now.',
      )
    } finally {
      setDownloading(false)
    }
  }

  async function signOut() {
    const supabase = createClient()

    await supabase.auth.signOut()

    router.push('/')
  }

  async function deleteAccount() {
    if (deleting) return

    setDeleting(true)

    try {
      const response = await fetch(
        '/api/account/delete',
        {
          method: 'POST',
        },
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ??
            'Failed to delete account.',
        )
      }

      router.push('/')
    } catch (error) {
      console.error(
        'Account deletion failed:',
        error,
      )

      alert(
        'Unable to delete your account right now.',
      )

      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* EDIT PROFILE */}

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
            Edit Profile
          </h2>

          <p
            className="mt-1 text-[10px]"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Change your username, avatar,
            and team.
          </p>
        </div>

        <div className="px-5 py-4">
          <Link
            href="/profile/edit"
            className="inline-flex border px-4 py-2 text-xs font-bold transition hover:bg-[var(--surface-secondary)]"
            style={{
              borderColor:
                'var(--border)',
              color:
                'var(--text-primary)',
              background:
                'var(--surface)',
            }}
          >
            Edit Profile
          </Link>
        </div>
      </section>


      {/* APPEARANCE */}

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
            Appearance
          </h2>

          <p
            className="mt-1 text-[10px]"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Change how SNYT looks.
          </p>
        </div>

        <div className="px-5 py-4">
          <p
            className="text-xs"
            style={{
              color:
                'var(--text-secondary)',
            }}
          >
            Use the theme toggle in the
            header to switch between light
            and dark mode.
          </p>
        </div>
      </section>


      {/* NOTIFICATIONS */}

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
            Notifications
          </h2>

          <p
            className="mt-1 text-[10px]"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Choose what appears in your
            notification bell.
          </p>
        </div>

        <div>
          <SettingToggle
            settingKey="upvotes"
            enabled={preferences.upvotes}
            label="Thread upvotes"
            description="Notify me when someone upvotes my thread."
            onToggle={updatePreference}
            loading={loadingPreferences}
            saving={savingPreference !== null}
          />

          <SettingToggle
            settingKey="mentions"
            enabled={preferences.mentions}
            label="Mentions"
            description="Notify me when someone mentions me with @username."
            onToggle={updatePreference}
            loading={loadingPreferences}
            saving={savingPreference !== null}
          />

          <SettingToggle
            settingKey="replies"
            enabled={preferences.replies}
            label="Replies"
            description="Notify me when someone replies to my comment."
            onToggle={updatePreference}
            loading={loadingPreferences}
            saving={savingPreference !== null}
          />
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

          <p
            className="mt-1 text-[10px]"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Manage your SNYT account.
          </p>
        </div>

        <div className="divide-y" style={{
          borderColor:
            'var(--border)',
        }}>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <div
                className="text-xs font-bold"
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                Download your data
              </div>

              <div
                className="mt-1 text-[10px]"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Download a copy of your
                SNYT account information.
              </div>
            </div>

            <button
              type="button"
              onClick={downloadData}
              disabled={downloading}
              className="shrink-0 border px-3 py-2 text-[11px] font-bold transition hover:bg-[var(--surface-secondary)] disabled:opacity-50"
              style={{
                borderColor:
                  'var(--border)',
                color:
                  'var(--text-primary)',
                background:
                  'var(--surface)',
              }}
            >
              {downloading
                ? 'Preparing...'
                : 'Download'}
            </button>
          </div>


          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <div
                className="text-xs font-bold"
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                Sign out
              </div>

              <div
                className="mt-1 text-[10px]"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Sign out of this SNYT
                account.
              </div>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="shrink-0 border border-red-300 px-3 py-2 text-[11px] font-bold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Sign Out
            </button>
          </div>


          <div className="px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-red-500">
                  Delete account
                </div>

                <div
                  className="mt-1 text-[10px]"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  Permanently delete your
                  SNYT account and profile.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteConfirm(
                    (current) =>
                      !current,
                  )
                }
                className="shrink-0 border border-red-300 px-3 py-2 text-[11px] font-bold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Delete Account
              </button>
            </div>

            {deleteConfirm && (
              <div
                className="mt-4 border border-red-300 bg-red-50 px-4 py-4 dark:bg-red-950/10"
              >
                <div className="text-xs font-bold text-red-600 dark:text-red-400">
                  This cannot be undone.
                </div>

                <p className="mt-1 text-[10px] leading-5 text-red-500">
                  Your account and associated
                  profile will be permanently
                  deleted.
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={
                      deleteAccount
                    }
                    disabled={deleting}
                    className="border border-red-500 bg-red-500 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50"
                  >
                    {deleting
                      ? 'Deleting...'
                      : 'Yes, Delete My Account'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirm(
                        false,
                      )
                    }
                    className="border px-3 py-2 text-[11px] font-bold"
                    style={{
                      borderColor:
                        'var(--border)',
                      color:
                        'var(--text-primary)',
                      background:
                        'var(--surface)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}