'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

type Team = {
  id: string
  name: string
  logo_url: string | null
}

type EditProfileFormProps = {
  username: string
  avatarUrl: string | null
  currentTeamId: string | null
  teams: Team[]
}

export default function EditProfileForm({
  username,
  avatarUrl,
  currentTeamId,
  teams,
}: EditProfileFormProps) {
  const router = useRouter()

  const [newUsername, setNewUsername] =
    useState(username)

  const [teamId, setTeamId] =
    useState(currentTeamId ?? '')

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  async function saveProfile() {
    const trimmedUsername =
      newUsername.trim()

    if (!trimmedUsername) {
      setError(
        'Username cannot be empty.'
      )
      return
    }

    if (trimmedUsername.length < 3) {
      setError(
        'Username must be at least 3 characters.'
      )
      return
    }

    if (trimmedUsername.length > 30) {
      setError(
        'Username cannot exceed 30 characters.'
      )
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError(
        'You need to be logged in.'
      )
      setSaving(false)
      return
    }

    const { error: updateError } =
      await supabase
        .from('profiles')
        .update({
          username: trimmedUsername,
          team_id: teamId || null,
        })
        .eq('id', user.id)

    if (updateError) {
      console.error(
        'Profile update failed:',
        updateError
      )

      if (
        updateError.code ===
        '23505'
      ) {
        setError(
          'That username is already taken.'
        )
      } else {
        setError(
          updateError.message ||
            'Unable to update profile.'
        )
      }

      setSaving(false)
      return
    }

    setSuccess(
      'Profile updated successfully.'
    )

    setSaving(false)

    router.refresh()
  }

  return (
    <div className="space-y-5">

      {/* PROFILE IDENTITY */}

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

        <div className="space-y-5 px-5 py-5">

          <div className="flex items-center gap-4">

            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
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
                Profile picture
              </div>

              <div
                className="mt-1 text-[10px]"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Your Google profile
                picture is currently
                used.
              </div>

            </div>

          </div>

          {/* USERNAME */}

          <div>

            <label
              className="mb-2 block text-xs font-bold"
              style={{
                color:
                  'var(--text-secondary)',
              }}
            >
              Username
            </label>

            <input
              type="text"
              value={newUsername}
              onChange={(event) =>
                setNewUsername(
                  event.target.value
                )
              }
              maxLength={30}
              disabled={saving}
              className="w-full border px-3 py-2.5 text-sm outline-none"
              style={{
                background:
                  'var(--surface-secondary)',
                color:
                  'var(--text-primary)',
                borderColor:
                  'var(--border)',
              }}
            />

            <p
              className="mt-1 text-[10px]"
              style={{
                color:
                  'var(--text-muted)',
              }}
            >
              3–30 characters.
            </p>

          </div>

          {/* TEAM / FLAG */}

          <div>

            <label
              className="mb-2 block text-xs font-bold"
              style={{
                color:
                  'var(--text-secondary)',
              }}
            >
              Team / Flag
            </label>

            <select
              value={teamId}
              onChange={(event) =>
                setTeamId(
                  event.target.value
                )
              }
              disabled={saving}
              className="w-full border px-3 py-2.5 text-sm outline-none"
              style={{
                background:
                  'var(--surface-secondary)',
                color:
                  'var(--text-primary)',
                borderColor:
                  'var(--border)',
              }}
            >

              <option value="">
                No team / flag
              </option>

              {teams.map((team) => (
                <option
                  key={team.id}
                  value={team.id}
                >
                  {team.name}
                </option>
              ))}

            </select>

            <p
              className="mt-1 text-[10px]"
              style={{
                color:
                  'var(--text-muted)',
              }}
            >
              This appears beside your
              username.
            </p>

          </div>

        </div>

      </section>

      {/* SAVE */}

      <div className="flex items-center justify-between">

        <div>

          {success && (
            <span className="text-xs text-green-500">
              {success}
            </span>
          )}

          {error && (
            <span className="text-xs text-red-500">
              {error}
            </span>
          )}

        </div>

        <button
          type="button"
          onClick={saveProfile}
          disabled={saving}
          className="border px-5 py-2.5 text-xs font-bold"
          style={{
            background:
              'var(--accent)',
            borderColor:
              'var(--accent)',
            color: '#ffffff',
            opacity:
              saving ? 0.6 : 1,
          }}
        >
          {saving
            ? 'Saving...'
            : 'Save Changes'}
        </button>

      </div>

    </div>
  )
}