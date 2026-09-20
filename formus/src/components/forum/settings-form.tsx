'use client'

import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

type SettingsFormProps = {
  username: string
  avatarUrl: string | null
}

export default function SettingsForm({
  username,
  avatarUrl,
}: SettingsFormProps) {
  const router = useRouter()

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
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="border-b px-5 py-4"
          style={{
            borderColor: 'var(--border)',
          }}
        >
          <h2
            className="text-sm font-bold"
            style={{
              color: 'var(--text-primary)',
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
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                }}
              >
                {username.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div
                className="text-sm font-bold"
                style={{
                  color: 'var(--text-primary)',
                }}
              >
                {username}
              </div>

              <div
                className="mt-1 text-[10px]"
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                Profile information
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACCOUNT */}
      <section
        className="border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="border-b px-5 py-4"
          style={{
            borderColor: 'var(--border)',
          }}
        >
          <h2
            className="text-sm font-bold"
            style={{
              color: 'var(--text-primary)',
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
              borderColor: 'var(--border)',
              background: 'var(--surface)',
            }}
          >
            Sign Out
          </button>
        </div>
      </section>
    </div>
  )
}